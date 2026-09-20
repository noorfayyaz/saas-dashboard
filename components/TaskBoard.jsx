"use client";

import { useState } from "react";

const STATUS_LABELS = { TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done" };
const STATUS_COLORS = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  DONE: "bg-green-100 text-green-700",
};

export default function TaskBoard({ orgId, initialTasks, role }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");
  const canEdit = role === "ADMIN" || role === "MEMBER";

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!newTitle.trim()) return;

    const res = await fetch(`/api/organizations/${orgId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setTasks([data, ...tasks]);
    setNewTitle("");
  }

  async function handleStatusChange(taskId, status) {
    const res = await fetch(`/api/organizations/${orgId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
    }
  }

  async function handleDelete(taskId) {
    const res = await fetch(`/api/organizations/${orgId}/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  }

  return (
    <div>
      {canEdit && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task title..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button type="submit" className="bg-brand-600 text-white px-5 py-2 rounded-lg hover:bg-brand-700 transition">
            Add Task
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {tasks.length === 0 ? (
        <p className="text-gray-400 text-sm">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between gap-3"
            >
              <span className="text-gray-800">{task.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                {canEdit ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`text-xs rounded-full px-2 py-1 font-medium border-0 ${STATUS_COLORS[task.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`text-xs rounded-full px-2 py-1 font-medium ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
