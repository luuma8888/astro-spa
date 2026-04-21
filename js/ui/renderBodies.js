import { formatDeg, formatIsoUtc, formatIsoWithOffset } from './formatters.js';

function renderMoonConstellationTransition(chart, label, body) {
  if (label !== 'Lune') return '';

  const transition = chart.diagnostics?.moonConstellationTransition;
  if (!transition?.to?.name) {
    return '<p>Prochaine constellation lunaire : indisponible</p>';
  }

  return `
    <p>Prochaine constellation lunaire : ${transition.to.name}</p>
    <p>Passage estimé : ${formatIsoWithOffset(transition.utcIso, chart.input?.utcOffset ?? 0)}</p>
    <p>Référence UTC : ${formatIsoUtc(transition.utcIso)}</p>
  `;
}

export function renderBodies(chart) {
  const el = document.getElementById('bodies');

  const intro = '<p><strong>Repère :</strong> longitude et latitude donnent la position céleste calculée; signes, maisons et constellation sont des lectures dérivées de cette position.</p>';

  const html = [
    ['Soleil', chart.bodies.sun],
    ['Lune', chart.bodies.moon],
    ...Object.entries(chart.planets)
  ].map(([key, body]) => `
    <div>
      <h3>${key}</h3>
      <p>Longitude : ${body.presentation?.longitudeText ?? formatDeg(body.longitudeDeg)}</p>
      <p>Latitude : ${body.presentation?.latitudeText ?? formatDeg(body.latitudeDeg)}</p>
      <p>Signe tropical : ${body.presentation?.tropicalSignText ?? body.tropical.name}</p>
      <p>Signe sidéral : ${body.presentation?.siderealSignText ?? body.sidereal.name}</p>
      <p>Maison : ${body.presentation?.houseText ?? body.house}</p>
      <p>Constellation : ${body.presentation?.constellationText ?? (body.constellation ? body.constellation.name : 'n/a')}</p>
      <p>Source constellation : ${body.presentation?.constellationSourceText ?? body.constellation?.source ?? 'n/a'}</p>
      ${renderMoonConstellationTransition(chart, key, body)}
    </div>
  `).join('');

  el.innerHTML = intro + html;
}
