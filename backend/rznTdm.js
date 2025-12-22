const axios = require("axios");

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toIsoLocal(year, month, day, timeHHMM) {
  const [hh, mm] = (timeHHMM || "00:00").split(":");
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(Number(hh))}:${pad2(Number(mm))}:00`;
}

function pickFirst(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return null;
}
function pickDeep(obj, paths) {
  for (const p of paths) {
    const parts = p.split(".");
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (cur && typeof cur === "object" && part in cur) cur = cur[part];
      else { ok = false; break; }
    }
    if (ok && cur != null && cur !== "") return cur;
  }
  return null;
}


function findFirstArray(payload) {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const candidates = ["events", "items", "data", "result", "list"];
    for (const k of candidates) {
      if (Array.isArray(payload[k])) return payload[k];
    }
  }
  return null;
}

function extractIsoFromEvent(ev, fallbackYear, fallbackMonth) {
  const dtRaw = pickFirst(ev, [
    "date_start",
    "date",
    "dateTime",
    "datetime",
    "start",
    "startAt",
    "startDateTime"
  ]);

  // 1) Если пришла строка с датой/временем — пробуем распарсить
  if (dtRaw) {
    const d1 = new Date(dtRaw);
    if (!isNaN(d1.getTime())) {
      return `${d1.getFullYear()}-${pad2(d1.getMonth() + 1)}-${pad2(d1.getDate())}T${pad2(d1.getHours())}:${pad2(d1.getMinutes())}:00`;
    }

    const d2 = new Date(String(dtRaw).replace(" ", "T"));
    if (!isNaN(d2.getTime())) {
      return `${d2.getFullYear()}-${pad2(d2.getMonth() + 1)}-${pad2(d2.getDate())}T${pad2(d2.getHours())}:${pad2(d2.getMinutes())}:00`;
    }

    // иногда date_start может быть "YYYY-MM-DD" без времени
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(dtRaw))) {
      const [yy, mm, dd] = String(dtRaw).split("-").map(Number);
      return toIsoLocal(yy, mm, dd, "00:00");
    }
  }

  // 2) fallback: год/месяц/день отдельными полями + время
  const y = Number(pickFirst(ev, ["year", "y"])) || fallbackYear;
  const m = Number(pickFirst(ev, ["month", "m"])) || fallbackMonth;
  const day = Number(pickFirst(ev, ["day", "d"])) || null;
  const time = pickFirst(ev, ["time", "startTime", "beginTime"]) || "00:00";

  if (day && m && y) return toIsoLocal(y, m, day, time);

  // 3) fallback: dateStr / startDate
  const dateStr = pickFirst(ev, ["dateStr", "startDate"]);
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
    const [yy, mm, dd] = String(dateStr).split("-").map(Number);
    return toIsoLocal(yy, mm, dd, time);
  }

  return null;
}


async function fetchShowsFromRznTdm() {
  console.log("🎭 RznTdm: start scrape (JSON endpoint)");

  const year = 2025;
  const month = 12;

  const url = `https://rzntdm.core.ubsystem.ru/uiapi/events/${year}/${pad2(month)}`;

  const resp = await axios.get(url, {
    timeout: 20000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept": "application/json,text/plain,*/*",
      "Referer": "https://www.rzn-tdm.ru/"
    }
  });

  const payload = resp.data;
  const events = findFirstArray(payload) || [];

  console.log("🎭 RznTdm events raw count:", Array.isArray(events) ? events.length : 0);
  if (events[0]) console.log("🎭 RznTdm raw sample keys:", Object.keys(events[0]).slice(0, 20));

  const shows = [];

  for (const ev of events) {
    if (!ev || typeof ev !== "object") continue;

    const titleRaw =
  pickFirst(ev, ["title", "name", "eventName", "caption"]) ||
  pickDeep(ev, [
    "performance.title",
    "performance.name",
    "performance.caption",
    "performanceInfo.title",
    "performanceInfo.name",
    "performanceInfo.caption",
    "performanceInfo.performance_name",
    "performanceInfo.performanceTitle"
  ]);

const title = String(titleRaw || "").trim();
if (!title) continue;


    const iso = extractIsoFromEvent(ev, year, month);
    if (!iso) continue;

    const evId = pickFirst(ev, ["id", "eventId", "uid", "guid"]) || `${iso}-${slugify(title)}`;

    shows.push({
      id: `tdm-${String(evId)}`,
      title,
      theatre: "Театр на Соборной (ТЮЗ)",
      date: iso,
      genre: "спектакль",
      images: []
    });
  }

  const uniq = new Map();
  for (const s of shows) uniq.set(String(s.id), s);

  const result = Array.from(uniq.values()).sort((a, b) => a.date.localeCompare(b.date));
  console.log("✅ RznTdm parsed events count:", result.length);
  return result;
}

module.exports = { fetchShowsFromRznTdm };
