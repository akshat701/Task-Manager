import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";

export default function TaskModal({
  projectId,
  onClose,
  onSuccess,
  task,
}: any) {
  const [title, setTitle] = useState(task?.title || "");
  const [status, setStatus] = useState(task?.status || "todo");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [users, setUsers] = useState<any[]>([]);
  const [assignee, setAssignee] = useState(task?.assignee_id || "");

  useEffect(() => {
    apiClient.get("/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (task) {
      await apiClient.patch(`/tasks/${task.id}`, {
        title,
        status,
        priority,
        assignee_id: assignee,
        due_date: dueDate,
      });
    } else {
      await apiClient.post("/tasks", {
        title,
        status,
        priority,
        project_id: projectId,
        assignee_id: assignee,
        due_date: dueDate,
      });
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">

        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {task ? "Edit Task" : "Create Task"}
        </h2>

        <input
          className="input w-full mb-3"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="input w-full mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          className="input w-full mb-3"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          className="input w-full mb-3"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="input w-full mb-4"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="button-secondary w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="button-primary w-full sm:w-auto"
          >
            {task ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}