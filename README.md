# small-apps

A collection of small experiments and projects, deployed as a static site via GitHub Pages.

Live at: **https://retdop.github.io/small-apps**

## Structure

```
small-apps/
├── index.html                  # Landing page (vanilla HTML)
├── script.js                   # Renders the project grid from projects.js
├── styles.css                  # Landing page styles (dark GitHub-style theme)
├── projects.js                 # Project registry — the single source of truth
├── projects/                   # Self-contained project files
│   ├── task-logger.html        # Entry point for the Task Logger React app
│   ├── mots-fleches.html       # Entry point for the Mots Fléchés React app
│   └── routine-tracker.html    # Entry point for the Routine Tracker React app
├── task-logger-source/         # React + TypeScript source for Task Logger
├── mots-fleches-source-app/    # React + TypeScript source for Mots Fléchés
└── routine-tracker-source/     # React + TypeScript source for Routine Tracker
```

> Compiled `.js` and `.css` files are **not committed** — they are built and copied into `projects/` by the CI/deploy workflows at runtime.

## Design decisions

### No root-level build tooling
The landing page is intentionally dependency-free vanilla HTML/CSS/JS. There is no `package.json` or bundler at the root. Each compiled app manages its own dependencies in its subdirectory.

### projects.js as the project registry
`projects.js` is the single place to register a project on the landing page. `script.js` reads this array at runtime and renders the card grid. Adding a project does not require touching any other file.

### Hybrid project types
Two patterns are supported:
- **Vanilla apps**: one or a few self-contained files in `projects/`. No build step, deployed as-is.
- **Compiled apps** (React + TypeScript + Vite + Tailwind): source in a `*-source/` subdirectory, built by CI/CD. The compiled output is written to `projects/` at deploy time and is not committed to the repo.

### Build artifacts are not committed
Compiled JS/CSS is excluded via `.gitignore` and generated fresh by CI on every build. This avoids noisy diffs and merge conflicts on generated files.

### Dark GitHub-style theme
`styles.css` uses CSS custom properties (`--bg-primary`, `--accent`, etc.) matching GitHub's dark palette. New apps should ideally follow the same visual language.

### Two-stage CI/CD
- **CI workflow** (runs on pull requests): builds all React apps and validates all HTML files with `html-validate`.
- **Deploy workflow** (runs on push to `main`): rebuilds everything, copies artifacts into `projects/`, uploads the whole repo as a Pages artifact, and deploys to GitHub Pages.

## Adding a new project

### Vanilla app

1. Create your files in `projects/` (e.g. `projects/my-app.html`).
2. Register it in `projects.js`:

```js
{
  title: "My App",
  description: "A short description.",
  link: "projects/my-app.html",
  date: "2026-03"
}
```

3. Commit and push — the deploy workflow runs automatically.

### React/compiled app

1. Scaffold a new app in a subdirectory (e.g. `my-app-source/`).
2. Configure Vite to output a single named JS file and CSS file (no hashes).
3. Add build + copy steps to both `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` (mirror the existing app steps).
4. Create an HTML entry point at `projects/my-app.html` referencing the compiled assets.
5. Add the output `.js` and `.css` to `.gitignore`.
6. Register it in `projects.js` as above.

## Local development

### Landing page / vanilla apps
No build step needed. Serve the root with any static server:

```sh
npx serve .
```

### React apps
Each compiled app has its own dev server:

```sh
cd task-logger-source   # or mots-fleches-source-app / routine-tracker-source
pnpm install
pnpm dev
```

To preview integrated in the full site, build and serve from the root:

```sh
pnpm build              # outputs to dist/
npx serve ..            # serve from small-apps root
```

## Setup (first time)

1. Go to **Settings > Pages** in the GitHub repo.
2. Set source to **GitHub Actions**.
3. Push to `main` to trigger the first deployment.
