// Creates the initial Epic and User Stories in Azure DevOps (Phase 3).
// Idempotent: existing items with the same type and title are reused, never duplicated.
// Every created or linked item is re-read from Azure DevOps and verified.
//
//   node ai-agent/bootstrap-backlog.ts            # create missing items
//   node ai-agent/bootstrap-backlog.ts --dry-run  # only report what would happen

import { writeFileSync } from "node:fs";
import {
  createWorkItem,
  findByTitle,
  getWorkItem,
  org,
  parentIdOf,
  project,
  setParent,
  toHtmlList,
  workItemWebUrl,
} from "./ado-client.ts";
import { epic, stories } from "./backlog.ts";

const dryRun = process.argv.includes("--dry-run");
const TAGS = "ai-sdlc-demo";

async function ensure(
  type: string,
  title: string,
  fields: Record<string, unknown>,
  parentId?: number,
): Promise<{ id: number | null; action: string }> {
  const existing = await findByTitle(type, title);
  if (existing.length > 1) {
    throw new Error(`Found ${existing.length} ${type} items titled "${title}" (${existing.join(", ")}); resolve manually.`);
  }
  if (existing.length === 1) {
    const id = existing[0];
    if (parentId !== undefined) {
      const current = parentIdOf(await getWorkItem(id));
      if (current === undefined) {
        if (!dryRun) await setParent(id, parentId);
        return { id, action: dryRun ? "exists, would link to parent" : "exists, linked to parent" };
      }
      if (current !== parentId) return { id, action: `exists, WARNING: parent is #${current}, expected #${parentId}` };
    }
    return { id, action: "exists" };
  }
  if (dryRun) return { id: null, action: "would create" };
  const created = await createWorkItem(type, { "System.Title": title, "System.Tags": TAGS, ...fields }, parentId);
  return { id: created.id, action: "created" };
}

async function verify(id: number, type: string, title: string, parentId?: number): Promise<string[]> {
  const item = await getWorkItem(id);
  const problems: string[] = [];
  if (item.fields["System.WorkItemType"] !== type) problems.push(`type is ${item.fields["System.WorkItemType"]}`);
  if (item.fields["System.Title"] !== title) problems.push(`title is "${item.fields["System.Title"]}"`);
  if (parentId !== undefined && parentIdOf(item) !== parentId) problems.push(`parent is #${parentIdOf(item) ?? "none"}`);
  if (type === "User Story" && !item.fields["Microsoft.VSTS.Common.AcceptanceCriteria"]) {
    problems.push("acceptance criteria missing");
  }
  return problems;
}

async function main() {
  console.log(`Azure DevOps: ${org}/${project}${dryRun ? " (dry run)" : ""}\n`);

  const epicResult = await ensure("Epic", epic.title, { "System.Description": epic.description });
  console.log(`Epic  #${epicResult.id ?? "-"}  ${epic.title}  [${epicResult.action}]`);

  const mapping: Record<string, unknown>[] = [];
  let failures = 0;

  for (const story of stories) {
    const result = await ensure(
      "User Story",
      story.title,
      {
        "System.Description": story.description,
        "Microsoft.VSTS.Common.AcceptanceCriteria": toHtmlList(story.acceptanceCriteria),
      },
      epicResult.id ?? undefined,
    );
    console.log(`Story #${result.id ?? "-"}  ${story.key} ${story.title}  [${result.action}]`);
    if (result.id !== null) {
      mapping.push({
        key: story.key,
        workItemId: result.id,
        title: story.title,
        url: workItemWebUrl(result.id),
        testFile: story.testFile,
      });
    }
  }

  if (dryRun || epicResult.id === null) return;

  console.log("\nVerifying in Azure DevOps...");
  const epicProblems = await verify(epicResult.id, "Epic", epic.title);
  if (epicProblems.length) {
    failures++;
    console.log(`  Epic #${epicResult.id}: ${epicProblems.join("; ")}`);
  }
  for (const m of mapping) {
    const story = stories.find((s) => s.key === m.key)!;
    const problems = await verify(m.workItemId as number, "User Story", story.title, epicResult.id);
    if (problems.length) {
      failures++;
      console.log(`  ${m.key} #${m.workItemId}: ${problems.join("; ")}`);
    }
  }
  console.log(failures ? `  ${failures} item(s) failed verification.` : "  All items verified.");

  writeFileSync(
    new URL("./traceability.json", import.meta.url),
    JSON.stringify({ organization: org, project, epic: { workItemId: epicResult.id, title: epic.title }, stories: mapping }, null, 2) + "\n",
  );
  console.log("\nWrote ai-agent/traceability.json");
  if (failures) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
