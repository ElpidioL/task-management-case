import { useMemo } from "react";
import { CategoryModalProvider } from "../components/dashboard/CategoryModalContext";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { TaskModalProvider } from "../components/dashboard/TaskModalContext";
import { TaskSection } from "../components/dashboard/TaskSection";
import type { User } from "../types/auth";
import type {
  Category,
  Task,
  TaskDueDateFilter,
  TaskFormState,
  TaskScopeFilter,
  TaskStatusFilter,
} from "../types/task";

export type DashboardMessages = {
  authMessage: string;
  errorMessage: string;
};

export type DashboardPageProps = {
  user: User;
  categories: Category[];
  messages: DashboardMessages;
  tasks: Task[];
  tasksLoading: boolean;
  taskFormLoading: boolean;
  categoryFormLoading: boolean;
  searchTerm: string;
  statusFilter: TaskStatusFilter;
  scopeFilter: TaskScopeFilter;
  dueDateFilter: TaskDueDateFilter;
  categoryFilter: string;
  page: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onScopeFilterChange: (value: TaskScopeFilter) => void;
  onDueDateFilterChange: (value: TaskDueDateFilter) => void;
  onCategoryFilterChange: (value: string) => void;
  onToggleCompletion: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onLogout: () => void | Promise<void>;
  saveTask: (form: TaskFormState, taskId: string | null) => Promise<void>;
  saveCategory: (payload: { name: string; color: string }) => Promise<void>;
};

export function DashboardPage({
  user,
  categories,
  messages,
  tasks,
  tasksLoading,
  taskFormLoading,
  categoryFormLoading,
  searchTerm,
  statusFilter,
  scopeFilter,
  dueDateFilter,
  categoryFilter,
  page,
  totalPages,
  onSearchChange,
  onStatusFilterChange,
  onScopeFilterChange,
  onDueDateFilterChange,
  onCategoryFilterChange,
  onToggleCompletion,
  onDeleteTask,
  onPrevPage,
  onNextPage,
  onLogout,
  saveTask,
  saveCategory,
}: DashboardPageProps) {
  const categoryColors = useMemo(
    () =>
      Object.fromEntries(categories.map((category) => [category.id, category.color ?? "#d1d5db"])),
    [categories],
  );

  return (
    <TaskModalProvider categories={categories} loading={taskFormLoading} onSaveTask={saveTask}>
      <CategoryModalProvider loading={categoryFormLoading} onSaveCategory={saveCategory}>
        <main className="container">
          <DashboardHeader user={user} onLogout={onLogout} />

          {messages.authMessage && <p className="success">{messages.authMessage}</p>}
          {messages.errorMessage && <p className="error">{messages.errorMessage}</p>}

          <TaskSection
            tasks={tasks}
            tasksLoading={tasksLoading}
            currentUserId={user.id}
            categoryColors={categoryColors}
            filters={{
              searchTerm,
              statusFilter,
              scopeFilter,
              dueDateFilter,
              categoryFilter,
              categories,
              onSearchChange,
              onStatusFilterChange,
              onScopeFilterChange,
              onDueDateFilterChange,
              onCategoryFilterChange,
            }}
            pagination={{
              page,
              totalPages,
              onPrevPage,
              onNextPage,
            }}
            onToggleCompletion={onToggleCompletion}
            onDeleteTask={onDeleteTask}
          />
        </main>
      </CategoryModalProvider>
    </TaskModalProvider>
  );
}
