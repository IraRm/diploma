const axios = require("axios");

const MONTHS = {
  "января": 0,
  "февраля": 1,
  "марта": 2,
  "апреля": 3,
  "мая": 4,
  "июня": 5,
  "июля": 6,
  "августа": 7,
  "сентября": 8,
  "октября": 9,
  "ноября": 10,
  "декабря": 11
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function pad2(n) {
  return n.toString().padStart(2, "0");
}

async function downloadHtml() {
  const url = "https://www.rzndrama.ru/ru/repertuar-na-mesyac.html";

  const resp = await axios.get(url, {
    timeout: 20000,
    responseType: "text",
    maxRedirects: 5,
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  return resp.data;
}

async function fetchShowsFromRzndrama() {
  const pageUrl = "https://www.rzndrama.ru/ru/repertuar-na-mesyac.html";
  const html = await downloadHtml();
  const htmlFixed = html
  .replace(/&nbsp;|&#160;|&#xA0;|&#8239;|&#x202F;/gi, " ")
  .replace(/[\u00A0\u202F]/g, " ");

console.log("RZNDRAMA HTML sample:", htmlFixed.slice(0, 300));

  const text = htmlFixed
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/(p|div|li|tr|td|th|h[1-6])>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/[ \t\r\f\v]+/g, " ")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

  const normalizedText = text.replace(/[\u00A0\u202F]/g, " ");
  console.log("RZNDRAMA has sample:", normalizedText.match(/\d{1,2}\s*[А-ЯЁа-яё]+,?\s*\d{1,2}:\d{2}\s*[-–—]/)?.[0]);


  const looksLikeSchedule =
    normalizedText.includes("Календарь") ||
    /\d{1,2}\s+[А-ЯЁа-яё]+,?\s+\d{1,2}:\d{2}/.test(normalizedText);

  if (!looksLikeSchedule) {
    console.log("⚠️ Похоже, пришла не страница афиши.");
    return [];
  }

  let year = new Date().getFullYear();
  const headerMatch = normalizedText.match(/Календарь[\s\S]{0,100}?([А-ЯЁа-яё]+)\s+(\d{4})/);
  if (headerMatch) year = Number(headerMatch[2]);

  const shows = [];
  const eventRegex =
  /(\d{1,2})\s*([А-ЯЁа-яё]+),?\s*(\d{1,2}:\d{2})\s*[-–—]\s*([^\n\r]+)/g;

  let match;
  while ((match = eventRegex.exec(normalizedText)) !== null) {
    const day = Number(match[1]);
    const monthWordRaw = match[2];
    const time = match[3];
    const titleAndRest = match[4].trim();

    const monthWord = monthWordRaw.toLowerCase().replace(/[.,]/g, "");
    const monthIndex = MONTHS[monthWord];
    if (monthIndex === undefined) continue;

    let title = titleAndRest.replace(/\s+/g, " ").split("(")[0].replace(/[«»"]/g, "").trim();
    if (!title) continue;

    const dateStr = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}T${time}:00`;

    const id = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}-${time}-${slugify(title)}`;

    shows.push({
      id,
      title,
      theatre: "Рязанский театр драмы",
      date: dateStr,
      genre: "спектакль",
      images: [],
      url: pageUrl
    });
  }

  console.log("🔎 Rzndrama parsed events count:", shows.length);
  return shows;
}

module.exports = { fetchShowsFromRzndrama };
