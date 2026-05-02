import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import { Link } from "react-router-dom";
import ProjectModal from "../components/project/ProjectModal";
import { useAuthStore } from "../store/authStore";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  const fetchData = async () => {
    const projRes = await apiClient.get("/projects");
    const taskRes = await apiClient.get("/tasks");

    setProjects(projRes.data);
    setTasks(taskRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStats = (projectId: string) => {
    const projectTasks = tasks.filter(
      (t) => t.project_id === projectId
    );

    return {
      total: projectTasks.length,
      todo: projectTasks.filter((t) => t.status === "todo").length,
      inProgress: projectTasks.filter(
        (t) => t.status === "in_progress"
      ).length,
      done: projectTasks.filter((t) => t.status === "done").length,
    };
  };

  return (
    <div className="app-bg min-h-screen p-4 sm:p-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Projects
        </h1>
      {user?.role === "admin" &&
        <button
          onClick={() => setShowModal(true)}
          className="button-primary w-full sm:w-auto"
        >
          + New Project
        </button>
}
      </div>

      {projects.length === 0 && (
        <p className="text-secondary">No projects found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {projects.map((p) => {
          const stats = getStats(p.id);

          return (
            <Link key={p.id} to={`/project/${p.id}`}>
              <div className="card p-4 sm:p-5 card-hover border border-gray-200 dark:border-gray-700 cursor-pointer">

                <h2 className="text-base sm:text-lg font-semibold mb-1">
                  {p.name}
                </h2>

                <p className="text-secondary text-sm mb-4">
                  {p.description}
                </p>

                <div className="text-sm mb-4 space-y-1">
                  <p>📊 {stats.total} tasks</p>
                  <p className="text-blue-500">Todo: {stats.todo}</p>
                  <p className="text-orange-500">
                    In Progress: {stats.inProgress}
                  </p>
                  <p className="text-green-600">
                    Done: {stats.done}
                  </p>
                </div>

                <div className="meta-text">
                  <p>Owner: User</p>
                  <p>
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

              </div>
            </Link>
          );
        })}
      </div>

      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}