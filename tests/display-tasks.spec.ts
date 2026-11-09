import { test, expect } from "@playwright/test";
import { expectTaskCount, openWithTasks, taskItem } from "./helpers";

// US-01: Display Tasks

test("US-01-display-task-list", async ({ page }) => {
  await openWithTasks(page, [
    { description: "Write project plan" },
    { description: "Review pull request" },
  ]);

  await expect(page.getByRole("list", { name: "Tasks" })).toBeVisible();
  await expectTaskCount(page, 2);
});

test("US-01-display-task-description", async ({ page }) => {
  await openWithTasks(page, [{ description: "Write project plan" }]);

  await expect(taskItem(page, "Write project plan")).toBeVisible();
});

test("US-01-completed-task-distinguishable", async ({ page }) => {
  await openWithTasks(page, [
    { description: "Open task" },
    { description: "Done task", completed: true },
  ]);

  await expect(page.getByRole("checkbox", { name: 'Mark "Done task" as completed' })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: 'Mark "Open task" as completed' })).not.toBeChecked();
  await expect(taskItem(page, "Done task")).toHaveClass(/task-item--completed/);
  await expect(taskItem(page, "Open task")).not.toHaveClass(/task-item--completed/);
});

test("US-01-empty-state", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByText("No tasks yet.")).toBeVisible();
  await expectTaskCount(page, 0);
});
