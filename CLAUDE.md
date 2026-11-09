# AI-SDLC Demo Project

## 1. Project Overview

This project demonstrates an AI-driven Software Development Lifecycle (AI-SDLC).

The primary objective is to demonstrate how Claude Code can act as an AI software development agent that connects requirements management, software implementation, test case generation, automated testing and continuous deployment.

The project uses Azure DevOps for requirements and test management, GitHub for source code management and CI/CD, and GitHub Pages for application deployment.

Claude Code is the primary AI development agent and runs locally in the developer's environment.

### Main objectives

1. Initialize an Azure DevOps project and its backlog.
2. Generate a simple web application based on the backlog.
3. Generate Playwright UI tests based on Azure DevOps User Stories.
4. Create and maintain traceability between User Stories, Test Cases and automated tests.
5. Store all application source code and automated tests in GitHub.
6. Execute automated tests using GitHub Actions.
7. Deploy the application to GitHub Pages only after successful builds and tests.
8. Demonstrate how a new User Story can trigger an AI-assisted development workflow.

## 2. Technology Stack

Use the following technologies unless there is a compelling technical reason to change them.

| Component                | Technology              |
| ------------------------ | ----------------------- |
| AI development agent     | Claude Code             |
| AI execution environment | Local developer machine |
| Frontend                 | React                   |
| Programming language     | TypeScript              |
| Build tool               | Vite                    |
| Styling                  | CSS                     |
| Test automation          | Playwright              |
| Requirements management  | Azure DevOps Boards     |
| Azure DevOps integration | REST API / MCP          |
| Source control           | GitHub                  |
| CI/CD                    | GitHub Actions          |
| Deployment               | GitHub Pages            |
| Initial persistence      | Browser LocalStorage    |

Avoid unnecessary infrastructure and external dependencies.

The initial application must not require a backend or database.

## 3. Application Scope

The application is a simple Task Management application.

Its purpose is to provide a sufficiently realistic application for demonstrating AI-generated UI tests.

### Initial functionality

The application must support:

1. Displaying tasks.
2. Adding a new task.
3. Marking a task as completed.
4. Deleting a task.

### Functional requirements

- Users can enter a task description.
- Users can add tasks to the task list.
- Empty task descriptions must not be accepted.
- Tasks must be displayed in the application.
- Users can mark tasks as completed.
- Users can delete tasks.
- Task information must persist after refreshing the browser.
- The interface must be simple and responsive.
- The application must support automated browser testing.

Use LocalStorage for persistence.

## 4. Azure DevOps Structure

Azure DevOps is the authoritative source for requirements and test management.

Create or use an Azure DevOps project named:

AI-SDLC-Demo

Use the Agile process template where possible.

### Initial backlog

Create the following Epic:

**Epic: Task Management Application**

Create these initial User Stories:

**US-01: Display Tasks**

As a user, I want to see my tasks so that I can understand what I need to do.

Acceptance criteria:

- The application displays a list of tasks.
- Each task displays its description.
- Completed tasks are visually distinguishable.

**US-02: Add Task**

As a user, I want to add a new task so that I can keep track of new activities.

Acceptance criteria:

- A user can enter a task description.
- A user can add a task using an Add button.
- The new task appears in the task list.
- Empty task descriptions are rejected.

**US-03: Complete Task**

As a user, I want to mark a task as completed so that I can track my progress.

Acceptance criteria:

- A task can be marked as completed.
- Completed tasks have a visible completed state.
- The completed state persists after refreshing the page.

**US-04: Delete Task**

As a user, I want to delete a task so that I can remove unnecessary tasks.

Acceptance criteria:

- A user can delete an existing task.
- The deleted task is no longer displayed.
- The deletion persists after refreshing the page.

Create the corresponding work items and link them to the Epic.

Do not create duplicate work items if the project already contains equivalent items.

## 5. Azure DevOps Traceability

Maintain explicit relationships between requirements, test cases and automated tests.

The intended relationship is:

User Story
|
+-- Test Case 1
| |
| +-- Automated Playwright Test
|
+-- Test Case 2
|
+-- Automated Playwright Test

### Work item types

Use:

- User Story for functional requirements.
- Test Case for test specifications.
- Automated Test association for automated test implementations.

### Test Case generation

For every User Story:

1. Read the complete User Story.
2. Read its acceptance criteria.
3. Identify testable requirements.
4. Identify positive and negative test scenarios.
5. Generate one or more Test Cases.
6. Link each Test Case to its parent User Story.
7. Store the automated test identifier and file path in the Test Case.

Test Cases must contain:

- Title.
- Description.
- Preconditions.
- Test steps.
- Expected results.
- Related User Story ID.
- Automated test identifier.
- Automated test file path.

