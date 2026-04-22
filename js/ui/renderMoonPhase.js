function renderMetric(label, value, tone = '') {
  return `
    <article class="moon-metric-card${tone ? ` ${tone}` : ''}">
      <span class="moon-metric-label">${label}</span>
      <strong class="moon-metric-value">${value ?? 'n/a'}</strong>
    </article>
  `;
}

function renderEventRow(label, data, fallback = 'indisponible', extra = '') {
  if (!data) {
    return `
      <article class="moon-event-row">
        <span class="moon-event-label">${label}</span>
        <strong>${fallback}</strong>
      </article>
    `;
  }

  const mainTitle = data.toTitleText ?? data.localTitleText ?? data.utcTitleText ?? fallback;
  const metaText = extra || data.utcText || 'n/a';
  const metaTitle = data.utcTitleText ?? extra ?? data.utcText ?? 'n/a';

  return `
      <article class="moon-event-row">
        <span class="moon-event-label">${label}</span>
        <strong title="${mainTitle}">${data.labelText ? `${data.labelText} — ${data.localText}` : data.toText ? `${data.toText} — ${data.localText}` : data.localText ?? fallback}</strong>
        <span class="moon-event-meta" title="${metaTitle}">${metaText}</span>
      </article>
    `;
  }

export function renderMoonPhase(chart) {
  const el = document.getElementById('moon-phase');
  const phase = chart.moonPhase;
  const presentation = phase?.presentation;
  const riseSet = presentation?.riseSetText;
  const nextConstellation = presentation?.nextConstellationText;
  const nextNode = presentation?.nextNodeText;
  const nextPerigee = presentation?.nextPerigeeText;
  const nextApogee = presentation?.nextApogeeText;
  const nextLunarEclipse = presentation?.nextLunarEclipseText;

  if (!phase) {
    el.innerHTML = '<p>Phase lunaire indisponible.</p>';
    return;
  }

  const visibilityText = riseSet?.status !== 'normal'
    ? riseSet?.statusText ?? 'n/a'
    : presentation?.visibilityText ?? 'n/a';

  const riseText = riseSet?.status === 'normal'
    ? `${riseSet.riseLocalText} (local) / ${riseSet.riseUtcText} (UTC)`
    : riseSet?.statusText ?? 'n/a';

  const setText = riseSet?.status === 'normal'
    ? `${riseSet.setLocalText} (local) / ${riseSet.setUtcText} (UTC)`
    : riseSet?.statusText ?? 'n/a';

  const previousMajor = presentation?.previousMajorPhaseText;
  const nextMajor = presentation?.nextMajorPhaseText;

  el.innerHTML = `
    <section class="moon-phase-layout">
      <article class="moon-hero-card">
        <span class="section-kicker">Lecture Lunaire</span>
        <h3>${presentation?.labelText ?? phase.label}</h3>
        <p class="moon-hero-copy">La phase est calculée par la géométrie Soleil-Lune, puis reliée à la visibilité locale, à la trajectoire sidérale et aux prochains jalons du cycle.</p>
        <div class="moon-metric-grid">
          ${renderMetric('Illumination', presentation?.illuminationText ?? `${phase.illuminationPercent.toFixed(2)}%`, 'is-highlight')}
          ${renderMetric('Tendance', presentation?.trendText ?? (phase.waxing ? 'Croissante' : 'Décroissante'))}
          ${renderMetric('Âge réel', presentation?.trueAgeText ?? `${phase.trueAgeDays?.toFixed?.(2) ?? phase.ageDays.toFixed(2)} jours`)}
          ${renderMetric('Distance', presentation?.distanceText ?? 'n/a')}
          ${renderMetric('Diamètre apparent', presentation?.apparentDiameterText ?? 'n/a')}
          ${renderMetric('Angle Soleil-Lune', presentation?.angleText ?? `${phase.angleDeg.toFixed(2)}°`)}
        </div>
      </article>

      <div class="moon-phase-grid">
        <article class="moon-panel">
          <h3>Cycle courant</h3>
          <div class="moon-key-list">
            <p><strong>Âge angulaire</strong><span>${presentation?.ageText ?? `${phase.ageDays.toFixed(2)} jours`}</span></p>
            <p><strong>Angle de phase</strong><span>${presentation?.brightLimbAngleText ?? `${phase.brightLimbPhaseAngleDeg?.toFixed(2) ?? 'n/a'}°`}</span></p>
            <p><strong>Cycle synodique</strong><span>${presentation?.cycleLengthText ?? 'n/a'}</span></p>
          </div>
          <div class="moon-dual-grid">
            <article class="moon-mini-card">
              <span class="moon-mini-label">Phase précédente</span>
              <strong title="${previousMajor?.localTitleText ?? 'indisponible'}">${previousMajor ? `${previousMajor.labelText} — ${previousMajor.localText}` : 'indisponible'}</strong>
              <span class="moon-mini-meta" title="${previousMajor?.utcTitleText ?? 'n/a'}">${previousMajor?.utcText ?? 'n/a'}</span>
            </article>
            <article class="moon-mini-card">
              <span class="moon-mini-label">Phase suivante</span>
              <strong title="${nextMajor?.localTitleText ?? 'indisponible'}">${nextMajor ? `${nextMajor.labelText} — ${nextMajor.localText}` : 'indisponible'}</strong>
              <span class="moon-mini-meta" title="${nextMajor?.utcTitleText ?? 'n/a'}">${nextMajor?.utcText ?? 'n/a'}</span>
            </article>
          </div>
        </article>

        <article class="moon-panel">
          <h3>Visibilité locale</h3>
          <div class="moon-key-list">
            <p><strong>Visibilité</strong><span>${visibilityText}</span></p>
            <p><strong>Lever</strong><span>${riseText}</span></p>
            <p><strong>Coucher</strong><span>${setText}</span></p>
          </div>
        </article>

        <article class="moon-panel">
          <h3>Trajectoire</h3>
          <div class="moon-key-list">
            <p><strong>Constellation actuelle</strong><span title="${presentation?.currentConstellationTitleText ?? 'n/a'}">${presentation?.currentConstellationText ?? 'n/a'}</span></p>
            <p><strong>Source</strong><span>${presentation?.currentConstellationSourceText ?? 'n/a'}</span></p>
            <p><strong>Trajectoire</strong><span>${presentation?.trajectoryText ?? 'n/a'}</span></p>
          </div>
          ${renderEventRow('Prochaine constellation', nextConstellation, 'indisponible')}
        </article>

        <article class="moon-panel moon-panel-events">
          <h3>Prochains jalons</h3>
          <div class="moon-event-list">
            ${renderEventRow('Nœud lunaire', nextNode, 'indisponible')}
            ${renderEventRow('Périgée', nextPerigee, 'indisponible', nextPerigee?.distanceText ?? nextPerigee?.utcText ?? 'n/a')}
            ${renderEventRow('Apogée', nextApogee, 'indisponible', nextApogee?.distanceText ?? nextApogee?.utcText ?? 'n/a')}
            ${renderEventRow('Éclipse de Lune', nextLunarEclipse, 'indisponible', nextLunarEclipse ? `${nextLunarEclipse.eclipseTypeText} · ${nextLunarEclipse.nodeDeltaText ?? 'n/a'}` : '')}
          </div>
        </article>
      </div>
    </section>
  `;
}
