const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

async function apiRequestInternal<T>(
  path: string,
  options: RequestInit = {},
  didRetryWithRefresh = false,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {

    if (response.status === 401 && !didRetryWithRefresh) {

      const lower = path.toLowerCase();
      const isAuthEndpoint =
        lower.includes("/api/auth/refresh/") ||
        lower.includes("/api/auth/logout/") ||
        lower.includes("/api/auth/login/") ||
        lower.includes("/api/auth/registration/");

      if (!isAuthEndpoint) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return apiRequestInternal<T>(path, options, true);
        }
      }
    }

    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as Record<string, unknown>;
      if (typeof data.detail === "string") {
        message = data.detail;
      } else {
        message = JSON.stringify(data);
      }
    } catch {
      
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiRequestInternal<T>(path, options, false);
}
