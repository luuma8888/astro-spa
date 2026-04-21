export function toUtcDate(input) {
  const [year, month, day] = input.date.split('-').map(Number);
  const [hour, minute, second = 0] = input.time.split(':').map(Number);
  const utcOffsetMinutes = Math.round(Number(input.utcOffset) * 60);
  const localMillis = Date.UTC(year, month - 1, day, hour, minute, second);

  const utcMillis = localMillis - utcOffsetMinutes * 60000;
  return new Date(utcMillis);
}

export function julianDayFromDate(date) {
  return (date.getTime() / 86400000) + 2440587.5;
}

export function dateFromJulianDay(jd) {
  return new Date((jd - 2440587.5) * 86400000);
}

export function julianCenturiesSinceJ2000(jd) {
  return (jd - 2451545.0) / 36525;
}
