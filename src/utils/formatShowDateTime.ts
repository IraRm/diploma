export function parseShowDate(dateString: string): Date {
  // поддержка ISO и "YYYY-MM-DD HH:mm"
  const normalized = dateString.replace(' ', 'T');
  return new Date(normalized);
}

export function formatShowDateTime(dateString: string): string {
  const date = parseShowDate(dateString);

  if (isNaN(date.getTime())) {
    return dateString; // если вдруг что-то пойдет не так
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month} ${hours}:${minutes}`;
}
