import type { FormEvent } from "react";
import type { AuthMode } from "../../types/auth";

type AuthFormProps = {
  mode: AuthMode;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthForm({
  mode,
  email,
  password,
  confirmPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="card form">
      <label>
        Email
        <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} required />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
        />
      </label>

      {mode === "register" && (
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
          />
        </label>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : mode === "login" ? "Login" : "Register + Login"}
      </button>
    </form>
  );
}
