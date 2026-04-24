import { formatDeg } from './formatters.js';

function renderBodyRow(label, body) {
  return `
    <tr>
      <th scope="row" class="astro-body-name">${label}</th>
      <td>${body.presentation?.longitudeText ?? formatDeg(body.longitudeDeg)}</td>
      <td>${body.presentation?.latitudeText ?? formatDeg(body.latitudeDeg)}</td>
      <td>${body.presentation?.tropicalSignText ?? body.tropical?.name ?? 'n/a'}</td>
      <td>${body.presentation?.siderealSignText ?? body.sidereal?.name ?? 'n/a'}</td>
      <td>${body.presentation?.houseText ?? body.house ?? 'n/a'}</td>
      <td title="${body.presentation?.constellationTitleText ?? body.constellation?.name ?? 'n/a'}">${body.presentation?.constellationText ?? body.constellation?.name ?? 'n/a'}</td>
    </tr>
  `;
}

export function renderBodies(chart) {
  const el = document.getElementById('bodies');
  const bodies = [
    ['Soleil', chart.bodies.sun],
    ['Lune', chart.bodies.moon],
    ['Mercure', chart.planets?.Mercury],
    ['Vénus', chart.planets?.Venus],
    ['Mars', chart.planets?.Mars],
    ['Jupiter', chart.planets?.Jupiter],
    ['Saturne', chart.planets?.Saturn],
    ['Uranus', chart.planets?.Uranus],
    ['Neptune', chart.planets?.Neptune]
  ].filter(([, body]) => body);

  el.innerHTML = `
    <div class="section-block section-block-intro">
      <p>Un seul tableau réunit ici les positions des corps. Les signes tropicaux et sidéraux sont alignés sur la même ligne, les maisons ne sont montrées qu’ici, et le détail technique complet des cuspides est relégué plus bas dans la section technique.</p>
    </div>
    <div class="astro-table-wrap">
      <table class="astro-table">
        <thead>
          <tr>
            <th>Corps</th>
            <th>Longitude</th>
            <th>Latitude</th>
            <th>Tropical</th>
            <th>Sidéral</th>
            <th>Maison</th>
            <th>Constellation</th>
          </tr>
        </thead>
        <tbody>
          ${bodies.map(([label, body]) => renderBodyRow(label, body)).join('')}
        </tbody>
      </table>
    </div>
  `;
}
