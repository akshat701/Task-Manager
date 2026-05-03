import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";

export default function EditProjectModal({ project, onClose, onSuccess }: any) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [deadline, setDeadline] = useState(
    project.deadline?.slice(0, 10) || ""
  );

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>(project.members || []);

  // 🔥 fetch all users (for adding)
  useEffect(() => {
    apiClient.get("/users").then((res) => {
      setAllUsers(res.data || []);
    });
  }, []);

  // 🔥 ADD MEMBER
  const handleAddMember = async (userId: string) => {
    await apiClient.post("/projects/add-member", {
      projectId: project._id,
      userId,
      role: "member",
    });

    onSuccess();
  };

  // 🔥 REMOVE MEMBER
  const handleRemoveMember = async (userId: string) => {
    await apiClient.patch("/projects/remove-member", {
      projectId: project._id,
      userId,
    });

    onSuccess();
  };

  // 🔥 UPDATE PROJECT
  const handleUpdate = async () => {
    await apiClient.patch(`/projects/${project._id}`, {
      name,
      description,
      deadline,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4">

        <h2 className="text-xl font-bold">Edit Project</h2>

        {/* 🔥 BASIC INFO */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input w-full"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input w-full"
        />

        {/* 🔥 CURRENT MEMBERS */}
        <div>
          <h3 className="font-semibold mb-2">Members</h3>

          {members.map((m: any) => (
            <div key={m.user._id} className="flex justify-between mb-2">
              <span>{m.user.name}</span>

              <button
                onClick={() => handleRemoveMember(m.user._id)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* 🔥 ADD MEMBER */}
        <div>
          <h3 className="font-semibold mb-2">Add Member</h3>

          {allUsers.map((u) => (
            <button
              key={u._id}
              onClick={() => handleAddMember(u._id)}
              className="text-blue-500 text-sm mr-2"
            >
              {u.name}
            </button>
          ))}
        </div>

        {/* 🔥 ACTION */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="button-secondary">
            Cancel
          </button>

          <button onClick={handleUpdate} className="button-primary">
            Update
          </button>
        </div>

      </div>
    </div>
  );
}