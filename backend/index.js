const express = require("express");
const cors = require("cors");
const { fetchShowsFromRzndrama } = require("./scrapeRzndrama");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Fallback-данные на случай, если сайт недоступен или парсинг ничего не дал
const fallbackShows = [
  {
    id: "1",
    title: "Ревизор",
    theatre: "Драматический театр",
    date: "2025-12-01T19:00:00",
    genre: "комедия",
    images: [
      "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485567702529-2b76d104e58f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485567724416-0a3c7a5b2e8c?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "2",
    title: "Чайка",
    theatre: "Театр им. Чехова",
    date: "2025-12-02T18:30:00",
    genre: "драма",
    images: [
      "https://images.unsplash.com/photo-1438109491414-7198515b166b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "3",
    title: "Щелкунчик",
    theatre: "Музыкальный театр",
    date: "2025-12-03T19:00:00",
    genre: "балет",
    images: [
      "https://images.unsplash.com/photo-1461782290329-3f723aa707a4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop"
    ]
  }
];

// простейший in-memory кэш, чтобы не долбить сайт на каждый запрос
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 минут
let cache = {
  data: null,
  fetchedAt: 0
};

async function getShowsWithCache() {
  const now = Date.now();

  // Режим "не скрапить сайт, всегда использовать fallback"
  if (process.env.DISABLE_SCRAPE === "true") {
    if (!cache.data) {
      console.log("⚙️ DISABLE_SCRAPE=true — использую только fallbackShows");
      cache = { data: fallbackShows, fetchedAt: now };
    }
    return cache.data;
  }

  // обычный режим с кэшем
  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  try {
    const scraped = await fetchShowsFromRzndrama();
    console.log("🔎 scraped shows count:", Array.isArray(scraped) ? scraped.length : 0);

    if (Array.isArray(scraped) && scraped.length > 0) {
      cache = { data: scraped, fetchedAt: now };
      console.log("✅ отдаю scraped из сети");
      return scraped;
    }

    console.log("⚠️ scraped пустой, отдаю fallback:", fallbackShows.length);
    cache = { data: fallbackShows, fetchedAt: now };
    return fallbackShows;
  } catch (err) {
    console.error("❌ Ошибка при загрузке афиши с rzndrama.ru, отдаю fallback:", err.message);
    cache = { data: fallbackShows, fetchedAt: now };
    return fallbackShows;
  }
}

// GET /shows — с кэшем
app.get("/shows", async (req, res) => {
  const shows = await getShowsWithCache();
  res.json(shows);
});

// GET /shows/:id — ищем в актуальных данных, затем в fallback
app.get("/shows/:id", async (req, res) => {
  try {
    const shows = await getShowsWithCache();

    let source = "scraped-or-fallback";
    let show = shows.find((s) => s.id === req.params.id);

    if (!show) {
      // дополнительный запасной вариант — прямой поиск по fallbackShows
      show = fallbackShows.find((s) => s.id === req.params.id);
      source = "fallback-only";
    }

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    console.log(`ℹ️ отдаю спектакль ${req.params.id} из ${source}`);
    res.json(show);
  } catch (err) {
    console.error("❌ Ошибка при загрузке спектакля, ищу во fallback:", err.message);
    const show = fallbackShows.find((s) => s.id === req.params.id);
    if (!show) {
      return res.status(404).json({ error: "Show not found (fallback)" });
    }
    res.json(show);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server is running on http://localhost:${PORT}`);
});
