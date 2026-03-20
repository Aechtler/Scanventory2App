import fs from 'node:fs';
import path from 'node:path';

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

function packageNameFromModuleDirectory(moduleDirectory) {
  return moduleDirectory.replace(/^node_modules\//, '');
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
    /https:\/\/registry\.npmjs\.org\/([^/\s]+)\/-\/[^\s]+\.tgz/g,
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
      packageName: match[1],
      tarballUrl,
    });
  }

  return misses;
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
