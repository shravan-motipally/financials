# Infra/DevOps best practices

## npm scripts and git hooks must be cross-platform

This repo documents Windows, macOS, and Linux setup side by side in
`docs/PRE_COMMIT_SETUP.md` — so a script wired into `package.json` or a
Husky hook must actually run on all three, not just the platform it was
authored on.

- **Never hardcode an OS-specific path or extension** (backslashes, a
  `.cmd`/`.ps1` wrapper, a fixed `%USERPROFILE%\scoop\...` install
  location) into an npm script. Call the tool by its bare name (e.g.
  `gitleaks detect ...`) and let each platform's own install step (already
  documented per-OS) put it on `PATH`.
- **A pre-commit hook that only works on one OS is worse than no hook** —
  it silently blocks every commit on the other platforms until someone
  either fixes it or reaches for `--no-verify`, which defeats the point of
  having it. Test hook changes by actually running `git commit` after
  editing them, not just by re-reading the script.
