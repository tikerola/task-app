import { useEffect, useState } from "react";
import type { Task } from "../types/task";
import { loadTasks, saveTasks } from "../services/taskStorage";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(description: string) {
    const task: Task = {
      id: crypto.randomUUID(),
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
  }

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <main className="tasks-page">
      <h1>Tasks</h1>
      <TaskForm onAdd={addTask} />
      <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
    </main>
  );
}
