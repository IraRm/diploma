import type { Show } from "../data/mockShows";

const API_BASE = "http://localhost:3000";

export async function fetchShows(): Promise<Show[]> {
  try {
    const res = await fetch(`${API_BASE}/shows`);
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    const data = await res.json();
    // можно сделать лёгкую валидацию
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format");
    }
    return data;
  } catch (e) {
    console.warn("Не удалось загрузить спектакли с бэкенда, использую mockShows:", e);
    const { mockShows } = await import("../data/mockShows");
    return mockShows;
  }
}
