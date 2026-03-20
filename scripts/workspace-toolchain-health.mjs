import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Readable } from 'node:stream';

export const TOOLCHAIN_REQUIREMENTS = [
  {
    moduleDirectory: 'node_modules/typescript',
    requiredFiles: ['lib/typescript.js'],
  },
  {
    moduleDirectory: 'node_modules/expo',
    requiredFiles: ['package.json', 'tsconfig.base'],
  },
  {
    moduleDirectory: 'node_modules/nativewind',
    requiredFiles: ['package.json', 'types/index.d.ts'],
  },
  {
    moduleDirectory: 'node_modules/@types/bcryptjs',
    requiredFiles: ['package.json', 'index.d.ts'],
  },
  {
    moduleDirectory: 'node_modules/@types/cors',
    requiredFiles: ['package.json', 'index.d.ts'],
  },
  {
    moduleDirectory: 'node_modules/@types/express-rate-limit',
    requiredFiles: ['package.json', 'index.d.ts'],
  },
  {
    moduleDirectory: 'node_modules/@types/multer',
    requiredFiles: ['package.json', 'index.d.ts'],
  },
  {
    moduleDirectory: 'node_modules/@types/uuid',
    requiredFiles: ['package.json', 'index.d.ts'],
  },
];

const require = createRequire(import.meta.url);
const DEFAULT_NPM_CACHE_DIRECTORY = path.join(
  process.env.HOME ?? '/root',
  '.npm',
  '_cacache',
);

