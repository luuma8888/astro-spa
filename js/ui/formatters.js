export function formatDeg(value) {
  return `${value.toFixed(4)}°`;
}

export function formatIsoUtc(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';

  return date.toISOString().replace('.000Z', ' UTC');
}

export function formatIsoWithOffset(isoString, utcOffsetHours = 0) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';

  const shifted = new Date(date.getTime() + Math.round(utcOffsetHours * 60) * 60000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  const sign = utcOffsetHours >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(Math.round(utcOffsetHours * 60));
  const offsetHoursPart = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const offsetMinutesPart = String(absoluteMinutes % 60).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes} UTC${sign}${offsetHoursPart}:${offsetMinutesPart}`;
}
