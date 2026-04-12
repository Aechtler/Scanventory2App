import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const animatedComponentFiles = [
  'AnimatedButton.tsx',
  'AnimatedNumber.tsx',
  'BounceInView.tsx',
  'FadeInView.tsx',
  'PulseView.tsx',
  'SlideUpView.tsx',
  'StaggeredItem.tsx',
];

test('Animated helpers live in focused component files', () => {
  for (const fileName of animatedComponentFiles) {
    const filePath = path.join(currentDir, 'Animated', fileName);
    assert.equal(
      existsSync(filePath),
      true,
      `expected split animated component file to exist: ${filePath}`,
    );
  }
});

test('Animated/index.ts is a small barrel without inline implementations', () => {
  const indexPath = path.join(currentDir, 'Animated', 'index.ts');
  const indexBarrel = readFileSync(indexPath, 'utf8');

  for (const fileName of animatedComponentFiles) {
    const exportName = fileName.replace(/\.tsx$/, '');
    assert.match(
      indexBarrel,
      new RegExp(`export\\s*\\{\\s*${exportName}\\s*\\}\\s*from\\s*'\\./${exportName}'`),
      `expected Animated/index.ts to re-export ${exportName}`,
    );
  }

  assert.equal(indexBarrel.includes('export function'), false);
});
