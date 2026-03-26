// Project data — add new projects by appending objects to this array.
// Categories: "code", "writing", "experiment", "notes"
const PROJECTS = [
  {
    title: "CLI Task Runner",
    description:
      "A lightweight command-line task runner for automating dev workflows. Supports parallel execution, dependency graphs, and YAML config.",
    category: "code",
    tags: ["python", "cli", "automation"],
    link: null,
    date: "2026-03",
  },
  {
    title: "On Building in Public",
    description:
      "Reflections on sharing work-in-progress and learning in the open. Why showing messy drafts leads to better outcomes.",
    category: "writing",
    tags: ["essay", "process"],
    link: null,
    date: "2026-02",
  },
  {
    title: "Markov Chain Text Generator",
    description:
      "Generating pseudo-coherent text from corpus data using Markov chains. Includes interactive demo and configurable n-gram order.",
    category: "experiment",
    tags: ["python", "nlp", "generative"],
    link: null,
    date: "2026-01",
  },
  {
    title: "Dev Environment Setup",
    description:
      "Documented setup for a reproducible development environment. Covers shell config, editor plugins, and toolchain installation.",
    category: "notes",
    tags: ["linux", "dotfiles", "setup"],
    link: null,
    date: "2025-12",
  },
  {
    title: "Git Hooks Collection",
    description:
      "Reusable pre-commit and commit-msg hooks for consistent code quality. Lint, format, and validate before every commit.",
    category: "code",
    tags: ["git", "bash", "devtools"],
    link: null,
    date: "2025-11",
  },
];
