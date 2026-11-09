# ai-agent

Azure DevOps integration scripts used by Claude Code. Claude Code itself is the AI agent;
no separate agent framework is built here.

| File | Purpose |
| ---- | ------- |
| `ado-client.ts` | Minimal Azure DevOps REST client (read/create/update work items, links, WIQL). |
| `backlog.ts` | Initial Epic and User Story definitions (CLAUDE.md section 4). |
| `bootstrap-backlog.ts` | Creates the Epic and User Stories if missing, links and verifies them. |
| `test-cases.ts` | Test Case specs (steps, expected results, criteria covered), one per Playwright test. |
| `sync-test-cases.ts` | Checks criteria coverage, creates missing Test Cases, links them to stories and verifies. |
| `traceability.json` | Generated mapping: User Story ↔ Test Case ↔ Playwright test. |
| `fetch-story.ts` | Prints a User Story (description, acceptance criteria, links) for analysis. |
| `link-pull-request.ts` | Adds a GitHub PR hyperlink and comment to a User Story (verified). |

## User Story Development workflow (Mode B)

Run in Claude Code:

```
/develop-story <user-story-id>
```

The workflow is defined in `.claude/skills/develop-story/SKILL.md`: fetch story → analyze and
clarify → test scenarios → feature branch → Test Case specs → Playwright tests → implement →
validate → create and link Test Cases → commit → Pull Request → link PR to story → report.
It never merges; merging and deployment need human approval.

## Requirements

- Node.js 24+ (runs TypeScript directly).
- Environment variables `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PROJECT`, `AZURE_DEVOPS_PAT`.
  On Windows, user-level variables are read from the registry if the current shell does not
  have them yet. Never commit the PAT.

## Usage

```bash
node ai-agent/bootstrap-backlog.ts --dry-run   # show what would be created
node ai-agent/bootstrap-backlog.ts             # create missing items and verify
node ai-agent/sync-test-cases.ts --dry-run     # check criteria coverage and test mapping
node ai-agent/sync-test-cases.ts               # create missing Test Cases, link and verify
```

Both scripts are idempotent: items are matched by work item type and exact title, so re-running
them never creates duplicates.

`sync-test-cases.ts` stops before changing anything if an acceptance criterion has no Test Case,
a Test Case cites a criterion that is not on the story, or Test Cases and Playwright test titles
do not match 1:1.

Traceability uses work item links ("Tested By") plus the automated test name and file in the Test
Case description. The `Microsoft.VSTS.TCM.AutomatedTest*` fields are left empty: a formal Azure Test
Plans automation association is not created.
