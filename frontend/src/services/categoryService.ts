import type { Category, PaginatedCategories } from "../types/task";
import { apiRequest } from "./apiClient";

export async function fetchCategories() {
  return apiRequest<PaginatedCategories>("/api/categories/");
}

export async function createCategory(name: string, color: string) {
  return apiRequest<Category>("/api/categories/", {
    method: "POST",
    body: JSON.stringify({ name, color }),
  });
}
