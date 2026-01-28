# Lint Workflow

Prüft Code-Qualität und Formatierung.

## Verwendung
```
/lint [option]
```

## Parameter
- `check` - Nur prüfen (Standard)
- `fix` - Automatisch beheben
- `staged` - Nur staged Files prüfen

## Schritte

1. **ESLint ausführen**
   ```bash
   # Prüfen
   npx eslint . --ext .ts,.tsx

   # Mit Fix
   npx eslint . --ext .ts,.tsx --fix
   ```

2. **Prettier ausführen**
   ```bash
   # Prüfen
   npx prettier --check "**/*.{ts,tsx,json,md}"

   # Mit Fix
   npx prettier --write "**/*.{ts,tsx,json,md}"
   ```

3. **TypeScript Type-Check**
   ```bash
   npx tsc --noEmit
   ```

4. **Alle Checks zusammen**
   ```bash
   npm run lint && npm run typecheck
   ```

## Pre-Commit Hook

Für automatisches Linting vor Commits:
```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

## lint-staged Konfiguration (package.json)
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```
