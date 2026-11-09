---
name: develop-story
description: Mode B User Story Development workflow (CLAUDE.md section 6). Takes an Azure DevOps User Story ID, analyzes its acceptance criteria, creates linked Test Cases and Playwright tests, implements the change on a feature branch and opens a GitHub Pull Request. Use when the user asks to develop, implement or process a User Story, or runs /develop-story <id>.
argument-hint: <user-story-id>
---

# Develop a User Story (Mode B)

Process Azure DevOps User Story **#$ARGUMENTS** end to end. Follow CLAUDE.md, especially section 12
(Quality and Safety Rules). Work through the steps in order. Do not skip the checkpoints.

If no story ID was given, ask for it and stop.

## Environment notes

- Scripts in `ai-agent/` run with `node ai-agent/<script>.ts`. They read `AZURE_DEVOPS_ORG`,
  `AZURE_DEVOPS_PROJECT` and `AZURE_DEVOPS_PAT` from the environment, falling back to the Windows
  user environment. Never print, log or commit the PAT.
- GitHub CLI: use `gh`. If it is not on PATH, use `"C:\Program Files\GitHub CLI\gh.exe"`.
- On Windows PowerShell 5.1, pass PR bodies with `--body-file` (write the file to the scratchpad),
  never inline `--body` text containing quotes.

## 1. Retrieve the story

```
node ai-agent/fetch-story.ts $ARGUMENTS
```

Stop and report if the item is not a User Story, is Closed/Removed, or has no acceptance criteria.
If it already has linked Test Cases or local specs, tell the user and ask whether to extend or stop.

## 2. Analyze

Read the description and every acceptance criterion. Also read the current app code under `src/`
and the existing tests under `tests/`, so the analysis reflects how the app works today.

Produce a short analysis:

- What the story changes in the app (UI, behaviour, persistence).
- For each acceptance criterion: is it testable as written?
- Missing or ambiguous requirements, e.g. undefined labels, error messages, edge cases (empty input,
  long text, duplicates), interaction with existing features, persistence.
- Proposed assumptions for each gap.

## 3. Checkpoint: clarifications

If there are ambiguities that change behaviour, present them with your proposed assumptions and ask
the user to confirm before continuing. Do **not** edit the acceptance criteria in Azure DevOps.
If the user wants them changed, they change them, or they explicitly approve a specific edit
(CLAUDE.md: never modify acceptance criteria without reporting; changing requirements needs approval).

If there are no meaningful ambiguities, say so in one line and continue.

## 4. Test scenarios

Derive positive and negative scenarios from the acceptance criteria, not from assumptions about the
implementation. Each scenario must cover at least one criterion, and every criterion needs at least
one scenario.

Name each scenario `US-$ARGUMENTS-<scenario-name>` (kebab-case). Pick the Playwright file: extend the
existing feature file if the story changes that feature, otherwise create
`tests/<feature-name>.spec.ts`.

## 5. Create the branch

```
git checkout main && git pull --ff-only
git checkout -b feature/US-$ARGUMENTS-<short-description>
```

Stop if the working tree has uncommitted changes that are not yours. Ask the user.

## 6. Test Case specs

Append one `TestCaseDefinition` per scenario to `ai-agent/test-cases.ts` under a
`// US-$ARGUMENTS: <title>` comment. Copy `covers` entries **exactly** from the acceptance criteria
text printed in step 1. Include preconditions, steps (action + expected result), `kind` and `testFile`.

## 7. Playwright tests

Write the tests with titles exactly equal to `automatedTest`. Follow CLAUDE.md section 7:

- Accessible selectors (`getByRole`, `getByLabel`), no arbitrary timeouts, no order dependence.
- Navigate with `page.goto("./")` (the base path differs on GitHub Pages).
- Reuse the helpers in `tests/helpers.ts` (`openWithTasks`, `addTask`, `taskItem`, `expectTaskCount`).

Run the new tests before implementing. They should fail for the expected reason, which shows they
test the new behaviour:

```
npm run build && npx playwright test --grep "US-$ARGUMENTS-"
```

## 8. Implement

Make the smallest change that satisfies the criteria, following the existing structure
(`src/components`, `src/pages`, `src/services`, `src/types`). Keep existing behaviour intact.
Inspect any file before overwriting it.

## 9. Validate locally

```
npm run build
npx playwright test
node ai-agent/sync-test-cases.ts --dry-run
```

All tests, old and new, must pass. Never weaken, skip or delete an existing test to make the suite
pass. If an existing test conflicts with the new story, stop and ask the user. The dry run must
report full coverage and a 1:1 Test Case ↔ Playwright mapping.

## 10. Create and link Test Cases in Azure DevOps

```
node ai-agent/sync-test-cases.ts
```

This creates the missing Test Cases, links each to the story ("Tested By"), verifies them by
re-reading and updates `ai-agent/traceability.json`. Note the new Test Case IDs.

Update the traceability table in `README.md` with the story, its Test Case IDs and the test file.

## 11. Commit and push

Commit the code, tests, `ai-agent/test-cases.ts`, `ai-agent/traceability.json` and `README.md`
with a message like `Implement US-$ARGUMENTS <title>`, ending with the Co-Authored-By line required
in this session. Before committing, check that the PAT appears in no file. Push the branch.

## 12. Open the Pull Request

The PR body must contain (CLAUDE.md section 9):

- Related User Story: `#$ARGUMENTS <title>` with its Azure DevOps URL. Note that the `#` IDs are
  Azure DevOps work items, not GitHub issues.
- Summary of the implemented functionality.
- Generated Test Case IDs with titles.
- Playwright test file paths and test names.
- Local build result and test result, with counts as actually observed.
- Any assumptions made in step 3 and any open issues.

```
gh pr create --base main --head <branch> --title "US-$ARGUMENTS: <title>" --body-file <file>
```

Then wait for CI (`gh pr checks <branch> --watch`) and record the real result.

## 13. Link the PR to the story

```
node ai-agent/link-pull-request.ts $ARGUMENTS <pr-url>
```

## 14. Report

Report to the user:

- PR URL and CI result.
- Azure DevOps story URL and the new Test Case IDs.
- Files changed.
- Test results (local and CI), with counts. Report failures honestly.
- Assumptions, open issues and anything skipped.

**Do not merge the PR.** Merging and deployment need human approval. Tell the user the PR is ready
for review.
