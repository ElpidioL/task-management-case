import { DashboardPage } from "./DashboardPage";
import { useAuth } from "../context/AuthContext";
import { useTaskDashboard } from "../hooks/useTaskDashboard";

export function TasksRoutePage() {
  const { user, authMessage, logout } = useAuth();
  const {
    tasks,
    categories,
    tasksLoading,
    taskFormLoading,
    categoryFormLoading,
    errorMessage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    scopeFilter,
    setScopeFilter,
    dueDateFilter,
    setDueDateFilter,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    totalPages,
    saveTask,
    saveCategory,
    handleToggleTaskCompletion,
    handleDeleteTask,
  } = useTaskDashboard();

  if (!user) return null;

  return (
    <DashboardPage
      user={user}
      categories={categories}
      messages={{ authMessage, errorMessage }}
      tasks={tasks}
      tasksLoading={tasksLoading}
      taskFormLoading={taskFormLoading}
      categoryFormLoading={categoryFormLoading}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      scopeFilter={scopeFilter}
      dueDateFilter={dueDateFilter}
      categoryFilter={categoryFilter}
      page={page}
      totalPages={totalPages}
      onSearchChange={(value) => {
        setPage(1);
        setSearchTerm(value);
      }}
      onStatusFilterChange={(value) => {
        setPage(1);
        setStatusFilter(value);
      }}
      onScopeFilterChange={(value) => {
        setPage(1);
        setScopeFilter(value);
      }}
      onDueDateFilterChange={(value) => {
        setPage(1);
        setDueDateFilter(value);
      }}
      onCategoryFilterChange={(value) => {
        setPage(1);
        setCategoryFilter(value);
      }}
      onToggleCompletion={handleToggleTaskCompletion}
      onDeleteTask={handleDeleteTask}
      onPrevPage={() => setPage((prev) => prev - 1)}
      onNextPage={() => setPage((prev) => prev + 1)}
      onLogout={logout}
      saveTask={saveTask}
      saveCategory={saveCategory}
    />
  );
}
