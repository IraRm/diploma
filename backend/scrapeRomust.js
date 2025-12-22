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

// Ищем в тексте: "24 декабря 2025 в 14:00"
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
  return { iso, year, month, day, time };
}

function pickGenre(blockText) {
  // На странице встречаются категории типа "Детские спектакли 0+" и т.п.
  // Возьмём только слово/фразу до возраста.
  const t = norm(blockText);
  const genreLine =
    t.match(/(Мюзикл|Музыкальная комедия|Оперетта|Опера|Детские спектакли|Концертная программа|Творческая встреча|У нас в гостях|Мы в гостях)\s*\d+\+/i);
  if (genreLine) return norm(genreLine[1]).toLowerCase();

  // fallback
  return "спектакль";
}

async function fetchShowsFromRomust() {
  console.log("🎼 RoMust: start scrape");

  const url = "https://romust.ru/afisha/";
  const resp = await axios.get(url, {
    timeout: 20000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  const html = resp.data || "";
  const $ = cheerio.load(html);

  console.log("🎼 RoMust html length:", html.length);

  const shows = [];
  const seen = new Set();

  // Берём ссылки с названием спектакля.
  // В афише названия идут кликабельным текстом прямо рядом с датой/временем. :contentReference[oaicite:1]{index=1}
  $('a[href^="/repertuar/detail/"]').each((_, a) => {
    const $a = $(a);
    const title = norm($a.text());

    // фильтр от мусора
    if (!title) return;
    if (title.length < 2) return;
    if (title.toLowerCase() === "афиша") return;
    if (title.toLowerCase() === "купить билет") return;

    // Поднимаемся вверх, ищем ближайший блок, где есть "дата месяц год в время"
    let $node = $a;
    let candidateText = "";

    for (let up = 0; up < 8; up++) {
  $node = $node.parent();
  if (!$node || !$node.length) break;

  const t = norm($node.text());
  if (!t) continue;

  // защита: если поднялись слишком высоко (почти весь экран) — пропускаем
  if (t.length > 900) continue;

  if (parseDateTime(t)) {
    candidateText = t;
    break;
  }
}

    if (!candidateText) return;
    if (!candidateText.includes(title)) return;


    const dt = parseDateTime(candidateText);
    if (!dt) return;

    const genre = pickGenre(candidateText);

    // Стабильный id
    const id = `romust-${dt.iso}-${slugify(title)}`;

    if (seen.has(id)) return;
    seen.add(id);

    shows.push({
      id,
      title,
      theatre: "Рязанский музыкальный театр",
      date: dt.iso,
      genre,
      images: []
    });
  });

  // Иногда на странице много ссылок с одинаковым title (в описаниях),
  // поэтому дополнительно отфильтруем по валидной дате и адекватному названию
  const result = shows
    .filter((s) => s.title && s.date && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/.test(s.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  console.log("✅ RoMust parsed events count:", result.length);
  if (result[0]) console.log("🎼 RoMust sample:", result[0]);

  return result;
}

module.exports = { fetchShowsFromRomust };
