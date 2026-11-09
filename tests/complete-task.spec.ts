import { test, expect } from "@playwright/test";
import { openWithTasks, taskItem } from "./helpers";

// US-03: Complete Task

test("US-03-complete-task", async ({ page }) => {
  await openWithTasks(page, [{ description: "Finish report" }]);

  const checkbox = page.getByRole("checkbox", { name: 'Mark "Finish report" as completed' });
  await checkbox.check();

  await expect(checkbox).toBeChecked();
  await expect(taskItem(page, "Finish report")).toHaveClass(/task-item--completed/);
});

test("US-03-completed-state-persists", async ({ page }) => {
  await openWithTasks(page, [{ description: "Finish report" }]);

  await page.getByRole("checkbox", { name: 'Mark "Finish report" as completed' }).check();
  await page.reload();

  await expect(page.getByRole("checkbox", { name: 'Mark "Finish report" as completed' })).toBeChecked();
  await expect(taskItem(page, "Finish report")).toHaveClass(/task-item--completed/);
});
