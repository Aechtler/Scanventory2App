import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const repoRoot = path.resolve(import.meta.dirname, '..');
const mobileRoot = path.join(repoRoot, 'packages', 'mobile');
const sourceExtensions = new Set(['.ts', '.tsx']);
const ignoredDirectories = new Set(['.expo', 'dist', 'node_modules']);
const failures = [];

function collectSourceFiles(directoryPath) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        return [];
      }

      return collectSourceFiles(entryPath);
    }

    return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : [];
  });
}

function report(relativePath, line, column, message) {
  failures.push(`${relativePath}:${line}:${column} ${message}`);
}

function checkFile(filePath) {
  const relativePath = path.relative(repoRoot, filePath);
  const sourceText = fs.readFileSync(filePath, 'utf8');

  if (sourceText.includes('<<<<<<<') || sourceText.includes('>>>>>>>')) {
    report(relativePath, 1, 1, 'merge conflict markers detected');
  }

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  for (const diagnostic of sourceFile.parseDiagnostics) {
    const position =
      diagnostic.start !== undefined
        ? sourceFile.getLineAndCharacterOfPosition(diagnostic.start)
        : null;

    report(
      relativePath,
      (position?.line ?? 0) + 1,
      (position?.character ?? 0) + 1,
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    );
  }

  function visit(node) {
    if (ts.isDebuggerStatement(node)) {
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      report(relativePath, position.line + 1, position.character + 1, 'debugger statement detected');
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

for (const filePath of collectSourceFiles(mobileRoot)) {
  checkFile(filePath);
}

if (failures.length > 0) {
  console.error('Mobile lint failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Mobile lint passed.');
