import { formatTaskDueDate, type Task } from "../../types/task";

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  currentUserId: string;
  categoryColors: Record<string, string>;
  onToggleCompletion: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export function TaskList({
  tasks,
  loading,
  currentUserId,
  categoryColors,
  onToggleCompletion,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return <p>No tasks found.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const dueLabel = formatTaskDueDate(task.due_date);
        const hasCategory = Boolean(task.category);

        return (
          <li key={task.id} className="task-item card">
            <div className="task-main">
              <div className="task-top-row">
                <div>
                  <h3>{task.title}</h3>
                </div>
                <span className={`status-pill ${task.is_completed ? "done" : "pending"}`}>
                  {task.is_completed ? "Completed" : "Pending"}
                </span>
                {dueLabel && (
                  <small>
                    <span className="task-due-label float-right">Due</span> {dueLabel}
                  </small>
                )}
              </div>
              <p>{task.description || "No description"}</p>
              {hasCategory && (
                <div className="task-meta">
                  <span
                    className="category-pill"
                    style={{
                      backgroundColor: categoryColors[task.category!] ?? "#d1d5db",
                    }}
                  />
                  <small>{task.category_name ?? "Category"}</small>
                </div>
              )}
              <div className="sharing-meta">
                {task.owner === currentUserId ? (
                  <small className="ownership-pill mine">Owned by me</small>
                ) : (
                  <small className="ownership-pill shared">
                    Shared with me · From {task.owner_email ?? `${task.owner.slice(0, 8)}…`}
                  </small>
                )}

                {task.owner === currentUserId && task.shares.length > 0 && (
                  <small className="share-list">
                    Shared with:{" "}
                    {task.shares
                      .map((share) => share.user_email ?? share.user.slice(0, 8))
                      .join(", ")}
                  </small>
                )}
              </div>
            </div>
            <div className="row task-actions">
              <button type="button" className="ghost-button" onClick={() => onToggleCompletion(task)}>
                {task.is_completed ? "Reopen" : "Complete"}
              </button>
              <button type="button" className="ghost-button" onClick={() => onEdit(task)}>
                Edit
              </button>
              <button type="button" className="danger-button" onClick={() => onDelete(task.id)}>
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
