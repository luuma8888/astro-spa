import { HUMAN_DESIGN_SUPPORTED_BODIES } from '../astronomy/humanDesign.js';

function bodyLabel(key) {
  const labels = {
    Sun: 'Soleil',
    Earth: 'Terre',
    Moon: 'Lune',
    NorthNode: 'Noeud Nord',
    SouthNode: 'Noeud Sud',
    Mercury: 'Mercure',
    Venus: 'Venus',
    Mars: 'Mars',
    Jupiter: 'Jupiter',
    Saturn: 'Saturne',
    Uranus: 'Uranus',
    Neptune: 'Neptune'
  };

  return labels[key] ?? key;
}

function formatLongitude(value) {
  return Number.isFinite(value) ? `${value.toFixed(3)}°` : 'n/a';
}

function formatActivation(activation) {
  if (!activation) return 'n/a';
  return `${activation.gate}.${activation.line}.${activation.color}.${activation.tone}.${activation.base}`;
}

function renderHdCell(activation, tone) {
  if (!activation) {
    return `
      <td class="hd-cell hd-cell-${tone}">
        <div class="hd-cell-inner">
          <div class="hd-activation-main">n/a</div>
          <div class="hd-activation-sub">Activation indisponible</div>
        </div>
      </td>
    `;
  }

  return `
    <td class="hd-cell hd-cell-${tone}">
      <div class="hd-cell-inner">
        <div class="hd-activation-main">${formatActivation(activation)}</div>
        <div class="hd-activation-sub">Porte ${activation.gate} · L${activation.line} · C${activation.color} · T${activation.tone} · B${activation.base} · ${formatLongitude(activation.longitudeDeg)}</div>
      </div>
    </td>
  `;
}

export function renderSymbolic(chart) {
  const el = document.getElementById('symbolic');
  if (!el) return;

  const hd = chart.humanDesign;
  const hdRows = hd
    ? HUMAN_DESIGN_SUPPORTED_BODIES
      .map((key) => {
        const conscious = hd.personality?.[key];
        const unconscious = hd.design?.[key];
        if (!conscious || !unconscious) return '';

        return `
          <tr>
            <th scope="row" class="hd-body-label">${bodyLabel(key)}</th>
            ${renderHdCell(unconscious, 'unconscious')}
            ${renderHdCell(conscious, 'conscious')}
          </tr>
        `;
      })
      .join('')
    : '';

  el.innerHTML = `
    ${hd ? `
      <div class="hd-overview-grid">
        <article class="kv-card">
          <span class="kv-label">Date de design</span>
          <strong class="kv-value">${hd.designUtcIso}</strong>
          <span class="hero-stat-sub">${hd.designAgeDays.toFixed(3)} jours avant la naissance</span>
        </article>
        <article class="kv-card">
          <span class="kv-label">Arc solaire</span>
          <strong class="kv-value">${hd.solarArcActualDeg.toFixed(6)}°</strong>
          <span class="hero-stat-sub">cible ${hd.targetSolarArcDeg.toFixed(3)}°</span>
        </article>
        <article class="kv-card">
          <span class="kv-label">Profil</span>
          <strong class="kv-value">${hd.profile}</strong>
          <span class="hero-stat-sub">ligne Soleil conscient / ligne Soleil inconscient</span>
        </article>
        <article class="kv-card">
          <span class="kv-label">Croix solaire</span>
          <strong class="kv-value">P ${formatActivation(hd.personality?.Sun)} / P ${formatActivation(hd.personality?.Earth)}</strong>
          <span class="hero-stat-sub">D ${formatActivation(hd.design?.Sun)} / D ${formatActivation(hd.design?.Earth)}</span>
        </article>
        <article class="kv-card">
          <span class="kv-label">Corps gérés</span>
          <strong class="kv-value">${hd.supportedBodies.length}</strong>
          <span class="hero-stat-sub">manquant: ${hd.missingBodies.join(', ')}</span>
        </article>
      </div>
      <div class="hd-layout">
        <div class="hd-legend">
          <span class="hd-legend-chip hd-legend-unconscious">Inconscient / Design</span>
          <span class="hd-legend-chip hd-legend-conscious">Conscient / Personality</span>
        </div>
        <div class="hd-table-wrap">
          <table class="hd-table">
            <colgroup>
              <col class="hd-col-body" />
              <col class="hd-col-design" />
              <col class="hd-col-personality" />
            </colgroup>
            <thead>
              <tr>
                <th>Corps</th>
                <th>Inconscient</th>
                <th>Conscient</th>
              </tr>
            </thead>
            <tbody>${hdRows}</tbody>
          </table>
        </div>
      </div>
    ` : `
      <div class="section-block">
        <p>Les calculs Human Design ne sont pas encore présents sur cette carte chargée. Un recalcul de la carte de naissance régénère ce bloc automatiquement.</p>
      </div>
    `}
  `;
}
