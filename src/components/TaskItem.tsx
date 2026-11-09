import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Task } from "../types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, description: string) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.description);
  const [error, setError] = useState<string | null>(null);
  const checkboxId = `task-${task.id}`;
  const editId = `task-edit-${task.id}`;
  const errorId = `task-edit-error-${task.id}`;

  function startEditing() {
    setDraft(task.description);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Task description cannot be empty.");
      return;
    }
    onEdit(task.id, trimmed);
    setEditing(false);
    setError(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") cancelEditing();
  }

  const className = task.completed ? "task-item task-item--completed" : "task-item";

  if (editing) {
    return (
      <li className={`${className} task-item--editing`}>
        <form className="task-item__edit-form" onSubmit={handleSave} noValidate>
          <label htmlFor={editId} className="visually-hidden">
            Edit task description
          </label>
          <input
            id={editId}
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            autoComplete="off"
            autoFocus
          />
          <button type="submit" className="task-item__save">
            Save
          </button>
          <button type="button" className="task-item__cancel" onClick={cancelEditing}>
            Cancel
          </button>
          {error && (
            <p id={errorId} className="task-item__error" role="alert">
              {error}
            </p>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className={className}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.description}" as completed`}
      />
      <label htmlFor={checkboxId} className="task-item__text">
        {task.description}
      </label>
      <button
        type="button"
        className="task-item__edit"
        onClick={startEditing}
        aria-label={`Edit "${task.description}"`}
      >
        Edit
      </button>
      <button
        type="button"
        className="task-item__delete"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.description}"`}
      >
        Delete
      </button>
    </li>
  );
}
