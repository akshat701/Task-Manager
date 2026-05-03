import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/common/Loader";
import CreateMemberModal from "../components/member/CreateMemberModal";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  const fetchStats = async () => {
    const res = await apiClient.get("/dashboard/stats");
    setStats(res.data);
  };

  const fetchTasks = async () => {
    const url = user?.role === "admin" ? "/tasks" : "/tasks/my";

    const res = await apiClient.get(url);
    setTasks(res.data || []);
  };

  const groupedTasks = tasks.reduce((acc: any, task: any) => {
    const projectName = task?.project?.name || "No Project";

    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(task);

    return acc;
  }, {});

  const userStats = tasks.reduce((acc: any, task: any) => {
    const userName = task?.assignedTo?.name || "Unassigned";

    if (!acc[userName]) {
      acc[userName] = {
        total: 0,
        done: 0,
        pending: 0,
      };
    }

    acc[userName].total++;

    if (task.status === "done") acc[userName].done++;
    else acc[userName].pending++;

    return acc;
  }, {});

  const topUser = Object.entries(userStats).sort(
    (a: any, b: any) => b[1].done - a[1].done,
  )[0]?.[0];

  const projectStats = tasks.reduce((acc: any, task: any) => {
    const project = task?.project?.name || "No Project";

    if (!acc[project]) {
      acc[project] = {
        total: 0,
        done: 0,
      };
    }

    acc[project].total++;

    if (task.status === "done") acc[project].done++;

    return acc;
  }, {});

  if (!stats) {
    return (
      <div className="p-6 text-gray-500 text-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {user?.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
        </h1>

        <div className="flex gap-2">
          {user?.role === "admin" && (
            <button
              onClick={() => setShowCreateMember(true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add Member
            </button>
          )}

          <Link
            to="/project"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Projects
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card title="Total Tasks" value={stats.totalTasks} />
        <Card title="Completed" value={stats.completedTasks} color="green" />
        <Card title="Pending" value={stats.pendingTasks} color="yellow" />
        <Card title="Overdue" value={stats.overdueTasks} color="red" />
      </div>

      <div className="app-bg p-5 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">
          {user?.role === "admin" ? "All Tasks (Project-wise)" : "My Tasks"}
        </h2>

        {Object.keys(groupedTasks).length === 0 && (
          <p className="text-gray-500 text-sm">No tasks found</p>
        )}

        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([project, tasks]: any) => (
            <div key={project} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-600">{project}</h3>

                {tasks[0]?.project?._id && (
                  <button
                    onClick={() => navigate(`/project/${tasks[0].project._id}`)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View →
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center app-bg p-2 rounded"
                  >
                    <span className="text-sm font-medium">{task.title}</span>

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

      {user?.role === "admin" && (
        <div className="app-bg p-6 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-5">👥 Team Performance</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(userStats).map(([userName, data]: any) => {
              const percent = Math.round((data.done / data.total) * 100);

              const initials = userName
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={userName}
                  className="app-bg border rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {initials}
                      </div>

                      <div>
                        <p className="font-semibold text-sm">{userName}</p>
                        <p className="text-xs text-gray-500">
                          {data.total} tasks
                        </p>
                      </div>
                    </div>

                    {userName === topUser && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        Top
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded mb-3">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span>📊 {data.total}</span>
                    <span className="text-green-600">✔ {data.done}</span>
                    <span className="text-yellow-600">⏳ {data.pending}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {user?.role === "admin" && (
        <div className="app-bg p-5 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-4">📁 Project Progress</h2>

          <div className="space-y-3">
            {Object.entries(projectStats).map(([project, data]: any) => {
              const percent = Math.round((data.done / data.total) * 100);

              return (
                <div key={project}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{project}</span>
                    <span>{percent}%</span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCreateMember && (
        <CreateMemberModal onClose={() => setShowCreateMember(false)} />
      )}
    </div>
  );
}

function Card({ title, value, color }: any) {
  const bg =
    color === "green"
      ? "bg-green-100"
      : color === "yellow"
        ? "bg-yellow-100"
        : color === "red"
          ? "bg-red-100"
          : "bg-white";

  return (
    <div className={`${bg} shadow rounded-xl p-5 border`}>
      <p className="text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
