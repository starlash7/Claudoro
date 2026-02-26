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

## Draft Release Upload (manual)

Workflow: `.github/workflows/release-draft.yml`

Trigger:

- `workflow_dispatch` only (manual run from GitHub Actions)

Targets:

- macOS package + upload to GitHub draft release
- Windows package + upload to GitHub draft release

Behavior:

- Uses `GH_TOKEN=${{ github.token }}` (no extra secret required)
- Publishes release assets with `electron-builder --publish always`
- Keeps release type as `draft` based on `electron-builder.yml`

## Signed Packaging (manual)

Workflow: `.github/workflows/release-signed.yml`

Use this workflow when preparing store-distributable binaries.

Required repository secrets:

- `CSC_LINK_MAC`
- `CSC_KEY_PASSWORD_MAC`
- `CSC_LINK_WIN`
- `CSC_KEY_PASSWORD_WIN`
- `GH_TOKEN`
- `APPLE_ID` (macOS only)
- `APPLE_APP_SPECIFIC_PASSWORD` (macOS only)
- `APPLE_TEAM_ID` (macOS only)

Workflow behavior:

- Secret validation runs before dependency install.
- If required secrets are missing, the job fails fast with explicit secret names.

Targets:

- Signed macOS package (`npm run build:mac -- --publish never --config.mac.notarize=true`)
- Signed Windows package (`npm run build:win -- --publish never`)

Artifacts:

- Uploads signed `dist/**` artifacts per platform.

## Release QA Gate

Before tagging, run:

1. `npm run qa:release`
2. Manual checks from `docs/RELEASE_QA_CHECKLIST.md` sections 1-6.

Only tag after both steps pass.

## Auto-Update Channel

`electron-builder` publish provider is GitHub Releases (`starlash7/Claudoro`) with draft releases.
Promote drafts to published once validation is complete.

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
