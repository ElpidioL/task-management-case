import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "../ui/Modal";
import { TaskForm } from "../tasks/TaskForm";
import type { Category, Task, TaskFormState } from "../../types/task";

type TaskModalContextValue = {
  openCreateTask: () => void;
  openEditTask: (task: Task) => void;
};

const TaskModalContext = createContext<TaskModalContextValue | undefined>(undefined);

export function useTaskModal() {
  const ctx = useContext(TaskModalContext);
  if (!ctx) {
    throw new Error("useTaskModal must be used within TaskModalProvider");
  }
  return ctx;
}

type TaskModalProviderProps = {
  children: ReactNode;
  categories: Category[];
  loading: boolean;
  onSaveTask: (form: TaskFormState, taskId: string | null) => Promise<void>;
};

export function TaskModalProvider({ children, categories, loading, onSaveTask }: TaskModalProviderProps) {
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setEditingTask(null);
  }, []);

  const openCreateTask = useCallback(() => {
    setEditingTask(null);
    setOpen(true);
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openCreateTask, openEditTask }),
    [openCreateTask, openEditTask],
  );

  return (
    <TaskModalContext.Provider value={value}>
      {children}
      <Modal
        title={editingTask ? "Edit Task" : "Create Task"}
        isOpen={open}
        onClose={close}
      >
        <TaskForm
          key={editingTask?.id ?? "new"}
          categories={categories}
          initialTask={editingTask}
          loading={loading}
          onCancel={close}
          onSubmit={async (form) => {
            await onSaveTask(form, editingTask?.id ?? null);
            close();
          }}
        />
      </Modal>
    </TaskModalContext.Provider>
  );
}
