// Phase 4: creates Azure DevOps Test Cases for the Playwright tests and links them to User Stories.
//
//   node ai-agent/sync-test-cases.ts            # create missing Test Cases, link and verify
//   node ai-agent/sync-test-cases.ts --dry-run  # only check and report
//
// Steps:
//   1. Read each User Story from Azure DevOps and its acceptance criteria.
//   2. Check every acceptance criterion is covered by a Test Case, and every Test Case cites a real criterion.
//   3. Check Test Cases and Playwright test titles match 1:1.
//   4. Create missing Test Cases (idempotent, matched by title) with a "Tests" link to the User Story.
//   5. Re-read and verify each Test Case, then write ai-agent/traceability.json.
//
// Traceability is a work item link (User Story "Tested By" Test Case) plus the automated test name and file
// recorded in the Test Case description. It is NOT a formal Azure Test Plans automation association:
// the Microsoft.VSTS.TCM.AutomatedTest* fields are intentionally left empty.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import {
  acceptanceCriteriaOf,
  createWorkItem,
  findByTitle,
  getWorkItem,
  org,
  project,
  updateWorkItem,
  workItemWebUrl,
  type WorkItem,
} from "./ado-client.ts";
import { testCases, type TestCaseDefinition } from "./test-cases.ts";

const dryRun = process.argv.includes("--dry-run");
const TESTS_LINK = "Microsoft.VSTS.Common.TestedBy-Reverse";
const TAGS = "ai-sdlc-demo; automated-playwright";
const repoRoot = new URL("../", import.meta.url);
const traceabilityPath = new URL("./traceability.json", import.meta.url);

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function caseTitle(tc: TestCaseDefinition): string {
  return `${tc.automatedTest}: ${tc.title}`;
}

function descriptionHtml(tc: TestCaseDefinition): string {
  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  return [
    `<p>${escapeHtml(tc.description)}</p>`,
    `<p><b>Scenario type:</b> ${tc.kind}</p>`,
    `<p><b>Related User Story:</b> #${tc.storyId}</p>`,
    `<p><b>Acceptance criteria covered:</b></p>${list(tc.covers)}`,
    `<p><b>Preconditions:</b></p>${list(tc.preconditions)}`,
    `<p><b>Automated test (Playwright):</b></p>`,
    list([`Test identifier: ${tc.automatedTest}`, `File: ${tc.testFile}`]),
    `<p><i>Linked by work item relation only; not a formal Azure Test Plans automation association.</i></p>`,
  ].join("");
}

function stepsXml(steps: TestCaseDefinition["steps"]): string {
  // Step text is HTML (isformatted="true") stored inside XML, so it is escaped twice.
  const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const cell = (text: string) => `<parameterizedString isformatted="true">${xmlEscape(`<P>${escapeHtml(text)}</P>`)}</parameterizedString>`;
  const body = steps
    .map((s, i) => `<step id="${i + 2}" type="ValidateStep">${cell(s.action)}${cell(s.expected)}<description/></step>`)
    .join("");
  return `<steps id="0" last="${steps.length + 1}">${body}</steps>`;
}

function linkedStoryIds(item: WorkItem): number[] {
  return (item.relations ?? []).filter((r) => r.rel === TESTS_LINK).map((r) => Number(r.url.split("/").pop()));
}

