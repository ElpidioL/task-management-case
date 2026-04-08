import { TaskFilters } from "../tasks/TaskFilters";
import { TaskList } from "../tasks/TaskList";
import type {
  Category,
  Task,
  TaskDueDateFilter,
  TaskScopeFilter,
  TaskStatusFilter,
} from "../../types/task";
import { useTaskModal } from "./TaskModalContext";

export type TaskSectionFilters = {
  searchTerm: string;
  statusFilter: TaskStatusFilter;
  scopeFilter: TaskScopeFilter;
  dueDateFilter: TaskDueDateFilter;
  categoryFilter: string;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onScopeFilterChange: (value: TaskScopeFilter) => void;
  onDueDateFilterChange: (value: TaskDueDateFilter) => void;
  onCategoryFilterChange: (value: string) => void;
};

export type TaskSectionPagination = {
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

type TaskSectionProps = {
  tasks: Task[];
  tasksLoading: boolean;
  currentUserId: string;
  categoryColors: Record<string, string>;
  filters: TaskSectionFilters;
  pagination: TaskSectionPagination;
  onToggleCompletion: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

export function TaskSection({
  tasks,
  tasksLoading,
  currentUserId,
  categoryColors,
  filters,
  pagination,
  onToggleCompletion,
  onDeleteTask,
}: TaskSectionProps) {
  const { openEditTask } = useTaskModal();

  return (
    <section className="card">
      <div className="section-heading">
        <h2>Tasks</h2>
        <small>{tasks.length} item(s)</small>
      </div>

      <TaskFilters
        searchTerm={filters.searchTerm}
        statusFilter={filters.statusFilter}
        scopeFilter={filters.scopeFilter}
        dueDateFilter={filters.dueDateFilter}
        categoryFilter={filters.categoryFilter}
        categories={filters.categories}
        onSearchChange={filters.onSearchChange}
        onStatusFilterChange={filters.onStatusFilterChange}
        onScopeFilterChange={filters.onScopeFilterChange}
        onDueDateFilterChange={filters.onDueDateFilterChange}
        onCategoryFilterChange={filters.onCategoryFilterChange}
      />

      <TaskList
        tasks={tasks}
        loading={tasksLoading}
        currentUserId={currentUserId}
        categoryColors={categoryColors}
        onToggleCompletion={onToggleCompletion}
        onEdit={openEditTask}
        onDelete={onDeleteTask}
      />

      <div className="pagination">
        <button type="button" disabled={pagination.page <= 1} onClick={pagination.onPrevPage}>
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={pagination.onNextPage}
        >
          Next
        </button>
      </div>
    </section>
  );
}
