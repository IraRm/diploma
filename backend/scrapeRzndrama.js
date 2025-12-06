const axios = require("axios");
// iconv пока оставим на всякий, но фактически страница в utf-8
const iconv = require("iconv-lite");

// русские месяцы в родительном падеже -> номер месяца JS
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

// качаем и декодируем HTML
async function downloadHtml() {
  const url = "https://www.rzndrama.ru/ru/repertuar-na-mesyac.html";

  const resp = await axios.get(url, { responseType: "arraybuffer" });
  const buf = Buffer.from(resp.data);

  // пробуем utf8
  let html = buf.toString("utf8");
  if (html.includes("Афиша на ближайшие месяцы") || html.includes("Календарь")) {
    console.log("✅ HTML успешно декодирован как utf8");
    return html;
  }

  // fallback в win1251, если вдруг понадобится
  html = iconv.decode(buf, "win1251");
  console.log("⚠️ utf8 не подошёл, декодирую как win1251");
  return html;
}

/**
 * Тянем страницу "Афиша на ближайшие месяцы"
 * и вытаскиваем строки вида:
 * 04 декабря, 19:00 - ТРИСТАН и ИЗОЛЬДА (Минск) (…)
 */
async function fetchShowsFromRzndrama() {
  const html = await downloadHtml();

  // чистим HTML → текст
  const text = html
    .replace(/\r\n/g, "\n")
    .replace(/&nbsp;/g, " ")      // ВАЖНО: заменяем HTML-сущность &nbsp; на пробел
    .replace(/\u00a0/g, " ")      // на всякий случай, если вдруг реально NBSP-символ
    .replace(/<[^>]+>/g, " ")     // убираем теги
    .replace(/[ \t]+/g, " ")      // схлопываем пробелы
    .replace(/\n[ \t]+/g, "\n");  // чистим пробелы в начале строк

  console.log("🔎 snippet:", text.slice(90, 350));

  let year = new Date().getFullYear();
  const headerMatch = text.match(/Календарь[\s\S]{0,100}?([А-ЯЁа-яё]+)\s+(\d{4})/);
  if (headerMatch) {
    year = Number(headerMatch[2]);
  }

  const shows = [];

  // упрощённый регексп: месяц берём как любое слово (\S+), а не [а-яё]+
  const eventRegex =
    /(\d{1,2})\s+(\S+),\s*(\d{1,2}:\d{2})\s*-\s*([^\n\r]+)/g;

  let match;
  while ((match = eventRegex.exec(text)) !== null) {
    const day = Number(match[1]);
    const monthWordRaw = match[2];
    const time = match[3];
    const titleAndRest = match[4].trim();

    const monthWord = monthWordRaw.toLowerCase();
    const monthIndex = MONTHS[monthWord];
    if (monthIndex === undefined) {
      // если вдруг попалось что-то вроде "декабря," с лишними символами — можно залогировать
      // console.log("Неизвестный месяц:", monthWordRaw);
      continue;
    }

    const [hStr, mStr] = time.split(":");
    const hours = Number(hStr);
    const minutes = Number(mStr);

    const jsDate = new Date(year, monthIndex, day, hours, minutes);

    // из "ТРИСТАН и ИЗОЛЬДА (Минск) (Автор...)" делаем название спектакля
    const rawTitle = titleAndRest.replace(/\s+/g, " ");
    let title = rawTitle.split("(")[0].replace(/[«»"]/g, "").trim();
    if (!title) continue;

    const dateStr = `${year}-${pad2(monthIndex + 1)}-${pad2(day)} ${time}`;

    const id = `${jsDate.getFullYear()}-${pad2(
      jsDate.getMonth() + 1
    )}-${pad2(jsDate.getDate())}-${time}-${slugify(title)}`;

    shows.push({
      id,
      title,
      theatre: "Рязанский театр драмы",
      date: dateStr,
      genre: "спектакль",
      images: []
    });
  }

  console.log("🔎 parsed events count:", shows.length);
  return shows;
}

module.exports = {
  fetchShowsFromRzndrama
};
