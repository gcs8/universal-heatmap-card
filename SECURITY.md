# Security Notes

This project treats npm install-time execution as a supply-chain risk.

## Dependency Install Rules

- Use `npm ci --ignore-scripts` for clean installs.
- Keep `package-lock.json` committed.
- Keep direct dependency versions pinned exactly in `package.json`.
- Do not add dependencies casually; prefer local code for small utilities.
- Review any package that requires `preinstall`, `install`, `postinstall`, or `prepare`.

The repo-level `.npmrc` sets `ignore-scripts=true`, so dependency lifecycle scripts are disabled by default. Explicit `npm run ...` commands still run the project scripts you invoke directly.

## Expected Lifecycle Scripts

The current tree includes `esbuild`, which declares a `postinstall` script in its package metadata. The clean bootstrap is validated with lifecycle scripts disabled so this package cannot execute during install.

## Safe Bootstrap

```sh
npm ci --ignore-scripts
npm test
npm run build
```

Run `npm audit` as a vulnerability signal, not as proof that the dependency tree is safe from newly compromised packages.

## GitHub Actions

Workflow actions are pinned to full commit SHAs. Refresh those pins deliberately during release maintenance rather than using moving refs such as tags or branch names.

Dependabot is configured for GitHub Actions and npm update PRs. Treat those PRs as prompts for review, not automatic approval.

## Debug Logging

Card debug logs are opt-in through `debug: true` or the documented localStorage flag. They avoid tokens and raw recorder rows, but may include entity IDs, value ranges, bucket counts, and timing data. Do not leave debug enabled when sharing browser console output from a private Home Assistant instance.
