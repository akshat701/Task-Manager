import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";

export default function ProjectModal({ onClose, onSuccess }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    apiClient.get("/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Project name required");
      return;
    }

    await apiClient.post("/projects", {
      name,
      description,
      owner_id: "1",
      members: selectedUsers,
      deadline,
      created_at: new Date().toISOString(),
    });

    

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

      <div className="card w-full max-w-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">

        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Create Project
        </h2>

        <input
          className="input w-full mb-3"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="input w-full mb-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          className="input w-full mb-3"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">
            Team Members
          </p>

          <div className="flex flex-wrap gap-2">
            {users.map((u) => {
              const selected = selectedUsers.includes(u._id);

              return (
                <button
                  key={u._id}
                  onClick={() => toggleUser(u._id)}
                  className={`px-3 py-1 rounded-full text-sm border transition
                    ${
                      selected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  {u.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="button-secondary w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="button-primary w-full sm:w-auto"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}