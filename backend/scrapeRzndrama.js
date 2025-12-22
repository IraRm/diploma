const axios = require("axios");
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
  const url = "http://www.rzndrama.ru/ru/repertuar-na-mesyac.html";

  const resp = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  const buf = Buffer.from(resp.data);

  // ✅ СНАЧАЛА объявляем html
  let html = buf.toString("utf8");

  // ✅ ТОЛЬКО ПОТОМ логируем
  console.log("HTML length:", html.length);
  console.log("Has 'Календарь':", html.includes("Календарь"));
  console.log("Has 'декабря':", html.includes("декабря"));

  if (html.includes("Афиша на ближайшие месяцы") || html.includes("Календарь")) {
    console.log("✅ HTML успешно декодирован как utf8");
    return html;
  }

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
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/(p|div|li|tr|td|th|h[1-6])>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/[ \t\r\f\v]+/g, " ")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

  const normalizedText = text.replace(/\u00A0/g, " ");

const looksLikeSchedule =
  normalizedText.includes("Календарь") ||
  /\d{1,2}\s+[А-ЯЁа-яё]+,?\s+\d{1,2}:\d{2}/.test(normalizedText);

if (!looksLikeSchedule) {
  console.log("⚠️ Похоже, пришла не страница афиши. HTML head:", html.slice(0, 400));
  return [];
}



  console.log("🔎 snippet:", normalizedText.slice(0, 800));

  let year = new Date().getFullYear();
  const headerMatch = normalizedText.match(/Календарь[\s\S]{0,100}?([А-ЯЁа-яё]+)\s+(\d{4})/);
  if (headerMatch) {
    year = Number(headerMatch[2]);
  }

  const shows = [];

  // дата: "04 декабря, 19:00 - ..."
  const eventRegex =
  /(\d{1,2})\s+([А-ЯЁа-яё]+),?\s*(\d{1,2}:\d{2})\s*[-–—]\s*([^\n\r]+)/g;


  let match;
  while ((match = eventRegex.exec(normalizedText)) !== null) {
    const day = Number(match[1]);
    const monthWordRaw = match[2];
    const time = match[3];
    const titleAndRest = match[4].trim();

    // убираем лишние знаки препинания у месяца
    const monthWord = monthWordRaw.toLowerCase().replace(/[.,]/g, "");
    const monthIndex = MONTHS[monthWord];
    if (monthIndex === undefined) {
      // если попалось что-то вообще левое — логируем и пропускаем
      console.log("Неизвестный месяц:", monthWordRaw);
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

    // ISO-формат, дружелюбный к new Date() везде
    const dateStr = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}T${time}:00`;

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
