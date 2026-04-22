import { formatConstellationLabel, formatDeg, formatIsoUtc, formatIsoUtcRaw, formatIsoWithOffset, formatIsoWithOffsetRaw } from './formatters.js';

function renderMoonConstellationTransition(chart, label, body) {
  if (label !== 'Lune') return '';

  const transition = chart.diagnostics?.moonConstellationTransition;
  if (!transition?.to?.name) {
    return '<p>Prochaine constellation lunaire : indisponible</p>';
  }

  const toLabel = formatConstellationLabel(transition.to);

  return `
    <p>Prochaine constellation lunaire : <span title="${toLabel.title}">${toLabel.short}</span></p>
    <p>Passage estimé : <span title="${formatIsoWithOffsetRaw(transition.utcIso, chart.input?.utcOffset ?? 0)}">${formatIsoWithOffset(transition.utcIso, chart.input?.utcOffset ?? 0)}</span></p>
    <p>Référence UTC : <span title="${formatIsoUtcRaw(transition.utcIso)}">${formatIsoUtc(transition.utcIso)}</span></p>
  `;
}

export function renderBodies(chart) {
  const el = document.getElementById('bodies');

  const intro = '<div class="section-block section-block-intro"><p>Longitude et latitude donnent la position céleste calculée. Signes, maisons et constellation sont des lectures dérivées de cette position.</p></div>';

  const html = [
    ['Soleil', chart.bodies.sun],
    ['Lune', chart.bodies.moon],
    ...Object.entries(chart.planets)
  ].map(([key, body]) => `
    <article class="body-card">
      <h3>${key}</h3>
      <div class="body-meta-grid">
        <div><span class="body-label">Longitude</span><strong>${body.presentation?.longitudeText ?? formatDeg(body.longitudeDeg)}</strong></div>
        <div><span class="body-label">Latitude</span><strong>${body.presentation?.latitudeText ?? formatDeg(body.latitudeDeg)}</strong></div>
        <div><span class="body-label">Signe tropical</span><strong>${body.presentation?.tropicalSignText ?? body.tropical.name}</strong></div>
        <div><span class="body-label">Signe sidéral</span><strong>${body.presentation?.siderealSignText ?? body.sidereal.name}</strong></div>
        <div><span class="body-label">Maison</span><strong>${body.presentation?.houseText ?? body.house}</strong></div>
        <div><span class="body-label">Constellation</span><strong title="${body.presentation?.constellationTitleText ?? body.constellation?.name ?? 'n/a'}">${body.presentation?.constellationText ?? (body.constellation ? body.constellation.name : 'n/a')}</strong></div>
      </div>
      <p class="body-source"><strong>Source constellation :</strong> ${body.presentation?.constellationSourceText ?? body.constellation?.source ?? 'n/a'}</p>
      ${renderMoonConstellationTransition(chart, key, body)}
    </article>
  `).join('');

  el.innerHTML = intro + html;
}