function packageNameFromModuleDirectory(moduleDirectory) {
  return moduleDirectory.replace(/^node_modules\//, '');
}

function getPackageLockPath(repoRoot) {
  return path.join(repoRoot, 'package-lock.json');
}

function readPackageLock(repoRoot) {
  return JSON.parse(fs.readFileSync(getPackageLockPath(repoRoot), 'utf8'));
}

function getPackageLockEntry(packageLock, moduleDirectory) {
  return packageLock?.packages?.[moduleDirectory];
}

function loadBundledNpmModule(moduleName) {
  try {
    return require(moduleName);
  } catch {
    const npmPackageRoots = [];

    if (process.env.npm_execpath) {
      npmPackageRoots.push(path.resolve(process.env.npm_execpath, '..', '..'));
    }

    npmPackageRoots.push('/usr/lib/node_modules/npm', '/usr/local/lib/node_modules/npm');

    for (const npmPackageRoot of npmPackageRoots) {
      try {
        return require(path.join(npmPackageRoot, 'node_modules', moduleName));
      } catch {
        continue;
      }
    }

    throw new Error(`Unable to load npm bundled module: ${moduleName}`);
  }
}

async function hasCachedTarballByIntegrity(integrity, cacheDirectory = DEFAULT_NPM_CACHE_DIRECTORY) {
  const cacache = loadBundledNpmModule('cacache');

  try {
    await cacache.get.byDigest(cacheDirectory, integrity);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function readTarballByIntegrity(integrity, cacheDirectory = DEFAULT_NPM_CACHE_DIRECTORY) {
  const cacache = loadBundledNpmModule('cacache');
  const cacheEntry = await cacache.get.byDigest(cacheDirectory, integrity);
  return cacheEntry.data;
}

async function extractPackageTarball(packageBuffer, moduleDirectoryPath) {
  const tar = loadBundledNpmModule('tar');

  await new Promise((resolve, reject) => {
    Readable.from(packageBuffer)
      .pipe(
        tar.x({
          cwd: moduleDirectoryPath,
          gzip: true,
          strip: 1,
        }),
      )
      .on('finish', resolve)
      .on('error', reject);
  });
}

export function collectMissingToolchainRequirements(repoRoot, requirements = TOOLCHAIN_REQUIREMENTS) {
  return requirements.flatMap(({ moduleDirectory, requiredFiles }) => {
    const missingFiles = requiredFiles.filter(
      (relativeFilePath) => !fs.existsSync(path.join(repoRoot, moduleDirectory, relativeFilePath)),
    );

    return missingFiles.length === 0 ? [] : [{ moduleDirectory, missingFiles }];
  });
}

export function extractOfflineInstallCacheMisses(installOutput) {
  if (!installOutput) {
    return [];
  }

  const tarballMatches = installOutput.matchAll(
    /https:\/\/registry\.npmjs\.org\/((?:@[^/\s]+(?:%2[fF]|\/)[^/\s]+)|[^/\s]+)\/-\/[^\s]+\.tgz/g,
  );
  const misses = [];
  const seenTarballs = new Set();

  for (const match of tarballMatches) {
    const tarballUrl = match[0];

    if (seenTarballs.has(tarballUrl)) {
      continue;
    }

    seenTarballs.add(tarballUrl);
    misses.push({
      packageName: decodeURIComponent(match[1]),
      tarballUrl,
    });
  }

  return misses;
}

export async function collectOfflineCacheMissesFromLockfile(
  repoRoot,
  missingRequirements,
  options = {},
) {
  const {
    cacheDirectory = DEFAULT_NPM_CACHE_DIRECTORY,
    packageLock = readPackageLock(repoRoot),
    hasCachedTarball = async ({ integrity }) => hasCachedTarballByIntegrity(integrity, cacheDirectory),
  } = options;
  const misses = [];
  const seenTarballs = new Set();

  for (const requirement of missingRequirements) {
    const packageLockEntry = getPackageLockEntry(packageLock, requirement.moduleDirectory);

    if (!packageLockEntry?.integrity || !packageLockEntry?.resolved) {
      continue;
    }

    if (
      await hasCachedTarball({
        integrity: packageLockEntry.integrity,
        moduleDirectory: requirement.moduleDirectory,
        resolved: packageLockEntry.resolved,
      })
    ) {
      continue;
    }

    if (seenTarballs.has(packageLockEntry.resolved)) {
      continue;
    }

    seenTarballs.add(packageLockEntry.resolved);
    misses.push({
      packageName: packageNameFromModuleDirectory(requirement.moduleDirectory),
      tarballUrl: packageLockEntry.resolved,
    });
  }

  return misses;
}

export async function restoreMissingToolchainRequirementsFromCache(
  repoRoot,
  missingRequirements,
  options = {},
) {
  const {
    cacheDirectory = DEFAULT_NPM_CACHE_DIRECTORY,
    packageLock = readPackageLock(repoRoot),
    readTarballByIntegrity: readTarball = async (integrity) =>
      readTarballByIntegrity(integrity, cacheDirectory),
    extractPackageTarball: extractTarball = extractPackageTarball,
  } = options;
  const restoredPackages = [];
  const unresolvedRequirements = [];

  for (const requirement of missingRequirements) {
    const packageLockEntry = getPackageLockEntry(packageLock, requirement.moduleDirectory);

    if (!packageLockEntry?.integrity) {
      unresolvedRequirements.push(requirement);
      continue;
    }

    try {
      const packageBuffer = await readTarball(packageLockEntry.integrity, {
        moduleDirectory: requirement.moduleDirectory,
        resolved: packageLockEntry.resolved,
      });
      const moduleDirectoryPath = path.join(repoRoot, requirement.moduleDirectory);

      await fs.promises.rm(moduleDirectoryPath, { recursive: true, force: true });
      await fs.promises.mkdir(moduleDirectoryPath, { recursive: true });
      await extractTarball(packageBuffer, moduleDirectoryPath, {
        moduleDirectory: requirement.moduleDirectory,
        resolved: packageLockEntry.resolved,
      });

      const missingFiles = requirement.missingFiles.filter(
        (relativeFilePath) => !fs.existsSync(path.join(moduleDirectoryPath, relativeFilePath)),
      );

      if (missingFiles.length > 0) {
        unresolvedRequirements.push({
          moduleDirectory: requirement.moduleDirectory,
          missingFiles,
        });
        continue;
      }

      restoredPackages.push(packageNameFromModuleDirectory(requirement.moduleDirectory));
    } catch (error) {
      if (error && typeof error === 'object' && error.code === 'ENOENT') {
        unresolvedRequirements.push(requirement);
        continue;
      }

      throw error;
    }
  }

  return {
    restoredPackages,
    unresolvedRequirements,
  };
}

export function formatMissingToolchainRequirements(
  missingRequirements,
  options = {},
) {
  const { offlineCacheMisses = [] } = options;
  const affectedPackages = [...new Set(missingRequirements.map(({ moduleDirectory }) => packageNameFromModuleDirectory(moduleDirectory)))];
  const lines = [
    'Workspace setup incomplete. Missing required package files:',
    ...missingRequirements.map(
      ({ moduleDirectory, missingFiles }) => `- ${moduleDirectory} -> ${missingFiles.join(', ')}`,
    ),
  ];

  if (offlineCacheMisses.length > 0) {
    lines.push(
      '',
      'Offline npm cache misses detected:',
      ...offlineCacheMisses.map(
        ({ packageName, tarballUrl }) => `- ${packageName} -> ${tarballUrl}`,
      ),
    );
  }

  lines.push(
    '',
    'Suggested next steps:',
    '- Restore the missing packages from cache or reinstall with network access.',
    '- If network access is available, run: npm install',
    '- Then rerun: npm run setup:workspace',
    `- Likely affected packages: ${affectedPackages.join(', ')}`,
  );

  return lines.join('\n');
}