function playwrightTestTitles(): Map<string, string> {
  const dir = new URL("tests/", repoRoot);
  const titles = new Map<string, string>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".spec.ts"))) {
    const src = readFileSync(new URL(file, dir), "utf8");
    for (const m of src.matchAll(/\btest\(\s*["'`]([^"'`]+)["'`]/g)) titles.set(m[1], `tests/${file}`);
  }
  return titles;
}

async function main() {
  console.log(`Azure DevOps: ${org}/${project}${dryRun ? " (dry run)" : ""}\n`);
  const problems: string[] = [];

  // 1-2. Read stories and check acceptance-criteria coverage.
  const storyIds = [...new Set(testCases.map((t) => t.storyId))];
  for (const id of storyIds) {
    const story = await getWorkItem(id);
    if (story.fields["System.WorkItemType"] !== "User Story") {
      problems.push(`#${id} is a ${story.fields["System.WorkItemType"]}, not a User Story`);
      continue;
    }
    const criteria = acceptanceCriteriaOf(story);
    const cases = testCases.filter((t) => t.storyId === id);
    console.log(`User Story #${id} ${story.fields["System.Title"]}: ${criteria.length} criteria, ${cases.length} test cases`);
    for (const c of criteria) {
      const n = cases.filter((t) => t.covers.includes(c)).length;
      console.log(`   ${n ? "✓" : "✗"} ${c}${n ? ` (${n})` : "  <-- NOT COVERED"}`);
      if (!n) problems.push(`#${id}: criterion not covered: "${c}"`);
    }
    for (const t of cases) {
      for (const c of t.covers) {
        if (!criteria.includes(c)) problems.push(`${t.automatedTest} cites a criterion not on #${id}: "${c}"`);
      }
    }
  }

  // 3. Test Cases <-> Playwright tests must match 1:1.
  const pw = playwrightTestTitles();
  for (const t of testCases) {
    const file = pw.get(t.automatedTest);
    if (!file) problems.push(`No Playwright test titled "${t.automatedTest}"`);
    else if (file !== t.testFile) problems.push(`"${t.automatedTest}" is in ${file}, expected ${t.testFile}`);
  }
  for (const title of pw.keys()) {
    if (!testCases.some((t) => t.automatedTest === title)) problems.push(`Playwright test "${title}" has no Test Case`);
  }

  if (problems.length) {
    console.log("\nStopping: fix these before creating Test Cases:");
    problems.forEach((p) => console.log(`  - ${p}`));
    process.exitCode = 1;
    return;
  }
  console.log(`\nCoverage OK: ${testCases.length} Test Cases ↔ ${pw.size} Playwright tests.\n`);

  // 4. Create or reuse Test Cases.
  const results: { tc: TestCaseDefinition; id: number | null; action: string }[] = [];
  for (const tc of testCases) {
    const title = caseTitle(tc);
    const existing = await findByTitle("Test Case", title);
    let id: number | null = null;
    let action: string;
    if (existing.length > 1) {
      throw new Error(`Found ${existing.length} Test Cases titled "${title}" (${existing.join(", ")}); resolve manually.`);
    } else if (existing.length === 1) {
      id = existing[0];
      const links = linkedStoryIds(await getWorkItem(id));
      if (links.includes(tc.storyId)) action = "exists";
      else if (dryRun) action = "exists, would link to story";
      else {
        await updateWorkItem(id, [
          {
            op: "add",
            path: "/relations/-",
            value: { rel: TESTS_LINK, url: `https://dev.azure.com/${org}/_apis/wit/workItems/${tc.storyId}` },
          },
        ]);
        action = "exists, linked to story";
      }
    } else if (dryRun) {
      action = "would create";
    } else {
      const created = await createWorkItem("Test Case", {
        "System.Title": title,
        "System.Tags": TAGS,
        "System.Description": descriptionHtml(tc),
        "Microsoft.VSTS.TCM.Steps": stepsXml(tc.steps),
      });
      id = created.id;
      await updateWorkItem(id, [
        {
          op: "add",
          path: "/relations/-",
          value: { rel: TESTS_LINK, url: `https://dev.azure.com/${org}/_apis/wit/workItems/${tc.storyId}` },
        },
      ]);
      action = "created";
    }
    results.push({ tc, id, action });
    console.log(`Test Case #${id ?? "-"}  ${title}  -> US #${tc.storyId}  [${action}]`);
  }

  if (dryRun) return;

  // 5. Verify by re-reading from Azure DevOps.
  console.log("\nVerifying in Azure DevOps...");
  let failures = 0;
  for (const r of results) {
    const item = await getWorkItem(r.id!);
    const issues: string[] = [];
    if (item.fields["System.WorkItemType"] !== "Test Case") issues.push("wrong type");
    if (item.fields["System.Title"] !== caseTitle(r.tc)) issues.push("title differs");
    if (!linkedStoryIds(item).includes(r.tc.storyId)) issues.push(`not linked to #${r.tc.storyId}`);
    const steps = String(item.fields["Microsoft.VSTS.TCM.Steps"] ?? "");
    const stepCount = (steps.match(/<step /g) ?? []).length;
    if (stepCount !== r.tc.steps.length) issues.push(`has ${stepCount} steps, expected ${r.tc.steps.length}`);
    if (!String(item.fields["System.Description"] ?? "").includes(r.tc.automatedTest)) issues.push("automated test id missing");
    if (issues.length) {
      failures++;
      console.log(`  #${r.id}: ${issues.join("; ")}`);
    }
  }
  console.log(failures ? `  ${failures} Test Case(s) failed verification.` : `  All ${results.length} Test Cases verified.`);

  // Update traceability mapping (adding stories that are not yet listed).
  const trace = JSON.parse(readFileSync(traceabilityPath, "utf8"));
  for (const id of storyIds) {
    if (trace.stories.some((s: { workItemId: number }) => s.workItemId === id)) continue;
    const story = await getWorkItem(id);
    const files = [...new Set(testCases.filter((t) => t.storyId === id).map((t) => t.testFile))];
    trace.stories.push({
      key: `US-${id}`,
      workItemId: id,
      title: story.fields["System.Title"],
      url: workItemWebUrl(id),
      testFile: files.length === 1 ? files[0] : files,
    });
  }
  for (const story of trace.stories) {
    story.testCases = results
      .filter((r) => r.tc.storyId === story.workItemId)
      .map((r) => ({
        testCaseId: r.id,
        title: r.tc.title,
        automatedTest: r.tc.automatedTest,
        testFile: r.tc.testFile,
        kind: r.tc.kind,
        url: workItemWebUrl(r.id!),
      }));
  }
  trace.association =
    "Work item links (User Story 'Tested By' Test Case) and automated test name/file in the Test Case description. " +
    "No formal Azure Test Plans automation association.";
  writeFileSync(traceabilityPath, JSON.stringify(trace, null, 2) + "\n");
  console.log("\nUpdated ai-agent/traceability.json");
  if (failures) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
