function renderEntry(item) {
  const value = item.unit ? `${item.value} ${item.unit}` : item.value;

  return `
    <p>
      <strong>${item.label}</strong> : ${value}. 
      ${item.method}
      ${item.usage ? ` Usage: ${item.usage}.` : ''}
      ${item.precision ? ` Precision: ${item.precision}.` : ''}
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

  if (!chart?.calculations?.length) {
    el.innerHTML = '<p>Le regroupement des calculs apparaîtra après le calcul d’une carte.</p>';
    return;
  }

  el.innerHTML = chart.calculations.map(renderGroup).join('');
}
