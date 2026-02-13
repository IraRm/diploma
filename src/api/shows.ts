import { mockShows, type Show } from "../data/mockShows";

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
export async function fetchShowById(id: string): Promise<Show> {
  try {
    const res = await fetch(`${API_BASE}/shows/${id}`);

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    const data = await res.json();
    return data as Show;
  } catch (e) {
    console.warn("Не удалось загрузить спектакль с API, ищу в mockShows:", e);

    const local = mockShows.find((s) => s.id === id);
    if (!local) {
      throw new Error("Show not found in mockShows");
    }
    return local;
  }
}

