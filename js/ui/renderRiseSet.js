function renderBodyRiseSet(title, data) {
  if (!data) {
    return `<p>${title}: indisponible</p>`;
  }

  if (data.neverRises) {
    return `<p><strong>${title}</strong> : ne se lève pas à cette latitude / date.</p>`;
  }

  if (data.circumpolar) {
    return `<p><strong>${title}</strong> : circumpolaire.</p>`;
  }

  return `
    <div>
      <p><strong>${title}</strong></p>
      <p>Lever (UTC) : ${data.rise ?? 'n/a'}</p>
      <p>Coucher (UTC) : ${data.set ?? 'n/a'}</p>
    </div>
  `;
}

export function renderRiseSet(chart) {
  const el = document.getElementById('rise-set');

  el.innerHTML = `
    <p><strong>Repère :</strong> lever et coucher sont estimés par recherche itérative sur la journée locale, avec correction d’horizon propre au Soleil et à la Lune.</p>
    ${renderBodyRiseSet('Soleil', chart.riseSet?.sun)}
    ${renderBodyRiseSet('Lune', chart.riseSet?.moon)}
  `;
}
