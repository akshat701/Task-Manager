import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import TaskColumn from "../components/task/TaskColumn";
import TaskModal from "../components/task/TaskModal";
import Loader from "../components/common/Loader";
import Toast from "../components/common/Toast";
import MembersModal from "../components/member/MembersModal";

import { DragDropContext } from "@hello-pangea/dnd";
import { useAuthStore } from "../store/authStore";

export default function ProjectDetailPage() {
  const { id } = useParams();

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);

  const [filter, setFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { user } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);

      const taskRes = await apiClient.get("/tasks");
      const userRes = await apiClient.get("/users");
      const projectRes = await apiClient.get(`/projects/${id}`);

      const filtered = taskRes.data.filter((t: any) => t.project_id === id);

      setTasks(filtered);
      setUsers(userRes.data);
      setProject(projectRes.data);
    } catch {
      setToast({ message: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  let filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  if (assigneeFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (t) => t.assignee_id === assigneeFilter,
    );
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const oldTasks = [...tasks];

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await apiClient.patch(`/tasks/${taskId}`, {
        status: newStatus,
      });
    } catch {
      setTasks(oldTasks);
      setToast({ message: "Update failed", type: "error" });
    }
  };

  return (
    <div className="app-bg min-h-screen p-4 sm:p-6 flex flex-col gap-4">
      {loading && <Loader />}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="card p-4 border flex flex-col sm:flex-row justify-between gap-3">
        <h1 className="text-xl font-bold">{project?.name || "Project"}</h1>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {user?.role === "admin" && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
          {user?.role === "admin" && (
            <button
              onClick={() => {
                setSelectedTask(null);
                setShowModal(true);
              }}
              className="button-primary"
            >
              + Add Task
            </button>
          )}
        </div>
      </div>

      {project && (
        <div className="card p-4 border">
          <h2 className="font-semibold mb-3">Team Members</h2>

          <div className="flex flex-wrap gap-2">
            {project.members.map((m: any) => {
              if (!m.user) return null;

              return (
                <div
                  key={m.user._id}
                  className="px-3 py-1 border rounded text-sm flex items-center gap-2"
                >
                  <span>{m.user.name}</span>

                  <span className="text-xs text-gray-500">({m.role})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && !loading && <p>No tasks found</p>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-4">
          {["todo", "in_progress", "done"].map((status) => (
            <div key={status} className="flex-1">
              <TaskColumn
                title={status}
                status={status}
                users={users}
                tasks={filteredTasks.filter((t) => t.status === status)}
                onEdit={(task: any) => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
              />
            </div>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <TaskModal
          projectId={id}
          task={selectedTask}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showMembersModal && project && (
        <MembersModal
          project={project}
          onClose={() => setShowMembersModal(false)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
