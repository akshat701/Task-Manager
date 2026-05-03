import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";
import Toast from "../common/Toast";
import Loader from "../common/Loader";

export default function CreateMemberModal({ onClose }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/projects")
      .then((res) => setProjects(res.data || []))
      .catch(() => setError("Failed to load projects"));
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (!name || !email || !password || !projectId) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post("/projects/add-new-member", {
        projectId,
        name,
        email,
        password,
        role,
      });

      setToast({ message: "Member added successfully", type: "success" });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg h-screen flex items-center justify-center">
      {loading && <Loader />}
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Add Team Member</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* PROJECT */}
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Project</option>
            {projects.length === 0 ? (
              <option disabled>No projects found</option>
            ) : (
              projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))
            )}
          </select>

          {/* FORM */}
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Temporary Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          {/* ACTION */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? "Adding Member..." : "Add Member"}
          </button>

          {/* FOOTER */}
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-red-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
