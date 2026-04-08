import type { FormEvent } from "react";
import { useState } from "react";
import { AuthPage } from "./AuthPage";
import type { AuthMode } from "../types/auth";
import { useAuth } from "../context/AuthContext";

export function LoginRoutePage() {
  const { authLoading, errorMessage, authMessage, loginWithEmail, registerAndLogin, clearMessages } =
    useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") {
      await loginWithEmail(email, password);
      return;
    }
    await registerAndLogin(email, password, confirmPassword);
  }

  function toggleMode() {
    setMode(mode === "login" ? "register" : "login");
    clearMessages();
  }

  return (
    <AuthPage
      mode={mode}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      loading={authLoading}
      authMessage={authMessage}
      errorMessage={errorMessage}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
      onToggleMode={toggleMode}
    />
  );
}
