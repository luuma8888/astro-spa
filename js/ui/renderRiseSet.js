function renderBodyRiseSet(title, data) {
  if (!data) {
    return `<p>${title}: indisponible</p>`;
  }

  const presentation = data.presentation;
  const status = presentation?.status ?? (data.neverRises ? 'never-rises' : data.circumpolar ? 'circumpolar' : 'normal');

  if (status === 'never-rises') {
    return `<p><strong>${title}</strong> : ne se lève pas à cette latitude / date.</p>`;
  }

  if (status === 'circumpolar') {
    return `<p><strong>${title}</strong> : circumpolaire.</p>`;
  }

  return `
    <article class="info-card">
      <h3>${title}</h3>
      <div class="bullet-list">
        <p>Lever (UTC) : ${presentation?.riseText ?? data.rise ?? 'n/a'}</p>
        <p>Coucher (UTC) : ${presentation?.setText ?? data.set ?? 'n/a'}</p>
      </div>
    </article>
  `;
}

export function renderRiseSet(chart) {
  const el = document.getElementById('rise-set');

  el.innerHTML = `
    <div class="section-block section-block-intro">
      <p>Lever et coucher sont estimés par recherche itérative sur la journée locale, avec correction d’horizon propre au Soleil et à la Lune.</p>
    </div>
    ${renderBodyRiseSet('Soleil', chart.riseSet?.sun)}
    ${renderBodyRiseSet('Lune', chart.riseSet?.moon)}
  `;
}
