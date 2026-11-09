# ai-agent

Azure DevOps integration scripts used by Claude Code. Claude Code itself is the AI agent;
no separate agent framework is built here.

| File | Purpose |
| ---- | ------- |
| `ado-client.ts` | Minimal Azure DevOps REST client (read/create/update work items, links, WIQL). |
| `backlog.ts` | Initial Epic and User Story definitions (CLAUDE.md section 4). |
| `bootstrap-backlog.ts` | Creates the Epic and User Stories if missing, links and verifies them. |
| `traceability.json` | Generated mapping: User Story ID ↔ Playwright test file. |

## Requirements

- Node.js 24+ (runs TypeScript directly).
- Environment variables `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PROJECT`, `AZURE_DEVOPS_PAT`.
  Never commit the PAT.

## Usage

```bash
node ai-agent/bootstrap-backlog.ts --dry-run   # show what would be created
node ai-agent/bootstrap-backlog.ts             # create missing items and verify
```

The script is idempotent: items are matched by work item type and exact title, so re-running
it never creates duplicates.
