export function renderSymbolic(chart) {
  const el = document.getElementById('symbolic');
  const entries = Object.entries(chart.symbolic)
    .map(([key, value]) => `<p>${key} → Hexagramme ${value.yking.id} <span class="muted-note">(correspondance symbolique de longitude)</span></p>`)
    .join('');
  el.innerHTML = `
    <p><strong>Repère :</strong> ce bloc montre une correspondance symbolique Y-King. Ce n’est pas un calcul Human Design.</p>
    ${entries}
  `;
}
