function renderEntry(item) {
  return `
    <p>
      <strong>${item.label}</strong> : ${item.valueText}. 
      ${item.method}
      ${item.usage ? ` Usage: ${item.usage}.` : ''}
      ${item.expectedPrecision ? ` Precision: ${item.expectedPrecision}.` : ''}
      ${item.source ? ` Source: ${item.source}.` : ''}
      ${item.notes ? ` Note: ${item.notes}.` : ''}
    </p>
  `;
}

function renderGroup(group) {
  if (!group?.items?.length) return '';

  return `
    <div class="calc-group">
      <h3>${group.title}</h3>
      ${group.items.map(renderEntry).join('')}
    </div>
  `;
}

export function renderCalculationGroups(chart) {
  const el = document.getElementById('calculation-groups');
  if (!el) return;

  const groups = Array.isArray(chart?.calculations)
    ? chart.calculations
    : chart?.calculations?.groups ?? [];

  if (!groups.length) {
    el.innerHTML = '<p>Le regroupement des calculs apparaîtra après le calcul d’une carte.</p>';
    return;
  }

  el.innerHTML = groups.map(renderGroup).join('');
}
