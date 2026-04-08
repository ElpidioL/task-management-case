export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Category = {
  id: string;
  name: string;
  color?: string;
};

export type TaskShare = {
  id?: string;
  user: string;
  user_email?: string;
  can_edit: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  owner: string;
  owner_email?: string;
  category: string | null;
  category_name?: string;
  is_completed: boolean;
  due_date: string | null;
  shares: TaskShare[];
  created_at?: string;
  updated_at?: string;
};

export type PaginatedCategories = PaginatedResponse<Category>;
export type PaginatedTasks = PaginatedResponse<Task>;

export type TaskStatusFilter = "all" | "pending" | "completed";
export type TaskScopeFilter = "all" | "mine" | "shared";

/** Client-side filter for tasks with/without due dates or by urgency. */
export type TaskDueDateFilter = "all" | "no_due" | "has_due" | "overdue" | "due_today";

export type TaskFormState = {
  title: string;
  description: string;
  category: string;
  due_date: string;
  is_completed: boolean;
  shares: Array<{
    email: string;
    can_edit: boolean;
  }>;
};

export const emptyTaskForm: TaskFormState = {
  title: "",
  description: "",
  category: "",
  due_date: "",
  is_completed: false,
  shares: [],
};

export function taskToFormState(task: Task | null): TaskFormState {
  if (!task) return emptyTaskForm;
  return {
    title: task.title,
    description: task.description ?? "",
    category: task.category ?? "",
    is_completed: task.is_completed,
    due_date: task.due_date ? task.due_date.slice(0, 16) : "",
    shares: task.shares.map((share) => ({
      email: share.user_email ?? "",
      can_edit: share.can_edit,
    })),
  };
}

/** Display due date in the UI (ISO string from API). */
export function formatTaskDueDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function isDueDateToday(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isDueDateOverdue(iso: string, isCompleted: boolean): boolean {
  if (isCompleted) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}