import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuthStore } from "../../store/authStore";

export default function TaskColumn({
  title,
  status,
  tasks,
  onEdit,
  users,
}: any) {
  const priorityColor: any = {
    low: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    medium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
  };

  const statusColor: any = {
    todo: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    in_progress:
      "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    done: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  };

  const {user} = useAuthStore();

  const getUserName = (id: string) => {
    const user = users.find((u: any) => u.id === id);
    return user ? user.name : "Unknown";
  };

  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl min-h-[350px]"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg capitalize">{title}</h2>

            <span className="text-sm text-secondary">{tasks.length} tasks</span>
          </div>

          {tasks.length === 0 && (
            <p className="text-sm text-secondary">No tasks</p>
          )}

          {tasks.map((task: any, index: number) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="card p-4 mb-3 card-hover border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-semibold text-base mb-2">{task.title}</h3>

                  <div className="flex gap-2 flex-wrap mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${statusColor[task.status]}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded ${priorityColor[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="text-xs text-secondary space-y-1 mb-3">
                    <p>
                      👤{" "}
                      {task.assignee_id
                        ? getUserName(task.assignee_id)
                        : "Unassigned"}
                    </p>

                    <p>
                      📅{" "}
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "No deadline"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ID: {task.id}
                    </span>
{user.role === "admin" || task.assignee_id === user.id ? (
                    <button
                      onClick={() => onEdit(task)}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    ) : null}
                  </div>
                </div>
              )}
            </Draggable>
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