Use the appropriate Azure DevOps work item link types.

The implementation must distinguish between a basic work item relationship and a formally associated Azure Test Plans automated test.

Do not claim that an automated test is formally associated with Azure Test Plans unless the association has actually been created and verified.

## 6. Claude Code Responsibilities

Claude Code acts as the primary AI development agent.

It is responsible for:

- Understanding the project.
- Reading Azure DevOps requirements.
- Analyzing User Stories.
- Generating test specifications.
- Creating Playwright tests.
- Implementing application functionality.
- Maintaining traceability.
- Running builds and tests.
- Preparing GitHub changes.

Claude Code must work incrementally.

Do not attempt to implement the entire project in a single uncontrolled operation.

### Operating modes

Implement the project around two primary workflows.

#### Mode A: Bootstrap

Purpose: Initialize the complete demonstration environment.

Tasks:

1. Verify the development environment.
2. Verify Azure DevOps connectivity.
3. Create or verify the Azure DevOps project.
4. Create the Epic and initial User Stories.
5. Generate the application structure.
6. Implement the Task Management application.
7. Create initial Playwright tests.
8. Create the GitHub repository structure.
9. Configure GitHub Actions.
10. Configure GitHub Pages deployment.

Before making changes to external systems, inspect their current state and avoid creating duplicates.

#### Mode B: User Story Development

Purpose: Process a new User Story and generate the corresponding implementation and tests.

Tasks:

1. Retrieve the User Story from Azure DevOps.
2. Analyze the description and acceptance criteria.
3. Identify missing or ambiguous requirements.
4. Propose clarifications if needed.
5. Generate test scenarios.
6. Create Azure DevOps Test Cases.
7. Link Test Cases to the User Story.
8. Generate Playwright tests.
9. Implement required application changes.
10. Execute the relevant tests.
11. Create a Git branch.
12. Commit the changes.
13. Create a GitHub Pull Request.
14. Report the results and Azure DevOps references.

Do not merge Pull Requests or deploy changes without the required human approval.

## 7. AI-Generated Test Strategy

Playwright is the primary UI testing framework.

Tests must be based on acceptance criteria rather than assumptions about the application.

### Test generation principles

- Each test must have a clear purpose.
- Each test must correspond to one or more acceptance criteria.
- Tests must use stable selectors.
- Prefer accessible selectors such as getByRole and getByLabel.
- Avoid arbitrary timeouts.
- Avoid unnecessary test dependencies.
- Tests must be repeatable.
- Tests must not depend on execution order.

### Test naming convention

Use the following format:

US-{story-id}-{scenario-name}

Examples:

US-102-add-task
US-102-reject-empty-task
US-103-complete-task
US-104-delete-task

Use stable identifiers in the Playwright test titles and maintain a mapping to Azure DevOps Test Case IDs.

### Example Playwright test

```typescript
import { test, expect } from "@playwright/test";

test("US-102-add-task", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Task description")
    .fill("Prepare project documentation");

  await page
    .getByRole("button", {
      name: "Add",
    })
    .click();

  await expect(page.getByText("Prepare project documentation")).toBeVisible();
});
```

The actual selectors must match the implemented application.

## 8. Project Structure

Use the following initial repository structure:

```text
ai-sdlc-demo/
│
├── CLAUDE.md
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   ├── display-tasks.spec.ts
│   ├── add-task.spec.ts
│   ├── complete-task.spec.ts
│   └── delete-task.spec.ts
│
├── ai-agent/
│   └── README.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md
```

The ai-agent directory is initially reserved for future integration components and documentation.

Claude Code itself is the initial AI agent. Do not build an unnecessary second agent framework.

## 9. GitHub Workflow

Use GitHub as the authoritative source code repository.

### Branching strategy

- main: stable and deployable version.
- feature branches: AI-generated or manually developed changes.

Use the following branch naming convention:

feature/US-{id}-{description}

Example:

feature/US-102-add-task

### Pull Requests

AI-generated changes must be submitted through Pull Requests.

A Pull Request should contain:

- Related User Story ID.
- Summary of implemented functionality.
- Generated Test Case IDs.
- Playwright test file paths.
- Build results.
- Test execution results.

Human approval is required before merging.

## 10. GitHub Actions and Deployment

Use GitHub Actions to implement continuous integration and deployment.

### Pipeline requirements

The pipeline must:

1. Check out the source code.
2. Install dependencies.
3. Install Playwright browsers.
4. Build the application.
5. Execute Playwright tests.
6. Upload test reports when appropriate.
7. Deploy to GitHub Pages only when all required checks pass.

### Deployment rules

- Pull Requests must execute build and tests.
- Pull Requests must not deploy to production.
- Only successful pushes to main may deploy.
- Failed builds or tests must block deployment.

