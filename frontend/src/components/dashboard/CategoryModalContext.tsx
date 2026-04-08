import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "../ui/Modal";
import { CategoryForm } from "../tasks/CategoryForm";

type CategoryModalContextValue = {
  openCategoryModal: () => void;
};

const CategoryModalContext = createContext<CategoryModalContextValue | undefined>(undefined);

export function useCategoryModal() {
  const ctx = useContext(CategoryModalContext);
  if (!ctx) {
    throw new Error("useCategoryModal must be used within CategoryModalProvider");
  }
  return ctx;
}

type CategoryModalProviderProps = {
  children: ReactNode;
  loading: boolean;
  onSaveCategory: (payload: { name: string; color: string }) => Promise<void>;
};

export function CategoryModalProvider({ children, loading, onSaveCategory }: CategoryModalProviderProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const openCategoryModal = useCallback(() => setOpen(true), []);

  const value = useMemo(() => ({ openCategoryModal }), [openCategoryModal]);

  return (
    <CategoryModalContext.Provider value={value}>
      {children}
      <Modal title="Create Category" isOpen={open} onClose={close}>
        <CategoryForm
          loading={loading}
          onCancel={close}
          onSubmit={async (payload) => {
            await onSaveCategory(payload);
            close();
          }}
        />
      </Modal>
    </CategoryModalContext.Provider>
  );
}
