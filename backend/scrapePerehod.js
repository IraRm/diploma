const axios = require("axios");
const cheerio = require("cheerio");

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function pad2(n) {
  return n.toString().padStart(2, "0");
}

// "25.12 (чт.) в 18:00" -> Date parts
function parseDateTime(line, year) {
  const m = line.match(/(\d{1,2})\.(\d{1,2}).*?(\d{1,2}:\d{2})/);
  if (!m) return null;

  const day = Number(m[1]);
  const month = Number(m[2]);
  const time = m[3];

  // защита от мусора
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  const iso = `${year}-${pad2(month)}-${pad2(day)}T${time}:00`;
  return { day, month, time, iso };
}

async function fetchShowsFromPerehod() {
  const url = "https://teatrperehod.ru/";
  const resp = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  const $ = cheerio.load(resp.data);

  const bodyText = $("body").text().replace(/\u00A0/g, " ");
  const lines = bodyText
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  const startIdx = lines.findIndex(l =>
    l.toLowerCase().includes("ближайшие спектакли")
  );

  if (startIdx === -1) {
    console.log("⚠️ Не нашёл блок 'Ближайшие спектакли'");
    return [];
  }

  const shows = [];

  let currentYear = new Date().getFullYear();
  let sawDecember = false;

  for (let i = startIdx; i < Math.min(lines.length, startIdx + 200); i++) {
    let dt = parseDateTime(lines[i], currentYear);
    if (!dt) continue;

    if (dt.month === 12) sawDecember = true;
    if (sawDecember && dt.month === 1) {
      currentYear += 1;
      sawDecember = false;
      dt = parseDateTime(lines[i], currentYear);
      if (!dt) continue;
    }

    const titleLine = (lines[i + 1] || "")
      .replace(/[«»"]/g, "")
      .trim();

    // если следующая строка — тоже дата, это не название
    if (parseDateTime(titleLine, currentYear)) continue;

    if (!titleLine) continue;

    const id = `${dt.iso}-${slugify(titleLine)}`;

    shows.push({
      id,
      title: titleLine,
      theatre: 'Театр "Переход" им. Г. Кириллова',
      date: dt.iso,
      genre: "спектакль",
      images: []
    });
  }

  console.log("✅ Perehod parsed events count:", shows.length);
  return shows;
}

module.exports = { fetchShowsFromPerehod };

