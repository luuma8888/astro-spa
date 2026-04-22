import { getConstellationLabel } from '../domain/displayLabels.js';

export function formatDeg(value) {
  return `${value.toFixed(4)}°`;
}

export function formatIsoUtc(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return `${formatHumanDate(date)} UTC`;
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
  return formatHumanDate(new Date(Date.UTC(year, Number(month) - 1, day, hours, minutes, 0)));
}

export function formatIsoUtcRaw(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toISOString().replace('.000Z', ' UTC');
}

export function formatIsoWithOffsetRaw(isoString, utcOffsetHours = 0) {
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

export function formatConstellationLabel(constellation) {
  return getConstellationLabel(constellation);
}

function formatHumanDate(date) {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).formatToParts(date);

  const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  const weekday = map.weekday ? map.weekday.charAt(0).toUpperCase() + map.weekday.slice(1) : '';
  return `${weekday} ${map.day} ${map.month} ${map.year} à ${map.hour}h${map.minute}`;
}
