// Initial backlog from CLAUDE.md section 4. `key` is the local placeholder used in
// Playwright test titles until real Azure DevOps IDs are known.

export interface StoryDefinition {
  key: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  testFile: string;
}

export const epic = {
  title: "Task Management Application",
  description:
    "A simple task management web application used to demonstrate an AI-driven software development lifecycle.",
};

export const stories: StoryDefinition[] = [
  {
    key: "US-01",
    title: "Display Tasks",
    description: "As a user, I want to see my tasks so that I can understand what I need to do.",
    acceptanceCriteria: [
      "The application displays a list of tasks.",
      "Each task displays its description.",
      "Completed tasks are visually distinguishable.",
    ],
    testFile: "tests/display-tasks.spec.ts",
  },
  {
    key: "US-02",
    title: "Add Task",
    description: "As a user, I want to add a new task so that I can keep track of new activities.",
    acceptanceCriteria: [
      "A user can enter a task description.",
      "A user can add a task using an Add button.",
      "The new task appears in the task list.",
      "Empty task descriptions are rejected.",
    ],
    testFile: "tests/add-task.spec.ts",
  },
  {
    key: "US-03",
    title: "Complete Task",
    description: "As a user, I want to mark a task as completed so that I can track my progress.",
    acceptanceCriteria: [
      "A task can be marked as completed.",
      "Completed tasks have a visible completed state.",
      "The completed state persists after refreshing the page.",
    ],
    testFile: "tests/complete-task.spec.ts",
  },
  {
    key: "US-04",
    title: "Delete Task",
    description: "As a user, I want to delete a task so that I can remove unnecessary tasks.",
    acceptanceCriteria: [
      "A user can delete an existing task.",
      "The deleted task is no longer displayed.",
      "The deletion persists after refreshing the page.",
    ],
    testFile: "tests/delete-task.spec.ts",
  },
];
