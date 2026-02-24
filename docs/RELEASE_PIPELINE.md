# Claudoro Release Pipeline

## CI (every push/PR)

Workflow: `.github/workflows/ci.yml`

Steps:

1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Type check (`npm run typecheck`)
4. Build (`npm run build`)

CI must pass before release packaging.

## Release Packaging (manual)

Workflow: `.github/workflows/release-packages.yml`

Trigger:

- `workflow_dispatch` only (manual run from GitHub Actions)

Targets:

- macOS package (`npm run build:mac`)
- Windows package (`npm run build:win`)
- Linux package (`npm run build:linux`)

Artifacts:

- Uploads `dist/**` for each target as workflow artifacts.

## Versioning

- Follow SemVer (`major.minor.patch`)
- Bump version in `package.json` before tagging.
- Tag format: `vX.Y.Z`

## Release Notes Template

Use this structure:

1. New features
2. UX improvements
3. Bug fixes
4. Known issues
5. Upgrade notes

