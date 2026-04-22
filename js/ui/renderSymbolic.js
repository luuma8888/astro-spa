export function renderSymbolic(chart) {
  const el = document.getElementById('symbolic');
  const entries = Object.entries(chart.symbolic)
    .map(([key, value]) => `
      <article class="kv-card">
        <span class="kv-label">${key}</span>
        <strong class="kv-value">Hexagramme ${value.yking.id}</strong>
        <span class="hero-stat-sub">correspondance symbolique de longitude</span>
      </article>
    `)
    .join('');
  el.innerHTML = `
    <div class="section-block section-block-intro">
      <p>Ce bloc montre une correspondance symbolique Y-King dérivée de la longitude. Ce n’est pas encore un moteur Human Design: pas de bodygraph, pas de centres, pas de canaux, pas de type, pas d’autorité, pas de profil.</p>
    </div>
    <div class="kv-grid">${entries}</div>
  `;
}
