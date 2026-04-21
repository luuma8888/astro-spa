export function renderMoonPhase(chart) {
  const el = document.getElementById('moon-phase');
  const phase = chart.moonPhase;

  if (!phase) {
    el.innerHTML = '<p>Phase lunaire indisponible.</p>';
    return;
  }

  el.innerHTML = `
    <p><strong>Repère :</strong> la phase lunaire est déduite de la géométrie Soleil-Lune et de la distance Terre-Lune, pas d’une interprétation symbolique.</p>
    <p><strong>Phase :</strong> ${phase.label}</p>
    <p><strong>Âge lunaire :</strong> ${phase.ageDays.toFixed(2)} jours</p>
    <p><strong>Illumination :</strong> ${phase.illuminationPercent.toFixed(2)}%</p>
    <p><strong>Angle Soleil-Lune :</strong> ${phase.angleDeg.toFixed(2)}°</p>
    <p><strong>Angle de phase :</strong> ${phase.brightLimbPhaseAngleDeg?.toFixed(2) ?? 'n/a'}°</p>
    <p><strong>Tendance :</strong> ${phase.waxing ? 'Croissante' : 'Décroissante'}</p>
  `;
}
