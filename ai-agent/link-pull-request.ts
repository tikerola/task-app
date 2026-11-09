// Mode B step 14: records a GitHub Pull Request on the User Story as a hyperlink and a discussion comment.
// Idempotent: does nothing if the hyperlink already exists. Does not change the story's state or fields.
//
//   node ai-agent/link-pull-request.ts <story-id> <pull-request-url>

import { getWorkItem, updateWorkItem, workItemWebUrl } from "./ado-client.ts";

const id = Number(process.argv[2]);
const prUrl = process.argv[3] ?? "";
if (!Number.isInteger(id) || id <= 0 || !/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/.test(prUrl)) {
  console.error("Usage: node ai-agent/link-pull-request.ts <story-id> <https://github.com/owner/repo/pull/N>");
  process.exit(2);
}

async function main() {
  const story = await getWorkItem(id);
  const has = (s: typeof story) => (s.relations ?? []).some((r) => r.rel === "Hyperlink" && r.url === prUrl);
  if (has(story)) {
    console.log(`#${id} already links to ${prUrl}`);
    return;
  }
  await updateWorkItem(id, [
    { op: "add", path: "/relations/-", value: { rel: "Hyperlink", url: prUrl, attributes: { comment: "GitHub Pull Request" } } },
    {
      op: "add",
      path: "/fields/System.History",
      value: `Claude Code opened a GitHub Pull Request for this story: <a href="${prUrl}">${prUrl}</a>`,
    },
  ]);
  const verified = await getWorkItem(id);
  if (!has(verified)) throw new Error(`Verification failed: #${id} does not link to ${prUrl}`);
  console.log(`Linked ${prUrl} to #${id} (verified): ${workItemWebUrl(id)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
