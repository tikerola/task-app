import { test, expect } from "@playwright/test";
import { expectTaskCount, openWithTasks, taskItem } from "./helpers";

// US-18: Edit Task

test("US-18-edit-task", async ({ page }) => {
  await openWithTasks(page, [{ description: "Buy milk" }, { description: "Call Alice" }]);

  await page.getByRole("button", { name: 'Edit "Buy milk"' }).click();
  const input = page.getByLabel("Edit task description");
  await expect(input).toHaveValue("Buy milk");

  await input.fill("Buy oat milk");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(input).toBeHidden();
  await expect(taskItem(page, "Buy oat milk")).toBeVisible();
  await expect(page.getByText("Buy milk", { exact: true })).toHaveCount(0);
  await expect(taskItem(page, "Call Alice")).toBeVisible();
  await expectTaskCount(page, 2);
});

test("US-18-cancel-edit", async ({ page }) => {
  await openWithTasks(page, [{ description: "Buy milk" }]);

  await page.getByRole("button", { name: 'Edit "Buy milk"' }).click();
  const input = page.getByLabel("Edit task description");
  await input.fill("Something else");
  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(input).toBeHidden();
  await expect(taskItem(page, "Buy milk")).toBeVisible();
  await expect(page.getByText("Something else")).toHaveCount(0);
});

test("US-18-reject-empty-edit", async ({ page }) => {
  await openWithTasks(page, [{ description: "Buy milk" }]);

  await page.getByRole("button", { name: 'Edit "Buy milk"' }).click();
  const input = page.getByLabel("Edit task description");
  await input.fill("");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("alert")).toHaveText("Task description cannot be empty.");
  await expect(input).toBeVisible();

  await page.reload();
  await expect(taskItem(page, "Buy milk")).toBeVisible();
  await expectTaskCount(page, 1);
});

test("US-18-reject-whitespace-edit", async ({ page }) => {
  await openWithTasks(page, [{ description: "Buy milk" }]);

  await page.getByRole("button", { name: 'Edit "Buy milk"' }).click();
  const input = page.getByLabel("Edit task description");
  await input.fill("   ");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(input).toBeVisible();

  await page.reload();
  await expect(taskItem(page, "Buy milk")).toBeVisible();
});

test("US-18-edited-description-persists", async ({ page }) => {
  await openWithTasks(page, [{ description: "Buy milk" }]);

  await page.getByRole("button", { name: 'Edit "Buy milk"' }).click();
  await page.getByLabel("Edit task description").fill("Buy oat milk");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(taskItem(page, "Buy oat milk")).toBeVisible();

  await page.reload();

  await expect(taskItem(page, "Buy oat milk")).toBeVisible();
  await expect(page.getByText("Buy milk", { exact: true })).toHaveCount(0);
});
