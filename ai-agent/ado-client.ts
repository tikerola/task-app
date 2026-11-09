// Minimal Azure DevOps REST client used by Claude Code scripts.
// Reads AZURE_DEVOPS_ORG, AZURE_DEVOPS_PROJECT and AZURE_DEVOPS_PAT from the environment.
// Run with Node 24+ (native TypeScript type stripping), e.g. `node ai-agent/bootstrap-backlog.ts`.

const API = "api-version=7.1";

export interface WorkItem {
  id: number;
  rev: number;
  url: string;
  fields: Record<string, unknown>;
  relations?: { rel: string; url: string; attributes?: Record<string, unknown> }[];
}

type PatchOp = { op: "add" | "replace" | "remove" | "test"; path: string; value?: unknown };

import { execFileSync } from "node:child_process";

/** On Windows, falls back to the user-level variable when the shell was started before it was set. */
function readEnv(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  if (process.platform !== "win32") return undefined;
  try {
    const out = execFileSync("reg", ["query", "HKCU\\Environment", "/v", name], { encoding: "utf8", stdio: "pipe" });
    return out.match(new RegExp(`${name}\\s+REG_\\w+\\s+(.+)`))?.[1]?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const org = requireEnv("AZURE_DEVOPS_ORG");
export const project = readEnv("AZURE_DEVOPS_PROJECT") ?? "AI-SDLC-Demo";
const baseUrl = `https://dev.azure.com/${encodeURIComponent(org)}`;
const projectUrl = `${baseUrl}/${encodeURIComponent(project)}`;
const authHeader = "Basic " + Buffer.from(":" + requireEnv("AZURE_DEVOPS_PAT")).toString("base64");

async function request<T>(method: string, url: string, body?: unknown, contentType = "application/json"): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { Authorization: authHeader, "Content-Type": contentType, Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${url} -> ${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }
  return (await res.json()) as T;
}

export function workItemWebUrl(id: number): string {
  return `${projectUrl}/_workitems/edit/${id}`;
}

export async function getWorkItem(id: number): Promise<WorkItem> {
  return request<WorkItem>("GET", `${baseUrl}/_apis/wit/workitems/${id}?$expand=relations&${API}`);
}

export async function queryIds(wiql: string): Promise<number[]> {
  const result = await request<{ workItems: { id: number }[] }>("POST", `${projectUrl}/_apis/wit/wiql?${API}`, {
    query: wiql,
  });
  return result.workItems.map((w) => w.id);
}

function escapeWiql(value: string): string {
  return value.replace(/'/g, "''");
}

/** Finds non-removed work items of a given type with an exact title. */
export async function findByTitle(type: string, title: string): Promise<number[]> {
  return queryIds(
    `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project ` +
      `AND [System.WorkItemType] = '${escapeWiql(type)}' AND [System.Title] = '${escapeWiql(title)}' ` +
      `AND [System.State] <> 'Removed' ORDER BY [System.Id]`,
  );
}

export async function createWorkItem(type: string, fields: Record<string, unknown>, parentId?: number): Promise<WorkItem> {
  const ops: PatchOp[] = Object.entries(fields).map(([k, v]) => ({ op: "add", path: `/fields/${k}`, value: v }));
  if (parentId !== undefined) ops.push(parentLinkOp(parentId));
  return request<WorkItem>(
    "POST",
    `${projectUrl}/_apis/wit/workitems/$${encodeURIComponent(type)}?${API}`,
    ops,
    "application/json-patch+json",
  );
}

export async function updateWorkItem(id: number, ops: PatchOp[]): Promise<WorkItem> {
  return request<WorkItem>("PATCH", `${baseUrl}/_apis/wit/workitems/${id}?${API}`, ops, "application/json-patch+json");
}

function parentLinkOp(parentId: number): PatchOp {
  return {
    op: "add",
    path: "/relations/-",
    value: { rel: "System.LinkTypes.Hierarchy-Reverse", url: `${baseUrl}/_apis/wit/workItems/${parentId}` },
  };
}

export function parentIdOf(item: WorkItem): number | undefined {
  const rel = item.relations?.find((r) => r.rel === "System.LinkTypes.Hierarchy-Reverse");
  return rel ? Number(rel.url.split("/").pop()) : undefined;
}

export async function setParent(childId: number, parentId: number): Promise<WorkItem> {
  return updateWorkItem(childId, [parentLinkOp(parentId)]);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Extracts acceptance criteria as a list of plain-text lines. Handles bullet lists and the
 * <div>/<br>/<p> line formats the Azure DevOps editor produces when criteria are typed by hand.
 */
export function acceptanceCriteriaOf(item: WorkItem): string[] {
  const html = String(item.fields["Microsoft.VSTS.Common.AcceptanceCriteria"] ?? "");
  return html
    .replace(/<br\s*\/?>|<\/(li|div|p|h\d)>/gi, "\n")
    .split("\n")
    .map((line) => stripHtml(line).replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

export function toHtmlList(items: string[]): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<ul>${items.map((i) => `<li>${escape(i)}</li>`).join("")}</ul>`;
}
