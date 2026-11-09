// Mode B step 1: prints a User Story from Azure DevOps for analysis.
//
//   node ai-agent/fetch-story.ts <work-item-id>          # readable summary
//   node ai-agent/fetch-story.ts <work-item-id> --json   # machine-readable

import { acceptanceCriteriaOf, getWorkItem, parentIdOf, stripHtml, workItemWebUrl } from "./ado-client.ts";
import { testCases } from "./test-cases.ts";

const id = Number(process.argv[2]);
const asJson = process.argv.includes("--json");
if (!Number.isInteger(id) || id <= 0) {
  console.error("Usage: node ai-agent/fetch-story.ts <work-item-id> [--json]");
  process.exit(2);
}

async function main() {
  const item = await getWorkItem(id);
  const f = item.fields;
  const testedBy = (item.relations ?? [])
    .filter((r) => r.rel === "Microsoft.VSTS.Common.TestedBy-Forward")
    .map((r) => Number(r.url.split("/").pop()));
  const parentId = parentIdOf(item);
  const parent = parentId ? await getWorkItem(parentId) : undefined;

  const story = {
    id,
    type: f["System.WorkItemType"],
    title: f["System.Title"],
    state: f["System.State"],
    url: workItemWebUrl(id),
    parent: parent ? { id: parentId, type: parent.fields["System.WorkItemType"], title: parent.fields["System.Title"] } : null,
    description: stripHtml(String(f["System.Description"] ?? "").replace(/<br\s*\/?>|<\/(div|p|li)>/gi, "\n")),
    acceptanceCriteria: acceptanceCriteriaOf(item),
    tags: f["System.Tags"] ?? "",
    linkedTestCases: testedBy,
    localTestCaseSpecs: testCases.filter((t) => t.storyId === id).map((t) => t.automatedTest),
  };

  if (asJson) {
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  console.log(`#${story.id} [${story.type}] ${story.title}  (${story.state})`);
  console.log(story.url);
  if (story.parent) console.log(`Parent: #${story.parent.id} [${story.parent.type}] ${story.parent.title}`);
  else console.log("Parent: none");
  console.log(`\nDescription:\n  ${story.description || "(empty)"}`);
  console.log(`\nAcceptance criteria (${story.acceptanceCriteria.length}):`);
  story.acceptanceCriteria.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  if (!story.acceptanceCriteria.length) console.log("  (none)");
  console.log(`\nLinked Test Cases in Azure DevOps: ${testedBy.length ? testedBy.map((t) => "#" + t).join(", ") : "none"}`);
  console.log(`Local Test Case specs: ${story.localTestCaseSpecs.length ? story.localTestCaseSpecs.join(", ") : "none"}`);
  if (story.type !== "User Story") console.log(`\nWARNING: #${id} is a ${story.type}, not a User Story.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
