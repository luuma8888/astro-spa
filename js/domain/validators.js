export function validateInput(input) {
  const errors = [];

  if (!input.date) errors.push('Date manquante');
  if (!input.time) errors.push('Heure manquante');
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    errors.push('Latitude invalide');
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    errors.push('Longitude invalide');
  }
  if (!Number.isFinite(input.utcOffset) || input.utcOffset < -14 || input.utcOffset > 14) {
    errors.push('UTC offset invalide');
  }

  return errors;
}
