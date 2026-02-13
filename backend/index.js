const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const { fetchShowsFromRzndrama } = require("./scrapeRzndrama");
const { fetchShowsFromPerehod } = require("./scrapePerehod");
const { fetchShowsFromRznPuppet } = require("./scrapeRznPuppet");
const { fetchShowsFromRznTdm } = require("./rznTdm"); // у тебя уже есть
const { fetchShowsFromRomust } = require("./scrapeRomust");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});

// Fallback-данные
const fallbackShows = [
  {
    id: "1",
    title: "Ревизор",
    theatre: "Драматический театр",
    date: "2025-12-01T19:00:00",
    genre: "комедия",
    images: [
      "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop"
    ],
    url: "https://example.com"
  }
];

// кэш
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { data: null, fetchedAt: 0 };

async function getShowsWithCache() {
  const now = Date.now();

  if (process.env.DISABLE_SCRAPE === "true") {
    if (!cache.data) {
      console.log("⚙️ DISABLE_SCRAPE=true — использую только fallbackShows");
      cache = { data: fallbackShows, fetchedAt: now };
    }
    return cache.data;
  }

  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  try {
    const [rzndrama, perehod, puppet, tdm, romust] = await Promise.all([
      fetchShowsFromRzndrama(),
      fetchShowsFromPerehod(),
      fetchShowsFromRznPuppet(),
      fetchShowsFromRznTdm(),
      fetchShowsFromRomust()
    ]);

    const scraped = [
      ...(Array.isArray(rzndrama) ? rzndrama : []),
      ...(Array.isArray(perehod) ? perehod : []),
      ...(Array.isArray(puppet) ? puppet : []),
      ...(Array.isArray(tdm) ? tdm : []),
      ...(Array.isArray(romust) ? romust : [])
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log("🔎 scraped shows count:", scraped.length);
    console.log(
      "🎭 theatres:",
      [...new Set(scraped.map((s) => s.theatre))].join(" | ")
    );

    if (scraped.length > 0) {
      cache = { data: scraped, fetchedAt: now };
      console.log("✅ отдаю scraped из сети");
      return scraped;
    }

    console.log("⚠️ scraped пустой, отдаю fallback:", fallbackShows.length);
    cache = { data: fallbackShows, fetchedAt: now };
    return fallbackShows;
  } catch (err) {
    console.error("❌ Ошибка при скрапинге афиш, отдаю fallback:", err.message);
    cache = { data: fallbackShows, fetchedAt: now };
    return fallbackShows;
  }
}

// --------- ГРУППИРОВКА (вариант B) + buyUrl в sessions ---------

function normalizeTitle(s) {
  return (s ?? "")
    .replace(/[«»"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function slugify(str) {
  return (str ?? "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function makeGroupId(show) {
  const t = slugify(show.theatre || "");
  const n = slugify(normalizeTitle(show.title || ""));
  return `${t}__${n}`;
}

function groupShows(rawShows) {
  const map = new Map();

  for (const s of rawShows) {
    const gid = makeGroupId(s);

    if (!map.has(gid)) {
      map.set(gid, {
        id: gid,
        title: s.title,
        theatre: s.theatre,
        genre: s.genre,
        images: Array.isArray(s.images) ? [...s.images] : [],
        description: null,
        performanceId: s.performanceId ?? null,
        date: undefined,
        sessions: []
      });
    }

    const g = map.get(gid);
    if (!g.performanceId && s.performanceId) g.performanceId = s.performanceId;

    g.sessions.push({
      id: s.id,
      date: s.date,
      buyUrl: s.buyUrl ?? s.url ?? null
    });

    if (Array.isArray(s.images) && s.images.length) {
      const set = new Set(g.images);
      for (const img of s.images) set.add(img);
      g.images = Array.from(set);
    }

    if (!g.genre && s.genre) g.genre = s.genre;
  }

  for (const g of map.values()) {
    g.sessions.sort((a, b) => a.date.localeCompare(b.date));
    g.date = g.sessions[0]?.date;
  }

  return Array.from(map.values()).sort((a, b) => {
    const ad = a.date ?? "9999-12-31T00:00:00";
    const bd = b.date ?? "9999-12-31T00:00:00";
    return ad.localeCompare(bd);
  });
}

function cleanText(s) {
  return String(s || "").replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();
}

function normalizeUrl(u, base) {
  if (!u) return null;
  const s = String(u).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  try {
    return new URL(s, base).toString();
  } catch {
    return null;
  }
}

function upgradeToHttps(u) {
  if (!u) return null;
  const s = String(u).trim();
  if (s.startsWith("http://www.rzn-tdm.ru/")) return s.replace("http://", "https://");
  if (s.startsWith("http://rzn-tdm.ru/")) return s.replace("http://", "https://");
  return s;
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function isBadPosterUrl(u) {
  const s = String(u || "").toLowerCase();
  return (
    s.includes("vnimanie") ||
    s.includes("attention") ||
    s.includes("logo") ||
    s.includes("banner") ||
    s.includes("icon") ||
    s.includes("sprite") ||
    s.includes("placeholder") ||
    s.includes("default") ||
    s.includes("noimage")
  );
}
function posterScore(u) {
  const s = String(u || "").toLowerCase();
  let score = 0;

  if (s.includes("useruploads")) score += 10;
  if (s.includes("/photo/")) score += 4;

  if (s.includes("poster") || s.includes("afisha") || s.includes("playbill")) score += 8;

  if (/\.(jpg|jpeg|png|webp)(\?|$)/.test(s)) score += 2;

  if (isBadPosterUrl(s)) score -= 999;

  if (s.includes("header") || s.includes("banner") || s.includes("slider")) score -= 50;
  if (s.includes("logo")) score -= 50;

  return score;
}



async function fetchTdmPerformanceDetails(performanceId) {
  const endpoints = [
    `https://rzntdm.core.ubsystem.ru/uiapi/performance/${performanceId}`,
    `https://rzntdm.core.ubsystem.ru/uiapi/performances/${performanceId}`,
    `https://rzntdm.core.ubsystem.ru/uiapi/performance/info/${performanceId}`
  ];

  for (const url of endpoints) {
    try {
      const resp = await axios.get(url, {
        timeout: 20000,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "ru-RU,ru;q=0.9",
          "Accept": "application/json,text/plain,*/*",
          "Referer": "https://www.rzn-tdm.ru/"
        }
      });

      const p = resp.data;
      if (!p || typeof p !== "object") continue;

      const description =
        p.description ||
        p.text ||
        p.content ||
        p.annotation ||
        (p.performance && p.performance.description) ||
        null;

      const img =
        p.image ||
        p.poster ||
        p.posterUrl ||
        p.imageUrl ||
        (p.images && p.images[0]) ||
        (p.photos && p.photos[0]) ||
        null;

      const posterUrl = img ? upgradeToHttps(normalizeUrl(img, "https://www.rzn-tdm.ru/")) : null;

      return {
        description: description ? String(description).trim() : null,
        posterUrl
      };
    } catch {
      
    }
  }

  return { description: null, posterUrl: null };
}

async function fetchTdmPageDetails(pageUrl) {
  const resp = await axios.get(pageUrl, {
    timeout: 20000,
    responseType: "arraybuffer",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "ru-RU,ru;q=0.9"
    }
  });

  const html = iconv.decode(Buffer.from(resp.data), "win1251");
  const $ = cheerio.load(html);

// --- POSTER ---
const ogImg = $('meta[property="og:image"]').attr("content");
const twImg = $('meta[name="twitter:image"]').attr("content");

const contentCandidates = [];
const metaCandidates = [];

if (ogImg) metaCandidates.push(upgradeToHttps(normalizeUrl(ogImg, pageUrl)));
if (twImg) metaCandidates.push(upgradeToHttps(normalizeUrl(twImg, pageUrl)));

const scope =
  $(".content_text, .page_text, #content, article, main, .page-content, .content").first();

scope.find("img[src]").each((_, el) => {
  const src = $(el).attr("src");
  const abs = upgradeToHttps(normalizeUrl(src, pageUrl));
  if (abs) contentCandidates.push(abs);
});

let posterUrl =
  contentCandidates
    .filter(Boolean)
    .filter((u) => !isBadPosterUrl(u))
    .sort((a, b) => posterScore(b) - posterScore(a))[0] || null;

if (!posterUrl) {
  posterUrl =
    metaCandidates
      .filter(Boolean)
      .filter((u) => !isBadPosterUrl(u))
      .sort((a, b) => posterScore(b) - posterScore(a))[0] || null;
}


  // --- DESCRIPTION ---
  const metaDesc = $('meta[name="description"]').attr("content");
  const ogDesc = $('meta[property="og:description"]').attr("content");

  const directSelectors = [
    ".content_text",
    ".page_text",
    ".text",
    ".description",
    "#content",
    ".maintext",
    ".entry-content",
    ".post-content",
    ".article-content",
    ".page-content",
    ".content"
  ];

  let bodyText = "";
  for (const sel of directSelectors) {
    const t = cleanText($(sel).text());
    if (t && t.length > bodyText.length) bodyText = t;
  }

  if (!bodyText || bodyText.length < 200) {
    const descScope = $("main, article, .content, .page-content").first();
    let combined = "";

    scope.find("p").each((_, el) => {
      const t = cleanText($(el).text());
      if (t.length >= 40) combined += (combined ? "\n\n" : "") + t;
    });

    if (combined.length > bodyText.length) bodyText = combined;
  }

  if (bodyText.length > 8000) bodyText = "";

  const description =
    bodyText && bodyText.length >= 200 ? bodyText : cleanText(ogDesc || metaDesc);

  return { posterUrl: posterUrl || null, description: description || null };
}

// --------- ROUTES ---------

app.get("/shows", async (req, res) => {
  const shows = await getShowsWithCache();
  res.setHeader("Cache-Control", "no-store");

  if (req.query.raw === "true") {
    return res.json(Array.isArray(shows) ? shows : []);
  }

  const grouped = groupShows(Array.isArray(shows) ? shows : []);
  return res.json(grouped);
});

app.get("/shows/:id", async (req, res) => {
  try {
    const shows = await getShowsWithCache();
    const grouped = groupShows(Array.isArray(shows) ? shows : []);

    const idRaw = req.params.id;
    const id1 = safeDecode(idRaw);
    const id2 = safeDecode(id1);

    const show = grouped.find((g) => g.id === idRaw || g.id === id1 || g.id === id2);
    if (!show) return res.status(404).json({ error: "Show not found" });

    const detailsUrl = show.sessions?.find((s) => s.buyUrl)?.buyUrl ?? null;
    console.log("🔎 detailsUrl:", detailsUrl);


    if (detailsUrl && typeof detailsUrl === "string" && detailsUrl.includes("rzn-tdm.ru")) {
      try {
        if (show.performanceId) {
          const api = await fetchTdmPerformanceDetails(show.performanceId);

          if (api.description && api.description.length > 120) {
            show.description = api.description;
          }

          if (api.posterUrl) {
            const first = show.images?.[0];
            if (!first || isBadPosterUrl(first)) {
              show.images = [api.posterUrl];
            } else {
              const set = new Set([api.posterUrl, ...(show.images || [])]);
              show.images = Array.from(set);
            }
          }
        }

        if (!show.description || show.description.length < 120 || !show.images || show.images.length === 0) {
  const page = await fetchTdmPageDetails(detailsUrl);

          if (page.description) show.description = page.description;

          if (page.posterUrl && !isBadPosterUrl(page.posterUrl)) {
  const first = show.images?.[0];
  if (!first || isBadPosterUrl(first)) {
    show.images = [page.posterUrl];
  } else {
    const set = new Set([page.posterUrl, ...(show.images || [])]);
    show.images = Array.from(set);
  }
}

        }
      } catch (e) {
        console.log("⚠️ TDM details fetch failed:", e?.message || e);
      }
    }

    if (Array.isArray(show.images)) {
      show.images = show.images
        .map(upgradeToHttps)
        .filter((u) => u && !isBadPosterUrl(u));
    }

    return res.json(show);
  } catch (err) {
    console.error("❌ Ошибка при загрузке спектакля:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/ping", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API server is running on http://localhost:${PORT}`);
});

