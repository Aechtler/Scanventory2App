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

const TOOLCHAIN_REQUIREMENT_MAP = new Map(
  TOOLCHAIN_REQUIREMENTS.map((requirement) => [requirement.moduleDirectory, requirement.requiredFiles]),
);

const require = createRequire(import.meta.url);
const DEFAULT_NPM_CACHE_DIRECTORY = path.join(
  process.env.HOME ?? '/root',
  '.npm',
  '_cacache',
);
const DEFAULT_INSTALLED_PACKAGE_SEARCH_ROOTS = [
  path.join(process.env.HOME ?? '/root', '.npm', '_npx'),
  '/usr/lib/node_modules',
  '/usr/local/lib/node_modules',
];
const DEFAULT_INSTALLED_PACKAGE_SEARCH_MAX_DEPTH = 6;

function packageNameFromModuleDirectory(moduleDirectory) {
  const modulePathParts = moduleDirectory.split('/');
  const nodeModulesIndex = modulePathParts.lastIndexOf('node_modules');

  if (nodeModulesIndex === -1 || nodeModulesIndex === modulePathParts.length - 1) {
    return moduleDirectory;
  }

  const packageParts = modulePathParts.slice(nodeModulesIndex + 1);
  return packageParts[0]?.startsWith('@') ? packageParts.slice(0, 2).join('/') : packageParts[0];
}

function getOwnedDependencyNameFromPackageName(packageName) {
  if (!packageName.startsWith('@types/')) {
    return packageName;
  }

  const unscopedName = packageName.slice('@types/'.length);
  return unscopedName.includes('__') ? `@${unscopedName.replace('__', '/')}` : unscopedName;
}

function formatWorkspaceOwnedPackageLine(packageName, workspaceDependencyOwners) {
  const dependencyName = getOwnedDependencyNameFromPackageName(packageName);
  const owners = workspaceDependencyOwners[packageName];
  const dependencyLabel =
    dependencyName !== packageName &&
    Array.isArray(workspaceDependencyOwners[dependencyName]) &&
    workspaceDependencyOwners[dependencyName].length > 0
      ? ` (for ${dependencyName})`
      : '';

  return `- ${packageName}${dependencyLabel} -> ${owners.join(', ')}`;
}

function getNetworkEnabledRetryCommand(retryCommand) {
  return `SCANAPP_ALLOW_NETWORK_INSTALL=1 ${retryCommand}`;
}

function collectAffectedWorkspaceOwners(
  directWorkspacePackages,
  workspaceOwnedTypePackages,
  workspaceDependencyOwners,
) {
  return [...new Set([
    ...directWorkspacePackages.flatMap(
      (packageName) => workspaceDependencyOwners[packageName] ?? [],
    ),
    ...workspaceOwnedTypePackages.flatMap(
      ({ dependencyName }) => workspaceDependencyOwners[dependencyName] ?? [],
    ),
  ])].sort((left, right) => left.localeCompare(right));
}

