import type { FormEvent } from "react";
import type { AuthMode } from "../types/auth";
import { AuthForm } from "../components/auth/AuthForm";

type AuthPageProps = {
  mode: AuthMode;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  authMessage: string;
  errorMessage: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMode: () => void;
};

export function AuthPage({
  mode,
  email,
  password,
  confirmPassword,
  loading,
  authMessage,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onToggleMode,
}: AuthPageProps) {
  return (
    <main className="container auth">
      <h1>Task Management</h1>
      <p>{mode === "login" ? "Login to manage your tasks." : "Create your account."}</p>

      <AuthForm
        mode={mode}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        loading={loading}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onConfirmPasswordChange={onConfirmPasswordChange}
        onSubmit={onSubmit}
      />

      <button className="link-button text-center" type="button" onClick={onToggleMode}>
        {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
      </button>

      {authMessage && <p className="success">{authMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </main>
  );
}
