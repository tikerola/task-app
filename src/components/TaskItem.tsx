import type { Task } from "../types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const checkboxId = `task-${task.id}`;
  return (
    <li className={task.completed ? "task-item task-item--completed" : "task-item"}>
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
        className="task-item__delete"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.description}"`}
      >
        Delete
      </button>
    </li>
  );
}
