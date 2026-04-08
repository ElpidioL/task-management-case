import type { PaginatedTasks } from "../types/task";
import type { Task, TaskFormState } from "../types/task";
import { apiRequest } from "./apiClient";

export type TaskQuery = {
  page: number;
  search: string;
};

export async function fetchTasks({ page, search }: TaskQuery) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search.trim()) {
    params.set("search", search.trim());
  }
  return apiRequest<PaginatedTasks>(`/api/tasks/?${params.toString()}`);
}

export async function createTask(taskForm: TaskFormState) {
  return apiRequest<Task>("/api/tasks/", {
    method: "POST",
    body: JSON.stringify(toTaskPayload(taskForm)),
  });
}

export async function updateTask(taskId: string, taskForm: TaskFormState) {
  return apiRequest<Task>(`/api/tasks/${taskId}/`, {
    method: "PATCH",
    body: JSON.stringify(toTaskPayload(taskForm)),
  });
}

export async function toggleTaskCompletion(task: Task) {
  return apiRequest<Task>(`/api/tasks/${task.id}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_completed: !task.is_completed }),
  });
}

export async function deleteTask(taskId: string) {
  return apiRequest<void>(`/api/tasks/${taskId}/`, { method: "DELETE" });
}

function toTaskPayload(taskForm: TaskFormState) {
  return {
    title: taskForm.title,
    description: taskForm.description,
    category: taskForm.category || null,
    is_completed: taskForm.is_completed,
    due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
    shares: taskForm.shares
      .filter((share) => share.email.trim().length > 0)
      .map((share) => ({
        email: share.email.trim(),
        can_edit: share.can_edit,
      })),
  };
}
