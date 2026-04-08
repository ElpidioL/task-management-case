import type { FormEvent } from "react";
import { useState } from "react";
import type { Category, Task, TaskFormState } from "../../types/task";
import { taskToFormState } from "../../types/task";

type TaskFormProps = {
  categories: Category[];
  initialTask: Task | null;
  loading: boolean;
  onSubmit: (form: TaskFormState) => void | Promise<void>;
  onCancel: () => void;
};

export function TaskForm({
  categories,
  initialTask,
  loading,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [form, setForm] = useState<TaskFormState>(() => taskToFormState(initialTask));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
      </label>

      <label>
        Category
        <select
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Due Date
        <input
          type="datetime-local"
          value={form.due_date}
          onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.is_completed}
          onChange={(e) => setForm((prev) => ({ ...prev, is_completed: e.target.checked }))}
        />
        Completed
      </label>

      <section className="share-section">
        <div className="section-heading">
          <h4>Share With</h4>
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                shares: [...prev.shares, { email: "", can_edit: false }],
              }))
            }
          >
            + Add User
          </button>
        </div>

        {form.shares.length === 0 ? (
          <small className="share-help">No shared users yet.</small>
        ) : (
          form.shares.map((share, index) => (
            <div key={`share-${index}`} className="share-row">
              <input
                type="email"
                autoComplete="email"
                placeholder="colleague@example.com"
                value={share.email}
                onChange={(e) => {
                  const nextShares = [...form.shares];
                  nextShares[index] = { ...share, email: e.target.value };
                  setForm((prev) => ({ ...prev, shares: nextShares }));
                }}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={share.can_edit}
                  onChange={(e) => {
                    const nextShares = [...form.shares];
                    nextShares[index] = { ...share, can_edit: e.target.checked };
                    setForm((prev) => ({ ...prev, shares: nextShares }));
                  }}
                />
                Can edit
              </label>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    shares: prev.shares.filter((_, rowIndex) => rowIndex !== index),
                  }));
                }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>

      <div className="row">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialTask ? "Update Task" : "Create Task"}
        </button>
        {initialTask && (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
