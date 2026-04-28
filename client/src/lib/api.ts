import { useNotificationStore } from "@/store/notification";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Request failed" }));
      const errorMessage = error.error || `API error: ${res.status}`;
      useNotificationStore.getState().showError(errorMessage);
      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error: any) {
    if (!error.message.includes("API error")) {
      useNotificationStore.getState().showError(error.message || "Network error");
    }
    throw error;
  }
}

export async function apiUpload<T = unknown>(
  endpoint: string,
  formData: FormData,
  token: string,
): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Upload failed" }));
      const errorMessage = error.error || `API error: ${res.status}`;
      useNotificationStore.getState().showError(errorMessage);
      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error: any) {
    if (!error.message.includes("API error")) {
      useNotificationStore.getState().showError(error.message || "Upload failed");
    }
    throw error;
  }
}
