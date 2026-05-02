import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStats(res.data);
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="card">Total Tasks: {stats.totalTasks}</div>
      <div className="card">Completed: {stats.completedTasks}</div>
      <div className="card">Pending: {stats.pendingTasks}</div>
      <div className="card text-red-500">
        Overdue: {stats.overdueTasks}
      </div>
    </div>
  );
}