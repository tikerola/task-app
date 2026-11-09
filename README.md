# AI-SDLC Demo

A simple Task Management app used to demonstrate an AI-driven software development lifecycle:
Azure DevOps User Stories → Claude Code → Playwright tests → GitHub Actions → GitHub Pages.

See [CLAUDE.md](CLAUDE.md) for the full project description and roadmap.

## Getting started

```bash
npm install
npx playwright install chromium
npm run dev          # start the dev server
```

## Build and test

```bash
npm run build        # type-check and build to dist/
npm test             # run Playwright tests against the built app
```

Tests run against `vite preview`, so build before testing.

## Test traceability

Test titles follow `US-{story-id}-{scenario-name}`, where `story-id` is the Azure DevOps work item ID
(project `timokerola777/AI-SDLC-Demo`, Epic #1 *Task Management Application*).

| Work item | Story | Test file |
| --------- | ----- | --------- |
| #2 | Display Tasks | `tests/display-tasks.spec.ts` |
| #3 | Add Task | `tests/add-task.spec.ts` |
| #4 | Complete Task | `tests/complete-task.spec.ts` |
| #5 | Delete Task | `tests/delete-task.spec.ts` |

The machine-readable mapping is in `ai-agent/traceability.json`.
