import { useState, type FormEvent } from "react";

interface TaskFormProps {
  onAdd: (description: string) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setError("Task description cannot be empty.");
      return;
    }
    onAdd(trimmed);
    setDescription("");
    setError(null);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="task-description">Task description</label>
      <div className="task-form__row">
        <input
          id="task-description"
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (error) setError(null);
          }}
          placeholder="What needs to be done?"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "task-error" : undefined}
          autoComplete="off"
        />
        <button type="submit">Add</button>
      </div>
      {error && (
        <p id="task-error" className="task-form__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
