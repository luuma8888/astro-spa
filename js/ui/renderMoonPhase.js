export function renderMoonPhase(chart) {
  const el = document.getElementById('moon-phase');
  const phase = chart.moonPhase;

  if (!phase) {
    el.innerHTML = '<p>Phase lunaire indisponible.</p>';
    return;
  }

  el.innerHTML = `
    <p><strong>Phase :</strong> ${phase.label}</p>
    <p><strong>Âge lunaire :</strong> ${phase.ageDays.toFixed(2)} jours</p>
    <p><strong>Illumination :</strong> ${phase.illuminationPercent.toFixed(2)}%</p>
    <p><strong>Angle Soleil-Lune :</strong> ${phase.angleDeg.toFixed(2)}°</p>
    <p><strong>Tendance :</strong> ${phase.waxing ? 'Croissante' : 'Décroissante'}</p>
  `;
}
