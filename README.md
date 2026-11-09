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

## Developing a new User Story

Create the User Story (with acceptance criteria) in Azure DevOps, then in Claude Code run:

```
/develop-story <user-story-id>
```

Claude Code analyzes the story, asks about unclear requirements, creates linked Azure DevOps Test
Cases and Playwright tests, implements the change on `feature/US-<id>-…` and opens a Pull Request.
A human reviews and merges; GitHub Actions then deploys. See `ai-agent/README.md`.

## Test traceability

Test titles follow `US-{story-id}-{scenario-name}`, where `story-id` is the Azure DevOps work item ID
(project `timokerola777/AI-SDLC-Demo`, Epic #1 *Task Management Application*).

| User Story | Test Cases | Test file |
| ---------- | ---------- | --------- |
| #2 Display Tasks | #6–#9 | `tests/display-tasks.spec.ts` |
| #3 Add Task | #10–#13 | `tests/add-task.spec.ts` |
| #4 Complete Task | #14–#15 | `tests/complete-task.spec.ts` |
| #5 Delete Task | #16–#17 | `tests/delete-task.spec.ts` |

Each Azure DevOps Test Case is titled `<playwright test title>: <description>` and maps 1:1 to a
Playwright test. Test Cases are linked to their User Story ("Tested By") and record the automated
test name and file in their description. This is a work item link, **not** a formal Azure Test Plans
automation association.

The full mapping (story ↔ Test Case ↔ Playwright test) is in `ai-agent/traceability.json`.
