const axios = require("axios");
const cheerio = require("cheerio");

const MONTHS = {
  "января": 1, "февраля": 2, "марта": 3, "апреля": 4, "мая": 5, "июня": 6,
  "июля": 7, "августа": 8, "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12
};

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function norm(s) {
  return (s || "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function parseDateTime(blockText) {
  const low = blockText.toLowerCase();
  const m = low.match(
    /(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+(\d{4})\s+в\s+(\d{1,2}:\d{2})/
  );
  if (!m) return null;

  const day = Number(m[1]);
  const month = MONTHS[m[2]];
  const year = Number(m[3]);
  const time = m[4];

  if (!day || !month || !year || !time) return null;

  const iso = `${year}-${pad2(month)}-${pad2(day)}T${time}:00`;
  return { iso };
}

function pickGenre(blockText) {
  const t = norm(blockText);
  const genreLine = t.match(
    /(Мюзикл|Музыкальная комедия|Оперетта|Опера|Детские спектакли|Концертная программа|Творческая встреча|У нас в гостях|Мы в гостях)\s*\d+\+/i
  );
  if (genreLine) return norm(genreLine[1]).toLowerCase();
  return "спектакль";
}

function absolutize(baseUrl, href) {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith("/")) return `${baseUrl}${href}`;
  return `${baseUrl}/${href}`;
}

async function fetchPosterFromDetailPage(pageUrl) {
  try {
    const resp = await axios.get(pageUrl, {
      timeout: 20000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "ru-RU,ru;q=0.9",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    const $ = cheerio.load(resp.data || "");

    const og =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content") ||
      null;

    if (og && typeof og === "string") return og;

    const img =
      $("img").first().attr("src") ||
      null;

    if (!img) return null;

    const base = new URL(pageUrl).origin;
    return absolutize(base, img);
  } catch (e) {
    return null;
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await mapper(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, worker);
  await Promise.all(workers);
  return results;
}

async function fetchShowsFromRomust() {
  console.log("🎼 RoMust: start scrape");

  const baseUrl = "https://romust.ru";
  const listUrl = `${baseUrl}/afisha/`;

  const resp = await axios.get(listUrl, {
    timeout: 20000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  const $ = cheerio.load(resp.data || "");

  const rawEvents = [];
  const seen = new Set();
  $('a[href^="/repertuar/detail/"]').each((_, a) => {
    const $a = $(a);
    const title = norm($a.text());
    if (!title || title.length < 2) return;

    const href = $a.attr("href") || "";
    const pageUrl = href ? `${baseUrl}${href}` : listUrl;

    let $node = $a;
    let candidateText = "";

    for (let up = 0; up < 10; up++) {
      $node = $node.parent();
      if (!$node || !$node.length) break;

      const t = norm($node.text());
      if (!t) continue;
      if (t.length > 1200) continue;

      if (parseDateTime(t)) {
        candidateText = t;
        break;
      }
    }

    if (!candidateText) return;

    const dt = parseDateTime(candidateText);
    if (!dt) return;

    const genre = pickGenre(candidateText);

    const id = `romust-${dt.iso}-${slugify(title)}`;
    if (seen.has(id)) return;
    seen.add(id);

    rawEvents.push({
      id,
      title,
      theatre: "Рязанский музыкальный театр",
      date: dt.iso,
      genre,
      pageUrl
    });
  });

  const events = rawEvents
    .filter((s) => s.title && s.date && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/.test(s.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  console.log("🎼 RoMust events found:", events.length);

  const posters = await mapWithConcurrency(
    events,
    4,
    async (ev) => {
      const poster = await fetchPosterFromDetailPage(ev.pageUrl);
      return poster;
    }
  );

  const shows = events.map((ev, idx) => {
    const poster = posters[idx];

    return {
      id: ev.id,
      title: ev.title,
      theatre: ev.theatre,
      date: ev.date,
      genre: ev.genre,
      images: poster ? [poster] : [],
      url: ev.pageUrl
    };
  });

  console.log(
    "✅ RoMust parsed events count:",
    shows.length,
    "| posters:",
    shows.filter((s) => s.images?.length).length
  );

  return shows;
}

module.exports = { fetchShowsFromRomust };
