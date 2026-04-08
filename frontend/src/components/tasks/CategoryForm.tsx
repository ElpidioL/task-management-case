import type { FormEvent } from "react";
import { useState } from "react";

type CategoryFormProps = {
  loading: boolean;
  onSubmit: (payload: { name: string; color: string }) => void | Promise<void>;
  onCancel?: () => void;
};

export function CategoryForm({ loading, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name: name.trim(), color });
    setName("");
    setColor("#3b82f6");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Name
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Color
        <div className="color-row">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#3b82f6"
          />
          <span className="color-preview" style={{ backgroundColor: color }} />
        </div>
      </label>

      <div className="row">
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Creating..." : "Create Category"}
        </button>
        {onCancel && (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
