// Test Case specifications derived from each User Story's acceptance criteria.
// Each Test Case maps 1:1 to a Playwright test whose title equals `automatedTest`.

export interface TestStep {
  action: string;
  expected: string;
}

export interface TestCaseDefinition {
  storyId: number;
  automatedTest: string;
  testFile: string;
  title: string;
  kind: "positive" | "negative";
  description: string;
  /** Acceptance criteria (exact text from the User Story) this Test Case verifies. */
  covers: string[];
  preconditions: string[];
  steps: TestStep[];
}

const FRESH = "The application is open in a browser with no stored tasks.";
const seeded = (tasks: string) => `The application is open with these stored tasks: ${tasks}.`;

export const testCases: TestCaseDefinition[] = [
  // US-2: Display Tasks
  {
    storyId: 2,
    automatedTest: "US-2-display-task-list",
    testFile: "tests/display-tasks.spec.ts",
    title: "Display a list of stored tasks",
    kind: "positive",
    description: "Verifies that stored tasks are shown as a list.",
    covers: ["The application displays a list of tasks."],
    preconditions: [seeded('"Write project plan", "Review pull request"')],
    steps: [
      { action: "Open the application.", expected: "A task list labelled \"Tasks\" is visible." },
      { action: "Count the items in the task list.", expected: "The list contains exactly 2 tasks." },
    ],
  },
  {
    storyId: 2,
    automatedTest: "US-2-display-task-description",
    testFile: "tests/display-tasks.spec.ts",
    title: "Each task shows its description",
    kind: "positive",
    description: "Verifies that a task's description text is displayed in the list.",
    covers: ["Each task displays its description."],
    preconditions: [seeded('"Write project plan"')],
    steps: [{ action: "Open the application.", expected: "A list item with the text \"Write project plan\" is visible." }],
  },
  {
    storyId: 2,
    automatedTest: "US-2-completed-task-distinguishable",
    testFile: "tests/display-tasks.spec.ts",
    title: "Completed tasks are visually distinguishable",
    kind: "positive",
    description: "Verifies that completed and open tasks are displayed differently.",
    covers: ["Completed tasks are visually distinguishable."],
    preconditions: [seeded('"Open task" (not completed), "Done task" (completed)')],
    steps: [
      { action: "Open the application.", expected: "Both tasks are visible." },
      { action: "Inspect \"Done task\".", expected: "Its checkbox is checked and the task is shown in completed style (struck through)." },
      { action: "Inspect \"Open task\".", expected: "Its checkbox is not checked and the task is shown in normal style." },
    ],
  },
  {
    storyId: 2,
    automatedTest: "US-2-empty-state",
    testFile: "tests/display-tasks.spec.ts",
    title: "Empty task list shows an empty-state message",
    kind: "negative",
    description: "Verifies the display when there are no tasks.",
    covers: ["The application displays a list of tasks."],
    preconditions: [FRESH],
    steps: [{ action: "Open the application.", expected: "The message \"No tasks yet.\" is shown and no task items are listed." }],
  },

  // US-3: Add Task
  {
    storyId: 3,
    automatedTest: "US-3-add-task",
    testFile: "tests/add-task.spec.ts",
    title: "Add a task with a valid description",
    kind: "positive",
    description: "Verifies that a user can enter a description and add it with the Add button.",
    covers: [
      "A user can enter a task description.",
      "A user can add a task using an Add button.",
      "The new task appears in the task list.",
    ],
    preconditions: [FRESH],
    steps: [
      { action: "Type \"Prepare project documentation\" into the \"Task description\" field.", expected: "The text is shown in the field." },
      { action: "Click the \"Add\" button.", expected: "\"Prepare project documentation\" appears in the task list." },
      { action: "Inspect the \"Task description\" field.", expected: "The field is cleared." },
    ],
  },
  {
    storyId: 3,
    automatedTest: "US-3-add-multiple-tasks",
    testFile: "tests/add-task.spec.ts",
    title: "Add multiple tasks",
    kind: "positive",
    description: "Verifies that several tasks can be added one after another.",
    covers: ["The new task appears in the task list."],
    preconditions: [FRESH],
    steps: [
      { action: "Add a task \"First task\".", expected: "\"First task\" appears in the list." },
      { action: "Add a task \"Second task\".", expected: "The list contains exactly 2 tasks." },
    ],
  },
  {
    storyId: 3,
    automatedTest: "US-3-reject-empty-task",
    testFile: "tests/add-task.spec.ts",
    title: "Reject an empty task description",
    kind: "negative",
    description: "Verifies that submitting an empty description is rejected.",
    covers: ["Empty task descriptions are rejected."],
    preconditions: [FRESH],
    steps: [
      {
        action: "Leave the \"Task description\" field empty and click \"Add\".",
        expected: "The error \"Task description cannot be empty.\" is shown and no task is added.",
      },
    ],
  },
  {
    storyId: 3,
    automatedTest: "US-3-reject-whitespace-task",
    testFile: "tests/add-task.spec.ts",
    title: "Reject a whitespace-only task description",
    kind: "negative",
    description: "Verifies that a description containing only spaces is treated as empty.",
    covers: ["Empty task descriptions are rejected."],
    preconditions: [FRESH],
    steps: [
      { action: "Type three spaces into the \"Task description\" field and click \"Add\".", expected: "An error message is shown and no task is added." },
    ],
  },

  // US-4: Complete Task
  {
    storyId: 4,
    automatedTest: "US-4-complete-task",
    testFile: "tests/complete-task.spec.ts",
    title: "Mark a task as completed",
    kind: "positive",
    description: "Verifies that a task can be marked completed and shows a completed state.",
    covers: ["A task can be marked as completed.", "Completed tasks have a visible completed state."],
    preconditions: [seeded('"Finish report" (not completed)')],
    steps: [
      { action: "Check the checkbox of \"Finish report\".", expected: "The checkbox is checked." },
      { action: "Inspect \"Finish report\".", expected: "The task is shown in completed style (struck through)." },
    ],
  },
  {
    storyId: 4,
    automatedTest: "US-4-completed-state-persists",
    testFile: "tests/complete-task.spec.ts",
    title: "Completed state persists after page refresh",
    kind: "positive",
    description: "Verifies that the completed state is stored and restored after reloading.",
    covers: ["The completed state persists after refreshing the page."],
    preconditions: [seeded('"Finish report" (not completed)')],
    steps: [
      { action: "Check the checkbox of \"Finish report\".", expected: "The task is shown as completed." },
      { action: "Refresh the page.", expected: "\"Finish report\" is still checked and shown in completed style." },
    ],
  },

  // US-5: Delete Task
  {
    storyId: 5,
    automatedTest: "US-5-delete-task",
    testFile: "tests/delete-task.spec.ts",
    title: "Delete an existing task",
    kind: "positive",
    description: "Verifies that deleting a task removes only that task from the list.",
    covers: ["A user can delete an existing task.", "The deleted task is no longer displayed."],
    preconditions: [seeded('"Keep me", "Remove me"')],
    steps: [
      { action: "Click \"Delete\" on \"Remove me\".", expected: "\"Remove me\" is no longer displayed." },
      { action: "Inspect the task list.", expected: "\"Keep me\" is still displayed and the list contains exactly 1 task." },
    ],
  },
  {
    storyId: 5,
    automatedTest: "US-5-deletion-persists",
    testFile: "tests/delete-task.spec.ts",
    title: "Deletion persists after page refresh",
    kind: "positive",
    description: "Verifies that a deleted task stays deleted after reloading.",
    covers: ["The deletion persists after refreshing the page."],
    preconditions: [seeded('"Keep me", "Remove me"')],
    steps: [
      { action: "Click \"Delete\" on \"Remove me\".", expected: "\"Remove me\" is no longer displayed." },
      { action: "Refresh the page.", expected: "\"Remove me\" is still not displayed and \"Keep me\" is displayed." },
    ],
  },

  // US-18: Edit Task
  {
    storyId: 18,
    automatedTest: "US-18-edit-task",
    testFile: "tests/edit-task.spec.ts",
    title: "Edit the description of an existing task",
    kind: "positive",
    description: "Verifies that a task's description can be edited and the new text replaces the old one in the list.",
    covers: [
      "A user can edit the description of an existing task.",
      "The updated description is shown in the task list.",
    ],
    preconditions: [seeded('"Buy milk", "Call Alice"')],
    steps: [
      { action: "Click \"Edit\" on \"Buy milk\".", expected: "An \"Edit task description\" field appears containing \"Buy milk\"." },
      { action: "Replace the text with \"Buy oat milk\" and click \"Save\".", expected: "The edit field closes." },
      {
        action: "Inspect the task list.",
        expected: "\"Buy oat milk\" is displayed, \"Buy milk\" is not, \"Call Alice\" is unchanged and the list contains exactly 2 tasks.",
      },
    ],
  },
  {
    storyId: 18,
    automatedTest: "US-18-cancel-edit",
    testFile: "tests/edit-task.spec.ts",
    title: "Cancel editing keeps the original description",
    kind: "negative",
    description: "Verifies that cancelling an edit discards the typed text and keeps the original description.",
    covers: ["A user can edit the description of an existing task."],
    preconditions: [seeded('"Buy milk"')],
    steps: [
      { action: "Click \"Edit\" on \"Buy milk\" and replace the text with \"Something else\".", expected: "The edit field contains \"Something else\"." },
      { action: "Click \"Cancel\".", expected: "The edit field closes and \"Buy milk\" is displayed; \"Something else\" is not." },
    ],
  },
  {
    storyId: 18,
    automatedTest: "US-18-reject-empty-edit",
    testFile: "tests/edit-task.spec.ts",
    title: "Reject an empty description when editing",
    kind: "negative",
    description: "Verifies that saving an empty description is rejected and the original description is kept.",
    covers: ["Empty descriptions are rejected when editing."],
    preconditions: [seeded('"Buy milk"')],
    steps: [
      { action: "Click \"Edit\" on \"Buy milk\", clear the field and click \"Save\".", expected: "The error \"Task description cannot be empty.\" is shown and the edit field stays open." },
      { action: "Refresh the page.", expected: "\"Buy milk\" is still displayed and the list contains exactly 1 task." },
    ],
  },
  {
    storyId: 18,
    automatedTest: "US-18-reject-whitespace-edit",
    testFile: "tests/edit-task.spec.ts",
    title: "Reject a whitespace-only description when editing",
    kind: "negative",
    description: "Verifies that a description containing only spaces is treated as empty when editing.",
    covers: ["Empty descriptions are rejected when editing."],
    preconditions: [seeded('"Buy milk"')],
    steps: [
      { action: "Click \"Edit\" on \"Buy milk\", replace the text with three spaces and click \"Save\".", expected: "An error message is shown and the edit field stays open." },
      { action: "Refresh the page.", expected: "\"Buy milk\" is still displayed." },
    ],
  },
  {
    storyId: 18,
    automatedTest: "US-18-edited-description-persists",
    testFile: "tests/edit-task.spec.ts",
    title: "Edited description persists after page refresh",
    kind: "positive",
    description: "Verifies that an edited description is stored and restored after reloading.",
    covers: ["The edited description persists after refreshing the page."],
    preconditions: [seeded('"Buy milk"')],
    steps: [
      { action: "Edit \"Buy milk\" to \"Buy oat milk\" and click \"Save\".", expected: "\"Buy oat milk\" is displayed." },
      { action: "Refresh the page.", expected: "\"Buy oat milk\" is still displayed and \"Buy milk\" is not." },
    ],
  },
];
