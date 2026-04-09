import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, login, logout as logoutRequest, register } from "../services/authService";
import type { User } from "../types/auth";

type AuthContextValue = {
  user: User | null;
  isBootstrapping: boolean;
  authLoading: boolean;
  errorMessage: string;
  authMessage: string;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerAndLogin: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  clearMessages: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    void bootstrapUser();
  }, []);

  async function bootstrapUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function loginWithEmail(email: string, password: string) {
    setAuthLoading(true);
    setErrorMessage("");
    setAuthMessage("");
    try {
      await login(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAuthMessage("Login successful.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function registerAndLogin(email: string, password: string, confirmPassword: string) {
    setAuthLoading(true);
    setErrorMessage("");
    setAuthMessage("");
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      await register(email, password, confirmPassword);
      await login(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAuthMessage("Account created and logged in.");

    } catch (error: any) {
      let message = "Authentication failed";
      if (error instanceof Error) {

        try {
          const parsed = JSON.parse(error.message);

          if (typeof parsed === "object" && parsed !== null) {
            const messages = Object.values(parsed).flat().filter(Boolean);

            if (messages.length > 0) {
              message = messages.join(" ");
            } else {
              message = error.message;
            }
          } else {
            message = error.message;
          }

        } catch {
          message = error.message;
        }
      }

      setErrorMessage(message);

    } finally {
      setAuthLoading(false);
    }
  }

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Expired token or network error — server still attempts to clear cookies.
    }
    setUser(null);
    setErrorMessage("");
    setAuthMessage("You have been logged out.");
  }, []);

  function clearMessages() {
    setErrorMessage("");
    setAuthMessage("");
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      authLoading,
      errorMessage,
      authMessage,
      loginWithEmail,
      registerAndLogin,
      logout,
      clearMessages,
    }),
    [user, isBootstrapping, authLoading, errorMessage, authMessage, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
