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

test('Animated.tsx stays a small compatibility barrel', () => {
  const animatedBarrelPath = path.join(currentDir, 'Animated.tsx');
  const animatedBarrel = readFileSync(animatedBarrelPath, 'utf8');

  for (const fileName of animatedComponentFiles) {
    const exportName = fileName.replace(/\.tsx$/, '');
    assert.match(
      animatedBarrel,
      new RegExp(`export\\s*\\{\\s*${exportName}\\s*\\}\\s*from\\s*'\\./Animated/${exportName}'`),
      `expected Animated.tsx to re-export ${exportName}`,
    );
  }

  assert.equal(animatedBarrel.includes('export function'), false);
});
