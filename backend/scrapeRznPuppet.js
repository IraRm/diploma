const axios = require("axios");
const cheerio = require("cheerio");

const MONTHS = {
  "января": 1, "февраля": 2, "марта": 3, "апреля": 4, "мая": 5, "июня": 6,
  "июля": 7, "августа": 8, "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12
};



function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function text($el) {
  return ($el.text() || "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

// Пытаемся вытащить: "27 декабря" и "начало в 17:30"
function parseCard(cardText, year) {
  const lower = cardText.toLowerCase();

  // дата: "27 декабря"
  const dm = lower.match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
  if (!dm) return null;

  const day = Number(dm[1]);
  const month = MONTHS[dm[2]];
  if (!day || !month) return null;

  // время: "начало в 17:30"
  const tm = lower.match(/начало\s+в\s+(\d{1,2}:\d{2})/);
  const time = tm ? tm[1] : "00:00";

  // название: обычно в заголовке h3 (на странице оно есть) :contentReference[oaicite:1]{index=1}
  // но на всякий случай попробуем вытащить как строку до возраста "0+ / 6+ / 12+ / 16+ / 18+"
  let title = cardText.split("\n")[0].trim();
    title = title.replace(/[«»"]/g, "").replace(/\s+/g, " ").trim();


  if (!title) return null;

  // год “перекатываем”: если сейчас декабрь и встретили январь — следующий год
  const now = new Date();
  let y = year ?? now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (currentMonth === 12 && month === 1) y += 1;

  const iso = `${y}-${pad2(month)}-${pad2(day)}T${time}:00`;

  return { title, iso, y, month, day, time };
}

async function fetchShowsFromRznPuppet() {
  console.log("🧸 RznPuppet: start scrape");

  const url = "https://rznpuppet.ru/playbill/";
  const resp = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

 const $ = cheerio.load(resp.data);

console.log("🧸 RznPuppet html length:", resp.data.length);
console.log("🧸 RznPuppet h3 count:", $("h3").length);

  // На странице много карточек, каждая содержит название и дату/время :contentReference[oaicite:2]{index=2}
  // Достаём по заголовкам h3 и их контейнерам.
  const cards = [];

    $("h3").each((_, h3) => {
    const $h3 = $(h3);
    const title = text($h3);
    if (!title) return;

    // Будем подниматься вверх по DOM, пока не найдём блок,
    // где есть и дата (месяц), и время (начало ...)
    let $node = $h3;
    let candidate = "";

    for (let up = 0; up < 8; up++) {
      $node = $node.parent();
      if (!$node || !$node.length) break;

      const t = text($node);
      const low = t.toLowerCase();

      const hasDate = /(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/.test(low);
      const hasTime = /начало\s*(?:в\s*)?\d{1,2}:\d{2}/.test(low);

      if (hasDate && hasTime) {
        candidate = t;
        break;
      }
    }

    if (!candidate) return;

    // Соберём текст “заголовок + блок”
    cards.push(`${title}\n${candidate}`);
  });

console.log("🧸 RznPuppet cards:", cards.length);
if (cards[0]) console.log("🧸 RznPuppet card sample:", cards[0].slice(0, 500));

  const shows = [];
  const year = new Date().getFullYear();

  for (const cardText of cards) {
    const parsed = parseCard(cardText, year);
    if (!parsed) continue;

    const id = `${parsed.iso}-${slugify(parsed.title)}`;
    shows.push({
      id,
      title: parsed.title,
      theatre: "Рязанский театр кукол",
      date: parsed.iso,
      genre: "спектакль",
      images: []
    });
  }

  // удалим дубли по id
  const uniq = new Map();
  for (const s of shows) uniq.set(s.id, s);

  const result = Array.from(uniq.values()).sort((a, b) => a.date.localeCompare(b.date));
  console.log("✅ RznPuppet parsed events count:", result.length);
  return result;
}

module.exports = { fetchShowsFromRznPuppet };
