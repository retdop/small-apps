# CLAUDE.md — notes for AI agents

## Repository overview

Static site hosting a collection of small apps, deployed to GitHub Pages via GitHub Actions. No backend, no database.

## Key facts

- **No root-level package manager.** Don't add a `package.json` or install anything at the repo root. Each compiled app lives in its own subdirectory with its own dependencies.
- **`projects.js` is the project registry.** To add or remove a card on the landing page, only edit this file.
- **`projects/` does NOT contain committed build artifacts.** Compiled `.js` and `.css` files are in `.gitignore` — they are built and copied into `projects/` by the CI/deploy workflows at runtime, never committed.
- **pnpm is the package manager** for all compiled apps. Use `pnpm install --frozen-lockfile` to match CI.
- **HTML validation runs on every PR.** All `.html` files under `projects/` (and `index.html`) are validated by `html-validate`. Keep markup valid.

## Project types

| Type | Example | Build step | Files |
|---|---|---|---|
| Vanilla | *(simple tools only)* | None | `projects/*.html`, `*.css`, `*.js` |
| Compiled (React) | Mots Fléchés, Task Logger | Vite (pnpm) | Source in `*-source-app/`, output in `projects/` |

**Vanilla is allowed** for genuinely simple, single-purpose tools with minimal state. For anything with non-trivial UI, multi-section state, or that may grow in complexity, use the React stack.

## Standard stack for compiled apps

All compiled apps use: **React 19 + TypeScript + Vite + Tailwind CSS 3**

- No Radix UI required for simple apps — add only what you need
- Path alias: `@` maps to `src/`
- Dev server: `pnpm dev` inside the source directory
- Build output: `dist/<app-name>.js` and `dist/<app-name>.css` — copied to `projects/` by CI, never committed
- Output filenames must be deterministic (no hashes) — the HTML entry points reference them by fixed name

### Vite config template

```ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: "my-app.js",
      chunkFileNames: "my-app-[name].js",
      assetFileNames: (assetInfo) => {
        if (assetInfo.name?.endsWith(".css")) return "my-app.css";
        return assetInfo.name ?? "asset";
      },
    },
  },
},
```

## CI/CD workflows

| File | Trigger | Does |
|---|---|---|
| `.github/workflows/ci.yml` | PR to `main` | Builds all compiled apps, validates HTML |
| `.github/workflows/deploy.yml` | Push to `main` | Builds, copies artifacts, uploads whole repo as Pages artifact, deploys |

Both workflows use `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` to pin GitHub Actions JS runtime.

## Adding a new vanilla app

1. Add files to `projects/my-app.html` (+ `.css`, `.js` as needed).
2. Add an entry to `projects.js`.
3. Ensure the HTML passes `html-validate`.

## Adding a new compiled/React app

1. Create a source directory, e.g. `my-app-source/`.
2. Set up Vite to produce deterministic output file names (no hashes) in `projects/` (see template above).
3. Add build + copy steps to both CI and deploy workflows, mirroring the existing app steps.
4. Create `projects/my-app.html` referencing the compiled assets.
5. Add an entry to `projects.js`.
6. Add the output `.js` and `.css` to `.gitignore`.

## Mots Fléchés source app

- Location: `mots-fleches-source-app/`
- Stack: React 19 + TypeScript + Vite + Tailwind CSS 3 + Radix UI
- Path alias: `@` maps to `src/`
- Dev server: `pnpm dev` inside `mots-fleches-source-app/`
- Build output: `dist/mots-fleches.js` and `dist/mots-fleches.css` — copied to `projects/` by CI, not committed

## Task Logger source app

- Location: `task-logger-source/`
- Stack: React 19 + TypeScript + Vite + Tailwind CSS 3
- Dev server: `pnpm dev` inside `task-logger-source/`
- Build output: `dist/task-logger.js` and `dist/task-logger.css` — copied to `projects/` by CI, not committed
- Stores data in `localStorage` (key: `task_logger_data`)

## Styling conventions

The landing page uses a dark GitHub-style palette defined as CSS variables in `styles.css`. Compiled apps use Tailwind with the same palette as inline arbitrary values. New apps don't need to match exactly but should be readable on dark backgrounds.

## Workflow rules

- **Always verify CI passes before declaring work done.** After pushing, check the PR's check runs and wait for all to succeed. Fix any failures before finishing.

## Things to avoid

- Don't add a monorepo tool (Turborepo, Nx, etc.) — the build graph is simple enough to manage manually.
- Don't add frameworks to the landing page (`index.html` + `script.js` + `styles.css`) — keep it zero-dependency.
- Don't rename or move `projects.js` without updating `index.html`.
- Don't hash output filenames in compiled apps — the HTML entry points reference them by fixed name.
