import type { Show } from "../data/mockShows";

// ТВОЙ MAC КАК СЕРВЕР API
const API_BASE = "http://192.168.100.220:3000";

export async function fetchShows(): Promise<Show[]> {
  const res = await fetch(`${API_BASE}/shows`);
  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid /shows response");
  }
  return data as Show[];
}
