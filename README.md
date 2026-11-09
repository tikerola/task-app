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

Test titles follow `US-{story-id}-{scenario-name}`. The IDs are placeholders (`US-01`…`US-04`)
until the User Stories exist in Azure DevOps; they will then be replaced with real work item IDs.

| Story | Test file |
| ----- | --------- |
| US-01 Display Tasks | `tests/display-tasks.spec.ts` |
| US-02 Add Task | `tests/add-task.spec.ts` |
| US-03 Complete Task | `tests/complete-task.spec.ts` |
| US-04 Delete Task | `tests/delete-task.spec.ts` |
