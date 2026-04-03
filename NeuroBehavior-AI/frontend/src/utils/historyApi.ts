import { getApiBaseUrl, getAuthToken } from "./auth";

export async function saveHistoryToBackend(payload: {
  session_label?: string;
  typing_result?: any;
  attention_result?: any;
  reading_result?: any;
  final_result?: any;
  prediction_result?: any;
}) {
  const token = getAuthToken();
  if (!token) return null;

  const response = await fetch(`${getApiBaseUrl()}/history/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to save history");
  }

  return data;
}

export async function fetchMyHistory() {
  const token = getAuthToken();
  if (!token) {
    return { items: [] };
  }

  const response = await fetch(`${getApiBaseUrl()}/history/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to fetch history");
  }

  return data as { items: any[] };
}
