import { test, expect } from "@playwright/test";
import { addTask, expectTaskCount, taskItem } from "./helpers";

// US-02: Add Task

test("US-02-add-task", async ({ page }) => {
  await page.goto("./");

  await addTask(page, "Prepare project documentation");

  await expect(taskItem(page, "Prepare project documentation")).toBeVisible();
  await expect(page.getByLabel("Task description")).toHaveValue("");
});

test("US-02-add-multiple-tasks", async ({ page }) => {
  await page.goto("./");

  await addTask(page, "First task");
  await addTask(page, "Second task");

  await expectTaskCount(page, 2);
});

test("US-02-reject-empty-task", async ({ page }) => {
  await page.goto("./");

  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("alert")).toHaveText("INTENTIONALLY WRONG - CI check");
  await expectTaskCount(page, 0);
});

test("US-02-reject-whitespace-task", async ({ page }) => {
  await page.goto("./");

  await addTask(page, "   ");

  await expect(page.getByRole("alert")).toBeVisible();
  await expectTaskCount(page, 0);
});