Use the official GitHub Pages deployment actions.

Configure the Vite base path correctly for GitHub Pages.

## 11. Azure DevOps Integration

Use Azure DevOps REST API as the initial integration method.

MCP can be considered as an alternative or complementary integration mechanism.

### Authentication

Use a dedicated Azure DevOps Personal Access Token or another supported authentication mechanism.

Never hardcode credentials.

Use environment variables or a secure credential store.

Suggested environment variables:

```text
AZURE_DEVOPS_ORG
AZURE_DEVOPS_PROJECT
AZURE_DEVOPS_PAT
GITHUB_TOKEN
```

Never commit secrets to GitHub.

### Integration requirements

The integration must support:

- Reading work items.
- Creating work items.
- Updating work items.
- Creating work item relationships.
- Reading acceptance criteria.
- Retrieving Test Case information.
- Maintaining traceability.

Validate every created or updated work item by retrieving it from Azure DevOps.

## 12. Quality and Safety Rules

Claude Code must follow these rules:

1. Never overwrite existing source code without inspecting it first.
2. Never delete existing Azure DevOps work items without explicit approval.
3. Never create duplicate User Stories or Test Cases.
4. Never commit secrets.
5. Never automatically merge Pull Requests.
6. Never automatically bypass failing tests.
7. Never modify acceptance criteria without reporting the change.
8. Never invent successful test results.
9. Always report errors and incomplete operations.
10. Always validate external changes.

### Human approval points

Require human approval before:

- Creating or deleting an Azure DevOps project.
- Making destructive Azure DevOps changes.
- Changing existing requirements.
- Merging Pull Requests.
- Changing deployment configuration.
- Publishing unapproved application changes.

## 13. Implementation Roadmap

Implement the project in the following order.

### Phase 1: Project Foundation

- Inspect the local environment.
- Create the React and TypeScript application.
- Implement the basic Task Management functionality.
- Configure Vite.
- Configure Playwright.
- Create initial manual UI tests.
- Verify that all tests pass.

Deliverable: A working application with automated UI tests.

### Phase 2: GitHub and CI/CD

- Create or configure the GitHub repository.
- Add the source code.
- Configure GitHub Actions.
- Configure GitHub Pages.
- Verify that failing tests block deployment.
- Verify that successful tests allow deployment.

Deliverable: A working application deployed through GitHub Actions.

### Phase 3: Azure DevOps Initialization

- Connect to Azure DevOps.
- Create or verify the project.
- Create the initial Epic.
- Create the four initial User Stories.
- Add acceptance criteria.
- Verify all relationships.

Deliverable: An Azure DevOps backlog representing the application.

### Phase 4: AI Test Generation

- Read User Stories through Azure DevOps.
- Analyze acceptance criteria.
- Generate test scenarios.
- Create Test Cases.
- Link Test Cases to User Stories.
- Generate Playwright tests.
- Maintain test identifiers and traceability.

Deliverable: AI-generated and traceable automated tests.

### Phase 5: Continuous AI Development

- Implement the User Story Development workflow.
- Generate feature branches.
- Implement requested changes.
- Generate tests.
- Run validation.
- Create Pull Requests.

Deliverable: A repeatable AI-assisted development workflow.

### Phase 6: End-to-End Demonstration

Demonstrate the following scenario:

1. A developer creates a new User Story in Azure DevOps.
2. Claude Code retrieves the User Story.
3. Claude Code analyzes the requirements.
4. Claude Code creates one or more Test Cases.
5. Claude Code links the Test Cases to the User Story.
6. Claude Code generates Playwright tests.
7. Claude Code implements the required functionality.
8. Claude Code creates a GitHub Pull Request.
9. GitHub Actions builds the application and executes tests.
10. A human reviews and approves the Pull Request.
11. The changes are merged into main.
12. GitHub Actions deploys the application to GitHub Pages.

Deliverable: A fully demonstrated AI-driven Software Development Lifecycle.

## 14. Claude Code Working Instructions

When starting work on this project:

1. Read this CLAUDE.md file completely.
2. Inspect the current repository and development environment.
3. Identify which implementation phase is currently active.
4. Summarize the current state.
5. Propose the next implementation steps.
6. Wait for confirmation before performing significant external or destructive operations.

Work in small, verifiable increments.

After each implementation phase:

- Summarize completed work.
- List modified files.
- Report test results.
- Report outstanding issues.
- Identify the next recommended task.

Prefer simple, maintainable and transparent solutions over complex architectures.

The main purpose of this project is not to build a sophisticated Task Management application.

The main purpose is to demonstrate how AI can transform a User Story into an implemented, tested and deployable software feature while maintaining traceability throughout the Software Development Lifecycle.
