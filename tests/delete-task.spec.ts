import { test, expect } from "@playwright/test";
import { expectTaskCount, openWithTasks, taskItem } from "./helpers";

// US-04: Delete Task

test("US-04-delete-task", async ({ page }) => {
  await openWithTasks(page, [{ description: "Keep me" }, { description: "Remove me" }]);

  await page.getByRole("button", { name: 'Delete "Remove me"' }).click();

  await expect(taskItem(page, "Remove me")).toHaveCount(0);
  await expect(taskItem(page, "Keep me")).toBeVisible();
  await expectTaskCount(page, 1);
});

test("US-04-deletion-persists", async ({ page }) => {
  await openWithTasks(page, [{ description: "Keep me" }, { description: "Remove me" }]);

  await page.getByRole("button", { name: 'Delete "Remove me"' }).click();
  await page.reload();

  await expect(taskItem(page, "Remove me")).toHaveCount(0);
  await expect(taskItem(page, "Keep me")).toBeVisible();
});
