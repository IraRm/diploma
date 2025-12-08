import { mockShows, type Show } from "../data/mockShows";

// Для Expo публичные переменные должны начинаться с EXPO_PUBLIC_
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function fetchShows(): Promise<Show[]> {
  try {
    const res = await fetch(`${API_BASE}/shows`);

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid /shows response");
    }

    return data as Show[];
  } catch (e) {
    console.warn("Не удалось загрузить спектакли с API, использую mockShows:", e);
    return mockShows;
  }
}
