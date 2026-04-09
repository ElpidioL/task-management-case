import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createCategory, fetchCategories } from "../services/categoryService";
import {
  createTask,
  deleteTask,
  fetchTasks,
  toggleTaskCompletion,
  updateTask,
} from "../services/taskService";

import {
  type Category,
  type PaginatedCategories,
  type PaginatedTasks,
  type Task,
  type TaskDueDateFilter,
  type TaskFormState,
  type TaskScopeFilter,
  type TaskStatusFilter,
} from "../types/task";

const PAGE_SIZE = 10;

export function useTaskDashboard() {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<TaskScopeFilter>("all");
  const [dueDateFilter, setDueDateFilter] = useState<TaskDueDateFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, categoryFilter, scopeFilter, dueDateFilter]);
  
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<PaginatedCategories>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categories: Category[] = categoriesData?.results ?? [];

  const { data: tasksData, isLoading: tasksLoading } = useQuery<PaginatedTasks>({
    queryKey: ["tasks", page, searchTerm, statusFilter, categoryFilter, scopeFilter, dueDateFilter],
    queryFn: () =>
      fetchTasks({
        page,
        search: searchTerm,
        status: statusFilter,
        scope: scopeFilter,
        category: categoryFilter,
        due: dueDateFilter,
      }),
  });
  const tasks = tasksData?.results ?? [];
  const totalCount = tasksData?.count ?? 0;
  
  const stableTasks = useMemo(() => tasks, [tasks]);

  const totalPages = useMemo(() => {
    if (totalCount === 0) return 1;
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }, [totalCount]);

  const taskMutation = useMutation({
    mutationFn: ({ form, taskId }: { form: TaskFormState; taskId: string | null }) =>
      taskId ? updateTask(taskId, form) : createTask(form),
    onSuccess: () => {
      setErrorMessage("");
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Could not save task");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTaskCompletion,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const categoryMutation = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) => createCategory(name, color),
    onSuccess: () => {
      setErrorMessage("");
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Could not create category");
    },
  });

  async function saveTask(form: TaskFormState, taskId: string | null) {
    await taskMutation.mutateAsync({ form, taskId });
  }

  async function saveCategory(payload: { name: string; color: string }) {
    await categoryMutation.mutateAsync(payload);
  }

  return {
    tasks: stableTasks,
    categories,
    tasksLoading,
    categoriesLoading,
    taskFormLoading: taskMutation.isPending,
    categoryFormLoading: categoryMutation.isPending,
    errorMessage,

    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    scopeFilter,
    setScopeFilter,
    dueDateFilter,
    setDueDateFilter,
    page,
    setPage,
    totalPages,

    saveTask,
    saveCategory,

    handleToggleTaskCompletion: (task: Task) => toggleMutation.mutate(task),
    handleDeleteTask: (taskId: string) => deleteMutation.mutate(taskId),
  };
}
