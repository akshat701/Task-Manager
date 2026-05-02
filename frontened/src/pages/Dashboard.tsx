import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await apiClient.get("/dashboard/stats");
      setStats(res.data);
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 🔥 Heading */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Link
          to="/"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Projects
        </Link>
      </div>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white shadow rounded-xl p-5 border">
          <p className="text-gray-500 text-sm">Total Tasks</p>
          <h2 className="text-2xl font-bold mt-2">
            {stats.totalTasks}
          </h2>
        </div>

        <div className="bg-green-100 shadow rounded-xl p-5 border">
          <p className="text-sm">Completed</p>
          <h2 className="text-2xl font-bold mt-2">
            {stats.completedTasks}
          </h2>
        </div>

        <div className="bg-yellow-100 shadow rounded-xl p-5 border">
          <p className="text-sm">Pending</p>
          <h2 className="text-2xl font-bold mt-2">
            {stats.pendingTasks}
          </h2>
        </div>

        <div className="bg-red-100 shadow rounded-xl p-5 border">
          <p className="text-sm">Overdue</p>
          <h2 className="text-2xl font-bold mt-2">
            {stats.overdueTasks}
          </h2>
        </div>
      </div>

      {/* ⚡ Quick Actions */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-3">
          Quick Actions
        </h2>

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

      {/* 📌 Summary */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-2">
          Overview
        </h2>

        <p className="text-gray-600">
          You have{" "}
          <span className="font-semibold">
            {stats.pendingTasks}
          </span>{" "}
          pending tasks and{" "}
          <span className="font-semibold text-red-500">
            {stats.overdueTasks}
          </span>{" "}
          overdue tasks.
        </p>
      </div>
    </div>
  );
}