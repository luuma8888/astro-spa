export function renderSummary(chart) {
  const el = document.getElementById('summary');
  const items = [
    ['Moment', `${chart.input?.date ?? 'n/a'} • ${(chart.input?.time ?? 'n/a').slice(0, 5)} • ${chart.input?.timeZone ?? 'n/a'}`],
    ['Lieu', `${Number(chart.input?.latitude).toFixed(4)} / ${Number(chart.input?.longitude).toFixed(4)}`],
    ['Occidental', `Soleil ${chart.bodies?.sun?.tropical?.name ?? 'n/a'} • Lune ${chart.bodies?.moon?.tropical?.name ?? 'n/a'}`],
    ['Sidéral', `Soleil ${chart.bodies?.sun?.sidereal?.name ?? 'n/a'} • Lune ${chart.bodies?.moon?.sidereal?.name ?? 'n/a'}`],
    ['Lunaire', chart.moonPhase?.presentation?.labelText ?? chart.moonPhase?.label ?? 'n/a'],
    ['Design Humain', `Profil ${chart.humanDesign?.profile ?? 'n/a'} • date design ${chart.humanDesign?.designUtcIso ?? 'n/a'}`],
    ['Astronomie', chart.meta?.precision?.coreAstronomy?.level ?? 'n/a'],
    ['Technique par défaut', `${chart.houseSystem ?? 'n/a'} • ayanamsa ${chart.options?.ayanamsa ?? 'n/a'}`]
  ];

  el.innerHTML = `
    <div class="kv-grid">
      ${items.map(([label, value]) => `
        <article class="kv-card">
          <span class="kv-label">${label}</span>
          <strong class="kv-value">${value}</strong>
        </article>
      `).join('')}
    </div>
  `;
}
