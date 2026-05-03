import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import CreateMemberModal from "../components/member/CreateMemberModal";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showCreateMember, setShowCreateMember] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await apiClient.get("/tasks/my");
      console.log("TASKS:", res.data); // 🔥 DEBUG
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 GROUP TASKS BY PROJECT (SAFE)
  const groupedTasks = tasks.reduce((acc: any, task: any) => {
    const projectName = task?.project?.name || "No Project";

    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(task);

    return acc;
  }, {});

  if (!stats) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex gap-2">
          {user?.role === "admin" && (
            <button
              onClick={() => setShowCreateMember(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Member
            </button>
          )}

          <Link
            to="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Projects
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white shadow rounded-xl p-5 border">
          <p className="text-gray-500 text-sm">Total Tasks</p>
          <h2 className="text-2xl font-bold mt-2">{stats.totalTasks}</h2>
        </div>

        <div className="bg-green-100 shadow rounded-xl p-5 border">
          <p className="text-sm">Completed</p>
          <h2 className="text-2xl font-bold mt-2">{stats.completedTasks}</h2>
        </div>

        <div className="bg-yellow-100 shadow rounded-xl p-5 border">
          <p className="text-sm">Pending</p>
          <h2 className="text-2xl font-bold mt-2">{stats.pendingTasks}</h2>
        </div>

        <div className="bg-red-100 shadow rounded-xl p-5 border">
          <p className="text-sm">Overdue</p>
          <h2 className="text-2xl font-bold mt-2">{stats.overdueTasks}</h2>
        </div>
      </div>

      {/* PROJECT-WISE TASKS */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">My Tasks</h2>

        {Object.keys(groupedTasks).length === 0 && (
          <p className="text-gray-500 text-sm">No tasks assigned</p>
        )}

        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([project, tasks]: any) => (
            <div key={project} className="border rounded-lg p-4">

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-600">
                  {project}
                </h3>

                {/* 🔥 FIX: proper navigation */}
                {tasks[0]?.project?._id && (
                  <button
                    onClick={() =>
                      navigate(`/project/${tasks[0].project._id}`)
                    }
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View Project →
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {tasks.map((task: any) => (
                  <div
                    key={task.id || task._id} // 🔥 FIX
                    className="flex justify-between items-center bg-gray-50 p-2 rounded hover:bg-gray-100 transition"
                  >
                    <span className="text-sm font-medium">
                      {task.title}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        task.status === "done"
                          ? "bg-green-100 text-green-600"
                          : task.status === "in_progress"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>

        <div className="flex gap-4 flex-wrap">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Projects
          </Link>

          <Link
            to="/"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Task
          </Link>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-2">Overview</h2>

        <p className="text-gray-600">
          You have{" "}
          <span className="font-semibold">{stats.pendingTasks}</span>{" "}
          pending tasks and{" "}
          <span className="font-semibold text-red-500">
            {stats.overdueTasks}
          </span>{" "}
          overdue tasks.
        </p>
      </div>

      {/* MODAL */}
      {showCreateMember && (
        <CreateMemberModal
          onClose={() => setShowCreateMember(false)}
        />
      )}
    </div>
  );
}