function collectAffectedWorkspaceBlockers(
  directWorkspacePackages,
  workspaceOwnedTypePackages,
  workspaceDependencyOwners,
) {
  const blockersByWorkspace = new Map();

  for (const packageName of directWorkspacePackages) {
    for (const owner of workspaceDependencyOwners[packageName] ?? []) {
      const blockers = blockersByWorkspace.get(owner) ?? new Set();
      blockers.add(packageName);
      blockersByWorkspace.set(owner, blockers);
    }
  }

  for (const { packageName, dependencyName } of workspaceOwnedTypePackages) {
    for (const owner of workspaceDependencyOwners[dependencyName] ?? []) {
      const blockers = blockersByWorkspace.get(owner) ?? new Set();
      blockers.add(packageName);
      blockersByWorkspace.set(owner, blockers);
    }
  }

  return [...blockersByWorkspace.entries()]
    .map(([workspaceName, blockers]) => ({
      workspaceName,
      blockers: [...blockers].sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => {
      if (left.blockers.length !== right.blockers.length) {
        return left.blockers.length - right.blockers.length;
      }

      return left.workspaceName.localeCompare(right.workspaceName);
    });
}

function getModuleDirectoryFromPackageName(packageName) {
  return path.join('node_modules', ...packageName.split('/'));
}

function getPackageDirectoryNameParts(packageName) {
  return packageName.split('/');
}

function findInstalledPackageSourceDirectories(
  packageName,
  {
    searchRoots = DEFAULT_INSTALLED_PACKAGE_SEARCH_ROOTS,
    maxDepth = DEFAULT_INSTALLED_PACKAGE_SEARCH_MAX_DEPTH,
  } = {},
) {
  const matches = new Set();
  const packageDirectoryNameParts = getPackageDirectoryNameParts(packageName);

  function visitDirectory(directoryPath, depth) {
    if (depth > maxDepth || !fs.existsSync(directoryPath)) {
      return;
    }

    let entries;

    try {
      entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const entryPath = path.join(directoryPath, entry.name);

      if (entry.name === 'node_modules') {
        const candidatePath = path.join(entryPath, ...packageDirectoryNameParts);

        if (fs.existsSync(candidatePath)) {
          matches.add(candidatePath);
        }
      }

      visitDirectory(entryPath, depth + 1);
    }
  }

  for (const searchRoot of searchRoots) {
    visitDirectory(searchRoot, 0);
  }

  return [...matches].sort((left, right) => left.localeCompare(right));
}

function getPackageLockPath(repoRoot) {
  return path.join(repoRoot, 'package-lock.json');
}

function readPackageLock(repoRoot) {
  return JSON.parse(fs.readFileSync(getPackageLockPath(repoRoot), 'utf8'));
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getRootPackageJsonPath(repoRoot) {
  return path.join(repoRoot, 'package.json');
}

function expandWorkspacePattern(repoRoot, workspacePattern) {
  if (!workspacePattern.endsWith('/*')) {
    const packageJsonPath = path.join(repoRoot, workspacePattern, 'package.json');
    return fs.existsSync(packageJsonPath) ? [packageJsonPath] : [];
  }

  const workspaceDirectory = path.join(repoRoot, workspacePattern.slice(0, -2));

  if (!fs.existsSync(workspaceDirectory)) {
    return [];
  }

  return fs
    .readdirSync(workspaceDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(workspaceDirectory, entry.name, 'package.json'))
    .filter((packageJsonPath) => fs.existsSync(packageJsonPath))
    .sort((left, right) => left.localeCompare(right));
}

function listWorkspacePackageJsonPaths(repoRoot) {
  const rootPackageJsonPath = getRootPackageJsonPath(repoRoot);
  const rootPackageJson = readJsonFile(rootPackageJsonPath);
  const workspacePatterns = Array.isArray(rootPackageJson.workspaces) ? rootPackageJson.workspaces : [];

  return [
    rootPackageJsonPath,
    ...workspacePatterns.flatMap((workspacePattern) =>
      expandWorkspacePattern(repoRoot, workspacePattern),
    ),
  ];
}

function getWorkspacePackageLabel(packageJsonPath, packageJson, repoRoot) {
  if (packageJsonPath === getRootPackageJsonPath(repoRoot)) {
    return typeof packageJson.name === 'string' && packageJson.name.length > 0
      ? packageJson.name
      : '@root';
  }

  return typeof packageJson.name === 'string' && packageJson.name.length > 0
    ? packageJson.name
    : path.relative(repoRoot, path.dirname(packageJsonPath));
}

function listWorkspacePackageManifests(repoRoot) {
  return listWorkspacePackageJsonPaths(repoRoot).map((packageJsonPath) => {
    const packageJson = readJsonFile(packageJsonPath);

    return {
      packageJsonPath,
      packageJson,
      ownerLabel: getWorkspacePackageLabel(packageJsonPath, packageJson, repoRoot),
    };
  });
}

export function loadPackageLock(repoRoot) {
  const packageLockPath = getPackageLockPath(repoRoot);

  try {
    return {
      packageLock: readPackageLock(repoRoot),
      issue: null,
    };
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return {
        packageLock: null,
        issue: {
          packageLockPath,
          reason: 'missing',
          detail: `Missing root package-lock.json at ${packageLockPath}`,
        },
      };
    }

    const detail =
      error instanceof Error
        ? `Unable to parse ${packageLockPath}: ${error.message}`
        : `Unable to parse ${packageLockPath}`;

    return {
      packageLock: null,
      issue: {
        packageLockPath,
        reason: 'invalid',
        detail,
      },
    };
  }
}

function getPackageLockEntry(packageLock, moduleDirectory) {
  return packageLock?.packages?.[moduleDirectory];
}

function getWorkspacePackageDirectory(packageJsonPath, repoRoot) {
  if (packageJsonPath === getRootPackageJsonPath(repoRoot)) {
    return '';
  }

  return path.relative(repoRoot, path.dirname(packageJsonPath));
}

function getDirectDependencyLockEntryCandidates(packageName, ownerPackageDirectory) {
  const moduleDirectory = getModuleDirectoryFromPackageName(packageName);
  const candidates = [];

  if (ownerPackageDirectory) {
    candidates.push(path.join(ownerPackageDirectory, moduleDirectory));
  }

  candidates.push(moduleDirectory);
  return [...new Set(candidates)];
}

function isTopLevelInstalledModuleDirectory(moduleDirectory) {
  const modulePathParts = moduleDirectory.split('/');

  if (modulePathParts[0] !== 'node_modules') {
    return false;
  }

  if (modulePathParts[1]?.startsWith('@')) {
    return modulePathParts.length === 3;
  }

  return modulePathParts.length === 2;
}

function listInstalledModuleDirectories(repoRoot, packageLock) {
  return Object.keys(packageLock?.packages ?? {})
    .filter((moduleDirectory) => isTopLevelInstalledModuleDirectory(moduleDirectory))
    .filter((moduleDirectory) => fs.existsSync(path.join(repoRoot, moduleDirectory)))
    .sort((left, right) => left.localeCompare(right));
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

function readPackageVersion(packageDirectoryPath) {
  const packageJsonPath = path.join(packageDirectoryPath, 'package.json');

  try {
    const packageJson = readJsonFile(packageJsonPath);
    return typeof packageJson.version === 'string' ? packageJson.version : null;
  } catch {
    return null;
  }
}

async function restoreRequirementFromInstalledPackageDirectory(
  repoRoot,
  requirement,
  packageLockEntry,
  findInstalledPackageSourceDirectoriesImpl,
) {
  const packageName = packageNameFromModuleDirectory(requirement.moduleDirectory);
  const expectedVersion =
    packageLockEntry && typeof packageLockEntry.version === 'string'
      ? packageLockEntry.version
      : null;
  const sourceDirectories = await findInstalledPackageSourceDirectoriesImpl(packageName, {
    expectedVersion,
    moduleDirectory: requirement.moduleDirectory,
  });

  for (const sourceDirectoryPath of sourceDirectories) {
    if (expectedVersion && readPackageVersion(sourceDirectoryPath) !== expectedVersion) {
      continue;
    }

    const moduleDirectoryPath = path.join(repoRoot, requirement.moduleDirectory);

    await fs.promises.rm(moduleDirectoryPath, { recursive: true, force: true });
    await fs.promises.mkdir(path.dirname(moduleDirectoryPath), { recursive: true });
    await fs.promises.cp(sourceDirectoryPath, moduleDirectoryPath, {
      recursive: true,
      force: true,
    });

    const missingFiles = requirement.missingFiles.filter(
      (relativeFilePath) => !fs.existsSync(path.join(moduleDirectoryPath, relativeFilePath)),
    );

    if (missingFiles.length === 0) {
      return true;
    }
  }

  return false;
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

export function collectMissingInstalledPackageRequirements(
  repoRoot,
  options = {},
) {
  const { packageLock = readPackageLock(repoRoot) } = options;

  return listInstalledModuleDirectories(repoRoot, packageLock).flatMap((moduleDirectory) => {
    const requiredFiles =
      TOOLCHAIN_REQUIREMENT_MAP.get(moduleDirectory) ??
      (moduleDirectory.startsWith('node_modules/@types/')
        ? ['package.json', 'index.d.ts']
        : ['package.json']);
    const missingFiles = requiredFiles.filter(
      (relativeFilePath) => !fs.existsSync(path.join(repoRoot, moduleDirectory, relativeFilePath)),
    );

    return missingFiles.length === 0 ? [] : [{ moduleDirectory, missingFiles }];
  });
}

export function collectMissingWorkspaceDependencyRequirements(repoRoot, options = {}) {
  const {
    packageLock = loadPackageLock(repoRoot).packageLock,
  } = options;
  const workspaceManifests = listWorkspacePackageManifests(repoRoot);
  const workspacePackageNames = new Set(
    workspaceManifests
      .map(({ packageJson }) => packageJson.name)
      .filter((packageName) => typeof packageName === 'string' && packageName.length > 0),
  );
  const missingRequirements = new Map();

  for (const { packageJsonPath, packageJson } of workspaceManifests) {
    const ownerPackageDirectory = getWorkspacePackageDirectory(packageJsonPath, repoRoot);

    for (const dependencyGroup of ['dependencies', 'devDependencies']) {
      const dependencies = packageJson[dependencyGroup];

      if (!dependencies || typeof dependencies !== 'object') {
        continue;
      }

      for (const dependencyName of Object.keys(dependencies).sort((left, right) =>
        left.localeCompare(right),
      )) {
        if (workspacePackageNames.has(dependencyName)) {
          continue;
        }

        const candidateModuleDirectories = getDirectDependencyLockEntryCandidates(
          dependencyName,
          ownerPackageDirectory,
        );
        const existingModuleDirectory = candidateModuleDirectories.find((moduleDirectory) =>
          fs.existsSync(path.join(repoRoot, moduleDirectory, 'package.json')),
        );

        if (existingModuleDirectory) {
          continue;
        }

        const preferredModuleDirectory =
          candidateModuleDirectories.find((moduleDirectory) =>
            Boolean(getPackageLockEntry(packageLock, moduleDirectory)),
          ) ?? getModuleDirectoryFromPackageName(dependencyName);
        const existingRequirement = missingRequirements.get(preferredModuleDirectory);

        if (existingRequirement) {
          continue;
        }

        missingRequirements.set(preferredModuleDirectory, {
          moduleDirectory: preferredModuleDirectory,
          missingFiles: ['package.json'],
        });
      }
    }
  }

  return [...missingRequirements.values()].sort((left, right) =>
    left.moduleDirectory.localeCompare(right.moduleDirectory),
  );
}

export function collectWorkspaceDependencyLockIssues(
  repoRoot,
  options = {},
) {
  const {
    packageLock = readPackageLock(repoRoot),
    semver = loadBundledNpmModule('semver'),
  } = options;
  const workspaceManifests = listWorkspacePackageManifests(repoRoot);
  const workspacePackageNames = new Set(
    workspaceManifests
      .map(({ packageJson }) => packageJson.name)
      .filter((packageName) => typeof packageName === 'string' && packageName.length > 0),
  );
  const declarationsByDependency = new Map();

  for (const { ownerLabel, packageJsonPath, packageJson } of workspaceManifests) {
    const ownerPackageDirectory = getWorkspacePackageDirectory(packageJsonPath, repoRoot);

    for (const dependencyGroup of ['dependencies', 'devDependencies']) {
      const dependencies = packageJson[dependencyGroup];

      if (!dependencies || typeof dependencies !== 'object') {
        continue;
      }

      for (const [dependencyName, spec] of Object.entries(dependencies)) {
        if (workspacePackageNames.has(dependencyName)) {
          continue;
        }

        const declarations = declarationsByDependency.get(dependencyName) ?? [];
        declarations.push({
          owner: ownerLabel,
          ownerPackageDirectory,
          dependencyGroup,
          spec,
        });
        declarationsByDependency.set(dependencyName, declarations);
      }
    }
  }

  return [...declarationsByDependency.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([packageName, declarations]) => {
      const missingDeclarations = [];
      const mismatchedDeclarations = [];

      for (const declaration of declarations) {
        const lockfileCandidates = getDirectDependencyLockEntryCandidates(
          packageName,
          declaration.ownerPackageDirectory,
        )
          .map((moduleDirectory) => ({
            moduleDirectory,
            version: getPackageLockEntry(packageLock, moduleDirectory)?.version ?? null,
          }))
          .filter(({ version }) => typeof version === 'string' && version.length > 0);

        if (lockfileCandidates.length === 0) {
          missingDeclarations.push(declaration);
          continue;
        }

        if (
          typeof declaration.spec === 'string' &&
          semver.validRange(declaration.spec) &&
          !lockfileCandidates.some(({ version }) =>
            semver.satisfies(version, declaration.spec, { includePrerelease: true }),
          )
        ) {
          mismatchedDeclarations.push({
            ...declaration,
            lockfileVersion: lockfileCandidates[0]?.version ?? null,
          });
        }
      }

      return [
        ...(missingDeclarations.length > 0
          ? [
              {
                packageName,
                issue: 'missing-lock-entry',
                lockfileVersion: null,
                declarations: missingDeclarations,
              },
            ]
          : []),
        ...(mismatchedDeclarations.length > 0
          ? [
              {
                packageName,
                issue: 'version-mismatch',
                lockfileVersion: mismatchedDeclarations[0]?.lockfileVersion ?? null,
                declarations: mismatchedDeclarations,
              },
            ]
          : []),
      ];
    });
}

export function collectWorkspaceDependencyOwners(repoRoot) {
  const ownersByDependency = new Map();

  for (const { packageJson, ownerLabel } of listWorkspacePackageManifests(repoRoot)) {

    for (const dependencyGroup of ['dependencies', 'devDependencies']) {
      const dependencies = packageJson[dependencyGroup];

      if (!dependencies || typeof dependencies !== 'object') {
        continue;
      }

      for (const dependencyName of Object.keys(dependencies)) {
        const existingOwners = ownersByDependency.get(dependencyName) ?? new Set();
        existingOwners.add(ownerLabel);
        ownersByDependency.set(dependencyName, existingOwners);
      }
    }
  }

  return Object.fromEntries(
    [...ownersByDependency.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([dependencyName, owners]) => [dependencyName, [...owners].sort((left, right) => left.localeCompare(right))]),
  );
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
    readTarballByIntegrity: readTarball = async (integrity) =>
      readTarballByIntegrity(integrity, cacheDirectory),
  } = options;
  const misses = [];
  const seenTarballs = new Set();

  for (const requirement of missingRequirements) {
    const packageLockEntry = getPackageLockEntry(packageLock, requirement.moduleDirectory);

    if (!packageLockEntry?.integrity || !packageLockEntry?.resolved) {
      continue;
    }

    const cacheMeta = {
      integrity: packageLockEntry.integrity,
      moduleDirectory: requirement.moduleDirectory,
      resolved: packageLockEntry.resolved,
    };

    if (await hasCachedTarball(cacheMeta)) {
      const packageBuffer = await readTarball(packageLockEntry.integrity, cacheMeta);

      if (packageBuffer instanceof Uint8Array && packageBuffer.byteLength > 0) {
        continue;
      }
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
    findInstalledPackageSourceDirectories:
      findInstalledPackageSourceDirectoriesImpl = findInstalledPackageSourceDirectories,
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

      if (!(packageBuffer instanceof Uint8Array)) {
        if (
          await restoreRequirementFromInstalledPackageDirectory(
            repoRoot,
            requirement,
            packageLockEntry,
            findInstalledPackageSourceDirectoriesImpl,
          )
        ) {
          restoredPackages.push(packageNameFromModuleDirectory(requirement.moduleDirectory));
          continue;
        }

        unresolvedRequirements.push(requirement);
        continue;
      }

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
        if (
          await restoreRequirementFromInstalledPackageDirectory(
            repoRoot,
            requirement,
            packageLockEntry,
            findInstalledPackageSourceDirectoriesImpl,
          )
        ) {
          restoredPackages.push(packageNameFromModuleDirectory(requirement.moduleDirectory));
          continue;
        }

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

function pushSummarizedSection(lines, title, entries, { maxListedEntries, overflowLabel }) {
  if (entries.length === 0) {
    return;
  }

  const visibleEntries = entries.slice(0, maxListedEntries);
  const omittedCount = entries.length - visibleEntries.length;
  const titleWithoutColon = title.endsWith(':') ? title.slice(0, -1) : title;
  const sectionTitle =
    omittedCount > 0
      ? `${titleWithoutColon} (showing first ${visibleEntries.length} of ${entries.length}):`
      : title;

  lines.push('', sectionTitle, ...visibleEntries);

  if (omittedCount > 0) {
    lines.push(`- ... ${omittedCount} more ${overflowLabel} omitted for brevity`);
  }
}

function formatDependencyLockIssueEntry({ packageName, issue, lockfileVersion, declarations }) {
  return declarations.map(({ owner, dependencyGroup, spec, lockfileVersion: declarationLockfileVersion }) => ({
    detail:
      issue === 'missing-lock-entry'
        ? `- ${packageName} -> missing root package-lock entry for ${owner} ${dependencyGroup} spec ${spec}`
        : `- ${packageName} -> locked ${declarationLockfileVersion ?? lockfileVersion} does not satisfy ${owner} ${dependencyGroup} spec ${spec}`,
    remediation:
      issue === 'missing-lock-entry'
        ? `- ${packageName} -> add a root package-lock entry satisfying ${owner} ${dependencyGroup} ${spec}`
        : `- ${packageName} -> replace locked ${declarationLockfileVersion ?? lockfileVersion} with a version satisfying ${owner} ${dependencyGroup} ${spec}`,
  }));
}

export function formatMissingToolchainRequirements(
  missingRequirements,
  options = {},
) {
  const {
    maxListedEntries = 25,
    dependencyLockIssues = [],
    offlineCacheMisses = [],
    packageLockIssue = null,
    retryCommand = 'npm run setup:workspace',
    workspaceDependencyOwners = {},
  } = options;
  const affectedPackages = [
    ...new Set(
      missingRequirements.map(({ moduleDirectory }) => packageNameFromModuleDirectory(moduleDirectory)),
    ),
  ];
  const directWorkspacePackages = affectedPackages.filter(
    (packageName) =>
      Array.isArray(workspaceDependencyOwners[packageName]) &&
      workspaceDependencyOwners[packageName].length > 0,
  );
  const workspaceOwnedTypePackages = affectedPackages
    .filter((packageName) => packageName.startsWith('@types/'))
    .map((packageName) => ({
      packageName,
      dependencyName: getOwnedDependencyNameFromPackageName(packageName),
    }))
    .filter(
      ({ packageName, dependencyName }) =>
        !directWorkspacePackages.includes(packageName) &&
        Array.isArray(workspaceDependencyOwners[dependencyName]) &&
        workspaceDependencyOwners[dependencyName].length > 0,
    );
  const workspaceOwnedTypePackageNames = new Set(
    workspaceOwnedTypePackages.map(({ packageName }) => packageName),
  );
  const affectedWorkspaceOwners = collectAffectedWorkspaceOwners(
    directWorkspacePackages,
    workspaceOwnedTypePackages,
    workspaceDependencyOwners,
  );
  const affectedWorkspaceBlockers = collectAffectedWorkspaceBlockers(
    directWorkspacePackages,
    workspaceOwnedTypePackages,
    workspaceDependencyOwners,
  );
  const transitivePackages = affectedPackages.filter(
    (packageName) =>
      !directWorkspacePackages.includes(packageName) &&
      !workspaceOwnedTypePackageNames.has(packageName),
  );
  const lines = ['Workspace setup incomplete. Missing required package files:'];

  const missingRequirementLines = missingRequirements.map(
    ({ moduleDirectory, missingFiles }) => `- ${moduleDirectory} -> ${missingFiles.join(', ')}`,
  );

  lines.push(...missingRequirementLines.slice(0, maxListedEntries));

  if (missingRequirementLines.length > maxListedEntries) {
    lines.push(
      `- ... ${missingRequirementLines.length - maxListedEntries} more missing package entries omitted for brevity`,
    );
  }

  if (directWorkspacePackages.length > 0) {
    lines.push(
      '',
      'Direct workspace dependency owners:',
      ...directWorkspacePackages.map((packageName) =>
        formatWorkspaceOwnedPackageLine(packageName, workspaceDependencyOwners),
      ),
    );
  }

  if (workspaceOwnedTypePackages.length > 0) {
    lines.push(
      '',
      'Workspace-owned type-definition blockers:',
      ...workspaceOwnedTypePackages.map(
        ({ packageName, dependencyName }) =>
          `- ${packageName} (for ${dependencyName}) -> ${workspaceDependencyOwners[dependencyName].join(', ')}`,
      ),
    );
  }

  if (affectedWorkspaceBlockers.length > 1) {
    lines.push(
      '',
      'Affected workspaces by direct blocker count:',
      ...affectedWorkspaceBlockers.map(({ workspaceName, blockers }) =>
        `- ${workspaceName} -> ${blockers.length} blocker${blockers.length === 1 ? '' : 's'}: ${blockers.join(', ')}`,
      ),
    );
  }

  pushSummarizedSection(
    lines,
    'Additional hollow installed packages:',
    transitivePackages.map((packageName) => `- ${packageName}`),
    {
      maxListedEntries,
      overflowLabel: 'packages',
    },
  );

  if (packageLockIssue) {
    lines.push('', 'Package-lock issue detected:', `- ${packageLockIssue.detail}`);
  }

  pushSummarizedSection(
    lines,
    'Workspace dependency lockfile issues detected:',
    dependencyLockIssues.flatMap((issue) =>
      formatDependencyLockIssueEntry(issue).map(({ detail }) => detail),
    ),
    {
      maxListedEntries,
      overflowLabel: 'lockfile issues',
    },
  );

  pushSummarizedSection(
    lines,
    'Lockfile packages to refresh:',
    dependencyLockIssues.flatMap((issue) =>
      formatDependencyLockIssueEntry(issue).map(({ remediation }) => remediation),
    ),
    {
      maxListedEntries,
      overflowLabel: 'lockfile refresh entries',
    },
  );

  pushSummarizedSection(
    lines,
    'Offline npm cache misses detected:',
    offlineCacheMisses.map(({ packageName, tarballUrl }) => `- ${packageName} -> ${tarballUrl}`),
    {
      maxListedEntries,
      overflowLabel: 'cache misses',
    },
  );

  lines.push(
    '',
    'Suggested next steps:',
  );

  if (packageLockIssue) {
    lines.push('- Restore or regenerate the root package-lock.json before retrying workspace setup.');
  }

  if (dependencyLockIssues.length > 0) {
    lines.push(
      '- Refresh the root package-lock.json so direct workspace dependency versions match package.json declarations.',
    );
  }

  lines.push(
    '- Restore the missing packages from cache or reinstall with network access.',
  );

  if (retryCommand === 'npm run setup:workspace') {
    lines.push('- If network access is available, run: SCANAPP_ALLOW_NETWORK_INSTALL=1 npm run setup:workspace');
  } else {
    lines.push(
      `- If network access is available, rerun the guarded check with network installs enabled: ${getNetworkEnabledRetryCommand(retryCommand)}`,
    );
  }

  if (affectedWorkspaceOwners.length > 0) {
    if (affectedWorkspaceBlockers.length > 1) {
      lines.push(
        `- Smallest affected workspace first: npm install --workspace=${affectedWorkspaceBlockers[0].workspaceName}`,
      );
      lines.push(
        `- To repair all affected workspaces together, run: npm install ${affectedWorkspaceOwners
          .map((workspaceName) => `--workspace=${workspaceName}`)
          .join(' ')}`,
      );
    } else {
      lines.push(
        `- To repair only the affected workspaces first, run: npm install ${affectedWorkspaceOwners
          .map((workspaceName) => `--workspace=${workspaceName}`)
          .join(' ')}`,
      );
    }
  }

  lines.push('- As a fallback, run: npm install', `- Then rerun the guarded check: ${retryCommand}`);

  if (affectedPackages.length > maxListedEntries) {
    lines.push(
      `- Likely affected packages (showing first ${maxListedEntries} of ${affectedPackages.length}): ${affectedPackages
        .slice(0, maxListedEntries)
        .join(', ')}`,
      `- ... ${affectedPackages.length - maxListedEntries} more affected packages omitted for brevity`,
    );
  } else {
    lines.push(`- Likely affected packages: ${affectedPackages.join(', ')}`);
  }

  return lines.join('\n');
}
