# claude-stuff

A personal portfolio site for code projects, writing, experiments, and notes. Built with static HTML/CSS and deployed via GitHub Pages.

## Adding a new project

Edit `projects.js` and add an object to the `PROJECTS` array:

```js
{
  title: "My New Project",
  description: "A short description of the project.",
  category: "code",          // code | writing | experiment | notes
  tags: ["python", "web"],
  link: "https://example.com", // or null
  date: "2026-03"
}
```

Commit and push. The GitHub Action deploys automatically.

## Setup

1. Go to **Settings > Pages** in the GitHub repo
2. Set source to **GitHub Actions**
3. Push to the `claude/github-pages-website-zkLRn` branch to trigger deployment
