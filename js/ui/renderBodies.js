import { formatDeg } from './formatters.js';

export function renderBodies(chart) {
  const el = document.getElementById('bodies');

  const intro = '<p><strong>Repère :</strong> longitude et latitude donnent la position céleste calculée; signes, maisons et constellation sont des lectures dérivées de cette position.</p>';

  const html = [
    ['Soleil', chart.bodies.sun],
    ['Lune', chart.bodies.moon],
    ...Object.entries(chart.planets)
  ].map(([key, body]) => `
    <div>
      <h3>${key}</h3>
      <p>Longitude : ${formatDeg(body.longitudeDeg)}</p>
      <p>Latitude : ${formatDeg(body.latitudeDeg)}</p>
      <p>Signe tropical : ${body.tropical.name}</p>
      <p>Signe sidéral : ${body.sidereal.name}</p>
      <p>Maison : ${body.house}</p>
      <p>Constellation : ${body.constellation ? body.constellation.name : 'n/a'}</p>
    </div>
  `).join('');

  el.innerHTML = intro + html;
}
