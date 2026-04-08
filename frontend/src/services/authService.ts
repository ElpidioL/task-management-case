import type { User } from "../types/auth";
import { apiRequest } from "./apiClient";

export async function getCurrentUser() {
  return apiRequest<User>("/api/user/");
}

export async function login(email: string, password: string) {
  return apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, confirmPassword: string) {
  return apiRequest("/api/auth/registration/", {
    method: "POST",
    body: JSON.stringify({
      email,
      password1: password,
      password2: confirmPassword,
    }),
  });
}

export async function logout() {
  return apiRequest<{ detail: string }>("/api/auth/logout/", { method: "POST" });
}
