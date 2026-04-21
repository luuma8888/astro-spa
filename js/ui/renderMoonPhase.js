export function renderMoonPhase(chart) {
  const el = document.getElementById('moon-phase');
  const phase = chart.moonPhase;
  const presentation = phase?.presentation;

  if (!phase) {
    el.innerHTML = '<p>Phase lunaire indisponible.</p>';
    return;
  }

  el.innerHTML = `
    <p><strong>Repère :</strong> la phase lunaire est déduite de la géométrie Soleil-Lune et de la distance Terre-Lune, pas d’une interprétation symbolique.</p>
    <p><strong>Phase :</strong> ${presentation?.labelText ?? phase.label}</p>
    <p><strong>Âge lunaire réel :</strong> ${presentation?.trueAgeText ?? `${phase.trueAgeDays?.toFixed?.(2) ?? phase.ageDays.toFixed(2)} jours`}</p>
    <p><strong>Âge lunaire angulaire :</strong> ${presentation?.ageText ?? `${phase.ageDays.toFixed(2)} jours`}</p>
    <p><strong>Illumination :</strong> ${presentation?.illuminationText ?? `${phase.illuminationPercent.toFixed(2)}%`}</p>
    <p><strong>Angle Soleil-Lune :</strong> ${presentation?.angleText ?? `${phase.angleDeg.toFixed(2)}°`}</p>
    <p><strong>Angle de phase :</strong> ${presentation?.brightLimbAngleText ?? `${phase.brightLimbPhaseAngleDeg?.toFixed(2) ?? 'n/a'}°`}</p>
    <p><strong>Tendance :</strong> ${presentation?.trendText ?? (phase.waxing ? 'Croissante' : 'Décroissante')}</p>
    <p><strong>Distance Terre-Lune :</strong> ${presentation?.distanceText ?? 'n/a'}</p>
    <p><strong>Diamètre apparent :</strong> ${presentation?.apparentDiameterText ?? 'n/a'}</p>
    <p><strong>Cycle synodique courant :</strong> ${presentation?.cycleLengthText ?? 'n/a'}</p>
    <p><strong>Dernière phase majeure :</strong> ${presentation?.previousMajorPhaseText ? `${presentation.previousMajorPhaseText.labelText} — ${presentation.previousMajorPhaseText.localText}` : 'indisponible'}</p>
    <p><strong>Référence UTC :</strong> ${presentation?.previousMajorPhaseText?.utcText ?? 'n/a'}</p>
    <p><strong>Prochaine phase majeure :</strong> ${presentation?.nextMajorPhaseText ? `${presentation.nextMajorPhaseText.labelText} — ${presentation.nextMajorPhaseText.localText}` : 'indisponible'}</p>
    <p><strong>Référence UTC :</strong> ${presentation?.nextMajorPhaseText?.utcText ?? 'n/a'}</p>
  `;
}
