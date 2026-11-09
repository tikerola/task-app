import { expect, type Page } from "@playwright/test";

export const STORAGE_KEY = "ai-sdlc-demo.tasks";

export interface SeedTask {
  description: string;
  completed?: boolean;
}

/** Opens the app with the given tasks already stored in LocalStorage. */
export async function openWithTasks(page: Page, tasks: SeedTask[]): Promise<void> {
  await page.goto("./");
  await page.evaluate(
    ({ key, items }) => {
      const stored = items.map((t, i) => ({
        id: `seed-${i}`,
        description: t.description,
        completed: t.completed ?? false,
        createdAt: new Date(0).toISOString(),
      }));
      localStorage.setItem(key, JSON.stringify(stored));
    },
    { key: STORAGE_KEY, items: tasks },
  );
  await page.reload();
}

export async function addTask(page: Page, description: string): Promise<void> {
  await page.getByLabel("Task description").fill(description);
  await page.getByRole("button", { name: "Add" }).click();
}

export function taskItem(page: Page, description: string) {
  return page.getByRole("listitem").filter({ hasText: description });
}

export async function expectTaskCount(page: Page, count: number): Promise<void> {
  if (count === 0) {
    await expect(page.getByRole("listitem")).toHaveCount(0);
  } else {
    await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(count);
  }
}
