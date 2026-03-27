# CLAUDE.md — notes for AI agents

## Repository overview

Static site hosting a collection of small apps, deployed to GitHub Pages via GitHub Actions. No backend, no database.

## Key facts

- **No root-level package manager.** Don't add a `package.json` or install anything at the repo root. Each compiled app lives in its own subdirectory with its own dependencies.
- **`projects.js` is the project registry.** To add or remove a card on the landing page, only edit this file.
- **`projects/` contains committed build artifacts.** `mots-fleches.js` and `mots-fleches.css` are compiled output that lives in the repo. After rebuilding Mots Fléchés locally, copy the dist files here before committing.
- **pnpm is the package manager** for `mots-fleches-source-app/`. Use `pnpm install --frozen-lockfile` to match CI.
- **HTML validation runs on every PR.** All `.html` files under `projects/` (and `index.html`) are validated by `html-validate`. Keep markup valid.

## Project types

| Type | Example | Build step | Files |
|---|---|---|---|
| Vanilla | Task Logger | None | `projects/*.html`, `*.css`, `*.js` |
| Compiled | Mots Fléchés | Vite (pnpm) | Source in `mots-fleches-source-app/`, output in `projects/` |

## CI/CD workflows

| File | Trigger | Does |
|---|---|---|
| `.github/workflows/ci.yml` | PR to `main` | Builds React apps, validates HTML |
| `.github/workflows/deploy.yml` | Push to `main` | Builds, uploads whole repo as Pages artifact, deploys |

Both workflows use `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` to pin GitHub Actions JS runtime.

## Adding a new vanilla app

1. Add files to `projects/my-app.html` (+ `.css`, `.js` as needed).
2. Add an entry to `projects.js`.
3. Ensure the HTML passes `html-validate`.

## Adding a new compiled/React app

1. Create a source directory, e.g. `my-app-source/`.
2. Set up Vite to produce deterministic output file names (no hashes) in `projects/`.
3. Add build + copy steps to both CI and deploy workflows, mirroring the Mots Fléchés steps.
4. Create `projects/my-app.html` referencing the compiled assets.
5. Add an entry to `projects.js`.
6. Commit the initial build artifacts.

## Mots Fléchés source app

- Location: `mots-fleches-source-app/`
- Stack: React 19 + TypeScript + Vite + Tailwind CSS 3 + Radix UI
- Path alias: `@` maps to `src/`
- Dev server: `pnpm dev` inside `mots-fleches-source-app/`
- Build output: `dist/mots-fleches.js` and `dist/mots-fleches.css` — copy to `projects/` after building

## Task Logger

- Location: `projects/task-logger.{html,css,js}`
- Pure vanilla JS, no dependencies, no build step
- Stores data in `localStorage`

## Styling conventions

The landing page uses a dark GitHub-style palette defined as CSS variables in `styles.css`. New apps don't need to match exactly but should be readable on dark backgrounds if embedded via the landing page.

## Workflow rules

- **Always verify CI passes before declaring work done.** After pushing, check the PR's check runs and wait for all to succeed. Fix any failures before finishing.

## Things to avoid

- Don't add a monorepo tool (Turborepo, Nx, etc.) — the build graph is simple enough to manage manually.
- Don't add frameworks to the landing page (`index.html` + `script.js` + `styles.css`) — keep it zero-dependency.
- Don't rename or move `projects.js` without updating `index.html`.
- Don't hash output filenames in compiled apps — the HTML entry points reference them by fixed name, and the filenames are committed.
