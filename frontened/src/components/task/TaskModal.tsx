import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";
import { useAuthStore } from "../../store/authStore";

export default function TaskModal({
  projectId,
  onClose,
  onSuccess,
  task,
}: any) {
  const { user } = useAuthStore();

  const [title, setTitle] = useState(task?.title || "");
  const [status, setStatus] = useState(task?.status || "todo");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [users, setUsers] = useState<any[]>([]);
  const [assignee, setAssignee] = useState(task?.assignee_id || "");

  // 🔥 Fetch project members ONLY
  useEffect(() => {
    if (!projectId) return;

    const fetchMembers = async () => {
      try {
        const res = await apiClient.get(`/projects/${projectId}`);

        const members = res.data.members || [];

        const formatted = members.map((m: any) => ({
          _id: m.user._id,
          name: m.user.name,
        }));

        setUsers(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMembers();
  }, [projectId]);

  // 🔥 Submit Handler (RBAC SAFE)
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      if (task) {
        // 🔥 UPDATE
        await apiClient.patch(`/tasks/${task.id}`, {
          // 👑 admin only fields
          ...(user?.role === "admin" && {
            title,
            priority,
            assignee_id: assignee,
            due_date: dueDate,
          }),

          // 👤 everyone can change status
          status,
        });
      } else {
        // 🔥 CREATE (admin only ideally, backend will check)
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">

        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {task ? "Edit Task" : "Create Task"}
        </h2>

        {/* 🔥 TITLE (ADMIN ONLY EDITABLE) */}
        {user?.role === "admin" ? (
          <input
            className="input w-full mb-3"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <div className="mb-3 text-sm text-gray-700">
            📝 {title}
          </div>
        )}

        {/* 🔥 STATUS (ALL CAN CHANGE) */}
        <select
          className="input w-full mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* 🔥 PRIORITY (ADMIN ONLY) */}
        {user?.role === "admin" && (
          <select
            className="input w-full mb-3"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        )}

        {/* 🔥 ASSIGNEE */}
        {user?.role === "admin" ? (
          <select
            className="input w-full mb-3"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="mb-3 text-sm text-gray-600">
            👤 Assigned to:{" "}
            {users.find((u) => u._id === assignee)?.name || "You"}
          </div>
        )}

        {/* 🔥 DUE DATE (ADMIN ONLY) */}
        {user?.role === "admin" && (
          <input
            type="date"
            className="input w-full mb-4"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        )}

        {/* 🔥 ACTIONS */}
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