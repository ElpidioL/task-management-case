import type { Category, TaskDueDateFilter, TaskScopeFilter, TaskStatusFilter } from "../../types/task";

type TaskFiltersProps = {
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

export function TaskFilters({
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
}: TaskFiltersProps) {
  return (
    <div className="filters">
      <input
        type="search"
        placeholder="Search by title/description"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        value={scopeFilter}
        onChange={(e) => onScopeFilterChange(e.target.value as TaskScopeFilter)}
      >
        <option value="all">All tasks</option>
        <option value="mine">My tasks</option>
        <option value="shared">Shared with me</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as TaskStatusFilter)}
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <select
        value={dueDateFilter}
        onChange={(e) => onDueDateFilterChange(e.target.value as TaskDueDateFilter)}
      >
        <option value="all">Any due date</option>
        <option value="has_due">Has due date</option>
        <option value="no_due">No due date</option>
        <option value="due_today">Due today</option>
        <option value="overdue">Overdue</option>
      </select>

      <select value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value)}>
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
