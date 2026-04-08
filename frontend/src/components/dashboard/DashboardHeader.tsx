import type { User } from "../../types/auth";
import { useCategoryModal } from "./CategoryModalContext";
import { useTaskModal } from "./TaskModalContext";

type DashboardHeaderProps = {
  user: User;
  onLogout: () => void | Promise<void>;
};

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const { openCreateTask } = useTaskModal();
  const { openCategoryModal } = useCategoryModal();

  return (
    <header className="header">
      <div className="header-copy">
        <h1>My Tasks</h1>
        <p>Welcome back, {user.email}</p>
      </div>
      <div className="row">
        <button type="button" onClick={openCreateTask}>
          + New Task
        </button>
        <button type="button" className="ghost-button" onClick={openCategoryModal}>
          + New Category
        </button>
        <button type="button" className="ghost-button" onClick={() => void onLogout()}>
          Logout
        </button>
      </div>
    </header>
  );
}
