import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const REQUIRED_SECTIONS = [
  '## 1) Auth',
  '## 2) Scan and analyze',
  '## 3) Save, library, and detail flows',
  '## 4) Backend upload and image routes',
  '## 5) Sync / update / delete',
  '## Recording results',
];

const REQUIRED_RECORDING_BULLETS = [
  'environment used',
  'command checks run and pass/fail/block status',
  'manual sections completed',
  'any regressions or blockers with exact file/flow context',
];

const REQUIRED_VALIDATION_TEMPLATE_FIELDS = [
  'Environment:',
  'Command checks:',
  'Manual sections completed:',
  'Regressions / blockers:',
];

const REQUIRED_TRELLO_FIELDS = [
  'Ziel',
  'Umfang',
  'Nachweise',
  'Nächster Schritt',
  'Validierung',
];

const REQUIRED_QUICK_COMMANDS = [
  'npm run validate:manual-regression',
  'npm run manual-regression:report',
];

function extractQuickCommandBlock(documentText) {
  const quickChecksIndex = documentText.indexOf('## Quick command checks');

  if (quickChecksIndex === -1) {
    return [];
  }

  const afterHeading = documentText.slice(quickChecksIndex + '## Quick command checks'.length);
  const nextSectionIndex = afterHeading.search(/\n## /u);
  const quickChecksSection =
    nextSectionIndex === -1 ? afterHeading : afterHeading.slice(0, nextSectionIndex);
  const match = quickChecksSection.match(/```bash\n([\s\S]*?)```/u);

  if (!match) {
    return [];
  }

  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractDocumentedScripts(documentText) {
  return extractQuickCommandBlock(documentText)
    .map((line) => line.match(/^npm run (?<script>[a-z0-9:-]+)$/iu)?.groups?.script)
    .filter(Boolean);
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function validateManualRegressionChecklist(repoRoot) {
  const packageJsonPath = path.join(repoRoot, 'package.json');
  const checklistPath = path.join(repoRoot, 'docs', 'manual-regression-checklist.md');
  const errors = [];

  if (!fs.existsSync(packageJsonPath)) {
    return ['Missing package.json for manual regression checklist validation'];
  }

  if (!fs.existsSync(checklistPath)) {
    return ['Missing docs/manual-regression-checklist.md'];
  }

  const packageJson = readJsonFile(packageJsonPath);
  const documentText = fs.readFileSync(checklistPath, 'utf8');
  const scripts = packageJson.scripts ?? {};
  const documentedQuickCommands = extractQuickCommandBlock(documentText);

  for (const command of REQUIRED_QUICK_COMMANDS) {
    if (!documentedQuickCommands.includes(command)) {
      errors.push(`Checklist quick command checks should include: ${command}`);
    }
  }

  for (const scriptName of extractDocumentedScripts(documentText)) {
    if (!(scriptName in scripts)) {
      errors.push(`Documented npm script is missing from package.json: ${scriptName}`);
    }
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!documentText.includes(section)) {
      errors.push(`Checklist is missing required section: ${section}`);
    }
  }

  for (const bullet of REQUIRED_RECORDING_BULLETS) {
    if (!documentText.includes(`- ${bullet}`)) {
      errors.push(`Checklist is missing recording-results bullet: ${bullet}`);
    }
  }

  if (!documentText.includes('## Validation result template')) {
    errors.push('Checklist is missing validation result template section');
  } else {
    for (const field of REQUIRED_VALIDATION_TEMPLATE_FIELDS) {
      if (!documentText.includes(`- ${field}`)) {
        errors.push(`Checklist is missing validation result template field: ${field}`);
      }
    }
  }

  if (!documentText.includes('## Trello update template')) {
    errors.push('Checklist is missing Trello update template section');
  } else {
    for (const field of REQUIRED_TRELLO_FIELDS) {
      if (!documentText.includes(`- ${field}`)) {
        errors.push(`Checklist is missing Trello template field: ${field}`);
      }
    }
  }

  return errors;
}

export function runManualRegressionChecklistValidation(repoRoot = process.cwd()) {
  const errors = validateManualRegressionChecklist(repoRoot);

  if (errors.length === 0) {
    console.log('Manual regression checklist validation passed.');
    return 0;
  }

  console.error('Manual regression checklist validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  return 1;
}

const entrypointPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : null;
const modulePath = fileURLToPath(import.meta.url);

if (entrypointPath === modulePath) {
  process.exitCode = runManualRegressionChecklistValidation();
}
