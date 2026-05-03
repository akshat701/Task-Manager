import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";

export default function EditProjectModal({ project, onClose, onSuccess }: any) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [deadline, setDeadline] = useState(
    project.deadline?.slice(0, 10) || "",
  );

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>(project.members || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get("/users").then((res) => {
      setAllUsers(res.data || []);
    });
  }, []);

  const handleAddMember = async (user: any) => {
    try {
      setLoading(true);

      await apiClient.post("/projects/add-member", {
        projectId: project._id,
        userId: user._id,
        role: "member",
      });

      setMembers((prev) => [...prev, { user }]);
    } finally {
      setLoading(false);
      onSuccess();
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      setLoading(true);

      await apiClient.patch("/projects/members/remove", {
        projectId: project._id,
        userId,
      });

      setMembers((prev) => prev.filter((m) => m.user._id !== userId));
    } finally {
      setLoading(false);
      onSuccess();
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await apiClient.patch(`/projects/${project._id}`, {
        name,
        description,
        deadline,
      });

      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-lg space-y-5">
        <h2 className="text-2xl font-bold text-gray-800">Edit Project</h2>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Name"
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full border p-2 rounded-lg"
          />

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Members</h3>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {members.map((m: any) => (
              <div
                key={m.user._id}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg"
              >
                <span>{m.user.name}</span>

                <button
                  onClick={() => handleRemoveMember(m.user._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Add Member</h3>

          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
            {allUsers
              .filter((u) => !members.find((m) => m.user._id === u._id))
              .map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleAddMember(u)}
                  className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                >
                  + {u.name}
                </button>
              ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
