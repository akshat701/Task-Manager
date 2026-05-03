import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";

export default function MembersModal({ project, onClose, onUpdate }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get("/users").then((res) => {
      setUsers(res.data || []);
    });
  }, []);

  const handleAdd = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      await apiClient.post("/projects/add-member", {
        projectId: project._id,
        userId: selectedUser,
        role,
      });

      setSelectedUser("");
      setRole("member");

      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch("/projects/update-role", {
        projectId: project._id,
        userId,
        role: newRole,
      });

      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Manage Team</h2>

        <div>
          <h3 className="font-semibold mb-2">Members</h3>

          {project?.members
            ?.filter((m: any) => m?.user)
            .map((m: any) => (
              <div
                key={m.user._id}
                className="flex justify-between items-center mb-2"
              >
                <span className="text-sm font-medium">
                  {m.user?.name || "Unknown User"}
                </span>

                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}

          {(!project?.members || project.members.length === 0) && (
            <p className="text-sm text-gray-500">No members</p>
          )}
        </div>

        <div className="border-t pt-3">
          <h3 className="font-semibold mb-2">Add Member</h3>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full mb-2 border p-2 rounded"
          >
            <option value="">Select User</option>
            {users.map((u: any) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mb-2 border p-2 rounded"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded w-full"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 text-red-500 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
