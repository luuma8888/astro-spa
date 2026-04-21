export function renderSymbolic(chart) {
  const el = document.getElementById('symbolic');
  const entries = Object.entries(chart.symbolic)
    .map(([key, value]) => `<p>${key} → Hexagramme ${value.yking.id}</p>`)
    .join('');
  el.innerHTML = entries;
}
