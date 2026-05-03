import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import { Link } from "react-router-dom";
import ProjectModal from "../components/project/ProjectModal";
import EditProjectModal from "../components/project/EditProjectModal";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/common/Loader";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await apiClient.get("/projects");
      const taskRes = await apiClient.get("/tasks");

      setProjects(projRes.data || []);
      setTasks(taskRes.data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.project_id === projectId);

    return {
      total: projectTasks.length,
      todo: projectTasks.filter((t) => t.status === "todo").length,
      inProgress: projectTasks.filter(
        (t) => t.status === "in_progress" || t.status === "in-progress",
      ).length,
      done: projectTasks.filter((t) => t.status === "done").length,
    };
  };

  return (
    <div className="app-bg min-h-screen p-4 sm:p-6">
      {loading && <Loader />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>

        {user?.role === "admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="button-primary w-full sm:w-auto"
          >
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 && (
        <p className="text-secondary">No projects found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {projects.map((p) => {
          const stats = getStats(p._id);

          return (
            <Link key={p._id} to={`/project/${p._id}`}>
              <div className="card p-4 sm:p-5 card-hover border border-gray-200 dark:border-gray-700 cursor-pointer relative">
                {user?.role === "admin" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditProject(p);
                    }}
                    className="absolute top-3 right-3 text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                )}

                <h2 className="text-base sm:text-lg font-semibold mb-1">
                  {p.name}
                </h2>

                <p className="text-secondary text-sm mb-4">{p.description}</p>

                <div className="text-sm mb-4 space-y-1">
                  <p>📊 {stats.total} tasks</p>
                  <p className="text-blue-500">Todo: {stats.todo}</p>
                  <p className="text-orange-500">
                    In Progress: {stats.inProgress}
                  </p>
                  <p className="text-green-600">Done: {stats.done}</p>
                </div>

                <div className="meta-text text-xs text-gray-500">
                  <p>Owner: {p.owner?.name || "You"}</p>
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

      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
