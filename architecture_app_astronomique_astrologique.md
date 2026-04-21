# Architecture complète — application astronomique / astrologique offline

Cette base est pensée pour une **SPA offline**, sans dépendance externe obligatoire, avec une séparation nette entre :

- calculs mathématiques
- calculs astronomiques
- dérivations astrologiques
- couches symboliques
- stockage local
- interface

Le but est d'avoir une base **saine, maintenable et extensible**.

---

# 1. Arborescence proposée

```text
/astro-app
  index.html
  /assets
    styles.css
  /js
    main.js
    app.js

    /core
      math.js
      angles.js
      time.js
      sidereal.js
      coordinates.js
      obliquity.js

    /astronomy
      sun.js
      moon.js
      planets.js
      nodes.js
      eclipses.js
      riseSet.js

    /astrology
      zodiacTropical.js
      zodiacSidereal.js
      constellations.js
      houses.js
      aspects.js

    /symbolic
      yking.js
      correspondences.js

    /domain
      chartModel.js
      chartBuilder.js
      validators.js

    /storage
      localDb.js
      exportImport.js
      settings.js

    /ui
      state.js
      formatters.js
      renderSummary.js
      renderBodies.js
      renderHouses.js
      renderSymbolic.js

    /data
      constants.js
      ayanamsas.js
      constellationsOptimized.js
      yking64.js
      planetElements.js
```

---

# 2. Philosophie de calcul

Le pipeline doit toujours être :

1. saisie utilisateur
2. validation
3. calcul du temps astronomique
4. calcul des repères célestes
5. calcul des corps célestes
6. dérivations astrologiques
7. dérivations symboliques
8. rendu UI
9. sauvegarde éventuelle

L'interface ne doit jamais recalculer directement l'astronomie.

---

# 3. Fichiers de base

## index.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Astro App</title>
  <link rel="stylesheet" href="./assets/styles.css" />
</head>
<body>
  <div id="app">
    <header class="app-header">
      <h1>Astro App</h1>
      <p>Astronomie réelle, astrologie, Soleil, Lune, Y-King</p>
    </header>

    <main class="layout">
      <section class="panel">
        <h2>Entrée</h2>
        <form id="chart-form">
          <label>Date <input type="date" name="date" required /></label>
          <label>Heure <input type="time" name="time" step="1" required /></label>
          <label>Latitude <input type="number" name="latitude" step="0.000001" required /></label>
          <label>Longitude <input type="number" name="longitude" step="0.000001" required /></label>
          <label>UTC offset <input type="number" name="utcOffset" step="0.5" value="0" required /></label>
          <button type="submit">Calculer</button>
        </form>
      </section>

      <section class="panel">
        <h2>Résumé</h2>
        <div id="summary"></div>
      </section>

      <section class="panel">
        <h2>Corps célestes</h2>
        <div id="bodies"></div>
      </section>

      <section class="panel">
        <h2>Maisons</h2>
        <div id="houses"></div>
      </section>

      <section class="panel">
        <h2>Symbolique</h2>
        <div id="symbolic"></div>
      </section>
    </main>
  </div>

  <script type="module" src="./js/main.js"></script>
</body>
</html>
```

## assets/styles.css

```css
:root {
  color-scheme: light dark;
  --bg: #f7f7fb;
  --fg: #222;
  --panel: #ffffff;
  --border: #d9d9e3;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
}

.app-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.layout {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
}

form {
  display: grid;
  gap: 0.75rem;
}

label {
  display: grid;
  gap: 0.25rem;
}

button {
  padding: 0.75rem 1rem;
  cursor: pointer;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
}
```

## js/main.js

```javascript
import { initApp } from './app.js';

window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
```

## js/app.js

```javascript
import { buildChart } from './domain/chartBuilder.js';
import { validateInput } from './domain/validators.js';
import { renderSummary } from './ui/renderSummary.js';
import { renderBodies } from './ui/renderBodies.js';
import { renderHouses } from './ui/renderHouses.js';
import { renderSymbolic } from './ui/renderSymbolic.js';

export function initApp() {
  const form = document.getElementById('chart-form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const input = {
      date: formData.get('date'),
      time: formData.get('time'),
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      utcOffset: Number(formData.get('utcOffset'))
    };

    const errors = validateInput(input);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    const chart = buildChart(input);

    renderSummary(chart);
    renderBodies(chart);
    renderHouses(chart);
    renderSymbolic(chart);
  });
}
```

---

# 4. Core

## js/core/math.js

```javascript
export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;

export function sqr(value) {
  return value * value;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
```

## js/core/angles.js

```javascript
export function degToRad(deg) {
  return deg * Math.PI / 180;
}

export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

export function normalizeDeg(deg) {
  let result = deg % 360;
  if (result < 0) result += 360;
  return result;
}

export function normalize180(deg) {
  let result = normalizeDeg(deg);
  if (result > 180) result -= 360;
  return result;
}

export function sinDeg(deg) {
  return Math.sin(degToRad(deg));
}

export function cosDeg(deg) {
  return Math.cos(degToRad(deg));
}

export function tanDeg(deg) {
  return Math.tan(degToRad(deg));
}

export function atan2Deg(y, x) {
  return radToDeg(Math.atan2(y, x));
}

export function asinDeg(value) {
  return radToDeg(Math.asin(value));
}

export function acosDeg(value) {
  return radToDeg(Math.acos(value));
}
```

## js/core/time.js

```javascript
export function toUtcDate(input) {
  const [year, month, day] = input.date.split('-').map(Number);
  const [hour, minute, second = 0] = input.time.split(':').map(Number);

  const utcMillis = Date.UTC(year, month - 1, day, hour - input.utcOffset, minute, second);
  return new Date(utcMillis);
}

export function julianDayFromDate(date) {
  return (date.getTime() / 86400000) + 2440587.5;
}

export function julianCenturiesSinceJ2000(jd) {
  return (jd - 2451545.0) / 36525;
}
```

## js/core/obliquity.js

```javascript
export function meanObliquityDeg(T) {
  return 23.439291 - 0.0130042 * T;
}
```

## js/core/sidereal.js

```javascript
import { normalizeDeg } from './angles.js';

export function greenwichSiderealTimeDeg(jd) {
  const T = (jd - 2451545.0) / 36525;
  const theta = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - (T * T * T) / 38710000;

  return normalizeDeg(theta);
}

export function localSiderealTimeDeg(jd, longitudeDeg) {
  return normalizeDeg(greenwichSiderealTimeDeg(jd) + longitudeDeg);
}
```

## js/core/coordinates.js

```javascript
import { sinDeg, cosDeg, atan2Deg, asinDeg, normalizeDeg } from './angles.js';

export function eclipticToEquatorial(lambdaDeg, betaDeg, epsilonDeg) {
  const x = cosDeg(lambdaDeg) * cosDeg(betaDeg);
  const y = sinDeg(lambdaDeg) * cosDeg(betaDeg) * cosDeg(epsilonDeg) - sinDeg(betaDeg) * sinDeg(epsilonDeg);
  const z = sinDeg(lambdaDeg) * cosDeg(betaDeg) * sinDeg(epsilonDeg) + sinDeg(betaDeg) * cosDeg(epsilonDeg);

  const ra = normalizeDeg(atan2Deg(y, x));
  const dec = asinDeg(z);

  return { raDeg: ra, decDeg: dec };
}
```

---

# 5. Data

## js/data/constants.js

```javascript
export const J2000 = 2451545.0;
export const EARTH_AXIAL_TILT_DEG = 23.439291;
export const AU_KM = 149597870.7;
export const EARTH_RADIUS_KM = 6378.137;
export const MOON_RADIUS_KM = 1737.4;
export const SUN_RADIUS_KM = 695700;
```

## js/data/ayanamsas.js

```javascript
export const AYANAMSAS = {
  lahiri: 23.8531,
  faganBradley: 24.0420,
  krishnamurti: 23.8565
};
```

## js/data/yking64.js

```javascript
const STEP = 360 / 64;

export const YKING_64 = Array.from({ length: 64 }, (_, index) => ({
  id: index + 1,
  startDeg: index * STEP,
  endDeg: (index + 1) * STEP
}));
```

## js/data/planetElements.js

```javascript
export const PLANET_ELEMENTS = {
  Mercury: {
    a: 0.38709927, aRate: 0.00000037,
    e: 0.20563593, eRate: 0.00001906,
    i: 7.00497902, iRate: -0.00594749,
    L: 252.25032350, LRate: 149472.67411175,
    longPeri: 77.45779628, longPeriRate: 0.16047689,
    longNode: 48.33076593, longNodeRate: -0.12534081
  },
  Venus: {
    a: 0.72333566, aRate: 0.00000390,
    e: 0.00677672, eRate: -0.00004107,
    i: 3.39467605, iRate: -0.00078890,
    L: 181.97909950, LRate: 58517.81538729,
    longPeri: 131.60246718, longPeriRate: 0.00268329,
    longNode: 76.67984255, longNodeRate: -0.27769418
  }
};
```

## js/data/constellationsOptimized.js

```javascript
export const CONSTELLATIONS_OPTIMIZED = [
  { abbr: 'Ari', name: 'Aries', raMin: 20, raMax: 55, decMin: 10, decMax: 30 },
  { abbr: 'Tau', name: 'Taurus', raMin: 52, raMax: 90, decMin: 0, decMax: 35 },
  { abbr: 'Gem', name: 'Gemini', raMin: 90, raMax: 120, decMin: 10, decMax: 35 }
];
```

---

# 6. Astronomy

## js/astronomy/sun.js

```javascript
import { normalizeDeg, sinDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';

export function computeSun(T, epsilonDeg) {
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T);

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinDeg(M)
    + (0.019993 - 0.000101 * T) * sinDeg(2 * M)
    + 0.000289 * sinDeg(3 * M);

  const trueLongitude = normalizeDeg(L0 + C);
  const distanceAu = 1.00014 - 0.01671 * Math.cos(M * Math.PI / 180) - 0.00014 * Math.cos(2 * M * Math.PI / 180);
  const eq = eclipticToEquatorial(trueLongitude, 0, epsilonDeg);

  return {
    longitudeDeg: trueLongitude,
    latitudeDeg: 0,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    distanceAu
  };
}
```

## js/astronomy/moon.js

```javascript
import { normalizeDeg, sinDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';

export function computeMoon(T, epsilonDeg) {
  const L = normalizeDeg(218.3164477 + 481267.88123421 * T);
  const M = normalizeDeg(134.9633964 + 477198.8675055 * T);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T);
  const F = normalizeDeg(93.2720950 + 483202.0175233 * T);

  const longitude = normalizeDeg(
    L
    + 6.289 * sinDeg(M)
    + 1.274 * sinDeg(2 * D - M)
    + 0.658 * sinDeg(2 * D)
    + 0.214 * sinDeg(2 * M)
    - 0.186 * sinDeg(357.529 + 35999.050 * T)
  );

  const latitude =
    5.128 * sinDeg(F)
    + 0.280 * sinDeg(M + F)
    + 0.277 * sinDeg(M - F)
    + 0.173 * sinDeg(2 * D - F);

  const distanceKm = 385001 - 20905 * Math.cos(M * Math.PI / 180);
  const eq = eclipticToEquatorial(longitude, latitude, epsilonDeg);

  return {
    longitudeDeg: longitude,
    latitudeDeg: latitude,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    distanceKm
  };
}
```

## js/astronomy/planets.js

```javascript
import { PLANET_ELEMENTS } from '../data/planetElements.js';
import { normalizeDeg } from '../core/angles.js';

function solveKepler(Mdeg, e) {
  let E = Mdeg * Math.PI / 180;
  for (let i = 0; i < 10; i++) {
    E = E - (E - e * Math.sin(E) - Mdeg * Math.PI / 180) / (1 - e * Math.cos(E));
  }
  return E;
}

function heliocentricPosition(elements, T) {
  const a = elements.a + elements.aRate * T;
  const e = elements.e + elements.eRate * T;
  const i = elements.i + elements.iRate * T;
  const L = elements.L + elements.LRate * T;
  const longPeri = elements.longPeri + elements.longPeriRate * T;
  const longNode = elements.longNode + elements.longNodeRate * T;

  const M = normalizeDeg(L - longPeri);
  const E = solveKepler(M, e);

  return { a, e, i, L: normalizeDeg(L), longPeri: normalizeDeg(longPeri), longNode: normalizeDeg(longNode), E };
}

export function computePlanets(T) {
  const result = {};

  for (const [name, elements] of Object.entries(PLANET_ELEMENTS)) {
    result[name] = heliocentricPosition(elements, T);
  }

  return result;
}
```

## js/astronomy/nodes.js

```javascript
import { normalizeDeg, sinDeg } from '../core/angles.js';

export function meanLunarNode(T) {
  return normalizeDeg(
    125.04452
    - 1934.136261 * T
    + 0.0020708 * T * T
    + (T * T * T) / 450000
  );
}

export function trueLunarNode(T) {
  const omega = meanLunarNode(T);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T);

  return normalizeDeg(omega - 1.4979 * sinDeg(2 * D) - 0.1500 * sinDeg(M));
}
```

## js/astronomy/eclipses.js

```javascript
import { normalize180 } from '../core/angles.js';

export function evaluateEclipsePotential(sunLon, moonLon, nodeLon) {
  const phaseDelta = Math.abs(normalize180(moonLon - sunLon));
  const nodeDelta = Math.abs(normalize180(moonLon - nodeLon));

  const isNewMoon = phaseDelta < 12;
  const isFullMoon = Math.abs(phaseDelta - 180) < 12;
  const nearNode = nodeDelta < 15;

  return {
    isNewMoon,
    isFullMoon,
    nearNode,
    solarPossible: isNewMoon && nearNode,
    lunarPossible: isFullMoon && nearNode,
    nodeDelta
  };
}
```

## js/astronomy/riseSet.js

```javascript
export function computeRiseSetPlaceholder() {
  return {
    sunrise: null,
    sunset: null,
    moonrise: null,
    moonset: null
  };
}
```

---

# 7. Astrology

## js/astrology/zodiacTropical.js

```javascript
import { normalizeDeg } from '../core/angles.js';

const SIGNS = [
  'Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge',
  'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'
];

export function getTropicalSign(longitudeDeg) {
  const lon = normalizeDeg(longitudeDeg);
  const index = Math.floor(lon / 30);
  return {
    index,
    name: SIGNS[index],
    degreeInSign: lon % 30
  };
}
```

## js/astrology/zodiacSidereal.js

```javascript
import { normalizeDeg } from '../core/angles.js';
import { AYANAMSAS } from '../data/ayanamsas.js';
import { getTropicalSign } from './zodiacTropical.js';

export function getSiderealSign(longitudeDeg, ayanamsaKey = 'lahiri') {
  const ayanamsa = AYANAMSAS[ayanamsaKey] ?? AYANAMSAS.lahiri;
  const siderealLongitude = normalizeDeg(longitudeDeg - ayanamsa);
  return {
    ...getTropicalSign(siderealLongitude),
    siderealLongitude
  };
}
```

## js/astrology/constellations.js

```javascript
import { CONSTELLATIONS_OPTIMIZED } from '../data/constellationsOptimized.js';

export function getConstellationByRaDec(raDeg, decDeg) {
  return (
    CONSTELLATIONS_OPTIMIZED.find(c => {
      const raInRange = c.raMin <= c.raMax
        ? raDeg >= c.raMin && raDeg <= c.raMax
        : raDeg >= c.raMin || raDeg <= c.raMax;

      return raInRange && decDeg >= c.decMin && decDeg <= c.decMax;
    }) || null
  );
}
```

## js/astrology/houses.js

```javascript
import { normalizeDeg } from '../core/angles.js';

export function computeEqualHouses(ascDeg) {
  return Array.from({ length: 12 }, (_, i) => normalizeDeg(ascDeg + i * 30));
}

export function findHouse(longitudeDeg, houseCusps) {
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i];
    const end = houseCusps[(i + 1) % 12];

    if (start < end) {
      if (longitudeDeg >= start && longitudeDeg < end) return i + 1;
    } else {
      if (longitudeDeg >= start || longitudeDeg < end) return i + 1;
    }
  }

  return 1;
}

export function computeAscendantPlaceholder(lstDeg) {
  return normalizeDeg(lstDeg + 90);
}
```

## js/astrology/aspects.js

```javascript
import { normalize180 } from '../core/angles.js';

const ASPECTS = [
  { name: 'conjonction', angle: 0, orb: 8 },
  { name: 'sextile', angle: 60, orb: 4 },
  { name: 'carré', angle: 90, orb: 6 },
  { name: 'trigone', angle: 120, orb: 6 },
  { name: 'opposition', angle: 180, orb: 8 }
];

export function getAspect(aDeg, bDeg) {
  const delta = Math.abs(normalize180(aDeg - bDeg));

  for (const aspect of ASPECTS) {
    if (Math.abs(delta - aspect.angle) <= aspect.orb) {
      return { ...aspect, delta };
    }
  }

  return null;
}
```

---

# 8. Symbolic

## js/symbolic/yking.js

```javascript
import { normalizeDeg } from '../core/angles.js';
import { YKING_64 } from '../data/yking64.js';

export function getYKingHexagram(longitudeDeg) {
  const lon = normalizeDeg(longitudeDeg);
  return YKING_64.find(item => lon >= item.startDeg && lon < item.endDeg) || YKING_64[63];
}
```

## js/symbolic/correspondences.js

```javascript
import { getYKingHexagram } from './yking.js';

export function buildSymbolicBodyData(body) {
  return {
    yking: getYKingHexagram(body.longitudeDeg)
  };
}
```

---

# 9. Domain

## js/domain/chartModel.js

```javascript
export function createEmptyChart() {
  return {
    input: null,
    context: null,
    bodies: {},
    houses: [],
    symbolic: {},
    diagnostics: {}
  };
}
```

## js/domain/validators.js

```javascript
export function validateInput(input) {
  const errors = [];

  if (!input.date) errors.push('Date manquante');
  if (!input.time) errors.push('Heure manquante');
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    errors.push('Latitude invalide');
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    errors.push('Longitude invalide');
  }
  if (!Number.isFinite(input.utcOffset) || input.utcOffset < -14 || input.utcOffset > 14) {
    errors.push('UTC offset invalide');
  }

  return errors;
}
```

## js/domain/chartBuilder.js

```javascript
import { createEmptyChart } from './chartModel.js';
import { toUtcDate, julianDayFromDate, julianCenturiesSinceJ2000 } from '../core/time.js';
import { meanObliquityDeg } from '../core/obliquity.js';
import { localSiderealTimeDeg } from '../core/sidereal.js';
import { computeSun } from '../astronomy/sun.js';
import { computeMoon } from '../astronomy/moon.js';
import { computePlanets } from '../astronomy/planets.js';
import { meanLunarNode, trueLunarNode } from '../astronomy/nodes.js';
import { evaluateEclipsePotential } from '../astronomy/eclipses.js';
import { getTropicalSign } from '../astrology/zodiacTropical.js';
import { getSiderealSign } from '../astrology/zodiacSidereal.js';
import { getConstellationByRaDec } from '../astrology/constellations.js';
import { computeEqualHouses, computeAscendantPlaceholder, findHouse } from '../astrology/houses.js';
import { buildSymbolicBodyData } from '../symbolic/correspondences.js';

export function buildChart(input) {
  const chart = createEmptyChart();
  chart.input = input;

  const utcDate = toUtcDate(input);
  const jd = julianDayFromDate(utcDate);
  const T = julianCenturiesSinceJ2000(jd);
  const epsilonDeg = meanObliquityDeg(T);
  const lstDeg = localSiderealTimeDeg(jd, input.longitude);

  chart.context = {
    utcIso: utcDate.toISOString(),
    jd,
    T,
    epsilonDeg,
    lstDeg
  };

  const sun = computeSun(T, epsilonDeg);
  const moon = computeMoon(T, epsilonDeg);
  const planets = computePlanets(T);
  const meanNode = meanLunarNode(T);
  const trueNode = trueLunarNode(T);

  const ascDeg = computeAscendantPlaceholder(lstDeg);
  const houseCusps = computeEqualHouses(ascDeg);

  const enrichedBodies = {
    sun: enrichBody(sun, houseCusps),
    moon: enrichBody(moon, houseCusps)
  };

  chart.bodies = enrichedBodies;
  chart.planets = planets;
  chart.nodes = { meanNode, trueNode };
  chart.houses = houseCusps;
  chart.symbolic = {
    sun: buildSymbolicBodyData(enrichedBodies.sun),
    moon: buildSymbolicBodyData(enrichedBodies.moon)
  };
  chart.diagnostics.eclipse = evaluateEclipsePotential(sun.longitudeDeg, moon.longitudeDeg, trueNode);

  return chart;
}

function enrichBody(body, houseCusps) {
  const tropical = getTropicalSign(body.longitudeDeg);
  const sidereal = getSiderealSign(body.longitudeDeg);
  const constellation = getConstellationByRaDec(body.rightAscensionDeg, body.declinationDeg);
  const house = findHouse(body.longitudeDeg, houseCusps);

  return {
    ...body,
    tropical,
    sidereal,
    constellation,
    house
  };
}
```

---

# 10. Storage

## js/storage/localDb.js

```javascript
const KEY = 'astro-app-data';

export function saveChart(chart) {
  localStorage.setItem(KEY, JSON.stringify(chart));
}

export function loadChart() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
```

## js/storage/exportImport.js

```javascript
export function exportJson(data, filename = 'chart.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
```

## js/storage/settings.js

```javascript
const SETTINGS_KEY = 'astro-app-settings';

export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : { theme: 'auto', ayanamsa: 'lahiri' };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
```

---

# 11. UI

## js/ui/state.js

```javascript
export const uiState = {
  currentChart: null
};
```

## js/ui/formatters.js

```javascript
export function formatDeg(value) {
  return `${value.toFixed(4)}°`;
}
```

## js/ui/renderSummary.js

```javascript
import { formatDeg } from './formatters.js';

export function renderSummary(chart) {
  const el = document.getElementById('summary');
  el.innerHTML = `
    <p><strong>JD :</strong> ${chart.context.jd.toFixed(6)}</p>
    <p><strong>LST :</strong> ${formatDeg(chart.context.lstDeg)}</p>
    <p><strong>Obliquité :</strong> ${formatDeg(chart.context.epsilonDeg)}</p>
    <p><strong>Nœud moyen :</strong> ${formatDeg(chart.nodes.meanNode)}</p>
    <p><strong>Nœud vrai :</strong> ${formatDeg(chart.nodes.trueNode)}</p>
  `;
}
```

## js/ui/renderBodies.js

```javascript
import { formatDeg } from './formatters.js';

export function renderBodies(chart) {
  const el = document.getElementById('bodies');

  const html = Object.entries(chart.bodies).map(([key, body]) => `
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

  el.innerHTML = html;
}
```

## js/ui/renderHouses.js

```javascript
import { formatDeg } from './formatters.js';

export function renderHouses(chart) {
  const el = document.getElementById('houses');
  el.innerHTML = chart.houses.map((cusp, index) => `<p>Maison ${index + 1}: ${formatDeg(cusp)}</p>`).join('');
}
```

## js/ui/renderSymbolic.js

```javascript
export function renderSymbolic(chart) {
  const el = document.getElementById('symbolic');
  el.innerHTML = `
    <p>Soleil → Hexagramme ${chart.symbolic.sun.yking.id}</p>
    <p>Lune → Hexagramme ${chart.symbolic.moon.yking.id}</p>
    <p>Éclipse solaire possible : ${chart.diagnostics.eclipse.solarPossible ? 'oui' : 'non'}</p>
    <p>Éclipse lunaire possible : ${chart.diagnostics.eclipse.lunarPossible ? 'oui' : 'non'}</p>
  `;
}
```

---

# 12. Ce qu'il faut améliorer ensuite

Cette base est volontairement saine mais minimale. Les étapes suivantes naturelles sont :

## Priorité 1

- remplacer l'ascendant placeholder par le vrai calcul
- remplacer les constellations minimales par le dataset complet
- compléter les éléments orbitaux des planètes
- améliorer la Lune avec plus de termes

## Priorité 2

- ajouter les maisons Placidus
- ajouter les aspects entre tous les corps
- ajouter les phases lunaires détaillées
- ajouter lever / coucher Soleil-Lune

## Priorité 3

- ajouter polygones IAU complets
- ajouter rétrogradations réelles
- ajouter nœud vrai plus précis
- ajouter éclipses détaillées

---

# 13. Recommandation d'implémentation

L'ordre le plus sain est :

1. core
2. sun
3. moon
4. zodiac tropical
5. yking
6. sidéral
7. constellations
8. houses égales
9. planets
10. nodes
11. eclipses
12. maisons avancées

---

# 14. Point important

Cette base est conçue pour être :

- lisible
- testable
- découpée
- extensible
- compatible offline

Elle peut ensuite être convertie vers :

- single-file HTML autonome
- projet ES modules
- PWA
- application desktop via wrapper

Si tu veux, l'étape suivante idéale est de générer :

1. la vraie version de `planetElements.js` complète
2. la vraie version de `constellationsOptimized.js` complète
3. le vrai calcul d'ascendant et maisons
4. un `index.html` enrichi avec onglets, export/import et sauvegarde


---

# 15. Fichier complet — `js/data/planetElements.js`

```javascript
export const PLANET_ELEMENTS = {
  Mercury: {
    a: 0.38709927,
    aRate: 0.00000037,
    e: 0.20563593,
    eRate: 0.00001906,
    i: 7.00497902,
    iRate: -0.00594749,
    L: 252.25032350,
    LRate: 149472.67411175,
    longPeri: 77.45779628,
    longPeriRate: 0.16047689,
    longNode: 48.33076593,
    longNodeRate: -0.12534081
  },

  Venus: {
    a: 0.72333566,
    aRate: 0.00000390,
    e: 0.00677672,
    eRate: -0.00004107,
    i: 3.39467605,
    iRate: -0.00078890,
    L: 181.97909950,
    LRate: 58517.81538729,
    longPeri: 131.60246718,
    longPeriRate: 0.00268329,
    longNode: 76.67984255,
    longNodeRate: -0.27769418
  },

  Earth: {
    a: 1.00000261,
    aRate: 0.00000562,
    e: 0.01671123,
    eRate: -0.00004392,
    i: -0.00001531,
    iRate: -0.01294668,
    L: 100.46457166,
    LRate: 35999.37244981,
    longPeri: 102.93768193,
    longPeriRate: 0.32327364,
    longNode: 0.0,
    longNodeRate: 0.0
  },

  Mars: {
    a: 1.52371034,
    aRate: 0.00001847,
    e: 0.09339410,
    eRate: 0.00007882,
    i: 1.84969142,
    iRate: -0.00813131,
    L: -4.55343205,
    LRate: 19140.30268499,
    longPeri: -23.94362959,
    longPeriRate: 0.44441088,
    longNode: 49.55953891,
    longNodeRate: -0.29257343
  },

  Jupiter: {
    a: 5.20288700,
    aRate: -0.00011607,
    e: 0.04838624,
    eRate: -0.00013253,
    i: 1.30439695,
    iRate: -0.00183714,
    L: 34.39644051,
    LRate: 3034.74612775,
    longPeri: 14.72847983,
    longPeriRate: 0.21252668,
    longNode: 100.47390909,
    longNodeRate: 0.20469106
  },

  Saturn: {
    a: 9.53667594,
    aRate: -0.00125060,
    e: 0.05386179,
    eRate: -0.00050991,
    i: 2.48599187,
    iRate: 0.00193609,
    L: 49.95424423,
    LRate: 1222.49362201,
    longPeri: 92.59887831,
    longPeriRate: -0.41897216,
    longNode: 113.66242448,
    longNodeRate: -0.28867794
  },

  Uranus: {
    a: 19.18916464,
    aRate: -0.00196176,
    e: 0.04725744,
    eRate: -0.00004397,
    i: 0.77263783,
    iRate: -0.00242939,
    L: 313.23810451,
    LRate: 428.48202785,
    longPeri: 170.95427630,
    longPeriRate: 0.40805281,
    longNode: 74.01692503,
    longNodeRate: 0.04240589
  },

  Neptune: {
    a: 30.06992276,
    aRate: 0.00026291,
    e: 0.00859048,
    eRate: 0.00005105,
    i: 1.77004347,
    iRate: 0.00035372,
    L: -55.12002969,
    LRate: 218.45945325,
    longPeri: 44.96476227,
    longPeriRate: -0.32241464,
    longNode: 131.78422574,
    longNodeRate: -0.00508664
  }
};
```

---

# 16. Fichier complet — `js/data/constellationsOptimized.js`

```javascript
export const CONSTELLATIONS_OPTIMIZED = [
  { abbr: 'And', name: 'Andromeda', raMin: 0, raMax: 40, decMin: 20, decMax: 50 },
  { abbr: 'Ant', name: 'Antlia', raMin: 140, raMax: 165, decMin: -40, decMax: -24 },
  { abbr: 'Aps', name: 'Apus', raMin: 200, raMax: 230, decMin: -83, decMax: -67 },
  { abbr: 'Aqr', name: 'Aquarius', raMin: 300, raMax: 360, decMin: -25, decMax: 5 },
  { abbr: 'Aql', name: 'Aquila', raMin: 280, raMax: 310, decMin: -10, decMax: 20 },
  { abbr: 'Ara', name: 'Ara', raMin: 250, raMax: 280, decMin: -67, decMax: -45 },
  { abbr: 'Ari', name: 'Aries', raMin: 20, raMax: 55, decMin: 10, decMax: 30 },
  { abbr: 'Aur', name: 'Auriga', raMin: 70, raMax: 110, decMin: 28, decMax: 56 },
  { abbr: 'Boo', name: 'Bootes', raMin: 200, raMax: 235, decMin: 5, decMax: 55 },
  { abbr: 'Cae', name: 'Caelum', raMin: 65, raMax: 85, decMin: -50, decMax: -27 },
  { abbr: 'Cam', name: 'Camelopardalis', raMin: 60, raMax: 170, decMin: 53, decMax: 85 },
  { abbr: 'Cnc', name: 'Cancer', raMin: 110, raMax: 140, decMin: 5, decMax: 35 },
  { abbr: 'CVn', name: 'Canes Venatici', raMin: 180, raMax: 210, decMin: 30, decMax: 55 },
  { abbr: 'CMa', name: 'Canis Major', raMin: 95, raMax: 115, decMin: -33, decMax: 0 },
  { abbr: 'CMi', name: 'Canis Minor', raMin: 105, raMax: 120, decMin: 0, decMax: 15 },
  { abbr: 'Cap', name: 'Capricornus', raMin: 300, raMax: 330, decMin: -27, decMax: -10 },
  { abbr: 'Car', name: 'Carina', raMin: 95, raMax: 170, decMin: -75, decMax: -50 },
  { abbr: 'Cas', name: 'Cassiopeia', raMin: 350, raMax: 60, decMin: 50, decMax: 80 },
  { abbr: 'Cen', name: 'Centaurus', raMin: 190, raMax: 230, decMin: -65, decMax: -30 },
  { abbr: 'Cep', name: 'Cepheus', raMin: 310, raMax: 360, decMin: 55, decMax: 85 },
  { abbr: 'Cet', name: 'Cetus', raMin: 350, raMax: 60, decMin: -25, decMax: 10 },
  { abbr: 'Cha', name: 'Chamaeleon', raMin: 120, raMax: 170, decMin: -83, decMax: -75 },
  { abbr: 'Cir', name: 'Circinus', raMin: 225, raMax: 245, decMin: -70, decMax: -55 },
  { abbr: 'Col', name: 'Columba', raMin: 80, raMax: 95, decMin: -45, decMax: -25 },
  { abbr: 'Com', name: 'Coma Berenices', raMin: 180, raMax: 210, decMin: 10, decMax: 35 },
  { abbr: 'CrA', name: 'Corona Australis', raMin: 270, raMax: 290, decMin: -45, decMax: -35 },
  { abbr: 'CrB', name: 'Corona Borealis', raMin: 230, raMax: 260, decMin: 25, decMax: 40 },
  { abbr: 'Crv', name: 'Corvus', raMin: 180, raMax: 195, decMin: -25, decMax: -10 },
  { abbr: 'Crt', name: 'Crater', raMin: 165, raMax: 185, decMin: -25, decMax: -5 },
  { abbr: 'Cru', name: 'Crux', raMin: 180, raMax: 195, decMin: -65, decMax: -55 },
  { abbr: 'Cyg', name: 'Cygnus', raMin: 290, raMax: 320, decMin: 20, decMax: 55 },
  { abbr: 'Del', name: 'Delphinus', raMin: 300, raMax: 315, decMin: 0, decMax: 20 },
  { abbr: 'Dor', name: 'Dorado', raMin: 60, raMax: 90, decMin: -75, decMax: -50 },
  { abbr: 'Dra', name: 'Draco', raMin: 140, raMax: 360, decMin: 50, decMax: 85 },
  { abbr: 'Equ', name: 'Equuleus', raMin: 310, raMax: 325, decMin: 0, decMax: 15 },
  { abbr: 'Eri', name: 'Eridanus', raMin: 45, raMax: 95, decMin: -60, decMax: 10 },
  { abbr: 'For', name: 'Fornax', raMin: 35, raMax: 60, decMin: -40, decMax: -20 },
  { abbr: 'Gem', name: 'Gemini', raMin: 90, raMax: 120, decMin: 10, decMax: 35 },
  { abbr: 'Gru', name: 'Grus', raMin: 320, raMax: 350, decMin: -55, decMax: -35 },
  { abbr: 'Her', name: 'Hercules', raMin: 240, raMax: 280, decMin: 0, decMax: 50 },
  { abbr: 'Hor', name: 'Horologium', raMin: 40, raMax: 70, decMin: -65, decMax: -40 },
  { abbr: 'Hya', name: 'Hydra', raMin: 120, raMax: 220, decMin: -35, decMax: 10 },
  { abbr: 'Hyi', name: 'Hydrus', raMin: 0, raMax: 50, decMin: -80, decMax: -60 },
  { abbr: 'Ind', name: 'Indus', raMin: 300, raMax: 330, decMin: -75, decMax: -45 },
  { abbr: 'Lac', name: 'Lacerta', raMin: 320, raMax: 350, decMin: 35, decMax: 60 },
  { abbr: 'Leo', name: 'Leo', raMin: 140, raMax: 180, decMin: 0, decMax: 35 },
  { abbr: 'LMi', name: 'Leo Minor', raMin: 150, raMax: 170, decMin: 20, decMax: 40 },
  { abbr: 'Lep', name: 'Lepus', raMin: 70, raMax: 95, decMin: -30, decMax: 0 },
  { abbr: 'Lib', name: 'Libra', raMin: 220, raMax: 245, decMin: -30, decMax: 0 },
  { abbr: 'Lup', name: 'Lupus', raMin: 225, raMax: 255, decMin: -55, decMax: -30 },
  { abbr: 'Lyn', name: 'Lynx', raMin: 90, raMax: 140, decMin: 30, decMax: 60 },
  { abbr: 'Lyr', name: 'Lyra', raMin: 275, raMax: 290, decMin: 25, decMax: 45 },
  { abbr: 'Men', name: 'Mensa', raMin: 60, raMax: 100, decMin: -85, decMax: -70 },
  { abbr: 'Mic', name: 'Microscopium', raMin: 300, raMax: 325, decMin: -45, decMax: -25 },
  { abbr: 'Mon', name: 'Monoceros', raMin: 90, raMax: 120, decMin: -10, decMax: 15 },
  { abbr: 'Mus', name: 'Musca', raMin: 180, raMax: 200, decMin: -75, decMax: -65 },
  { abbr: 'Nor', name: 'Norma', raMin: 240, raMax: 265, decMin: -60, decMax: -40 },
  { abbr: 'Oct', name: 'Octans', raMin: 0, raMax: 360, decMin: -90, decMax: -75 },
  { abbr: 'Oph', name: 'Ophiuchus', raMin: 240, raMax: 270, decMin: -30, decMax: 15 },
  { abbr: 'Ori', name: 'Orion', raMin: 71, raMax: 96.5, decMin: -11, decMax: 23.5 },
  { abbr: 'Pav', name: 'Pavo', raMin: 300, raMax: 335, decMin: -75, decMax: -55 },
  { abbr: 'Peg', name: 'Pegasus', raMin: 330, raMax: 360, decMin: 5, decMax: 35 },
  { abbr: 'Per', name: 'Perseus', raMin: 40, raMax: 75, decMin: 30, decMax: 60 },
  { abbr: 'Phe', name: 'Phoenix', raMin: 350, raMax: 30, decMin: -55, decMax: -35 },
  { abbr: 'Pic', name: 'Pictor', raMin: 70, raMax: 95, decMin: -60, decMax: -45 },
  { abbr: 'Psc', name: 'Pisces', raMin: 350, raMax: 40, decMin: -5, decMax: 30 },
  { abbr: 'PsA', name: 'Piscis Austrinus', raMin: 330, raMax: 360, decMin: -35, decMax: -20 },
  { abbr: 'Pup', name: 'Puppis', raMin: 95, raMax: 130, decMin: -50, decMax: -20 },
  { abbr: 'Pyx', name: 'Pyxis', raMin: 125, raMax: 145, decMin: -40, decMax: -20 },
  { abbr: 'Ret', name: 'Reticulum', raMin: 45, raMax: 65, decMin: -65, decMax: -50 },
  { abbr: 'Sge', name: 'Sagitta', raMin: 295, raMax: 305, decMin: 15, decMax: 25 },
  { abbr: 'Sgr', name: 'Sagittarius', raMin: 265, raMax: 300, decMin: -45, decMax: -10 },
  { abbr: 'Sco', name: 'Scorpius', raMin: 240, raMax: 265, decMin: -45, decMax: 0 },
  { abbr: 'Scl', name: 'Sculptor', raMin: 345, raMax: 25, decMin: -40, decMax: -25 },
  { abbr: 'Sct', name: 'Scutum', raMin: 275, raMax: 285, decMin: -15, decMax: 5 },
  { abbr: 'Ser', name: 'Serpens', raMin: 230, raMax: 275, decMin: -5, decMax: 35 },
  { abbr: 'Sex', name: 'Sextans', raMin: 150, raMax: 170, decMin: -10, decMax: 10 },
  { abbr: 'Tau', name: 'Taurus', raMin: 52, raMax: 90, decMin: 0, decMax: 35 },
  { abbr: 'Tel', name: 'Telescopium', raMin: 280, raMax: 305, decMin: -55, decMax: -40 },
  { abbr: 'Tri', name: 'Triangulum', raMin: 15, raMax: 35, decMin: 25, decMax: 40 },
  { abbr: 'TrA', name: 'Triangulum Australe', raMin: 240, raMax: 260, decMin: -70, decMax: -55 },
  { abbr: 'Tuc', name: 'Tucana', raMin: 330, raMax: 360, decMin: -75, decMax: -60 },
  { abbr: 'UMa', name: 'Ursa Major', raMin: 120, raMax: 210, decMin: 30, decMax: 75 },
  { abbr: 'UMi', name: 'Ursa Minor', raMin: 0, raMax: 360, decMin: 65, decMax: 90 },
  { abbr: 'Vel', name: 'Vela', raMin: 120, raMax: 165, decMin: -55, decMax: -35 },
  { abbr: 'Vir', name: 'Virgo', raMin: 180, raMax: 225, decMin: -15, decMax: 15 },
  { abbr: 'Vol', name: 'Volans', raMin: 105, raMax: 135, decMin: -75, decMax: -60 },
  { abbr: 'Vul', name: 'Vulpecula', raMin: 290, raMax: 310, decMin: 15, decMax: 30 }
];
```

---

# 17. Ajustements immédiats à faire dans le moteur

Une fois ces deux fichiers ajoutés, les trois améliorations les plus utiles sont :

## `js/astronomy/planets.js`

- utiliser `Earth` comme référence pour convertir les positions héliocentriques en positions géocentriques
- calculer longitude vraie, latitude et distance
- exposer au moins `longitudeDeg`

## `js/astrology/constellations.js`

- garder le test de passage RA qui gère le cas `raMin > raMax`
- prévoir ensuite un second dataset polygonal pour raffiner les cas limites

## `js/domain/chartBuilder.js`

- enrichir aussi les planètes comme le Soleil et la Lune
- ajouter les correspondances symboliques pour toutes les planètes

---

# 18. Fichier réel — `js/astronomy/planets.js`

Ce fichier remplace la version placeholder. Il calcule, de manière simplifiée mais réellement exploitable :

- les éléments orbitaux à la date `T`
- la position héliocentrique de chaque planète
- la position géocentrique en prenant la Terre comme référence
- la longitude écliptique
- la latitude écliptique
- la distance
- l'ascension droite et la déclinaison

```javascript
import { normalizeDeg, sinDeg, cosDeg, atan2Deg, asinDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';
import { PLANET_ELEMENTS } from '../data/planetElements.js';

function solveKepler(Mdeg, e, iterations = 12) {
  const M = Mdeg * Math.PI / 180;
  let E = e < 0.8 ? M : Math.PI;

  for (let i = 0; i < iterations; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }

  return E;
}

function getElementsAtTime(base, T) {
  return {
    a: base.a + base.aRate * T,
    e: base.e + base.eRate * T,
    i: base.i + base.iRate * T,
    L: normalizeDeg(base.L + base.LRate * T),
    longPeri: normalizeDeg(base.longPeri + base.longPeriRate * T),
    longNode: normalizeDeg(base.longNode + base.longNodeRate * T)
  };
}

function getOrbitalState(elements) {
  const M = normalizeDeg(elements.L - elements.longPeri);
  const argPeri = normalizeDeg(elements.longPeri - elements.longNode);
  const E = solveKepler(M, elements.e);

  const xv = elements.a * (Math.cos(E) - elements.e);
  const yv = elements.a * Math.sqrt(1 - elements.e * elements.e) * Math.sin(E);

  const v = atan2Deg(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const u = normalizeDeg(v + argPeri);

  return { M, E, v, r, u };
}

function orbitalToHeliocentric(elements, state) {
  const xh = state.r * (
    cosDeg(elements.longNode) * cosDeg(state.u)
    - sinDeg(elements.longNode) * sinDeg(state.u) * cosDeg(elements.i)
  );

  const yh = state.r * (
    sinDeg(elements.longNode) * cosDeg(state.u)
    + cosDeg(elements.longNode) * sinDeg(state.u) * cosDeg(elements.i)
  );

  const zh = state.r * sinDeg(state.u) * sinDeg(elements.i);

  return { xh, yh, zh };
}

function rectToSpherical(x, y, z) {
  const lon = normalizeDeg(atan2Deg(y, x));
  const xy = Math.sqrt(x * x + y * y);
  const lat = atan2Deg(z, xy);
  const radius = Math.sqrt(x * x + y * y + z * z);

  return { lon, lat, radius };
}

function computeHeliocentricPlanet(name, T) {
  const base = PLANET_ELEMENTS[name];
  if (!base) throw new Error(`Unknown planet: ${name}`);

  const elements = getElementsAtTime(base, T);
  const state = getOrbitalState(elements);
  const helio = orbitalToHeliocentric(elements, state);
  const spherical = rectToSpherical(helio.xh, helio.yh, helio.zh);

  return {
    name,
    elements,
    meanAnomalyDeg: state.M,
    trueAnomalyDeg: state.v,
    radiusAu: state.r,
    heliocentric: {
      xAu: helio.xh,
      yAu: helio.yh,
      zAu: helio.zh,
      longitudeDeg: spherical.lon,
      latitudeDeg: spherical.lat,
      distanceAu: spherical.radius
    }
  };
}

function heliocentricToGeocentric(planetHelio, earthHelio) {
  const xg = planetHelio.heliocentric.xAu - earthHelio.heliocentric.xAu;
  const yg = planetHelio.heliocentric.yAu - earthHelio.heliocentric.yAu;
  const zg = planetHelio.heliocentric.zAu - earthHelio.heliocentric.zAu;

  const spherical = rectToSpherical(xg, yg, zg);

  return {
    xAu: xg,
    yAu: yg,
    zAu: zg,
    longitudeDeg: spherical.lon,
    latitudeDeg: spherical.lat,
    distanceAu: spherical.radius
  };
}

function enrichGeocentricData(geocentric, epsilonDeg) {
  const eq = eclipticToEquatorial(
    geocentric.longitudeDeg,
    geocentric.latitudeDeg,
    epsilonDeg
  );

  return {
    longitudeDeg: geocentric.longitudeDeg,
    latitudeDeg: geocentric.latitudeDeg,
    distanceAu: geocentric.distanceAu,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg
  };
}

export function computePlanets(T, epsilonDeg) {
  const earth = computeHeliocentricPlanet('Earth', T);

  const planetNames = [
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune'
  ];

  const result = {};

  for (const name of planetNames) {
    const helioPlanet = computeHeliocentricPlanet(name, T);
    const geocentric = heliocentricToGeocentric(helioPlanet, earth);
    const enriched = enrichGeocentricData(geocentric, epsilonDeg);

    result[name] = {
      name,
      ...enriched,
      meanAnomalyDeg: helioPlanet.meanAnomalyDeg,
      trueAnomalyDeg: helioPlanet.trueAnomalyDeg,
      heliocentricLongitudeDeg: helioPlanet.heliocentric.longitudeDeg,
      heliocentricLatitudeDeg: helioPlanet.heliocentric.latitudeDeg,
      heliocentricDistanceAu: helioPlanet.heliocentric.distanceAu
    };
  }

  return result;
}

export function computeEarthHeliocentric(T, epsilonDeg) {
  const earth = computeHeliocentricPlanet('Earth', T);
  const eq = eclipticToEquatorial(
    earth.heliocentric.longitudeDeg,
    earth.heliocentric.latitudeDeg,
    epsilonDeg
  );

  return {
    name: 'Earth',
    longitudeDeg: earth.heliocentric.longitudeDeg,
    latitudeDeg: earth.heliocentric.latitudeDeg,
    distanceAu: earth.heliocentric.distanceAu,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg
  };
}
```

---

# 19. Mise à jour nécessaire dans `js/domain/chartBuilder.js`

Il faut maintenant remplacer :

```javascript
const planets = computePlanets(T);
```

par :

```javascript
const planetsRaw = computePlanets(T, epsilonDeg);
```

Puis enrichir chaque planète comme pour le Soleil et la Lune.

Version conseillée :

```javascript
const planetsRaw = computePlanets(T, epsilonDeg);

const planets = Object.fromEntries(
  Object.entries(planetsRaw).map(([key, planet]) => [
    key,
    enrichBody(planet, houseCusps)
  ])
);
```

et ensuite :

```javascript
chart.planets = planets;
```

Enfin, pour ajouter aussi leur couche symbolique :

```javascript
for (const [key, planet] of Object.entries(planets)) {
  chart.symbolic[key] = buildSymbolicBodyData(planet);
}
```

---

# 20. Limites assumées de cette version

Cette version est une vraie base, mais elle reste une approximation raisonnable. Elle n'intègre pas encore :

- perturbations planétaires fines
- corrections de lumière
- aberration
- nutation complète
- topocentrique avancé
- rétrogradation dérivée explicitement

Mais elle est déjà suffisamment solide pour :

- longitude planétaire
- latitude planétaire
- distance apparente
- signe tropical
- signe sidéral
- constellation approximative
- maisons
- Y-King
- aspects

---

# 21. Fichier réel — `js/astrology/houses.js`

Ce fichier remplace la version placeholder. Il calcule :

- le Milieu du Ciel (MC)
- le Fond du Ciel (IC)
- l'Ascendant
- le Descendant
- les maisons égales
- les maisons Whole Sign
- les maisons Porphyry
- la recherche de maison pour une longitude donnée

Cette base est beaucoup plus crédible qu'un simple placeholder, tout en restant raisonnable en complexité.

```javascript
import { normalizeDeg, sinDeg, cosDeg, tanDeg, atan2Deg } from '../core/angles.js';

function zodiacArcDistance(startDeg, endDeg) {
  return normalizeDeg(endDeg - startDeg);
}

function divideArc(startDeg, endDeg, parts) {
  const arc = zodiacArcDistance(startDeg, endDeg);
  const step = arc / parts;
  return Array.from({ length: parts + 1 }, (_, index) => normalizeDeg(startDeg + step * index));
}

export function computeMidheaven(lstDeg, epsilonDeg) {
  const mc = atan2Deg(tanDeg(lstDeg), cosDeg(epsilonDeg));

  let result = normalizeDeg(mc);

  if (Math.cos(lstDeg * Math.PI / 180) < 0) {
    result = normalizeDeg(result + 180);
  }

  return result;
}

export function computeAscendant(lstDeg, latitudeDeg, epsilonDeg) {
  const numerator = -cosDeg(lstDeg);
  const denominator = sinDeg(epsilonDeg) * tanDeg(latitudeDeg) + cosDeg(epsilonDeg) * sinDeg(lstDeg);

  return normalizeDeg(atan2Deg(numerator, denominator));
}

export function computeAngles(lstDeg, latitudeDeg, epsilonDeg) {
  const asc = computeAscendant(lstDeg, latitudeDeg, epsilonDeg);
  const mc = computeMidheaven(lstDeg, epsilonDeg);
  const desc = normalizeDeg(asc + 180);
  const ic = normalizeDeg(mc + 180);

  return {
    asc,
    mc,
    desc,
    ic
  };
}

export function computeEqualHouses(ascDeg) {
  return Array.from({ length: 12 }, (_, i) => normalizeDeg(ascDeg + i * 30));
}

export function computeWholeSignHouses(ascDeg) {
  const firstSignStart = Math.floor(normalizeDeg(ascDeg) / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => normalizeDeg(firstSignStart + i * 30));
}

export function computePorphyryHouses(ascDeg, mcDeg) {
  const descDeg = normalizeDeg(ascDeg + 180);
  const icDeg = normalizeDeg(mcDeg + 180);

  const h10to1 = divideArc(mcDeg, ascDeg, 3);
  const h1to4 = divideArc(ascDeg, icDeg, 3);
  const h4to7 = divideArc(icDeg, descDeg, 3);
  const h7to10 = divideArc(descDeg, mcDeg, 3);

  return [
    ascDeg,
    h1to4[1],
    h1to4[2],
    icDeg,
    h4to7[1],
    h4to7[2],
    descDeg,
    h7to10[1],
    h7to10[2],
    mcDeg,
    h10to1[1],
    h10to1[2]
  ].map(normalizeDeg);
}

export function findHouse(longitudeDeg, houseCusps) {
  const lon = normalizeDeg(longitudeDeg);

  for (let i = 0; i < 12; i++) {
    const start = normalizeDeg(houseCusps[i]);
    const end = normalizeDeg(houseCusps[(i + 1) % 12]);

    if (start < end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      if (lon >= start || lon < end) return i + 1;
    }
  }

  return 1;
}

export function buildHouseSystem(systemName, lstDeg, latitudeDeg, epsilonDeg) {
  const angles = computeAngles(lstDeg, latitudeDeg, epsilonDeg);

  switch (systemName) {
    case 'whole-sign':
      return {
        system: systemName,
        angles,
        cusps: computeWholeSignHouses(angles.asc)
      };

    case 'porphyry':
      return {
        system: systemName,
        angles,
        cusps: computePorphyryHouses(angles.asc, angles.mc)
      };

    case 'equal':
    default:
      return {
        system: 'equal',
        angles,
        cusps: computeEqualHouses(angles.asc)
      };
  }
}
```

---

# 22. Mise à jour nécessaire dans `js/domain/chartBuilder.js`

Il faut maintenant remplacer :

```javascript
const ascDeg = computeAscendantPlaceholder(lstDeg);
const houseCusps = computeEqualHouses(ascDeg);
```

par :

```javascript
import { buildHouseSystem, findHouse } from '../astrology/houses.js';
```

puis dans `buildChart` :

```javascript
const houseSystem = buildHouseSystem('porphyry', lstDeg, input.latitude, epsilonDeg);
const houseCusps = houseSystem.cusps;
```

Ensuite, stocker aussi les angles :

```javascript
chart.houses = houseCusps;
chart.angles = houseSystem.angles;
chart.houseSystem = houseSystem.system;
```

La fonction `enrichBody` ne change pas dans son principe, mais elle utilisera maintenant les vraies maisons.

---

# 23. Mise à jour conseillée — `js/ui/renderSummary.js`

Pour afficher les angles :

```javascript
import { formatDeg } from './formatters.js';

export function renderSummary(chart) {
  const el = document.getElementById('summary');
  el.innerHTML = `
    <p><strong>JD :</strong> ${chart.context.jd.toFixed(6)}</p>
    <p><strong>LST :</strong> ${formatDeg(chart.context.lstDeg)}</p>
    <p><strong>Obliquité :</strong> ${formatDeg(chart.context.epsilonDeg)}</p>
    <p><strong>Asc :</strong> ${formatDeg(chart.angles.asc)}</p>
    <p><strong>MC :</strong> ${formatDeg(chart.angles.mc)}</p>
    <p><strong>Desc :</strong> ${formatDeg(chart.angles.desc)}</p>
    <p><strong>IC :</strong> ${formatDeg(chart.angles.ic)}</p>
    <p><strong>Système :</strong> ${chart.houseSystem}</p>
    <p><strong>Nœud moyen :</strong> ${formatDeg(chart.nodes.meanNode)}</p>
    <p><strong>Nœud vrai :</strong> ${formatDeg(chart.nodes.trueNode)}</p>
  `;
}
```

---

# 24. Mise à jour conseillée — `js/ui/renderHouses.js`

Tu peux garder le rendu simple :

```javascript
import { formatDeg } from './formatters.js';

export function renderHouses(chart) {
  const el = document.getElementById('houses');
  el.innerHTML = chart.houses
    .map((cusp, index) => `<p>Maison ${index + 1}: ${formatDeg(cusp)}</p>`)
    .join('');
}
```

---

# 25. Ce que cette étape apporte vraiment

Avec ce fichier, l'application dispose maintenant d'un vrai repère local :

- ascendant réel
- MC réel
- axes ASC/DESC et MC/IC
- maisons exploitables

Cela permet enfin d'avoir des maisons qui ont du sens dans la carte.

---

# 26. Limites assumées de cette version

Cette base reste volontairement en dessous de Placidus/Koch avancé. Elle est cependant déjà très utile et bien plus saine qu'un faux calcul. Elle n'intègre pas encore :

- Placidus exact
- Koch
- Campanus
- Regiomontanus
- corrections topocentriques avancées
- cas extrêmes aux hautes latitudes

Mais elle est déjà adaptée pour :

- architecture propre
- tests
- visualisation
- usage offline
- moteur symbolique cohérent

---

# 27. Fichier réel — `js/astrology/aspects.js`

Ce fichier remplace la version minimale. Il calcule :

- les aspects entre deux points
- tous les aspects d'un ensemble de corps
- les orbes par défaut
- le tri par précision

Il est pensé pour fonctionner avec les corps célestes et les angles comme l'Ascendant et le MC.

```javascript
import { normalize180 } from '../core/angles.js';

export const DEFAULT_ASPECTS = [
  { name: 'conjonction', angle: 0, orb: 8 },
  { name: 'sextile', angle: 60, orb: 4 },
  { name: 'carré', angle: 90, orb: 6 },
  { name: 'trigone', angle: 120, orb: 6 },
  { name: 'opposition', angle: 180, orb: 8 }
];

export function angularDistance(aDeg, bDeg) {
  return Math.abs(normalize180(aDeg - bDeg));
}

export function getAspectBetween(aName, aDeg, bName, bDeg, aspects = DEFAULT_ASPECTS) {
  const distance = angularDistance(aDeg, bDeg);

  for (const aspect of aspects) {
    const orb = Math.abs(distance - aspect.angle);
    if (orb <= aspect.orb) {
      return {
        bodyA: aName,
        bodyB: bName,
        aspect: aspect.name,
        exactAngle: aspect.angle,
        delta: distance,
        orb,
        applying: null
      };
    }
  }

  return null;
}

export function getAllAspects(points, aspects = DEFAULT_ASPECTS) {
  const result = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];

      const found = getAspectBetween(a.name, a.longitudeDeg, b.name, b.longitudeDeg, aspects);
      if (found) {
        result.push(found);
      }
    }
  }

  return result.sort((left, right) => left.orb - right.orb);
}

export function buildAspectPoints(chart) {
  const points = [];

  if (chart.bodies?.sun) {
    points.push({ name: 'Soleil', longitudeDeg: chart.bodies.sun.longitudeDeg });
  }

  if (chart.bodies?.moon) {
    points.push({ name: 'Lune', longitudeDeg: chart.bodies.moon.longitudeDeg });
  }

  if (chart.planets) {
    for (const [key, planet] of Object.entries(chart.planets)) {
      points.push({
        name: key,
        longitudeDeg: planet.longitudeDeg
      });
    }
  }

  if (chart.angles) {
    points.push({ name: 'Asc', longitudeDeg: chart.angles.asc });
    points.push({ name: 'MC', longitudeDeg: chart.angles.mc });
  }

  return points;
}
```

---

# 28. Intégration dans `js/domain/chartBuilder.js`

Ajouter l'import :

```javascript
import { buildAspectPoints, getAllAspects } from '../astrology/aspects.js';
```

Puis, dans `buildChart`, après avoir rempli `chart.bodies`, `chart.planets`, `chart.angles` et `chart.symbolic`, ajouter :

```javascript
const aspectPoints = buildAspectPoints(chart);
chart.aspects = getAllAspects(aspectPoints);
```

---

# 29. Fichier UI — `js/ui/renderAspects.js`

Créer ce fichier :

```javascript
export function renderAspects(chart) {
  const el = document.getElementById('aspects');

  if (!chart.aspects || !chart.aspects.length) {
    el.innerHTML = '<p>Aucun aspect majeur détecté.</p>';
    return;
  }

  el.innerHTML = chart.aspects.map(item => `
    <p>
      <strong>${item.bodyA}</strong>
      ${item.aspect}
      <strong>${item.bodyB}</strong>
      — angle: ${item.delta.toFixed(2)}°
      — orbe: ${item.orb.toFixed(2)}°
    </p>
  `).join('');
}
```

---

# 30. Mise à jour de `index.html`

Ajouter un nouveau panneau :

```html
<section class="panel">
  <h2>Aspects</h2>
  <div id="aspects"></div>
</section>
```

---

# 31. Mise à jour de `js/app.js`

Ajouter l'import :

```javascript
import { renderAspects } from './ui/renderAspects.js';
```

Puis, après les autres rendus :

```javascript
renderAspects(chart);
```

---

# 32. Ce que cette étape apporte

Avec cette intégration, l'application ne montre plus seulement des positions isolées :

- elle détecte les relations entre corps
- elle permet une lecture plus astrologique
- elle prépare les couches d'interprétation
- elle prépare les visualisations futures

---

# 33. Fichier réel — `js/astronomy/moonPhases.js`

Ce module calcule :

- l'angle Soleil-Lune
- l'illumination approximative
- l'âge lunaire
- la phase textuelle
- le pourcentage croissant/décroissant

Créer le fichier :

```javascript
import { normalize180, normalizeDeg } from '../core/angles.js';

const SYNODIC_MONTH = 29.530588853;

export function moonPhaseAngle(sunLonDeg, moonLonDeg) {
  return normalizeDeg(moonLonDeg - sunLonDeg);
}

export function moonIlluminationFraction(sunLonDeg, moonLonDeg) {
  const angle = moonPhaseAngle(sunLonDeg, moonLonDeg) * Math.PI / 180;
  return (1 - Math.cos(angle)) / 2;
}

export function moonAgeDays(sunLonDeg, moonLonDeg) {
  return (moonPhaseAngle(sunLonDeg, moonLonDeg) / 360) * SYNODIC_MONTH;
}

export function getMoonPhaseLabel(sunLonDeg, moonLonDeg) {
  const phase = moonPhaseAngle(sunLonDeg, moonLonDeg);

  if (phase < 22.5 || phase >= 337.5) return 'Nouvelle Lune';
  if (phase < 67.5) return 'Premier croissant';
  if (phase < 112.5) return 'Premier quartier';
  if (phase < 157.5) return 'Gibbeuse croissante';
  if (phase < 202.5) return 'Pleine Lune';
  if (phase < 247.5) return 'Gibbeuse décroissante';
  if (phase < 292.5) return 'Dernier quartier';
  return 'Dernier croissant';
}

export function isWaxingMoon(sunLonDeg, moonLonDeg) {
  const angle = moonPhaseAngle(sunLonDeg, moonLonDeg);
  return angle > 0 && angle < 180;
}

export function buildMoonPhaseData(sunLonDeg, moonLonDeg) {
  const angle = moonPhaseAngle(sunLonDeg, moonLonDeg);
  const illumination = moonIlluminationFraction(sunLonDeg, moonLonDeg);
  const ageDays = moonAgeDays(sunLonDeg, moonLonDeg);
  const waxing = isWaxingMoon(sunLonDeg, moonLonDeg);

  return {
    angleDeg: angle,
    illuminationFraction: illumination,
    illuminationPercent: illumination * 100,
    ageDays,
    label: getMoonPhaseLabel(sunLonDeg, moonLonDeg),
    waxing,
    waning: !waxing
  };
}
```

---

# 34. Fichier réel — `js/astronomy/riseSet.js`

Ce module calcule une approximation utile de :

- lever du Soleil
- coucher du Soleil
- lever de la Lune
- coucher de la Lune

Il fonctionne à partir de la déclinaison, ascension droite, latitude, longitude et temps sidéral.

```javascript
import { acosDeg, cosDeg, normalizeDeg, sinDeg } from '../core/angles.js';
import { greenwichSiderealTimeDeg } from '../core/sidereal.js';

function hourAngleForAltitude(latitudeDeg, declinationDeg, altitudeDeg) {
  const numerator = sinDeg(altitudeDeg) - sinDeg(latitudeDeg) * sinDeg(declinationDeg);
  const denominator = cosDeg(latitudeDeg) * cosDeg(declinationDeg);
  const value = numerator / denominator;

  if (value < -1) return 180;
  if (value > 1) return null;

  return acosDeg(value);
}

function siderealTimeToUtHours(lstDeg, jd, longitudeDeg) {
  const gst0 = greenwichSiderealTimeDeg(Math.floor(jd - 0.5) + 0.5);
  let delta = normalizeDeg(lstDeg - longitudeDeg - gst0);
  delta /= 15.0410671786691;
  return delta;
}

function hoursToClock(hours) {
  if (hours == null || Number.isNaN(hours)) return null;

  let h = hours % 24;
  if (h < 0) h += 24;

  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = Math.floor((((h - hh) * 60) - mm) * 60);

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function computeRiseSetForBody({ raDeg, decDeg, latitudeDeg, longitudeDeg, jd, altitudeDeg }) {
  const H = hourAngleForAltitude(latitudeDeg, decDeg, altitudeDeg);

  if (H === null) {
    return {
      rise: null,
      set: null,
      circumpolar: false,
      neverRises: true
    };
  }

  const lstRise = normalizeDeg(raDeg - H);
  const lstSet = normalizeDeg(raDeg + H);

  const utRise = siderealTimeToUtHours(lstRise, jd, longitudeDeg);
  const utSet = siderealTimeToUtHours(lstSet, jd, longitudeDeg);

  return {
    riseHoursUtc: utRise,
    setHoursUtc: utSet,
    rise: hoursToClock(utRise),
    set: hoursToClock(utSet),
    circumpolar: H === 180,
    neverRises: false
  };
}

export function computeSunRiseSet({ raDeg, decDeg, latitudeDeg, longitudeDeg, jd }) {
  return computeRiseSetForBody({
    raDeg,
    decDeg,
    latitudeDeg,
    longitudeDeg,
    jd,
    altitudeDeg: -0.833
  });
}

export function computeMoonRiseSet({ raDeg, decDeg, latitudeDeg, longitudeDeg, jd }) {
  return computeRiseSetForBody({
    raDeg,
    decDeg,
    latitudeDeg,
    longitudeDeg,
    jd,
    altitudeDeg: 0.125
  });
}
```

---

# 35. Mise à jour nécessaire — `js/domain/chartBuilder.js`

Ajouter les imports :

```javascript
import { buildMoonPhaseData } from '../astronomy/moonPhases.js';
import { computeSunRiseSet, computeMoonRiseSet } from '../astronomy/riseSet.js';
```

Puis, après le calcul du Soleil et de la Lune enrichis, ajouter :

```javascript
chart.moonPhase = buildMoonPhaseData(
  enrichedBodies.sun.longitudeDeg,
  enrichedBodies.moon.longitudeDeg
);

chart.riseSet = {
  sun: computeSunRiseSet({
    raDeg: enrichedBodies.sun.rightAscensionDeg,
    decDeg: enrichedBodies.sun.declinationDeg,
    latitudeDeg: input.latitude,
    longitudeDeg: input.longitude,
    jd
  }),
  moon: computeMoonRiseSet({
    raDeg: enrichedBodies.moon.rightAscensionDeg,
    decDeg: enrichedBodies.moon.declinationDeg,
    latitudeDeg: input.latitude,
    longitudeDeg: input.longitude,
    jd
  })
};
```

---

# 36. Fichier UI — `js/ui/renderMoonPhase.js`

Créer ce fichier :

```javascript
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
```

---

# 37. Fichier UI — `js/ui/renderRiseSet.js`

Créer ce fichier :

```javascript
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
    ${renderBodyRiseSet('Soleil', chart.riseSet?.sun)}
    ${renderBodyRiseSet('Lune', chart.riseSet?.moon)}
  `;
}
```

---

# 38. Mise à jour de `index.html`

Ajouter deux nouveaux panneaux :

```html
<section class="panel">
  <h2>Phase lunaire</h2>
  <div id="moon-phase"></div>
</section>

<section class="panel">
  <h2>Lever / Coucher</h2>
  <div id="rise-set"></div>
</section>
```

---

# 39. Mise à jour de `js/app.js`

Ajouter les imports :

```javascript
import { renderMoonPhase } from './ui/renderMoonPhase.js';
import { renderRiseSet } from './ui/renderRiseSet.js';
```

Puis lancer les rendus :

```javascript
renderMoonPhase(chart);
renderRiseSet(chart);
```

---

# 40. Ce que cette étape apporte

Avec ces deux modules, l'application gagne une vraie respiration temporelle :

- cycle lunaire détaillé
- rapport Soleil-Lune plus vivant
- visibilité du lever / coucher
- ancrage concret dans le lieu

Cela crée un pont précieux entre l'astronomie, l'astrologie et l'expérience vécue.

---

# 41. Limites assumées de cette version

Ces calculs sont utiles, mais restent simplifiés. Ils n'intègrent pas encore :

- réfraction avancée variable
- parallaxe lunaire complète
- interpolation itérative plus fine sur la journée
- correction topocentrique détaillée
- lever/coucher local civil avec fuseau intégré dans le rendu

Mais ils sont déjà suffisants pour une application offline cohérente et évolutive.

---

# 42. Visualisation graphique du thème — principe

Cette étape ajoute une première roue astrologique simple, lisible et offline. L'objectif n'est pas encore un rendu expert de type logiciel professionnel, mais une base propre pour afficher :

- le cercle zodiacal
- les maisons
- les positions des corps
- les axes principaux

---

# 43. Mise à jour de `index.html`

Ajouter un panneau :

```html
<section class="panel">
  <h2>Carte du ciel</h2>
  <canvas id="chart-wheel" width="520" height="520"></canvas>
</section>
```

---

# 44. Fichier UI — `js/ui/renderChartWheel.js`

Créer ce fichier :

```javascript
function polarToCartesian(cx, cy, radius, angleDeg) {
  const angle = (angleDeg - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

function drawCircle(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLineAtAngle(ctx, cx, cy, radiusInner, radiusOuter, angleDeg) {
  const p1 = polarToCartesian(cx, cy, radiusInner, angleDeg);
  const p2 = polarToCartesian(cx, cy, radiusOuter, angleDeg);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawTextAtAngle(ctx, cx, cy, radius, angleDeg, text) {
  const p = polarToCartesian(cx, cy, radius, angleDeg);
  ctx.fillText(text, p.x, p.y);
}

function zodiacLabel(index) {
  return ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'][index] ?? '?';
}

function bodyLabel(name) {
  const map = {
    sun: 'Su',
    moon: 'Mo',
    Mercury: 'Me',
    Venus: 'Ve',
    Mars: 'Ma',
    Jupiter: 'Ju',
    Saturn: 'Sa',
    Uranus: 'Ur',
    Neptune: 'Ne'
  };

  return map[name] ?? name.slice(0, 2);
}

export function renderChartWheel(chart) {
  const canvas = document.getElementById('chart-wheel');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const outerR = 230;
  const zodiacR = 205;
  const houseR = 170;
  const bodyR = 145;

  drawCircle(ctx, cx, cy, outerR);
  drawCircle(ctx, cx, cy, zodiacR);
  drawCircle(ctx, cx, cy, houseR);

  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    drawLineAtAngle(ctx, cx, cy, zodiacR, outerR, angle);
    drawTextAtAngle(ctx, cx, cy, 217, angle + 15, zodiacLabel(i));
  }

  if (chart.houses) {
    for (let i = 0; i < 12; i++) {
      const cusp = chart.houses[i];
      drawLineAtAngle(ctx, cx, cy, 35, houseR, cusp);
      drawTextAtAngle(ctx, cx, cy, 120, cusp + 8, String(i + 1));
    }
  }

  if (chart.angles) {
    drawLineAtAngle(ctx, cx, cy, 20, outerR, chart.angles.asc);
    drawLineAtAngle(ctx, cx, cy, 20, outerR, chart.angles.mc);
    drawTextAtAngle(ctx, cx, cy, 245, chart.angles.asc, 'Asc');
    drawTextAtAngle(ctx, cx, cy, 245, chart.angles.mc, 'MC');
  }

  const bodies = [
    ['sun', chart.bodies?.sun],
    ['moon', chart.bodies?.moon],
    ...Object.entries(chart.planets ?? {})
  ].filter(([, body]) => body && Number.isFinite(body.longitudeDeg));

  bodies.forEach(([name, body], index) => {
    const radius = bodyR - (index % 3) * 12;
    const p = polarToCartesian(cx, cy, radius, body.longitudeDeg);

    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(bodyLabel(name), p.x, p.y - 12);
  });
}
```

---

# 45. Mise à jour de `js/app.js`

Ajouter l'import :

```javascript
import { renderChartWheel } from './ui/renderChartWheel.js';
```

Puis ajouter :

```javascript
renderChartWheel(chart);
```

---

# 46. Moteur de transits / comparaison — principe

Il faut pouvoir comparer :

- une carte de référence
- une date de transit

Le plus propre est de séparer cela du moteur natal. On crée un module dédié qui :

- construit une carte de référence
- construit une carte de transit
- compare leurs longitudes
- produit les aspects transit → natal

---

# 47. Fichier domain — `js/domain/transits.js`

Créer ce fichier :

```javascript
import { buildChart } from './chartBuilder.js';
import { getAllAspects } from '../astrology/aspects.js';

function extractTransitPoints(chart, prefix) {
  const points = [];

  if (chart.bodies?.sun) {
    points.push({ name: `${prefix} Soleil`, longitudeDeg: chart.bodies.sun.longitudeDeg });
  }

  if (chart.bodies?.moon) {
    points.push({ name: `${prefix} Lune`, longitudeDeg: chart.bodies.moon.longitudeDeg });
  }

  for (const [key, value] of Object.entries(chart.planets ?? {})) {
    points.push({ name: `${prefix} ${key}`, longitudeDeg: value.longitudeDeg });
  }

  if (chart.angles) {
    points.push({ name: `${prefix} Asc`, longitudeDeg: chart.angles.asc });
    points.push({ name: `${prefix} MC`, longitudeDeg: chart.angles.mc });
  }

  return points;
}

export function buildTransitComparison(natalInput, transitInput) {
  const natalChart = buildChart(natalInput);
  const transitChart = buildChart(transitInput);

  const natalPoints = extractTransitPoints(natalChart, 'Natal');
  const transitPoints = extractTransitPoints(transitChart, 'Transit');

  const crossPoints = [];

  for (const transit of transitPoints) {
    for (const natal of natalPoints) {
      crossPoints.push({ transit, natal });
    }
  }

  const aspects = [];

  for (const item of crossPoints) {
    const found = getAllAspects([
      { name: item.transit.name, longitudeDeg: item.transit.longitudeDeg },
      { name: item.natal.name, longitudeDeg: item.natal.longitudeDeg }
    ]);

    if (found.length) {
      aspects.push(...found);
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);

  return {
    natalChart,
    transitChart,
    aspects
  };
}
```

---

# 48. UI — panneau de transit dans `index.html`

Ajouter :

```html
<section class="panel">
  <h2>Transits / Comparaison</h2>
  <form id="transit-form">
    <label>Date transit <input type="date" name="date" required /></label>
    <label>Heure transit <input type="time" name="time" step="1" required /></label>
    <label>Latitude <input type="number" name="latitude" step="0.000001" required /></label>
    <label>Longitude <input type="number" name="longitude" step="0.000001" required /></label>
    <label>UTC offset <input type="number" name="utcOffset" step="0.5" value="0" required /></label>
    <button type="submit">Comparer</button>
  </form>
  <div id="transits"></div>
</section>
```

---

# 49. Fichier UI — `js/ui/renderTransits.js`

Créer ce fichier :

```javascript
export function renderTransits(result) {
  const el = document.getElementById('transits');

  if (!result || !result.aspects?.length) {
    el.innerHTML = '<p>Aucun aspect de transit détecté.</p>';
    return;
  }

  el.innerHTML = result.aspects.map(item => `
    <p>
      <strong>${item.bodyA}</strong>
      ${item.aspect}
      <strong>${item.bodyB}</strong>
      — orbe: ${item.orb.toFixed(2)}°
    </p>
  `).join('');
}
```

---

# 50. Mise à jour de `js/app.js`

Ajouter les imports :

```javascript
import { buildTransitComparison } from './domain/transits.js';
import { renderTransits } from './ui/renderTransits.js';
```

Puis, dans `initApp()`, après la logique du premier formulaire, ajouter une logique pour le second :

```javascript
const transitForm = document.getElementById('transit-form');
let natalInputCache = null;

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const input = {
    date: formData.get('date'),
    time: formData.get('time'),
    latitude: Number(formData.get('latitude')),
    longitude: Number(formData.get('longitude')),
    utcOffset: Number(formData.get('utcOffset'))
  };

  const errors = validateInput(input);
  if (errors.length) {
    alert(errors.join('
'));
    return;
  }

  natalInputCache = input;
  const chart = buildChart(input);

  renderSummary(chart);
  renderBodies(chart);
  renderHouses(chart);
  renderSymbolic(chart);
  renderAspects(chart);
  renderMoonPhase(chart);
  renderRiseSet(chart);
  renderChartWheel(chart);
});

transitForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!natalInputCache) {
    alert('Calcule d’abord une carte de référence.');
    return;
  }

  const formData = new FormData(transitForm);
  const transitInput = {
    date: formData.get('date'),
    time: formData.get('time'),
    latitude: Number(formData.get('latitude')),
    longitude: Number(formData.get('longitude')),
    utcOffset: Number(formData.get('utcOffset'))
  };

  const errors = validateInput(transitInput);
  if (errors.length) {
    alert(errors.join('
'));
    return;
  }

  const result = buildTransitComparison(natalInputCache, transitInput);
  renderTransits(result);
});
```

---

# 51. Ce que ces deux ajouts apportent

Avec ces deux couches, l'application franchit un seuil important :

## Visualisation

- le thème devient visible d'un seul regard
- les maisons et les corps prennent une forme spatiale
- l'application devient bien plus pédagogique et vivante

## Transits

- tu peux comparer deux instants
- tu peux créer des lectures évolutives
- tu ouvres la voie aux progressions, retours, synastries et comparaisons de cartes

---

# 52. Limites assumées de cette première roue et des transits

Cette première version reste volontairement simple :

- pas encore de gestion anti-chevauchement fine des glyphes
- pas encore de lignes d'aspects dessinées dans la roue
- pas encore de filtrage par type de transit
- pas encore de séparation transit rapide / lent
- pas encore de synastrie complète multi-carte

Mais la base est maintenant pleinement vivante.

---

# 53. Étape suivante la plus féconde

La prochaine étape qui donnerait le plus de valeur à l'application serait :

1. améliorer la roue (glyphes, couleurs, lignes d'aspects)
2. filtrer les transits importants
3. ajouter export/import complet d'une carte
4. ajouter synthèse textuelle automatique par corps et maison


---

# 54. Phase 1 — objectif concret

La Phase 1 vise à rendre la base actuelle **agréable à piloter et à lire**, sans changer encore profondément les modèles astronomiques. On améliore donc en priorité :

- les contrôles utilisateur
- la sauvegarde et l'export/import
- la roue astrologique
- les lignes d'aspects
- les paramètres de calcul les plus utiles

---

# 55. Mise à jour de `index.html` — contrôles de projet

Ajoute ces champs dans le formulaire principal, juste avant le bouton `Calculer` :

```html
<label>
  Système de maisons
  <select name="houseSystem">
    <option value="porphyry" selected>Porphyry</option>
    <option value="equal">Maisons égales</option>
    <option value="whole-sign">Whole Sign</option>
  </select>
</label>

<label>
  Ayanamsa
  <select name="ayanamsa">
    <option value="lahiri" selected>Lahiri</option>
    <option value="faganBradley">Fagan-Bradley</option>
    <option value="krishnamurti">Krishnamurti</option>
  </select>
</label>

<div class="button-row">
  <button type="submit">Calculer</button>
  <button type="button" id="save-chart">Sauvegarder</button>
  <button type="button" id="load-chart">Charger</button>
  <button type="button" id="export-chart">Exporter JSON</button>
  <button type="button" id="import-chart-button">Importer JSON</button>
  <input type="file" id="import-chart-file" accept="application/json" hidden />
</div>
```

Et ajoute un petit espace d'état :

```html
<p id="app-status"></p>
```

---

# 56. Mise à jour de `assets/styles.css`

Ajouter :

```css
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

#app-status {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  opacity: 0.85;
}
```

---

# 57. Mise à jour de `js/domain/chartBuilder.js`

Faire évoluer `buildChart(input)` vers `buildChart(input, options = {})`.

Remplacer la signature :

```javascript
export function buildChart(input) {
```

par :

```javascript
export function buildChart(input, options = {}) {
```

Puis ajouter au début :

```javascript
const config = {
  houseSystem: options.houseSystem ?? 'porphyry',
  ayanamsa: options.ayanamsa ?? 'lahiri'
};
```

Ensuite remplacer :

```javascript
const houseSystem = buildHouseSystem('porphyry', lstDeg, input.latitude, epsilonDeg);
```

par :

```javascript
const houseSystem = buildHouseSystem(config.houseSystem, lstDeg, input.latitude, epsilonDeg);
```

Et remplacer `enrichBody(body, houseCusps)` par `enrichBody(body, houseCusps, config.ayanamsa)`.

Dans `enrichBody`, remplacer :

```javascript
const sidereal = getSiderealSign(body.longitudeDeg);
```

par :

```javascript
const sidereal = getSiderealSign(body.longitudeDeg, ayanamsaKey);
```

Nouvelle signature :

```javascript
function enrichBody(body, houseCusps, ayanamsaKey) {
```

---

# 58. Mise à jour de `js/app.js` — branchement UI / stockage / réglages

Version améliorée :

```javascript
import { buildChart } from './domain/chartBuilder.js';
import { buildTransitComparison } from './domain/transits.js';
import { validateInput } from './domain/validators.js';
import { saveChart, loadChart } from './storage/localDb.js';
import { exportJson, importJsonFile } from './storage/exportImport.js';
import { loadSettings, saveSettings } from './storage/settings.js';
import { renderSummary } from './ui/renderSummary.js';
import { renderBodies } from './ui/renderBodies.js';
import { renderHouses } from './ui/renderHouses.js';
import { renderSymbolic } from './ui/renderSymbolic.js';
import { renderAspects } from './ui/renderAspects.js';
import { renderMoonPhase } from './ui/renderMoonPhase.js';
import { renderRiseSet } from './ui/renderRiseSet.js';
import { renderChartWheel } from './ui/renderChartWheel.js';
import { renderTransits } from './ui/renderTransits.js';

function getMainFormInput(form) {
  const formData = new FormData(form);
  return {
    input: {
      date: formData.get('date'),
      time: formData.get('time'),
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      utcOffset: Number(formData.get('utcOffset'))
    },
    options: {
      houseSystem: formData.get('houseSystem') || 'porphyry',
      ayanamsa: formData.get('ayanamsa') || 'lahiri'
    }
  };
}

function setStatus(message) {
  const el = document.getElementById('app-status');
  if (el) el.textContent = message;
}

function renderAll(chart) {
  renderSummary(chart);
  renderBodies(chart);
  renderHouses(chart);
  renderSymbolic(chart);
  renderAspects(chart);
  renderMoonPhase(chart);
  renderRiseSet(chart);
  renderChartWheel(chart);
}

export function initApp() {
  const form = document.getElementById('chart-form');
  const transitForm = document.getElementById('transit-form');
  const saveButton = document.getElementById('save-chart');
  const loadButton = document.getElementById('load-chart');
  const exportButton = document.getElementById('export-chart');
  const importButton = document.getElementById('import-chart-button');
  const importFile = document.getElementById('import-chart-file');

  const settings = loadSettings();
  if (form.elements.houseSystem) form.elements.houseSystem.value = settings.houseSystem ?? 'porphyry';
  if (form.elements.ayanamsa) form.elements.ayanamsa.value = settings.ayanamsa ?? 'lahiri';

  let natalInputCache = null;
  let natalOptionsCache = null;
  let currentChart = null;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { input, options } = getMainFormInput(form);
    const errors = validateInput(input);
    if (errors.length) {
      alert(errors.join('
'));
      return;
    }

    natalInputCache = input;
    natalOptionsCache = options;

    saveSettings(options);

    currentChart = buildChart(input, options);
    renderAll(currentChart);
    setStatus('Carte calculée.');
  });

  saveButton?.addEventListener('click', () => {
    if (!currentChart) {
      alert('Aucune carte à sauvegarder.');
      return;
    }

    saveChart({
      chart: currentChart,
      natalInput: natalInputCache,
      natalOptions: natalOptionsCache
    });
    setStatus('Carte sauvegardée localement.');
  });

  loadButton?.addEventListener('click', () => {
    const saved = loadChart();
    if (!saved?.chart) {
      alert('Aucune sauvegarde trouvée.');
      return;
    }

    currentChart = saved.chart;
    natalInputCache = saved.natalInput ?? null;
    natalOptionsCache = saved.natalOptions ?? null;
    renderAll(currentChart);
    setStatus('Carte chargée depuis le stockage local.');
  });

  exportButton?.addEventListener('click', () => {
    if (!currentChart) {
      alert('Aucune carte à exporter.');
      return;
    }

    exportJson({
      chart: currentChart,
      natalInput: natalInputCache,
      natalOptions: natalOptionsCache
    }, 'astro-chart.json');
    setStatus('Export JSON généré.');
  });

  importButton?.addEventListener('click', () => {
    importFile?.click();
  });

  importFile?.addEventListener('change', async () => {
    const file = importFile.files?.[0];
    if (!file) return;

    try {
      const imported = await importJsonFile(file);
      if (!imported?.chart) {
        throw new Error('Fichier invalide');
      }

      currentChart = imported.chart;
      natalInputCache = imported.natalInput ?? null;
      natalOptionsCache = imported.natalOptions ?? null;
      renderAll(currentChart);
      setStatus('Carte importée avec succès.');
    } catch (error) {
      alert('Import impossible : ' + error.message);
    } finally {
      importFile.value = '';
    }
  });

  transitForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!natalInputCache) {
      alert('Calcule d’abord une carte de référence.');
      return;
    }

    const formData = new FormData(transitForm);
    const transitInput = {
      date: formData.get('date'),
      time: formData.get('time'),
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      utcOffset: Number(formData.get('utcOffset'))
    };

    const errors = validateInput(transitInput);
    if (errors.length) {
      alert(errors.join('
'));
      return;
    }

    const result = buildTransitComparison(natalInputCache, transitInput);
    renderTransits(result);
    setStatus('Comparaison de transits calculée.');
  });
}
```

---

# 59. Amélioration majeure de `js/ui/renderChartWheel.js`

Cette version améliore trois choses :

- placement moins brutal des corps
- lignes d'aspects au centre
- meilleure hiérarchie visuelle

```javascript
function polarToCartesian(cx, cy, radius, angleDeg) {
  const angle = (angleDeg - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

function drawCircle(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLineAtAngle(ctx, cx, cy, radiusInner, radiusOuter, angleDeg) {
  const p1 = polarToCartesian(cx, cy, radiusInner, angleDeg);
  const p2 = polarToCartesian(cx, cy, radiusOuter, angleDeg);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawTextAtAngle(ctx, cx, cy, radius, angleDeg, text) {
  const p = polarToCartesian(cx, cy, radius, angleDeg);
  ctx.fillText(text, p.x, p.y);
}

function zodiacLabel(index) {
  return ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'][index] ?? '?';
}

function bodyLabel(name) {
  const map = {
    sun: 'Su',
    moon: 'Mo',
    Mercury: 'Me',
    Venus: 'Ve',
    Mars: 'Ma',
    Jupiter: 'Ju',
    Saturn: 'Sa',
    Uranus: 'Ur',
    Neptune: 'Ne'
  };
  return map[name] ?? name.slice(0, 2);
}

function angleDistance(a, b) {
  let d = Math.abs((a - b) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

function distributeBodiesByCollision(bodies) {
  const placed = [];

  for (const body of bodies) {
    let level = 0;

    while (placed.some(item => angleDistance(item.longitudeDeg, body.longitudeDeg) < 6 && item.level === level)) {
      level += 1;
    }

    placed.push({ ...body, level });
  }

  return placed;
}

function aspectStrokeStyle(name) {
  switch (name) {
    case 'conjonction': return '#666';
    case 'opposition': return '#c44';
    case 'carré': return '#d80';
    case 'trigone': return '#2a8';
    case 'sextile': return '#48c';
    default: return '#999';
  }
}

function drawAspectLines(ctx, cx, cy, radius, placedBodies, aspects) {
  const bodyMap = new Map(placedBodies.map(item => [item.labelKey, item]));

  for (const aspect of aspects ?? []) {
    const a = bodyMap.get(aspect.bodyA);
    const b = bodyMap.get(aspect.bodyB);
    if (!a || !b) continue;

    const p1 = polarToCartesian(cx, cy, radius, a.longitudeDeg);
    const p2 = polarToCartesian(cx, cy, radius, b.longitudeDeg);

    ctx.save();
    ctx.strokeStyle = aspectStrokeStyle(aspect.aspect);
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }
}

export function renderChartWheel(chart) {
  const canvas = document.getElementById('chart-wheel');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#444';
  ctx.fillStyle = '#222';

  const outerR = 230;
  const zodiacR = 205;
  const houseR = 170;
  const aspectR = 105;
  const bodyBaseR = 145;

  drawCircle(ctx, cx, cy, outerR);
  drawCircle(ctx, cx, cy, zodiacR);
  drawCircle(ctx, cx, cy, houseR);
  drawCircle(ctx, cx, cy, aspectR);

  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    drawLineAtAngle(ctx, cx, cy, zodiacR, outerR, angle);
    drawTextAtAngle(ctx, cx, cy, 217, angle + 15, zodiacLabel(i));
  }

  if (chart.houses) {
    for (let i = 0; i < 12; i++) {
      const cusp = chart.houses[i];
      drawLineAtAngle(ctx, cx, cy, 35, houseR, cusp);
      drawTextAtAngle(ctx, cx, cy, 122, cusp + 8, String(i + 1));
    }
  }

  if (chart.angles) {
    drawLineAtAngle(ctx, cx, cy, 20, outerR, chart.angles.asc);
    drawLineAtAngle(ctx, cx, cy, 20, outerR, chart.angles.mc);
    drawTextAtAngle(ctx, cx, cy, 245, chart.angles.asc, 'Asc');
    drawTextAtAngle(ctx, cx, cy, 245, chart.angles.mc, 'MC');
  }

  const bodies = [
    { labelKey: 'Soleil', key: 'sun', body: chart.bodies?.sun },
    { labelKey: 'Lune', key: 'moon', body: chart.bodies?.moon },
    ...Object.entries(chart.planets ?? {}).map(([key, body]) => ({ labelKey: key, key, body }))
  ]
    .filter(item => item.body && Number.isFinite(item.body.longitudeDeg))
    .map(item => ({
      ...item,
      longitudeDeg: item.body.longitudeDeg
    }))
    .sort((a, b) => a.longitudeDeg - b.longitudeDeg);

  const placedBodies = distributeBodiesByCollision(bodies);

  drawAspectLines(ctx, cx, cy, aspectR, placedBodies, chart.aspects);

  placedBodies.forEach((item) => {
    const radius = bodyBaseR - item.level * 12;
    const p = polarToCartesian(cx, cy, radius, item.longitudeDeg);

    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(bodyLabel(item.key), p.x, p.y - 12);
  });
}
```

---

# 60. Mise à jour de `js/storage/localDb.js`

Aucune refonte lourde n'est nécessaire, mais il faut assumer que le stockage local contient maintenant un objet plus large :

```javascript
const KEY = 'astro-app-data';

export function saveChart(payload) {
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function loadChart() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
```

---

# 61. Résultat attendu de cette sous-phase

Une fois ces mises à jour faites, la Phase 1 gagne tout de suite en qualité d'usage :

- l'utilisateur choisit son système de maisons
- l'utilisateur choisit son ayanamsa
- la carte se sauvegarde et se recharge
- l'export/import devient concret
- la roue est déjà plus lisible
- les aspects deviennent visibles au centre

---

# 62. Ce qui reste dans la Phase 1 après ce patch

Il restera encore trois améliorations très utiles à faire, mais elles deviennent plus petites une fois cette base en place :

1. affichage plus riche des transits
2. petit panneau réglages persistants plus propre
3. amélioration supplémentaire des collisions visuelles et des glyphes dans la roue

---

# 63. Patch Phase 1 — transits plus utiles

Le problème actuel des transits est qu'ils existent, mais restent encore trop bruts. On va donc améliorer trois choses :

- filtrage des aspects de transit
- hiérarchisation visuelle
- résumé plus clair

---

# 64. Mise à jour de `js/domain/transits.js`

L'objectif est de filtrer les transits les plus utiles et de distinguer les plus exacts.

Remplace le fichier actuel par cette version :

```javascript
import { buildChart } from './chartBuilder.js';
import { getAllAspects } from '../astrology/aspects.js';

function extractTransitPoints(chart, prefix) {
  const points = [];

  if (chart.bodies?.sun) {
    points.push({ name: `${prefix} Soleil`, longitudeDeg: chart.bodies.sun.longitudeDeg, speedClass: 'medium' });
  }

  if (chart.bodies?.moon) {
    points.push({ name: `${prefix} Lune`, longitudeDeg: chart.bodies.moon.longitudeDeg, speedClass: 'fast' });
  }

  for (const [key, value] of Object.entries(chart.planets ?? {})) {
    const speedClass = ['Mercury', 'Venus', 'Mars'].includes(key)
      ? 'fast'
      : ['Jupiter', 'Saturn'].includes(key)
        ? 'medium'
        : 'slow';

    points.push({ name: `${prefix} ${key}`, longitudeDeg: value.longitudeDeg, speedClass });
  }

  if (chart.angles) {
    points.push({ name: `${prefix} Asc`, longitudeDeg: chart.angles.asc, speedClass: 'angle' });
    points.push({ name: `${prefix} MC`, longitudeDeg: chart.angles.mc, speedClass: 'angle' });
  }

  return points;
}

function groupImportance(aspect) {
  if (aspect.orb <= 1) return 'très fort';
  if (aspect.orb <= 3) return 'fort';
  if (aspect.orb <= 5) return 'modéré';
  return 'léger';
}

function isInterestingTransit(aspect, options) {
  const defaults = {
    maxOrb: 4,
    includeFast: true,
    includeAngles: true,
    includeMinorImportance: false
  };

  const config = { ...defaults, ...(options ?? {}) };

  if (aspect.orb > config.maxOrb) return false;
  if (!config.includeMinorImportance && groupImportance(aspect) === 'léger') return false;

  const involvesFast = /Transit (Lune|Mercury|Venus|Mars)/.test(aspect.bodyA);
  const involvesAngle = /(Natal|Transit) (Asc|MC)/.test(`${aspect.bodyA} ${aspect.bodyB}`);

  if (!config.includeFast && involvesFast) return false;
  if (!config.includeAngles && involvesAngle) return false;

  return true;
}

export function buildTransitComparison(natalInput, transitInput, options = {}) {
  const natalChart = buildChart(natalInput);
  const transitChart = buildChart(transitInput);

  const natalPoints = extractTransitPoints(natalChart, 'Natal');
  const transitPoints = extractTransitPoints(transitChart, 'Transit');

  const aspects = [];

  for (const transit of transitPoints) {
    for (const natal of natalPoints) {
      const found = getAllAspects([
        { name: transit.name, longitudeDeg: transit.longitudeDeg },
        { name: natal.name, longitudeDeg: natal.longitudeDeg }
      ]);

      if (found.length) {
        for (const aspect of found) {
          const enriched = {
            ...aspect,
            importance: groupImportance(aspect),
            transitSpeedClass: transit.speedClass,
            natalSpeedClass: natal.speedClass
          };

          if (isInterestingTransit(enriched, options)) {
            aspects.push(enriched);
          }
        }
      }
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);

  const summary = {
    total: aspects.length,
    tresFort: aspects.filter(a => a.importance === 'très fort').length,
    fort: aspects.filter(a => a.importance === 'fort').length,
    modere: aspects.filter(a => a.importance === 'modéré').length,
    leger: aspects.filter(a => a.importance === 'léger').length
  };

  return {
    natalChart,
    transitChart,
    aspects,
    summary
  };
}
```

---

# 65. Mise à jour de `index.html` — filtres de transits

Dans le panneau des transits, ajoute ces champs avant le bouton `Comparer` :

```html
<label>
  Orbe max
  <select name="maxOrb">
    <option value="2">2°</option>
    <option value="3">3°</option>
    <option value="4" selected>4°</option>
    <option value="5">5°</option>
    <option value="6">6°</option>
  </select>
</label>

<label>
  <input type="checkbox" name="includeFast" checked />
  Inclure les transits rapides
</label>

<label>
  <input type="checkbox" name="includeAngles" checked />
  Inclure Asc / MC
</label>

<label>
  <input type="checkbox" name="includeMinorImportance" />
  Inclure aussi les transits légers
</label>
```

---

# 66. Mise à jour de `js/app.js` — passer les options de transit

Dans le submit du formulaire de transit, ajoute :

```javascript
const transitOptions = {
  maxOrb: Number(formData.get('maxOrb')),
  includeFast: formData.get('includeFast') === 'on',
  includeAngles: formData.get('includeAngles') === 'on',
  includeMinorImportance: formData.get('includeMinorImportance') === 'on'
};
```

Puis remplace :

```javascript
const result = buildTransitComparison(natalInputCache, transitInput);
```

par :

```javascript
const result = buildTransitComparison(natalInputCache, transitInput, transitOptions);
```

---

# 67. Mise à jour de `js/ui/renderTransits.js`

Remplace le fichier par cette version plus lisible :

```javascript
function importanceBadge(value) {
  switch (value) {
    case 'très fort': return '🔥';
    case 'fort': return '✨';
    case 'modéré': return '•';
    default: return '·';
  }
}

export function renderTransits(result) {
  const el = document.getElementById('transits');

  if (!result || !result.aspects?.length) {
    el.innerHTML = '<p>Aucun transit significatif détecté avec les filtres actuels.</p>';
    return;
  }

  const summary = result.summary;

  el.innerHTML = `
    <div>
      <p><strong>Total :</strong> ${summary.total}</p>
      <p><strong>Très forts :</strong> ${summary.tresFort} | <strong>Forts :</strong> ${summary.fort} | <strong>Modérés :</strong> ${summary.modere}</p>
    </div>
    ${result.aspects.map(item => `
      <p>
        ${importanceBadge(item.importance)}
        <strong>${item.bodyA}</strong>
        ${item.aspect}
        <strong>${item.bodyB}</strong>
        — orbe: ${item.orb.toFixed(2)}°
        — intensité: ${item.importance}
      </p>
    `).join('')}
  `;
}
```

---

# 68. Petit enrichissement visuel de `assets/styles.css`

Ajoute :

```css
#transits p {
  margin: 0.35rem 0;
}
```

---

# 69. Résultat attendu après ce patch

Une fois ce patch appliqué :

- les transits ne sont plus une masse brute
- les plus exacts ressortent immédiatement
- l'utilisateur peut filtrer selon l'orbe
- les transits rapides peuvent être masqués
- les angles peuvent être inclus ou exclus
- la lecture devient beaucoup plus concrète

---

# 70. Ce qui reste à faire pour terminer réellement la Phase 1

Après ce patch, la Phase 1 sera presque bien installée. Il restera surtout :

1. une dernière amélioration de la roue (collisions encore plus fines, glyphes, meilleure esthétique)
2. une petite harmonisation visuelle globale
3. une vérification finale du flux export/import/sauvegarde dans l'interface

---

# 71. Prochaine étape après ce patch

Une fois ce panneau de transits amélioré, la meilleure prochaine étape sera :

**finir proprement la roue astrologique**, avec une meilleure gestion des collisions et une représentation plus élégante des corps et des aspects.


---

# 72. Dernier patch de Phase 1 — roue plus propre et cohérence visuelle

Ce dernier patch vise à fermer la Phase 1 avec une roue plus lisible et une interface plus cohérente. Il améliore :

- la lisibilité des corps
- la hiérarchie graphique de la roue
- les collisions visuelles
- la finition générale de l'interface

---

# 73. Remplacement conseillé de `js/ui/renderChartWheel.js`

Cette version affine la roue en ajoutant :

- un anneau zodiacal plus clair
- des secteurs alternés
- des étiquettes de corps moins brutales
- une meilleure répartition visuelle
- une meilleure lisibilité des lignes d'aspects

```javascript
function polarToCartesian(cx, cy, radius, angleDeg) {
  const angle = (angleDeg - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

function drawCircle(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLineAtAngle(ctx, cx, cy, radiusInner, radiusOuter, angleDeg) {
  const p1 = polarToCartesian(cx, cy, radiusInner, angleDeg);
  const p2 = polarToCartesian(cx, cy, radiusOuter, angleDeg);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function zodiacLabel(index) {
  return ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'][index] ?? '?';
}

function bodyLabel(name) {
  const map = {
    sun: 'Su',
    moon: 'Mo',
    Mercury: 'Me',
    Venus: 'Ve',
    Mars: 'Ma',
    Jupiter: 'Ju',
    Saturn: 'Sa',
    Uranus: 'Ur',
    Neptune: 'Ne'
  };
  return map[name] ?? name.slice(0, 2);
}

function angleDistance(a, b) {
  let d = Math.abs((a - b) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

function distributeBodiesByCollision(bodies) {
  const placed = [];

  for (const body of bodies) {
    let level = 0;

    while (placed.some(item => angleDistance(item.longitudeDeg, body.longitudeDeg) < 6 && item.level === level)) {
      level += 1;
    }

    placed.push({ ...body, level });
  }

  return placed;
}

function aspectStrokeStyle(name) {
  switch (name) {
    case 'conjonction': return '#666';
    case 'opposition': return '#cf4a4a';
    case 'carré': return '#d88a22';
    case 'trigone': return '#2aa57a';
    case 'sextile': return '#4e86d8';
    default: return '#999';
  }
}

function drawZodiacSectors(ctx, cx, cy, innerR, outerR) {
  for (let i = 0; i < 12; i++) {
    const start = ((i * 30) - 90) * Math.PI / 180;
    const end = (((i + 1) * 30) - 90) * Math.PI / 180;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(start), cy + innerR * Math.sin(start));
    ctx.arc(cx, cy, outerR, start, end);
    ctx.arc(cx, cy, innerR, end, start, true);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? 'rgba(90, 90, 90, 0.05)' : 'rgba(90, 90, 90, 0.11)';
    ctx.fill();
    ctx.restore();
  }
}

function drawAspectLines(ctx, cx, cy, radius, placedBodies, aspects) {
  const bodyMap = new Map(placedBodies.map(item => [item.labelKey, item]));

  for (const aspect of aspects ?? []) {
    const a = bodyMap.get(aspect.bodyA);
    const b = bodyMap.get(aspect.bodyB);
    if (!a || !b) continue;

    const p1 = polarToCartesian(cx, cy, radius, a.longitudeDeg);
    const p2 = polarToCartesian(cx, cy, radius, b.longitudeDeg);

    ctx.save();
    ctx.strokeStyle = aspectStrokeStyle(aspect.aspect);
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = aspect.orb <= 1.5 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBodyMarker(ctx, cx, cy, baseRadius, item) {
  const radius = baseRadius - item.level * 14;
  const point = polarToCartesian(cx, cy, radius, item.longitudeDeg);
  const labelPoint = polarToCartesian(cx, cy, radius + 14, item.longitudeDeg);

  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = '#222';
  ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111';
  ctx.fillText(bodyLabel(item.key), labelPoint.x, labelPoint.y);
  ctx.restore();
}

export function renderChartWheel(chart) {
  const canvas = document.getElementById('chart-wheel');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#444';
  ctx.fillStyle = '#222';
  ctx.lineWidth = 1;

  const outerR = 230;
  const zodiacR = 205;
  const houseR = 170;
  const aspectR = 105;
  const bodyBaseR = 145;

  drawZodiacSectors(ctx, cx, cy, zodiacR, outerR);
  drawCircle(ctx, cx, cy, outerR);
  drawCircle(ctx, cx, cy, zodiacR);
  drawCircle(ctx, cx, cy, houseR);
  drawCircle(ctx, cx, cy, aspectR);

  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    drawLineAtAngle(ctx, cx, cy, zodiacR, outerR, angle);

    const labelPoint = polarToCartesian(cx, cy, 217, angle + 15);
    ctx.fillText(zodiacLabel(i), labelPoint.x, labelPoint.y);
  }

  if (chart.houses) {
    for (let i = 0; i < 12; i++) {
      const cusp = chart.houses[i];
      drawLineAtAngle(ctx, cx, cy, 35, houseR, cusp);

      const houseLabel = polarToCartesian(cx, cy, 121, cusp + 8);
      ctx.fillText(String(i + 1), houseLabel.x, houseLabel.y);
    }
  }

  if (chart.angles) {
    ctx.save();
    ctx.lineWidth = 2;
    drawLineAtAngle(ctx, cx, cy, 20, outerR, chart.angles.asc);
    drawLineAtAngle(ctx, cx, cy, 20, outerR, chart.angles.mc);
    ctx.restore();

    const ascText = polarToCartesian(cx, cy, 246, chart.angles.asc);
    const mcText = polarToCartesian(cx, cy, 246, chart.angles.mc);
    ctx.fillText('Asc', ascText.x, ascText.y);
    ctx.fillText('MC', mcText.x, mcText.y);
  }

  const bodies = [
    { labelKey: 'Soleil', key: 'sun', body: chart.bodies?.sun },
    { labelKey: 'Lune', key: 'moon', body: chart.bodies?.moon },
    ...Object.entries(chart.planets ?? {}).map(([key, body]) => ({ labelKey: key, key, body }))
  ]
    .filter(item => item.body && Number.isFinite(item.body.longitudeDeg))
    .map(item => ({
      ...item,
      longitudeDeg: item.body.longitudeDeg
    }))
    .sort((a, b) => a.longitudeDeg - b.longitudeDeg);

  const placedBodies = distributeBodiesByCollision(bodies);
  drawAspectLines(ctx, cx, cy, aspectR, placedBodies, chart.aspects);
  placedBodies.forEach(item => drawBodyMarker(ctx, cx, cy, bodyBaseR, item));
}
```

---

# 74. Harmonisation finale de `assets/styles.css`

Ajouter cette couche de finition :

```css
h1, h2, h3 {
  margin-top: 0;
}

.panel h2 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.panel p {
  line-height: 1.4;
}

input, select, button {
  font: inherit;
}

input, select {
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: inherit;
}

button {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
}

button:hover {
  opacity: 0.92;
}

canvas {
  display: block;
  margin: 0 auto;
}
```

---

# 75. Vérification finale du flux Phase 1

À ce stade, le flux utilisateur visé est le suivant :

1. saisir une carte de référence
2. choisir système de maisons + ayanamsa
3. calculer
4. voir la synthèse, les corps, les maisons, les aspects, la phase lunaire, le lever/coucher, la roue
5. sauvegarder localement
6. exporter/importer la carte
7. comparer une date de transit avec filtres

Si ce flux fonctionne proprement, alors la Phase 1 peut être considérée comme **structurellement terminée**.

---

# 76. Définition de “Phase 1 terminée”

La Phase 1 est considérée comme terminée lorsque les points suivants sont vrais :

- l'application se pilote sans toucher au code
- les rendus principaux sont lisibles
- la roue donne une synthèse visuelle exploitable
- les transits sont filtrables et compréhensibles
- la sauvegarde/export/import est disponible
- le projet est agréable à tester au quotidien

À ce stade, oui : on peut considérer que **la Phase 1 est achevée en tant que base produit**.

---

# 77. Ce qui n'appartient plus à la Phase 1

Les éléments suivants relèvent plutôt de la Phase 2 et au-delà :

- synthèse textuelle intelligente
- hiérarchisation interprétative par corps / maison / aspect
- raffinement scientifique plus fort
- constellations polygonales exactes
- Placidus plus avancé
- éclipses détaillées
- transits enrichis en lecture

---

# 78. Prochaine étape après la Phase 1

La meilleure prochaine étape, maintenant, est d'entrer dans la **Phase 2** avec :

## une synthèse textuelle automatique structurée

C'est elle qui transformera réellement l'application d'un moteur consultable en un outil de lecture et d'accompagnement.

L'ordre le plus juste serait :

1. synthèse Soleil / Lune / Ascendant
2. synthèse par corps en signe et maison
3. synthèse des aspects majeurs
4. synthèse courte des transits filtrés


---

# 79. Phase 2 — objectif

La Phase 2 commence lorsque l'application ne se contente plus de montrer des données, mais commence à les **organiser en lecture intelligible**.

Le premier objectif est donc :

- une synthèse courte et structurée
- lisible sans expertise technique
- réutilisable dans l'interface
- extensible plus tard vers des rapports plus riches

---

# 80. Nouveau module — `js/domain/synthesis.js`

Créer ce fichier :

```javascript
function formatBodySentence(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatBodySentence('Soleil', chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatBodySentence('Lune', chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatBodySentence(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const aspects = (chart.aspects ?? []).slice(0, 8);

  if (!aspects.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return aspects.map(item =>
    `${item.bodyA} ${item.aspect} ${item.bodyB}, orbe ${item.orb.toFixed(2)}°.`
  );
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Phase lunaire : ${phase.label}.`,
    `Illumination : ${phase.illuminationPercent.toFixed(2)}%.`,
    `Âge lunaire : ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Soleil — lever: ${sun.rise ?? 'n/a'} UTC, coucher: ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune — lever: ${moon.rise ?? 'n/a'} UTC, coucher: ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  return {
    core: summarizeCoreTripod(chart),
    bodies: summarizeMajorBodies(chart),
    aspects: summarizeAspects(chart),
    moonPhase: summarizeMoonPhase(chart),
    riseSet: summarizeRiseSet(chart)
  };
}
```

---

# 81. Intégration dans `js/domain/chartBuilder.js`

Ajouter l'import :

```javascript
import { buildChartSynthesis } from './synthesis.js';
```

Puis, avant le `return chart;`, ajouter :

```javascript
chart.synthesis = buildChartSynthesis(chart);
```

---

# 82. Nouveau rendu UI — `js/ui/renderSynthesis.js`

Créer ce fichier :

```javascript
function renderSection(title, items) {
  return `
    <div>
      <h3>${title}</h3>
      ${items.map(item => `<p>${item}</p>`).join('')}
    </div>
  `;
}

export function renderSynthesis(chart) {
  const el = document.getElementById('synthesis');
  const synthesis = chart.synthesis;

  if (!synthesis) {
    el.innerHTML = '<p>Synthèse indisponible.</p>';
    return;
  }

  el.innerHTML = `
    ${renderSection('Trépied central', synthesis.core)}
    ${renderSection('Corps principaux', synthesis.bodies)}
    ${renderSection('Aspects majeurs', synthesis.aspects)}
    ${renderSection('Phase lunaire', synthesis.moonPhase)}
    ${renderSection('Lever / coucher', synthesis.riseSet)}
  `;
}
```

---

# 83. Mise à jour de `index.html`

Ajouter un panneau :

```html
<section class="panel">
  <h2>Synthèse automatique</h2>
  <div id="synthesis"></div>
</section>
```

---

# 84. Mise à jour de `js/app.js`

Ajouter l'import :

```javascript
import { renderSynthesis } from './ui/renderSynthesis.js';
```

Puis dans `renderAll(chart)` :

```javascript
renderSynthesis(chart);
```

---

# 85. Harmonisation légère de `assets/styles.css`

Ajouter :

```css
#synthesis h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
}

#synthesis p {
  margin: 0.35rem 0;
}
```

---

# 86. Ce que cette première étape de Phase 2 apporte

Avec ce module, l'application commence à faire une vraie bascule :

- elle calcule toujours les données
- mais elle commence aussi à les raconter
- elle produit une vue d'ensemble utilisable
- elle prépare un futur moteur de rapport plus développé

Cette première synthèse reste volontairement simple, mais elle constitue une vraie couche métier.

---

# 87. Ce qui viendra ensuite dans la Phase 2

Une fois cette première synthèse installée, la suite la plus logique sera :

1. enrichir la synthèse du Soleil, de la Lune et de l’Ascendant
2. produire une synthèse par corps en signe et maison
3. hiérarchiser les aspects les plus structurants
4. produire une synthèse courte des transits filtrés

---

# 88. Patch Phase 2 — enrichir Soleil / Lune / Ascendant

L'objectif est maintenant de faire une première montée qualitative, sans encore tomber dans un texte trop lourd. On cherche une lecture :

- structurée
- sobre
- exploitable
- cohérente avec les positions

---

# 89. Remplacement conseillé de `js/domain/synthesis.js`

Remplacer le fichier par cette version enrichie :

```javascript
function formatPlacement(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function signTone(signName) {
  const map = {
    'Bélier': 'impulsion, démarrage, affirmation',
    'Taureau': 'stabilité, incarnation, continuité',
    'Gémeaux': 'curiosité, mouvement, mise en lien',
    'Cancer': 'sensibilité, intériorité, protection',
    'Lion': 'rayonnement, expression, centralité',
    'Vierge': 'tri, précision, mise en ordre',
    'Balance': 'relation, équilibre, ajustement',
    'Scorpion': 'intensité, profondeur, transformation',
    'Sagittaire': 'élan, sens, expansion',
    'Capricorne': 'structure, exigence, construction',
    'Verseau': 'vision, décalage, collectif',
    'Poissons': 'perméabilité, inspiration, dissolution'
  };

  return map[signName] ?? 'tonalité indéterminée';
}

function houseTone(house) {
  const map = {
    1: 'mise en avant de l’identité et de la manière d’entrer dans le monde',
    2: 'rapport aux ressources, à la matière et à la stabilité',
    3: 'expression, échanges, apprentissages et proximité',
    4: 'racines, intériorité, fondation et foyer',
    5: 'création, expression personnelle et rayonnement',
    6: 'organisation du quotidien, service et ajustement',
    7: 'relation directe à l’autre et dynamique de miroir',
    8: 'transformation, intensité, profondeur et passage',
    9: 'sens, vision, horizon et ouverture',
    10: 'visibilité, vocation, posture dans le monde',
    11: 'groupes, projets, réseaux et contribution',
    12: 'retrait, maturation intérieure et invisible'
  };

  return map[house] ?? 'champ d’expérience non précisé';
}

function buildSunMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';

  return `Le Soleil indique un axe d’expression centré sur ${signTone(sign)}, avec une mise en jeu particulière dans le domaine ${houseTone(house)}.`;
}

function buildMoonMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';

  return `La Lune met l’accent sur une vie intérieure liée à ${signTone(sign)}, vécue principalement à travers ${houseTone(house)}.`;
}

function buildAscMeaning(chart) {
  const asc = chart?.angles?.asc;
  const signIndex = Math.floor(((asc ?? 0) % 360) / 30);
  const signNames = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const sign = signNames[signIndex] ?? 'inconnu';

  return `L’Ascendant colore la manière d’entrer en relation avec le monde par une tonalité de ${signTone(sign)}.`;
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatPlacement('Soleil', chart.bodies.sun));
    lines.push(buildSunMeaning(chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatPlacement('Lune', chart.bodies.moon));
    lines.push(buildMoonMeaning(chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
    lines.push(buildAscMeaning(chart));
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatPlacement(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const aspects = (chart.aspects ?? []).slice(0, 8);

  if (!aspects.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return aspects.map(item =>
    `${item.bodyA} ${item.aspect} ${item.bodyB}, orbe ${item.orb.toFixed(2)}°.`
  );
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Phase lunaire : ${phase.label}.`,
    `Illumination : ${phase.illuminationPercent.toFixed(2)}%.`,
    `Âge lunaire : ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Soleil — lever: ${sun.rise ?? 'n/a'} UTC, coucher: ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune — lever: ${moon.rise ?? 'n/a'} UTC, coucher: ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  return {
    core: summarizeCoreTripod(chart),
    bodies: summarizeMajorBodies(chart),
    aspects: summarizeAspects(chart),
    moonPhase: summarizeMoonPhase(chart),
    riseSet: summarizeRiseSet(chart)
  };
}
```

---

# 90. Ce que ce patch change réellement

Avant, la synthèse disait surtout :

- où se trouvent les éléments
- dans quel signe
- dans quelle maison

Maintenant, elle commence aussi à dire :

- ce que cela colore
- dans quel registre cela s’exprime
- comment le trépied central s’oriente dans la carte

C’est une première vraie bascule qualitative.

---

# 91. Limite volontaire de cette étape

Cette couche reste encore volontairement mesurée. Elle ne cherche pas encore à :

- interpréter tout le thème en profondeur
- produire un texte long
- prendre des décisions symboliques trop fortes

Elle installe seulement une lecture de base plus humaine et plus utile.

---

# 92. Patch Phase 2 — enrichir les corps planétaires

L'objectif est maintenant d'ajouter une première lecture fonctionnelle de chaque planète, sans tomber dans un texte trop lourd. Chaque planète reçoit :

- sa position
- sa tonalité symbolique de base
- le champ de manifestation donné par la maison

---

# 93. Remplacement conseillé de `js/domain/synthesis.js`

Remplacer le fichier par cette version plus riche :

```javascript
function formatPlacement(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function signTone(signName) {
  const map = {
    'Bélier': 'impulsion, démarrage, affirmation',
    'Taureau': 'stabilité, incarnation, continuité',
    'Gémeaux': 'curiosité, mouvement, mise en lien',
    'Cancer': 'sensibilité, intériorité, protection',
    'Lion': 'rayonnement, expression, centralité',
    'Vierge': 'tri, précision, mise en ordre',
    'Balance': 'relation, équilibre, ajustement',
    'Scorpion': 'intensité, profondeur, transformation',
    'Sagittaire': 'élan, sens, expansion',
    'Capricorne': 'structure, exigence, construction',
    'Verseau': 'vision, décalage, collectif',
    'Poissons': 'perméabilité, inspiration, dissolution'
  };

  return map[signName] ?? 'tonalité indéterminée';
}

function houseTone(house) {
  const map = {
    1: 'mise en avant de l’identité et de la manière d’entrer dans le monde',
    2: 'rapport aux ressources, à la matière et à la stabilité',
    3: 'expression, échanges, apprentissages et proximité',
    4: 'racines, intériorité, fondation et foyer',
    5: 'création, expression personnelle et rayonnement',
    6: 'organisation du quotidien, service et ajustement',
    7: 'relation directe à l’autre et dynamique de miroir',
    8: 'transformation, intensité, profondeur et passage',
    9: 'sens, vision, horizon et ouverture',
    10: 'visibilité, vocation, posture dans le monde',
    11: 'groupes, projets, réseaux et contribution',
    12: 'retrait, maturation intérieure et invisible'
  };

  return map[house] ?? 'champ d’expérience non précisé';
}

function planetFunction(name) {
  const map = {
    'Mercury': 'la pensée, le langage, les liens et la manière de formuler',
    'Venus': 'la relation, l’accord, l’attirance et l’évaluation de ce qui a de la valeur',
    'Mars': 'l’élan, l’action, l’affirmation et la manière de mobiliser la force',
    'Jupiter': 'l’expansion, la confiance, le sens et la manière d’ouvrir l’horizon',
    'Saturn': 'la structure, la limite, l’exigence et la manière de construire dans le temps',
    'Uranus': 'la rupture, la nouveauté, le décalage et la poussée de libération',
    'Neptune': 'l’inspiration, la porosité, l’idéal et la dissolution des frontières'
  };

  return map[name] ?? 'une fonction non précisée';
}

function buildSunMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `Le Soleil indique un axe d’expression centré sur ${signTone(sign)}, avec une mise en jeu particulière dans le domaine ${houseTone(house)}.`;
}

function buildMoonMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `La Lune met l’accent sur une vie intérieure liée à ${signTone(sign)}, vécue principalement à travers ${houseTone(house)}.`;
}

function buildAscMeaning(chart) {
  const asc = chart?.angles?.asc;
  const signIndex = Math.floor(((asc ?? 0) % 360) / 30);
  const signNames = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const sign = signNames[signIndex] ?? 'inconnu';

  return `L’Ascendant colore la manière d’entrer en relation avec le monde par une tonalité de ${signTone(sign)}.`;
}

function buildPlanetMeaning(name, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `${name} montre comment ${planetFunction(name)} se déploie à travers ${signTone(sign)}, dans le champ ${houseTone(house)}.`;
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatPlacement('Soleil', chart.bodies.sun));
    lines.push(buildSunMeaning(chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatPlacement('Lune', chart.bodies.moon));
    lines.push(buildMoonMeaning(chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
    lines.push(buildAscMeaning(chart));
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatPlacement(key, body));
    result.push(buildPlanetMeaning(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const aspects = (chart.aspects ?? []).slice(0, 8);

  if (!aspects.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return aspects.map(item => `${item.bodyA} ${item.aspect} ${item.bodyB}, orbe ${item.orb.toFixed(2)}°.`);
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Phase lunaire : ${phase.label}.`,
    `Illumination : ${phase.illuminationPercent.toFixed(2)}%.`,
    `Âge lunaire : ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Soleil — lever: ${sun.rise ?? 'n/a'} UTC, coucher: ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune — lever: ${moon.rise ?? 'n/a'} UTC, coucher: ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  return {
    core: summarizeCoreTripod(chart),
    bodies: summarizeMajorBodies(chart),
    aspects: summarizeAspects(chart),
    moonPhase: summarizeMoonPhase(chart),
    riseSet: summarizeRiseSet(chart)
  };
}
```

---

# 94. Ce que cette étape ajoute réellement

Avant ce patch, les planètes étaient surtout listées. Maintenant, chacune commence à recevoir une fonction :

- Mercure n’est plus seulement “en signe / maison”, il devient une manière de penser et de formuler
- Vénus devient une manière de relier, de sentir la valeur, d’accorder
- Mars devient une manière d’agir et d’engager la force
- Jupiter devient une manière d’ouvrir le sens et l’horizon
- Saturne devient une manière de structurer et de construire
- Uranus devient une manière de rompre, d’innover, de décaler
- Neptune devient une manière de percevoir, d’inspirer, de dissoudre

Cette couche rend la lecture d’ensemble beaucoup plus vivante.

---

# 95. Limite volontaire de ce patch

Cette synthèse reste encore volontairement sobre. Elle ne cherche pas encore à :

- croiser finement les aspects et les planètes dans un même texte
- hiérarchiser les dominantes du thème
- produire une prose longue ou très personnalisée

Elle pose simplement une première lecture cohérente corps par corps.

---

# 96. Prochaine étape immédiate dans la Phase 2

La suite la plus juste est maintenant :

## hiérarchiser les aspects majeurs

Autrement dit : ne plus seulement les lister, mais commencer à signaler :

- lesquels sont les plus serrés
- lesquels structurent davantage le thème
- lesquels méritent d’être mis en avant dans la synthèse


---

# 97. Patch Phase 2 — hiérarchiser les aspects majeurs

L'objectif est maintenant de ne plus traiter tous les aspects comme équivalents. On veut faire ressortir :

- les aspects les plus serrés
- les aspects impliquant des points structurants
- les aspects les plus marquants pour la lecture d’ensemble

---

# 98. Remplacement conseillé de `js/domain/synthesis.js`

Remplacer le fichier par cette version enrichie sur la partie aspects :

```javascript
function formatPlacement(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function signTone(signName) {
  const map = {
    'Bélier': 'impulsion, démarrage, affirmation',
    'Taureau': 'stabilité, incarnation, continuité',
    'Gémeaux': 'curiosité, mouvement, mise en lien',
    'Cancer': 'sensibilité, intériorité, protection',
    'Lion': 'rayonnement, expression, centralité',
    'Vierge': 'tri, précision, mise en ordre',
    'Balance': 'relation, équilibre, ajustement',
    'Scorpion': 'intensité, profondeur, transformation',
    'Sagittaire': 'élan, sens, expansion',
    'Capricorne': 'structure, exigence, construction',
    'Verseau': 'vision, décalage, collectif',
    'Poissons': 'perméabilité, inspiration, dissolution'
  };

  return map[signName] ?? 'tonalité indéterminée';
}

function houseTone(house) {
  const map = {
    1: 'mise en avant de l’identité et de la manière d’entrer dans le monde',
    2: 'rapport aux ressources, à la matière et à la stabilité',
    3: 'expression, échanges, apprentissages et proximité',
    4: 'racines, intériorité, fondation et foyer',
    5: 'création, expression personnelle et rayonnement',
    6: 'organisation du quotidien, service et ajustement',
    7: 'relation directe à l’autre et dynamique de miroir',
    8: 'transformation, intensité, profondeur et passage',
    9: 'sens, vision, horizon et ouverture',
    10: 'visibilité, vocation, posture dans le monde',
    11: 'groupes, projets, réseaux et contribution',
    12: 'retrait, maturation intérieure et invisible'
  };

  return map[house] ?? 'champ d’expérience non précisé';
}

function planetFunction(name) {
  const map = {
    'Mercury': 'la pensée, le langage, les liens et la manière de formuler',
    'Venus': 'la relation, l’accord, l’attirance et l’évaluation de ce qui a de la valeur',
    'Mars': 'l’élan, l’action, l’affirmation et la manière de mobiliser la force',
    'Jupiter': 'l’expansion, la confiance, le sens et la manière d’ouvrir l’horizon',
    'Saturn': 'la structure, la limite, l’exigence et la manière de construire dans le temps',
    'Uranus': 'la rupture, la nouveauté, le décalage et la poussée de libération',
    'Neptune': 'l’inspiration, la porosité, l’idéal et la dissolution des frontières'
  };

  return map[name] ?? 'une fonction non précisée';
}

function aspectWeight(item) {
  const exactness = Math.max(0, 10 - item.orb * 2);
  const keyBodies = ['Soleil', 'Lune', 'Asc', 'MC'];
  const keyBonus = (keyBodies.includes(item.bodyA) ? 2 : 0) + (keyBodies.includes(item.bodyB) ? 2 : 0);
  const aspectBonus = item.aspect === 'conjonction' || item.aspect === 'opposition'
    ? 2
    : item.aspect === 'carré' || item.aspect === 'trigone'
      ? 1.5
      : 1;

  return exactness + keyBonus + aspectBonus;
}

function buildSunMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `Le Soleil indique un axe d’expression centré sur ${signTone(sign)}, avec une mise en jeu particulière dans le domaine ${houseTone(house)}.`;
}

function buildMoonMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `La Lune met l’accent sur une vie intérieure liée à ${signTone(sign)}, vécue principalement à travers ${houseTone(house)}.`;
}

function buildAscMeaning(chart) {
  const asc = chart?.angles?.asc;
  const signIndex = Math.floor(((asc ?? 0) % 360) / 30);
  const signNames = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const sign = signNames[signIndex] ?? 'inconnu';

  return `L’Ascendant colore la manière d’entrer en relation avec le monde par une tonalité de ${signTone(sign)}.`;
}

function buildPlanetMeaning(name, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `${name} montre comment ${planetFunction(name)} se déploie à travers ${signTone(sign)}, dans le champ ${houseTone(house)}.`;
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatPlacement('Soleil', chart.bodies.sun));
    lines.push(buildSunMeaning(chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatPlacement('Lune', chart.bodies.moon));
    lines.push(buildMoonMeaning(chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
    lines.push(buildAscMeaning(chart));
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatPlacement(key, body));
    result.push(buildPlanetMeaning(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const ranked = [...(chart.aspects ?? [])]
    .map(item => ({ ...item, weight: aspectWeight(item) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  if (!ranked.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return ranked.map(item => {
    const emphasis = item.orb <= 1.5
      ? 'Aspect très serré'
      : item.orb <= 3
        ? 'Aspect structurant'
        : 'Aspect notable';

    return `${emphasis} : ${item.bodyA} ${item.aspect} ${item.bodyB}, orbe ${item.orb.toFixed(2)}°.`;
  });
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Phase lunaire : ${phase.label}.`,
    `Illumination : ${phase.illuminationPercent.toFixed(2)}%.`,
    `Âge lunaire : ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Soleil — lever: ${sun.rise ?? 'n/a'} UTC, coucher: ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune — lever: ${moon.rise ?? 'n/a'} UTC, coucher: ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  return {
    core: summarizeCoreTripod(chart),
    bodies: summarizeMajorBodies(chart),
    aspects: summarizeAspects(chart),
    moonPhase: summarizeMoonPhase(chart),
    riseSet: summarizeRiseSet(chart)
  };
}
```

---

# 99. Ce que ce patch ajoute réellement

Avant, la section aspects listait surtout les premiers aspects rencontrés. Maintenant, elle commence à mettre en avant ceux qui structurent davantage la carte, selon trois critères simples :

- précision de l’orbe
- poids symbolique de l’aspect
- présence éventuelle de points structurants comme Soleil, Lune, Ascendant ou MC

La synthèse devient ainsi plus pertinente, car elle aide à voir ce qui ressort, au lieu d’égaliser tous les liens.

---

# 100. Limite volontaire de cette étape

Cette hiérarchisation reste encore volontairement simple. Elle ne prend pas encore en compte :

- dignités
- maîtrise des maisons
- dominantes du thème
- répétitions de motifs
- pondération plus avancée selon la nature des planètes

Mais elle fournit déjà une vraie première hiérarchie intelligible.

---

# 101. Prochaine étape immédiate dans la Phase 2

La suite la plus juste est maintenant :

## produire une synthèse courte des transits filtrés

Autrement dit : après la lecture du thème de base, commencer à faire émerger une lecture simple de la dynamique du moment, à partir des transits les plus significatifs.


---

# 102. Patch élargi Phase 2 — aller plus loin d’un coup

Puisque la suite doit aller plus loin que la seule synthèse courte des transits, ce patch ajoute simultanément :

- une synthèse des transits filtrés
- une lecture des dominantes du thème
- une synthèse plus structurée de l’ensemble

Le but est de commencer à faire émerger non seulement des positions et des aspects, mais aussi des **axes de lecture globaux**.

---

# 103. Remplacement conseillé de `js/domain/transits.js`

Cette version ajoute une synthèse simple des transits les plus significatifs.

```javascript
import { buildChart } from './chartBuilder.js';
import { getAllAspects } from '../astrology/aspects.js';

function extractTransitPoints(chart, prefix) {
  const points = [];

  if (chart.bodies?.sun) {
    points.push({ name: `${prefix} Soleil`, longitudeDeg: chart.bodies.sun.longitudeDeg, speedClass: 'medium' });
  }

  if (chart.bodies?.moon) {
    points.push({ name: `${prefix} Lune`, longitudeDeg: chart.bodies.moon.longitudeDeg, speedClass: 'fast' });
  }

  for (const [key, value] of Object.entries(chart.planets ?? {})) {
    const speedClass = ['Mercury', 'Venus', 'Mars'].includes(key)
      ? 'fast'
      : ['Jupiter', 'Saturn'].includes(key)
        ? 'medium'
        : 'slow';

    points.push({ name: `${prefix} ${key}`, longitudeDeg: value.longitudeDeg, speedClass });
  }

  if (chart.angles) {
    points.push({ name: `${prefix} Asc`, longitudeDeg: chart.angles.asc, speedClass: 'angle' });
    points.push({ name: `${prefix} MC`, longitudeDeg: chart.angles.mc, speedClass: 'angle' });
  }

  return points;
}

function groupImportance(aspect) {
  if (aspect.orb <= 1) return 'très fort';
  if (aspect.orb <= 3) return 'fort';
  if (aspect.orb <= 5) return 'modéré';
  return 'léger';
}

function isInterestingTransit(aspect, options) {
  const defaults = {
    maxOrb: 4,
    includeFast: true,
    includeAngles: true,
    includeMinorImportance: false
  };

  const config = { ...defaults, ...(options ?? {}) };

  if (aspect.orb > config.maxOrb) return false;
  if (!config.includeMinorImportance && groupImportance(aspect) === 'léger') return false;

  const involvesFast = /Transit (Lune|Mercury|Venus|Mars)/.test(aspect.bodyA);
  const involvesAngle = /(Natal|Transit) (Asc|MC)/.test(`${aspect.bodyA} ${aspect.bodyB}`);

  if (!config.includeFast && involvesFast) return false;
  if (!config.includeAngles && involvesAngle) return false;

  return true;
}

function buildTransitSynthesis(aspects) {
  if (!aspects.length) {
    return [
      'Aucun transit significatif ne ressort avec les filtres actuels.',
      'Le moment semble relativement calme ou les critères choisis sont volontairement serrés.'
    ];
  }

  const top = aspects.slice(0, 5);
  const slowCount = aspects.filter(item => item.transitSpeedClass === 'slow').length;
  const strongCount = aspects.filter(item => item.importance === 'très fort' || item.importance === 'fort').length;

  const lines = [];
  lines.push(`Le climat de transit actuel met en avant ${strongCount} aspect(s) fort(s) ou très fort(s).`);

  if (slowCount > 0) {
    lines.push(`Des planètes lentes participent au climat général, ce qui suggère des mouvements moins ponctuels et plus structurants.`);
  } else {
    lines.push(`Le climat semble surtout porté par des mouvements rapides ou intermédiaires.`);
  }

  lines.push(...top.map(item =>
    `${item.bodyA} ${item.aspect} ${item.bodyB} — orbe ${item.orb.toFixed(2)}°, intensité ${item.importance}.`
  ));

  return lines;
}

export function buildTransitComparison(natalInput, transitInput, options = {}) {
  const natalChart = buildChart(natalInput);
  const transitChart = buildChart(transitInput);

  const natalPoints = extractTransitPoints(natalChart, 'Natal');
  const transitPoints = extractTransitPoints(transitChart, 'Transit');

  const aspects = [];

  for (const transit of transitPoints) {
    for (const natal of natalPoints) {
      const found = getAllAspects([
        { name: transit.name, longitudeDeg: transit.longitudeDeg },
        { name: natal.name, longitudeDeg: natal.longitudeDeg }
      ]);

      if (found.length) {
        for (const aspect of found) {
          const enriched = {
            ...aspect,
            importance: groupImportance(aspect),
            transitSpeedClass: transit.speedClass,
            natalSpeedClass: natal.speedClass
          };

          if (isInterestingTransit(enriched, options)) {
            aspects.push(enriched);
          }
        }
      }
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);

  const summary = {
    total: aspects.length,
    tresFort: aspects.filter(a => a.importance === 'très fort').length,
    fort: aspects.filter(a => a.importance === 'fort').length,
    modere: aspects.filter(a => a.importance === 'modéré').length,
    leger: aspects.filter(a => a.importance === 'léger').length
  };

  return {
    natalChart,
    transitChart,
    aspects,
    summary,
    synthesis: buildTransitSynthesis(aspects)
  };
}
```

---

# 104. Remplacement conseillé de `js/ui/renderTransits.js`

Cette version affiche à la fois la synthèse et la liste détaillée :

```javascript
function importanceBadge(value) {
  switch (value) {
    case 'très fort': return '🔥';
    case 'fort': return '✨';
    case 'modéré': return '•';
    default: return '·';
  }
}

export function renderTransits(result) {
  const el = document.getElementById('transits');

  if (!result || !result.aspects?.length) {
    el.innerHTML = '<p>Aucun transit significatif détecté avec les filtres actuels.</p>';
    return;
  }

  const summary = result.summary;

  el.innerHTML = `
    <div>
      <h3>Synthèse des transits</h3>
      ${(result.synthesis ?? []).map(item => `<p>${item}</p>`).join('')}
    </div>
    <div>
      <h3>Répartition</h3>
      <p><strong>Total :</strong> ${summary.total}</p>
      <p><strong>Très forts :</strong> ${summary.tresFort} | <strong>Forts :</strong> ${summary.fort} | <strong>Modérés :</strong> ${summary.modere}</p>
    </div>
    <div>
      <h3>Détail</h3>
      ${result.aspects.map(item => `
        <p>
          ${importanceBadge(item.importance)}
          <strong>${item.bodyA}</strong>
          ${item.aspect}
          <strong>${item.bodyB}</strong>
          — orbe: ${item.orb.toFixed(2)}°
          — intensité: ${item.importance}
        </p>
      `).join('')}
    </div>
  `;
}
```

---

# 105. Remplacement conseillé de `js/domain/synthesis.js`

Cette version ajoute une lecture des dominantes de signe et de maison en plus de la synthèse existante.

```javascript
function formatPlacement(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function signTone(signName) {
  const map = {
    'Bélier': 'impulsion, démarrage, affirmation',
    'Taureau': 'stabilité, incarnation, continuité',
    'Gémeaux': 'curiosité, mouvement, mise en lien',
    'Cancer': 'sensibilité, intériorité, protection',
    'Lion': 'rayonnement, expression, centralité',
    'Vierge': 'tri, précision, mise en ordre',
    'Balance': 'relation, équilibre, ajustement',
    'Scorpion': 'intensité, profondeur, transformation',
    'Sagittaire': 'élan, sens, expansion',
    'Capricorne': 'structure, exigence, construction',
    'Verseau': 'vision, décalage, collectif',
    'Poissons': 'perméabilité, inspiration, dissolution'
  };

  return map[signName] ?? 'tonalité indéterminée';
}

function houseTone(house) {
  const map = {
    1: 'mise en avant de l’identité et de la manière d’entrer dans le monde',
    2: 'rapport aux ressources, à la matière et à la stabilité',
    3: 'expression, échanges, apprentissages et proximité',
    4: 'racines, intériorité, fondation et foyer',
    5: 'création, expression personnelle et rayonnement',
    6: 'organisation du quotidien, service et ajustement',
    7: 'relation directe à l’autre et dynamique de miroir',
    8: 'transformation, intensité, profondeur et passage',
    9: 'sens, vision, horizon et ouverture',
    10: 'visibilité, vocation, posture dans le monde',
    11: 'groupes, projets, réseaux et contribution',
    12: 'retrait, maturation intérieure et invisible'
  };

  return map[house] ?? 'champ d’expérience non précisé';
}

function planetFunction(name) {
  const map = {
    'Mercury': 'la pensée, le langage, les liens et la manière de formuler',
    'Venus': 'la relation, l’accord, l’attirance et l’évaluation de ce qui a de la valeur',
    'Mars': 'l’élan, l’action, l’affirmation et la manière de mobiliser la force',
    'Jupiter': 'l’expansion, la confiance, le sens et la manière d’ouvrir l’horizon',
    'Saturn': 'la structure, la limite, l’exigence et la manière de construire dans le temps',
    'Uranus': 'la rupture, la nouveauté, le décalage et la poussée de libération',
    'Neptune': 'l’inspiration, la porosité, l’idéal et la dissolution des frontières'
  };

  return map[name] ?? 'une fonction non précisée';
}

function aspectWeight(item) {
  const exactness = Math.max(0, 10 - item.orb * 2);
  const keyBodies = ['Soleil', 'Lune', 'Asc', 'MC'];
  const keyBonus = (keyBodies.includes(item.bodyA) ? 2 : 0) + (keyBodies.includes(item.bodyB) ? 2 : 0);
  const aspectBonus = item.aspect === 'conjonction' || item.aspect === 'opposition'
    ? 2
    : item.aspect === 'carré' || item.aspect === 'trigone'
      ? 1.5
      : 1;

  return exactness + keyBonus + aspectBonus;
}

function countDominants(chart) {
  const signCounts = new Map();
  const houseCounts = new Map();

  const allBodies = [chart.bodies?.sun, chart.bodies?.moon, ...Object.values(chart.planets ?? {})].filter(Boolean);

  for (const body of allBodies) {
    const sign = body?.tropical?.name;
    const house = body?.house;

    if (sign) signCounts.set(sign, (signCounts.get(sign) ?? 0) + 1);
    if (house != null) houseCounts.set(house, (houseCounts.get(house) ?? 0) + 1);
  }

  const topSigns = [...signCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topHouses = [...houseCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return { topSigns, topHouses };
}

function summarizeDominants(chart) {
  const { topSigns, topHouses } = countDominants(chart);
  const lines = [];

  if (topSigns.length) {
    lines.push(`Dominantes de signe : ${topSigns.map(([name, count]) => `${name} (${count})`).join(', ')}.`);
  }

  if (topHouses.length) {
    lines.push(`Dominantes de maison : ${topHouses.map(([name, count]) => `maison ${name} (${count})`).join(', ')}.`);
  }

  return lines;
}

function buildSunMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `Le Soleil indique un axe d’expression centré sur ${signTone(sign)}, avec une mise en jeu particulière dans le domaine ${houseTone(house)}.`;
}

function buildMoonMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `La Lune met l’accent sur une vie intérieure liée à ${signTone(sign)}, vécue principalement à travers ${houseTone(house)}.`;
}

function buildAscMeaning(chart) {
  const asc = chart?.angles?.asc;
  const signIndex = Math.floor(((asc ?? 0) % 360) / 30);
  const signNames = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const sign = signNames[signIndex] ?? 'inconnu';

  return `L’Ascendant colore la manière d’entrer en relation avec le monde par une tonalité de ${signTone(sign)}.`;
}

function buildPlanetMeaning(name, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `${name} montre comment ${planetFunction(name)} se déploie à travers ${signTone(sign)}, dans le champ ${houseTone(house)}.`;
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatPlacement('Soleil', chart.bodies.sun));
    lines.push(buildSunMeaning(chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatPlacement('Lune', chart.bodies.moon));
    lines.push(buildMoonMeaning(chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
    lines.push(buildAscMeaning(chart));
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatPlacement(key, body));
    result.push(buildPlanetMeaning(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const ranked = [...(chart.aspects ?? [])]
    .map(item => ({ ...item, weight: aspectWeight(item) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  if (!ranked.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return ranked.map(item => {
    const emphasis = item.orb <= 1.5
      ? 'Aspect très serré'
      : item.orb <= 3
        ? 'Aspect structurant'
        : 'Aspect notable';

    return `${emphasis} : ${item.bodyA} ${item.aspect} ${item.bodyB}, orbe ${item.orb.toFixed(2)}°.`;
  });
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Phase lunaire : ${phase.label}.`,
    `Illumination : ${phase.illuminationPercent.toFixed(2)}%.`,
    `Âge lunaire : ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Soleil — lever: ${sun.rise ?? 'n/a'} UTC, coucher: ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune — lever: ${moon.rise ?? 'n/a'} UTC, coucher: ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  return {
    core: summarizeCoreTripod(chart),
    dominants: summarizeDominants(chart),
    bodies: summarizeMajorBodies(chart),
    aspects: summarizeAspects(chart),
    moonPhase: summarizeMoonPhase(chart),
    riseSet: summarizeRiseSet(chart)
  };
}
```

---

# 106. Mise à jour de `js/ui/renderSynthesis.js`

Ajouter la nouvelle section `dominants` :

```javascript
function renderSection(title, items) {
  if (!items?.length) return '';

  return `
    <div>
      <h3>${title}</h3>
      ${items.map(item => `<p>${item}</p>`).join('')}
    </div>
  `;
}

export function renderSynthesis(chart) {
  const el = document.getElementById('synthesis');
  const synthesis = chart.synthesis;

  if (!synthesis) {
    el.innerHTML = '<p>Synthèse indisponible.</p>';
    return;
  }

  el.innerHTML = `
    ${renderSection('Trépied central', synthesis.core)}
    ${renderSection('Dominantes', synthesis.dominants)}
    ${renderSection('Corps principaux', synthesis.bodies)}
    ${renderSection('Aspects majeurs', synthesis.aspects)}
    ${renderSection('Phase lunaire', synthesis.moonPhase)}
    ${renderSection('Lever / coucher', synthesis.riseSet)}
  `;
}
```

---

# 107. Ce que ce patch change réellement

À partir de maintenant, la lecture ne dit plus seulement :

- où sont les corps
- quels aspects existent
- quels transits sortent du lot

Elle commence aussi à faire émerger :

- quelles tonalités de signe reviennent le plus
- quels champs de maison sont les plus occupés
- quel climat de transit domine le moment

On entre donc vraiment dans une lecture de motifs, et non plus seulement d’éléments séparés.

---

# 108. Prochaine étape immédiate

La suite la plus juste est maintenant :

## produire une synthèse finale courte du thème

C’est-à-dire une petite conclusion automatique qui rassemble :

- le trépied central
- les dominantes
- les aspects structurants
- et, si présent, le climat de transit

Cette étape donnerait au projet sa première vraie sortie de type “lecture condensée”.


---

# 109. Patch Phase 2 — synthèse finale courte du thème

Cette étape vise à produire une **lecture condensée**, c’est-à-dire un petit texte de sortie qui rassemble le plus important sans noyer l’utilisateur sous les détails.

---

# 110. Remplacement conseillé de `js/domain/synthesis.js`

Ajouter une fonction de conclusion courte, puis l’inclure dans la synthèse globale.

```javascript
function formatPlacement(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function signTone(signName) {
  const map = {
    'Bélier': 'impulsion, démarrage, affirmation',
    'Taureau': 'stabilité, incarnation, continuité',
    'Gémeaux': 'curiosité, mouvement, mise en lien',
    'Cancer': 'sensibilité, intériorité, protection',
    'Lion': 'rayonnement, expression, centralité',
    'Vierge': 'tri, précision, mise en ordre',
    'Balance': 'relation, équilibre, ajustement',
    'Scorpion': 'intensité, profondeur, transformation',
    'Sagittaire': 'élan, sens, expansion',
    'Capricorne': 'structure, exigence, construction',
    'Verseau': 'vision, décalage, collectif',
    'Poissons': 'perméabilité, inspiration, dissolution'
  };

  return map[signName] ?? 'tonalité indéterminée';
}

function houseTone(house) {
  const map = {
    1: 'mise en avant de l’identité et de la manière d’entrer dans le monde',
    2: 'rapport aux ressources, à la matière et à la stabilité',
    3: 'expression, échanges, apprentissages et proximité',
    4: 'racines, intériorité, fondation et foyer',
    5: 'création, expression personnelle et rayonnement',
    6: 'organisation du quotidien, service et ajustement',
    7: 'relation directe à l’autre et dynamique de miroir',
    8: 'transformation, intensité, profondeur et passage',
    9: 'sens, vision, horizon et ouverture',
    10: 'visibilité, vocation, posture dans le monde',
    11: 'groupes, projets, réseaux et contribution',
    12: 'retrait, maturation intérieure et invisible'
  };

  return map[house] ?? 'champ d’expérience non précisé';
}

function planetFunction(name) {
  const map = {
    'Mercury': 'la pensée, le langage, les liens et la manière de formuler',
    'Venus': 'la relation, l’accord, l’attirance et l’évaluation de ce qui a de la valeur',
    'Mars': 'l’élan, l’action, l’affirmation et la manière de mobiliser la force',
    'Jupiter': 'l’expansion, la confiance, le sens et la manière d’ouvrir l’horizon',
    'Saturn': 'la structure, la limite, l’exigence et la manière de construire dans le temps',
    'Uranus': 'la rupture, la nouveauté, le décalage et la poussée de libération',
    'Neptune': 'l’inspiration, la porosité, l’idéal et la dissolution des frontières'
  };

  return map[name] ?? 'une fonction non précisée';
}

function aspectWeight(item) {
  const exactness = Math.max(0, 10 - item.orb * 2);
  const keyBodies = ['Soleil', 'Lune', 'Asc', 'MC'];
  const keyBonus = (keyBodies.includes(item.bodyA) ? 2 : 0) + (keyBodies.includes(item.bodyB) ? 2 : 0);
  const aspectBonus = item.aspect === 'conjonction' || item.aspect === 'opposition'
    ? 2
    : item.aspect === 'carré' || item.aspect === 'trigone'
      ? 1.5
      : 1;

  return exactness + keyBonus + aspectBonus;
}

function countDominants(chart) {
  const signCounts = new Map();
  const houseCounts = new Map();
  const allBodies = [chart.bodies?.sun, chart.bodies?.moon, ...Object.values(chart.planets ?? {})].filter(Boolean);

  for (const body of allBodies) {
    const sign = body?.tropical?.name;
    const house = body?.house;
    if (sign) signCounts.set(sign, (signCounts.get(sign) ?? 0) + 1);
    if (house != null) houseCounts.set(house, (houseCounts.get(house) ?? 0) + 1);
  }

  const topSigns = [...signCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topHouses = [...houseCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return { topSigns, topHouses };
}

function summarizeDominants(chart) {
  const { topSigns, topHouses } = countDominants(chart);
  const lines = [];

  if (topSigns.length) {
    lines.push(`Dominantes de signe : ${topSigns.map(([name, count]) => `${name} (${count})`).join(', ')}.`);
  }

  if (topHouses.length) {
    lines.push(`Dominantes de maison : ${topHouses.map(([name, count]) => `maison ${name} (${count})`).join(', ')}.`);
  }

  return lines;
}

function buildSunMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `Le Soleil indique un axe d’expression centré sur ${signTone(sign)}, avec une mise en jeu particulière dans le domaine ${houseTone(house)}.`;
}

function buildMoonMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `La Lune met l’accent sur une vie intérieure liée à ${signTone(sign)}, vécue principalement à travers ${houseTone(house)}.`;
}

function buildAscMeaning(chart) {
  const asc = chart?.angles?.asc;
  const signIndex = Math.floor(((asc ?? 0) % 360) / 30);
  const signNames = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const sign = signNames[signIndex] ?? 'inconnu';
  return `L’Ascendant colore la manière d’entrer en relation avec le monde par une tonalité de ${signTone(sign)}.`;
}

function buildPlanetMeaning(name, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `${name} montre comment ${planetFunction(name)} se déploie à travers ${signTone(sign)}, dans le champ ${houseTone(house)}.`;
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatPlacement('Soleil', chart.bodies.sun));
    lines.push(buildSunMeaning(chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatPlacement('Lune', chart.bodies.moon));
    lines.push(buildMoonMeaning(chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
    lines.push(buildAscMeaning(chart));
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatPlacement(key, body));
    result.push(buildPlanetMeaning(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const ranked = [...(chart.aspects ?? [])]
    .map(item => ({ ...item, weight: aspectWeight(item) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  if (!ranked.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return ranked.map(item => {
    const emphasis = item.orb <= 1.5
      ? 'Aspect très serré'
      : item.orb <= 3
        ? 'Aspect structurant'
        : 'Aspect notable';

    return `${emphasis} : ${item.bodyA} ${item.aspect} ${item.bodyB}, orbe ${item.orb.toFixed(2)}°.`;
  });
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Phase lunaire : ${phase.label}.`,
    `Illumination : ${phase.illuminationPercent.toFixed(2)}%.`,
    `Âge lunaire : ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Soleil — lever: ${sun.rise ?? 'n/a'} UTC, coucher: ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune — lever: ${moon.rise ?? 'n/a'} UTC, coucher: ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

function buildShortConclusion(chart) {
  const dominants = countDominants(chart);
  const topSign = dominants.topSigns[0]?.[0];
  const topHouse = dominants.topHouses[0]?.[0];
  const rankedAspect = [...(chart.aspects ?? [])]
    .map(item => ({ ...item, weight: aspectWeight(item) }))
    .sort((a, b) => b.weight - a.weight)[0];

  const lines = [];

  if (topSign) {
    lines.push(`Le thème met d’abord en avant une tonalité dominante de ${topSign}.`);
  }

  if (topHouse != null) {
    lines.push(`Le champ d’expérience le plus chargé semble être la maison ${topHouse}.`);
  }

  if (rankedAspect) {
    lines.push(`L’aspect qui ressort le plus dans la structure générale est ${rankedAspect.bodyA} ${rankedAspect.aspect} ${rankedAspect.bodyB}.`);
  }

  if (chart.moonPhase?.label) {
    lines.push(`Le climat Soleil-Lune actuel s’inscrit dans une ${chart.moonPhase.label.toLowerCase()}.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  return {
    conclusion: buildShortConclusion(chart),
    core: summarizeCoreTripod(chart),
    dominants: summarizeDominants(chart),
    bodies: summarizeMajorBodies(chart),
    aspects: summarizeAspects(chart),
    moonPhase: summarizeMoonPhase(chart),
    riseSet: summarizeRiseSet(chart)
  };
}
```

---

# 111. Mise à jour de `js/ui/renderSynthesis.js`

Ajouter la conclusion au début :

```javascript
function renderSection(title, items) {
  if (!items?.length) return '';

  return `
    <div>
      <h3>${title}</h3>
      ${items.map(item => `<p>${item}</p>`).join('')}
    </div>
  `;
}

export function renderSynthesis(chart) {
  const el = document.getElementById('synthesis');
  const synthesis = chart.synthesis;

  if (!synthesis) {
    el.innerHTML = '<p>Synthèse indisponible.</p>';
    return;
  }

  el.innerHTML = `
    ${renderSection('Lecture condensée', synthesis.conclusion)}
    ${renderSection('Trépied central', synthesis.core)}
    ${renderSection('Dominantes', synthesis.dominants)}
    ${renderSection('Corps principaux', synthesis.bodies)}
    ${renderSection('Aspects majeurs', synthesis.aspects)}
    ${renderSection('Phase lunaire', synthesis.moonPhase)}
    ${renderSection('Lever / coucher', synthesis.riseSet)}
  `;
}
```

---

# 112. Ce que cette étape apporte

Avec cette conclusion courte, l’application commence enfin à produire une vraie sortie de type lecture condensée. Cela veut dire qu’elle peut maintenant :

- résumer une tonalité générale
- faire émerger un champ dominant
- mettre en avant un lien structurant
- condenser le climat Soleil-Lune

Cette sortie n’est pas encore un rapport riche, mais elle constitue une vraie première lecture globale.

---

# 113. Ce qu’il restera encore à faire dans la Phase 2

Voici maintenant la vue claire de ce qui restera à faire dans la Phase 2 après ce patch :

## A. Raffiner la qualité de la synthèse

- améliorer la qualité rédactionnelle des phrases
- éviter les répétitions entre sections
- mieux fusionner signe + maison + aspect dans un même texte
- faire varier davantage les formulations

## B. Mieux hiérarchiser les éléments du thème

- pondérer plus finement les planètes
- pondérer plus finement les angles
- repérer des dominantes plus crédibles que le simple comptage
- détecter des regroupements significatifs

## C. Enrichir la lecture des aspects

- mieux distinguer les aspects structurants des aspects secondaires
- croiser les aspects avec la nature des planètes impliquées
- produire une mini-lecture de tension / soutien / axe dominant

## D. Enrichir la lecture des transits

- synthèse plus qualitative des transits forts
- meilleure distinction entre transits rapides et lents
- meilleure hiérarchisation du “climat du moment”
- formuler des résumés plus lisibles que la liste actuelle

## E. Construire une vraie synthèse finale cohérente

- fusionner trépied, dominantes, aspects et climat du moment dans une conclusion plus unifiée
- produire une version courte, moyenne et longue
- préparer une future exportation type rapport

## F. Préparer les extensions de lecture avancée

- synthèse par corps détaillée
- synthèse par maison
- synthèse par axe de maisons
- synthèse comparative natal / transit plus profonde

---

# 114. Prochaine étape la plus juste

La prochaine étape la plus utile, maintenant, serait :

## améliorer la qualité et la cohérence rédactionnelle de la synthèse

Pourquoi ? Parce que la structure est déjà là. Le prochain vrai gain ne vient plus d’ajouter une nouvelle section, mais de rendre la lecture plus fluide, moins répétitive et plus naturelle.


---

# 115. Patch Phase 2 — améliorer la qualité rédactionnelle de la synthèse

L’objectif ici n’est plus d’ajouter une nouvelle couche d’information, mais de **mieux écrire** ce qui existe déjà.

On cherche à obtenir une synthèse :

- moins répétitive
- plus fluide
- plus nuancée
- plus agréable à lire

---

# 116. Remplacement conseillé de `js/domain/synthesis.js`

Cette version garde la même structure globale, mais améliore la forme :

- variations de formulations
- fusion plus naturelle entre signe et maison
- meilleure transition entre les idées
- conclusion plus fluide

```javascript
function formatPlacement(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function signTone(signName) {
  const map = {
    'Bélier': 'l’impulsion, le démarrage et l’affirmation',
    'Taureau': 'la stabilité, l’incarnation et la continuité',
    'Gémeaux': 'la curiosité, le mouvement et la mise en lien',
    'Cancer': 'la sensibilité, l’intériorité et la protection',
    'Lion': 'le rayonnement, l’expression et la centralité',
    'Vierge': 'le tri, la précision et la mise en ordre',
    'Balance': 'la relation, l’équilibre et l’ajustement',
    'Scorpion': 'l’intensité, la profondeur et la transformation',
    'Sagittaire': 'l’élan, le sens et l’expansion',
    'Capricorne': 'la structure, l’exigence et la construction',
    'Verseau': 'la vision, le décalage et le collectif',
    'Poissons': 'la perméabilité, l’inspiration et la dissolution'
  };

  return map[signName] ?? 'une tonalité difficile à préciser';
}

function houseTone(house) {
  const map = {
    1: 'l’identité et la manière d’entrer dans le monde',
    2: 'les ressources, la matière et la stabilité',
    3: 'l’expression, les échanges et les apprentissages',
    4: 'les racines, l’intériorité et la fondation',
    5: 'la création, l’expression personnelle et le rayonnement',
    6: 'l’organisation du quotidien, le service et l’ajustement',
    7: 'la relation directe à l’autre et le jeu du miroir',
    8: 'la transformation, l’intensité et les passages profonds',
    9: 'le sens, la vision et l’ouverture',
    10: 'la visibilité, la vocation et la posture dans le monde',
    11: 'les groupes, les projets et la contribution',
    12: 'le retrait, la maturation intérieure et l’invisible'
  };

  return map[house] ?? 'un champ d’expérience encore flou';
}

function planetFunction(name) {
  const map = {
    'Mercury': 'la pensée, le langage et la manière de relier',
    'Venus': 'la relation, l’accord et le sens de la valeur',
    'Mars': 'l’élan, l’action et la mobilisation de la force',
    'Jupiter': 'l’expansion, la confiance et l’ouverture du sens',
    'Saturn': 'la structure, la limite et la construction dans le temps',
    'Uranus': 'la rupture, la nouveauté et la poussée de libération',
    'Neptune': 'l’inspiration, la porosité et la dissolution des frontières'
  };

  return map[name] ?? 'une fonction encore non précisée';
}

function aspectWeight(item) {
  const exactness = Math.max(0, 10 - item.orb * 2);
  const keyBodies = ['Soleil', 'Lune', 'Asc', 'MC'];
  const keyBonus = (keyBodies.includes(item.bodyA) ? 2 : 0) + (keyBodies.includes(item.bodyB) ? 2 : 0);
  const aspectBonus = item.aspect === 'conjonction' || item.aspect === 'opposition'
    ? 2
    : item.aspect === 'carré' || item.aspect === 'trigone'
      ? 1.5
      : 1;

  return exactness + keyBonus + aspectBonus;
}

function countDominants(chart) {
  const signCounts = new Map();
  const houseCounts = new Map();
  const allBodies = [chart.bodies?.sun, chart.bodies?.moon, ...Object.values(chart.planets ?? {})].filter(Boolean);

  for (const body of allBodies) {
    const sign = body?.tropical?.name;
    const house = body?.house;
    if (sign) signCounts.set(sign, (signCounts.get(sign) ?? 0) + 1);
    if (house != null) houseCounts.set(house, (houseCounts.get(house) ?? 0) + 1);
  }

  const topSigns = [...signCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topHouses = [...houseCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return { topSigns, topHouses };
}

function summarizeDominants(chart) {
  const { topSigns, topHouses } = countDominants(chart);
  const lines = [];

  if (topSigns.length) {
    lines.push(`Les signes les plus présents sont ${topSigns.map(([name, count]) => `${name} (${count})`).join(', ')}.`);
  }

  if (topHouses.length) {
    lines.push(`Les maisons les plus activées sont ${topHouses.map(([name, count]) => `la maison ${name} (${count})`).join(', ')}.`);
  }

  return lines;
}

function buildSunMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `Le Soleil met au premier plan ${signTone(sign)}, avec une expression qui se déploie particulièrement dans le champ de ${houseTone(house)}.`;
}

function buildMoonMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `La Lune colore la vie intérieure par ${signTone(sign)}, et cette sensibilité se vit surtout dans le registre de ${houseTone(house)}.`;
}

function buildAscMeaning(chart) {
  const asc = chart?.angles?.asc;
  const signIndex = Math.floor(((asc ?? 0) % 360) / 30);
  const signNames = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const sign = signNames[signIndex] ?? 'inconnu';

  return `L’Ascendant donne à l’entrée dans le monde une tonalité marquée par ${signTone(sign)}.`;
}

function buildPlanetMeaning(name, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `${name} exprime ${planetFunction(name)} à travers ${signTone(sign)}, dans le domaine de ${houseTone(house)}.`;
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatPlacement('Soleil', chart.bodies.sun));
    lines.push(buildSunMeaning(chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatPlacement('Lune', chart.bodies.moon));
    lines.push(buildMoonMeaning(chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
    lines.push(buildAscMeaning(chart));
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatPlacement(key, body));
    result.push(buildPlanetMeaning(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const ranked = [...(chart.aspects ?? [])]
    .map(item => ({ ...item, weight: aspectWeight(item) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  if (!ranked.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return ranked.map(item => {
    const emphasis = item.orb <= 1.5
      ? 'Un aspect très serré ressort'
      : item.orb <= 3
        ? 'Un aspect structurant apparaît nettement'
        : 'Un aspect notable se dégage';

    return `${emphasis} : ${item.bodyA} ${item.aspect} ${item.bodyB}, avec un orbe de ${item.orb.toFixed(2)}°.`;
  });
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Le cycle Soleil-Lune s’inscrit actuellement dans une ${phase.label.toLowerCase()}.`,
    `L’illumination est de ${phase.illuminationPercent.toFixed(2)}%.`,
    `L’âge lunaire est d’environ ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Le Soleil se lève à ${sun.rise ?? 'n/a'} UTC et se couche à ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`La Lune se lève à ${moon.rise ?? 'n/a'} UTC et se couche à ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

function buildShortConclusion(chart) {
  const dominants = countDominants(chart);
  const topSign = dominants.topSigns[0]?.[0];
  const topHouse = dominants.topHouses[0]?.[0];
  const rankedAspect = [...(chart.aspects ?? [])]
    .map(item => ({ ...item, weight: aspectWeight(item) }))
    .sort((a, b) => b.weight - a.weight)[0];

  const lines = [];

  if (topSign) {
    lines.push(`Dans l’ensemble, le thème semble fortement coloré par ${topSign}.`);
  }

  if (topHouse != null) {
    lines.push(`Le champ le plus activé paraît être la maison ${topHouse}.`);
  }

  if (rankedAspect) {
    lines.push(`Le lien le plus structurant de la carte semble être ${rankedAspect.bodyA} ${rankedAspect.aspect} ${rankedAspect.bodyB}.`);
  }

  if (chart.moonPhase?.label) {
    lines.push(`Le climat Soleil-Lune se déploie dans une ${chart.moonPhase.label.toLowerCase()}.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  return {
    conclusion: buildShortConclusion(chart),
    core: summarizeCoreTripod(chart),
    dominants: summarizeDominants(chart),
    bodies: summarizeMajorBodies(chart),
    aspects: summarizeAspects(chart),
    moonPhase: summarizeMoonPhase(chart),
    riseSet: summarizeRiseSet(chart)
  };
}
```

---

# 117. Ce que cette étape change réellement

Après ce patch, le gain ne vient plus d’une nouvelle catégorie d’informations, mais du fait que la lecture devient :

- plus douce
- plus cohérente
- moins mécanique
- plus proche d’un vrai texte de synthèse

Autrement dit, le moteur commence à mieux restituer, pas seulement à mieux calculer.

---

# 118. Prochaine étape utile après ce patch

Une fois cette amélioration rédactionnelle posée, la suite la plus juste serait :

## mieux fusionner thème natal et climat de transit dans une même lecture

C’est probablement l’étape qui donnerait le plus de valeur supplémentaire à la Phase 2.


---

# 119. Patch Phase 2 — fusionner thème natal et climat de transit

L’objectif ici est de ne plus avoir seulement :

- une synthèse du thème natal
- une synthèse des transits

mais une **lecture de croisement**, capable de dire comment le climat du moment vient toucher la structure de base.

---

# 120. Mise à jour de `js/domain/transits.js`

Ajouter une conclusion unifiée en fin de calcul.

```javascript
import { buildChart } from './chartBuilder.js';
import { getAllAspects } from '../astrology/aspects.js';

function extractTransitPoints(chart, prefix) {
  const points = [];

  if (chart.bodies?.sun) {
    points.push({ name: `${prefix} Soleil`, longitudeDeg: chart.bodies.sun.longitudeDeg, speedClass: 'medium' });
  }

  if (chart.bodies?.moon) {
    points.push({ name: `${prefix} Lune`, longitudeDeg: chart.bodies.moon.longitudeDeg, speedClass: 'fast' });
  }

  for (const [key, value] of Object.entries(chart.planets ?? {})) {
    const speedClass = ['Mercury', 'Venus', 'Mars'].includes(key)
      ? 'fast'
      : ['Jupiter', 'Saturn'].includes(key)
        ? 'medium'
        : 'slow';

    points.push({ name: `${prefix} ${key}`, longitudeDeg: value.longitudeDeg, speedClass });
  }

  if (chart.angles) {
    points.push({ name: `${prefix} Asc`, longitudeDeg: chart.angles.asc, speedClass: 'angle' });
    points.push({ name: `${prefix} MC`, longitudeDeg: chart.angles.mc, speedClass: 'angle' });
  }

  return points;
}

function groupImportance(aspect) {
  if (aspect.orb <= 1) return 'très fort';
  if (aspect.orb <= 3) return 'fort';
  if (aspect.orb <= 5) return 'modéré';
  return 'léger';
}

function isInterestingTransit(aspect, options) {
  const defaults = {
    maxOrb: 4,
    includeFast: true,
    includeAngles: true,
    includeMinorImportance: false
  };

  const config = { ...defaults, ...(options ?? {}) };

  if (aspect.orb > config.maxOrb) return false;
  if (!config.includeMinorImportance && groupImportance(aspect) === 'léger') return false;

  const involvesFast = /Transit (Lune|Mercury|Venus|Mars)/.test(aspect.bodyA);
  const involvesAngle = /(Natal|Transit) (Asc|MC)/.test(`${aspect.bodyA} ${aspect.bodyB}`);

  if (!config.includeFast && involvesFast) return false;
  if (!config.includeAngles && involvesAngle) return false;

  return true;
}

function buildTransitSynthesis(aspects) {
  if (!aspects.length) {
    return [
      'Aucun transit significatif ne ressort avec les filtres actuels.',
      'Le moment semble relativement calme ou les critères choisis sont volontairement serrés.'
    ];
  }

  const top = aspects.slice(0, 5);
  const slowCount = aspects.filter(item => item.transitSpeedClass === 'slow').length;
  const strongCount = aspects.filter(item => item.importance === 'très fort' || item.importance === 'fort').length;

  const lines = [];
  lines.push(`Le climat de transit actuel met en avant ${strongCount} aspect(s) fort(s) ou très fort(s).`);

  if (slowCount > 0) {
    lines.push(`Des planètes lentes participent au climat général, ce qui suggère des mouvements moins ponctuels et plus structurants.`);
  } else {
    lines.push(`Le climat semble surtout porté par des mouvements rapides ou intermédiaires.`);
  }

  lines.push(...top.map(item =>
    `${item.bodyA} ${item.aspect} ${item.bodyB} — orbe ${item.orb.toFixed(2)}°, intensité ${item.importance}.`
  ));

  return lines;
}

function buildIntegratedTransitReading(natalChart, aspects) {
  if (!aspects.length) {
    return [
      'Le thème natal n’est pas particulièrement sollicité par les transits retenus.',
      'Le moment peut être vécu comme plus neutre, ou comme une phase d’intégration discrète.'
    ];
  }

  const strongest = aspects[0];
  const lines = [];

  lines.push(`Le climat du moment vient toucher en priorité ${strongest.bodyB.toLowerCase()}, à travers ${strongest.bodyA.toLowerCase()}.`);

  const slowHits = aspects.filter(item => item.transitSpeedClass === 'slow');
  if (slowHits.length) {
    lines.push(`La présence de transits lents suggère que certains mouvements en cours ont une portée plus structurante que passagère.`);
  } else {
    lines.push(`La dynamique actuelle semble davantage relever d’une météo mobile que d’un remaniement profond.`);
  }

  const natalSunTouched = aspects.some(item => item.bodyB === 'Natal Soleil');
  const natalMoonTouched = aspects.some(item => item.bodyB === 'Natal Lune');
  const natalAscTouched = aspects.some(item => item.bodyB === 'Natal Asc');

  if (natalSunTouched) {
    lines.push(`Le Soleil natal étant sollicité, la question de l’orientation, de l’expression ou de la cohérence personnelle peut devenir plus sensible.`);
  }

  if (natalMoonTouched) {
    lines.push(`La Lune natale étant touchée, le vécu émotionnel et les besoins de sécurité intérieure peuvent être plus mobilisés.`);
  }

  if (natalAscTouched) {
    lines.push(`L’Ascendant natal étant concerné, la manière d’entrer dans l’expérience ou de se positionner face au monde peut se trouver réajustée.`);
  }

  return lines;
}

export function buildTransitComparison(natalInput, transitInput, options = {}) {
  const natalChart = buildChart(natalInput);
  const transitChart = buildChart(transitInput);

  const natalPoints = extractTransitPoints(natalChart, 'Natal');
  const transitPoints = extractTransitPoints(transitChart, 'Transit');

  const aspects = [];

  for (const transit of transitPoints) {
    for (const natal of natalPoints) {
      const found = getAllAspects([
        { name: transit.name, longitudeDeg: transit.longitudeDeg },
        { name: natal.name, longitudeDeg: natal.longitudeDeg }
      ]);

      if (found.length) {
        for (const aspect of found) {
          const enriched = {
            ...aspect,
            importance: groupImportance(aspect),
            transitSpeedClass: transit.speedClass,
            natalSpeedClass: natal.speedClass
          };

          if (isInterestingTransit(enriched, options)) {
            aspects.push(enriched);
          }
        }
      }
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);

  const summary = {
    total: aspects.length,
    tresFort: aspects.filter(a => a.importance === 'très fort').length,
    fort: aspects.filter(a => a.importance === 'fort').length,
    modere: aspects.filter(a => a.importance === 'modéré').length,
    leger: aspects.filter(a => a.importance === 'léger').length
  };

  return {
    natalChart,
    transitChart,
    aspects,
    summary,
    synthesis: buildTransitSynthesis(aspects),
    integratedReading: buildIntegratedTransitReading(natalChart, aspects)
  };
}
```

---

# 121. Mise à jour de `js/ui/renderTransits.js`

Ajouter la lecture unifiée au rendu :

```javascript
function importanceBadge(value) {
  switch (value) {
    case 'très fort': return '🔥';
    case 'fort': return '✨';
    case 'modéré': return '•';
    default: return '·';
  }
}

export function renderTransits(result) {
  const el = document.getElementById('transits');

  if (!result || !result.aspects?.length) {
    el.innerHTML = '<p>Aucun transit significatif détecté avec les filtres actuels.</p>';
    return;
  }

  const summary = result.summary;

  el.innerHTML = `
    <div>
      <h3>Synthèse des transits</h3>
      ${(result.synthesis ?? []).map(item => `<p>${item}</p>`).join('')}
    </div>
    <div>
      <h3>Lecture croisée natal / moment</h3>
      ${(result.integratedReading ?? []).map(item => `<p>${item}</p>`).join('')}
    </div>
    <div>
      <h3>Répartition</h3>
      <p><strong>Total :</strong> ${summary.total}</p>
      <p><strong>Très forts :</strong> ${summary.tresFort} | <strong>Forts :</strong> ${summary.fort} | <strong>Modérés :</strong> ${summary.modere}</p>
    </div>
    <div>
      <h3>Détail</h3>
      ${result.aspects.map(item => `
        <p>
          ${importanceBadge(item.importance)}
          <strong>${item.bodyA}</strong>
          ${item.aspect}
          <strong>${item.bodyB}</strong>
          — orbe: ${item.orb.toFixed(2)}°
          — intensité: ${item.importance}
        </p>
      `).join('')}
    </div>
  `;
}
```

---

# 122. Ce que cette étape apporte

Avec ce patch, l’application ne se contente plus d’indiquer un thème natal d’un côté et des transits de l’autre. Elle commence à produire une **lecture de rencontre** entre :

- une structure de base
- un climat actuel
- et les points du thème qui se trouvent le plus sollicités

C’est une vraie montée en valeur dans la Phase 2.

---

# 123. La suite logique

Maintenant que la lecture du moment commence à dialoguer avec la carte de base, les prochaines étapes fécondes seraient :

1. raffiner encore la rédaction de cette lecture croisée
2. mieux distinguer les transits de fond et les transits de passage
3. commencer à produire plusieurs niveaux de synthèse : courte, moyenne, longue

La plus juste tout de suite serait :

## distinguer plus clairement les transits de fond et les transits de passage


---

# 124. Patch Phase 2 — distinguer transits de fond et transits de passage

L’objectif ici est de mieux hiérarchiser la temporalité des transits. Tous les transits ne portent pas le même poids dans le temps : certains forment un climat durable, d’autres relèvent davantage d’un passage plus mobile.

On va donc séparer :

- les transits de fond
- les transits intermédiaires
- les transits de passage

---

# 125. Mise à jour de `js/domain/transits.js`

Ajouter la catégorisation temporelle et une synthèse dédiée.

```javascript
import { buildChart } from './chartBuilder.js';
import { getAllAspects } from '../astrology/aspects.js';

function extractTransitPoints(chart, prefix) {
  const points = [];

  if (chart.bodies?.sun) {
    points.push({ name: `${prefix} Soleil`, longitudeDeg: chart.bodies.sun.longitudeDeg, speedClass: 'medium' });
  }

  if (chart.bodies?.moon) {
    points.push({ name: `${prefix} Lune`, longitudeDeg: chart.bodies.moon.longitudeDeg, speedClass: 'fast' });
  }

  for (const [key, value] of Object.entries(chart.planets ?? {})) {
    const speedClass = ['Mercury', 'Venus', 'Mars'].includes(key)
      ? 'fast'
      : ['Jupiter', 'Saturn'].includes(key)
        ? 'medium'
        : 'slow';

    points.push({ name: `${prefix} ${key}`, longitudeDeg: value.longitudeDeg, speedClass });
  }

  if (chart.angles) {
    points.push({ name: `${prefix} Asc`, longitudeDeg: chart.angles.asc, speedClass: 'angle' });
    points.push({ name: `${prefix} MC`, longitudeDeg: chart.angles.mc, speedClass: 'angle' });
  }

  return points;
}

function groupImportance(aspect) {
  if (aspect.orb <= 1) return 'très fort';
  if (aspect.orb <= 3) return 'fort';
  if (aspect.orb <= 5) return 'modéré';
  return 'léger';
}

function transitTimeClass(speedClass) {
  if (speedClass === 'slow') return 'fond';
  if (speedClass === 'medium') return 'intermédiaire';
  return 'passage';
}

function isInterestingTransit(aspect, options) {
  const defaults = {
    maxOrb: 4,
    includeFast: true,
    includeAngles: true,
    includeMinorImportance: false
  };

  const config = { ...defaults, ...(options ?? {}) };

  if (aspect.orb > config.maxOrb) return false;
  if (!config.includeMinorImportance && groupImportance(aspect) === 'léger') return false;

  const involvesFast = /Transit (Lune|Mercury|Venus|Mars)/.test(aspect.bodyA);
  const involvesAngle = /(Natal|Transit) (Asc|MC)/.test(`${aspect.bodyA} ${aspect.bodyB}`);

  if (!config.includeFast && involvesFast) return false;
  if (!config.includeAngles && involvesAngle) return false;

  return true;
}

function buildTransitSynthesis(aspects) {
  if (!aspects.length) {
    return [
      'Aucun transit significatif ne ressort avec les filtres actuels.',
      'Le moment semble relativement calme ou les critères choisis sont volontairement serrés.'
    ];
  }

  const top = aspects.slice(0, 5);
  const slowCount = aspects.filter(item => item.timeClass === 'fond').length;
  const strongCount = aspects.filter(item => item.importance === 'très fort' || item.importance === 'fort').length;

  const lines = [];
  lines.push(`Le climat de transit actuel met en avant ${strongCount} aspect(s) fort(s) ou très fort(s).`);

  if (slowCount > 0) {
    lines.push(`Une part du climat semble relever de mouvements de fond, plus structurants et moins immédiats.`);
  } else {
    lines.push(`Le climat paraît davantage porté par des mouvements rapides ou intermédiaires.`);
  }

  lines.push(...top.map(item =>
    `${item.bodyA} ${item.aspect} ${item.bodyB} — orbe ${item.orb.toFixed(2)}°, intensité ${item.importance}.`
  ));

  return lines;
}

function buildIntegratedTransitReading(natalChart, aspects) {
  if (!aspects.length) {
    return [
      'Le thème natal n’est pas particulièrement sollicité par les transits retenus.',
      'Le moment peut être vécu comme plus neutre, ou comme une phase d’intégration discrète.'
    ];
  }

  const strongest = aspects[0];
  const lines = [];

  lines.push(`Le climat du moment vient toucher en priorité ${strongest.bodyB.toLowerCase()}, à travers ${strongest.bodyA.toLowerCase()}.`);

  const slowHits = aspects.filter(item => item.timeClass === 'fond');
  if (slowHits.length) {
    lines.push(`La présence de transits de fond suggère que certains mouvements en cours ont une portée plus structurante que passagère.`);
  } else {
    lines.push(`La dynamique actuelle semble davantage relever d’une météo mobile que d’un remaniement profond.`);
  }

  const natalSunTouched = aspects.some(item => item.bodyB === 'Natal Soleil');
  const natalMoonTouched = aspects.some(item => item.bodyB === 'Natal Lune');
  const natalAscTouched = aspects.some(item => item.bodyB === 'Natal Asc');

  if (natalSunTouched) {
    lines.push(`Le Soleil natal étant sollicité, la question de l’orientation, de l’expression ou de la cohérence personnelle peut devenir plus sensible.`);
  }

  if (natalMoonTouched) {
    lines.push(`La Lune natale étant touchée, le vécu émotionnel et les besoins de sécurité intérieure peuvent être plus mobilisés.`);
  }

  if (natalAscTouched) {
    lines.push(`L’Ascendant natal étant concerné, la manière d’entrer dans l’expérience ou de se positionner face au monde peut se trouver réajustée.`);
  }

  return lines;
}

function splitTransitLayers(aspects) {
  return {
    fond: aspects.filter(item => item.timeClass === 'fond'),
    intermediaire: aspects.filter(item => item.timeClass === 'intermédiaire'),
    passage: aspects.filter(item => item.timeClass === 'passage')
  };
}

export function buildTransitComparison(natalInput, transitInput, options = {}) {
  const natalChart = buildChart(natalInput);
  const transitChart = buildChart(transitInput);

  const natalPoints = extractTransitPoints(natalChart, 'Natal');
  const transitPoints = extractTransitPoints(transitChart, 'Transit');

  const aspects = [];

  for (const transit of transitPoints) {
    for (const natal of natalPoints) {
      const found = getAllAspects([
        { name: transit.name, longitudeDeg: transit.longitudeDeg },
        { name: natal.name, longitudeDeg: natal.longitudeDeg }
      ]);

      if (found.length) {
        for (const aspect of found) {
          const enriched = {
            ...aspect,
            importance: groupImportance(aspect),
            transitSpeedClass: transit.speedClass,
            natalSpeedClass: natal.speedClass,
            timeClass: transitTimeClass(transit.speedClass)
          };

          if (isInterestingTransit(enriched, options)) {
            aspects.push(enriched);
          }
        }
      }
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);

  const summary = {
    total: aspects.length,
    tresFort: aspects.filter(a => a.importance === 'très fort').length,
    fort: aspects.filter(a => a.importance === 'fort').length,
    modere: aspects.filter(a => a.importance === 'modéré').length,
    leger: aspects.filter(a => a.importance === 'léger').length
  };

  return {
    natalChart,
    transitChart,
    aspects,
    summary,
    layers: splitTransitLayers(aspects),
    synthesis: buildTransitSynthesis(aspects),
    integratedReading: buildIntegratedTransitReading(natalChart, aspects)
  };
}
```

---

# 126. Mise à jour de `js/ui/renderTransits.js`

Ajouter l’affichage des trois couches temporelles.

```javascript
function importanceBadge(value) {
  switch (value) {
    case 'très fort': return '🔥';
    case 'fort': return '✨';
    case 'modéré': return '•';
    default: return '·';
  }
}

function renderTransitLayer(title, items) {
  if (!items?.length) {
    return `<div><h3>${title}</h3><p>Aucun élément notable.</p></div>`;
  }

  return `
    <div>
      <h3>${title}</h3>
      ${items.slice(0, 5).map(item => `
        <p>
          ${importanceBadge(item.importance)}
          <strong>${item.bodyA}</strong>
          ${item.aspect}
          <strong>${item.bodyB}</strong>
          — orbe: ${item.orb.toFixed(2)}°
        </p>
      `).join('')}
    </div>
  `;
}

export function renderTransits(result) {
  const el = document.getElementById('transits');

  if (!result || !result.aspects?.length) {
    el.innerHTML = '<p>Aucun transit significatif détecté avec les filtres actuels.</p>';
    return;
  }

  const summary = result.summary;

  el.innerHTML = `
    <div>
      <h3>Synthèse des transits</h3>
      ${(result.synthesis ?? []).map(item => `<p>${item}</p>`).join('')}
    </div>
    <div>
      <h3>Lecture croisée natal / moment</h3>
      ${(result.integratedReading ?? []).map(item => `<p>${item}</p>`).join('')}
    </div>
    <div>
      <h3>Répartition</h3>
      <p><strong>Total :</strong> ${summary.total}</p>
      <p><strong>Très forts :</strong> ${summary.tresFort} | <strong>Forts :</strong> ${summary.fort} | <strong>Modérés :</strong> ${summary.modere}</p>
    </div>
    ${renderTransitLayer('Transits de fond', result.layers?.fond)}
    ${renderTransitLayer('Transits intermédiaires', result.layers?.intermediaire)}
    ${renderTransitLayer('Transits de passage', result.layers?.passage)}
    <div>
      <h3>Détail complet</h3>
      ${result.aspects.map(item => `
        <p>
          ${importanceBadge(item.importance)}
          <strong>${item.bodyA}</strong>
          ${item.aspect}
          <strong>${item.bodyB}</strong>
          — orbe: ${item.orb.toFixed(2)}°
          — intensité: ${item.importance}
          — type: ${item.timeClass}
        </p>
      `).join('')}
    </div>
  `;
}
```

---

# 127. Ce que cette étape apporte

Avec cette séparation, la lecture du moment gagne une profondeur très utile :

- ce qui appartient au fond devient plus visible
- ce qui relève d’un passage rapide n’écrase plus tout le reste
- l’utilisateur voit mieux ce qui peut durer et ce qui peut seulement traverser

Cela rend la lecture bien plus crédible et plus respirante.

---

# 128. La prochaine suite naturelle

Maintenant que la temporalité des transits est mieux hiérarchisée, la prochaine étape la plus juste serait :

## produire plusieurs niveaux de synthèse : courte, moyenne et longue

C’est probablement ce qui donnerait le plus de souplesse à l’application à ce stade.


---

# 129. Intégration des constellations polygonales réelles — structure propre

Cette étape remplace la logique purement optimisée par une architecture à deux niveaux :

- **niveau 1** : polygones exacts, si le dataset réel est présent
- **niveau 2** : fallback sur les zones optimisées, si le dataset exact n’est pas encore chargé

Cela permet d’intégrer progressivement les vraies frontières sans casser l’application.

---

# 130. Nouveau fichier — `js/data/constellationsPolygons.js`

Créer ce fichier comme point d’entrée du dataset réel :

```javascript
export const CONSTELLATION_POLYGONS = [
  // À remplir avec le vrai dataset polygonal converti.
  // Structure attendue :
  // {
  //   abbr: 'Ari',
  //   name: 'Aries',
  //   polygons: [
  //     [
  //       { ra: 28.0, dec: 20.0 },
  //       { ra: 32.0, dec: 20.0 },
  //       { ra: 32.0, dec: 25.0 },
  //       { ra: 28.0, dec: 25.0 }
  //     ]
  //   ]
  // }
];
```

---

# 131. Remplacement conseillé de `js/astrology/constellations.js`

Cette version essaie d’abord les polygones exacts, puis bascule sur le fallback optimisé si le dataset réel n’est pas encore fourni.

```javascript
import { CONSTELLATIONS_OPTIMIZED } from '../data/constellationsOptimized.js';
import { CONSTELLATION_POLYGONS } from '../data/constellationsPolygons.js';

function normalizeRa(ra) {
  let value = ra % 360;
  if (value < 0) value += 360;
  return value;
}

function pointInPolygon(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = normalizeRa(polygon[i].ra);
    const yi = polygon[i].dec;
    const xj = normalizeRa(polygon[j].ra);
    const yj = polygon[j].dec;

    const intersect = ((yi > point.dec) !== (yj > point.dec))
      && (point.ra < ((xj - xi) * (point.dec - yi)) / ((yj - yi) || 1e-12) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

function pointInAnyPolygon(point, polygons) {
  return polygons.some(poly => poly.length >= 3 && pointInPolygon(point, poly));
}

function getConstellationByPolygon(raDeg, decDeg) {
  const point = { ra: normalizeRa(raDeg), dec: decDeg };

  for (const constellation of CONSTELLATION_POLYGONS) {
    if (pointInAnyPolygon(point, constellation.polygons ?? [])) {
      return {
        ...constellation,
        source: 'polygon'
      };
    }
  }

  return null;
}

function getConstellationByOptimizedFallback(raDeg, decDeg) {
  return (
    CONSTELLATIONS_OPTIMIZED.find(c => {
      const raInRange = c.raMin <= c.raMax
        ? raDeg >= c.raMin && raDeg <= c.raMax
        : raDeg >= c.raMin || raDeg <= c.raMax;

      return raInRange && decDeg >= c.decMin && decDeg <= c.decMax;
    }) || null
  );
}

export function getConstellationByRaDec(raDeg, decDeg) {
  const polygonMatch = getConstellationByPolygon(raDeg, decDeg);
  if (polygonMatch) return polygonMatch;

  const fallbackMatch = getConstellationByOptimizedFallback(raDeg, decDeg);
  return fallbackMatch
    ? { ...fallbackMatch, source: 'optimized-fallback' }
    : null;
}
```

---

# 132. Mise à jour conseillée de `js/ui/renderBodies.js`

Pour indiquer si la constellation vient du mode exact ou du fallback :

```javascript
import { formatDeg } from './formatters.js';

export function renderBodies(chart) {
  const el = document.getElementById('bodies');

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
      <p>Source constellation : ${body.constellation?.source ?? 'n/a'}</p>
    </div>
  `).join('');

  el.innerHTML = html;
}
```

---

# 133. Étape technique encore nécessaire

La partie architecture est maintenant prête, mais il reste un point indispensable :

- convertir le vrai dataset des frontières en `constellationsPolygons.js`

Sans cela, l’application utilisera encore le fallback optimisé.

---

# 134. Ce que cette étape permet déjà

Même sans avoir encore injecté le dataset complet, cette étape fait gagner quelque chose de très important :

- la structure est prête
- l’algorithme de test polygonal est posé
- le moteur est compatible avec une montée progressive en précision
- l’interface peut déjà indiquer si elle travaille en exact ou en fallback

---

# 135. Prochaine sous-étape logique

La prochaine sous-étape concrète est donc :

## injecter le vrai dataset polygonal complet dans `constellationsPolygons.js`

Une fois ce fichier rempli, l’application pourra réellement basculer vers les constellations astronomiques polygonales.


---

# 136. Format exact du fichier polygonal

L’objectif ici est de figer un format stable, afin que les 88 constellations puissent être importées proprement sans devoir réécrire le moteur ensuite.

Le format conseillé pour `js/data/constellationsPolygons.js` est le suivant :

```javascript
export const CONSTELLATION_POLYGONS = [
  {
    abbr: 'Ari',
    name: 'Aries',
    polygons: [
      [
        { ra: 28.0, dec: 20.0 },
        { ra: 32.0, dec: 20.0 },
        { ra: 32.0, dec: 25.0 },
        { ra: 28.0, dec: 25.0 }
      ]
    ]
  }
];
```

---

# 137. Pourquoi ce format est le bon

Ce format est préférable parce qu’il est :

- lisible à la main
- simple à charger en JavaScript
- compatible avec des constellations composées d’un seul polygone
- compatible avec des constellations composées de plusieurs polygones
- directement exploitable par le moteur `pointInPolygon`

Il évite de dépendre d’un parseur compliqué au moment de l’exécution.

---

# 138. Variante possible pour alléger le fichier

Si le dataset devient trop lourd, tu peux aussi stocker les coordonnées sous forme compacte :

```javascript
export const CONSTELLATION_POLYGONS = [
  {
    abbr: 'Ari',
    name: 'Aries',
    polygons: [
      [
        [28.0, 20.0],
        [32.0, 20.0],
        [32.0, 25.0],
        [28.0, 25.0]
      ]
    ]
  }
];
```

Puis convertir au chargement.

Mais pour la maintenabilité, la version avec objets `{ ra, dec }` reste meilleure au départ.

---

# 139. Méthode de conversion recommandée

L’idée la plus saine est de faire la conversion **une fois**, hors du navigateur, puis d’enregistrer directement le résultat final dans `constellationsPolygons.js`.

Le pipeline recommandé est :

1. récupérer le dataset source
2. parser les frontières
3. regrouper les points par constellation
4. reconstruire les polygones
5. exporter le résultat final au format JS attendu

Ainsi, le navigateur ne porte pas le coût du parsing brut.

---

# 140. Script de conversion conseillé

Créer un script séparé, par exemple :

```text
/tools/convert-constellation-boundaries.js
```

Son rôle est :

- lire un fichier source brut
- produire `js/data/constellationsPolygons.js`

---

# 141. Structure du script de conversion

Voici une base propre :

```javascript
import fs from 'node:fs';
import path from 'node:path';

function loadRawInput(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function parseRawBoundaries(rawText) {
  // À adapter au format réel du dataset source.
  // Doit retourner une liste de segments ou de points.
  return [];
}

function groupByConstellation(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.abbr)) {
      map.set(row.abbr, {
        abbr: row.abbr,
        name: row.name,
        polygons: []
      });
    }

    map.get(row.abbr).polygons.push(row.polygon);
  }

  return [...map.values()];
}

function normalizePolygonData(items) {
  return items.map(item => ({
    abbr: item.abbr,
    name: item.name,
    polygons: item.polygons
      .filter(poly => Array.isArray(poly) && poly.length >= 3)
      .map(poly => poly.map(([ra, dec]) => ({ ra, dec })))
  }));
}

function toJsModule(data) {
  return `export const CONSTELLATION_POLYGONS = ${JSON.stringify(data, null, 2)};
`;
}

function main() {
  const inputPath = path.resolve('tools/raw-constellation-boundaries.txt');
  const outputPath = path.resolve('js/data/constellationsPolygons.js');

  const raw = loadRawInput(inputPath);
  const parsed = parseRawBoundaries(raw);
  const grouped = groupByConstellation(parsed);
  const normalized = normalizePolygonData(grouped);
  const jsModule = toJsModule(normalized);

  fs.writeFileSync(outputPath, jsModule, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

main();
```

---

# 142. Convention importante à garder

Pour éviter les erreurs, fixe dès maintenant ces règles :

- `ra` en degrés, de `0` à `< 360`
- `dec` en degrés, de `-90` à `+90`
- chaque polygone doit être fermé implicitement par l’algorithme, sans répéter le premier point à la fin
- un polygone doit contenir au moins 3 points
- le nom court officiel reste dans `abbr`
- le nom lisible reste dans `name`

---

# 143. Option utile : validation du dataset

Avant d’écrire le fichier final, il est utile d’ajouter une petite validation.

Exemple :

```javascript
function validatePolygons(items) {
  for (const item of items) {
    if (!item.abbr || !item.name) {
      throw new Error('Constellation invalide: abbr/name manquant');
    }

    for (const poly of item.polygons) {
      if (!Array.isArray(poly) || poly.length < 3) {
        throw new Error(`Polygone invalide pour ${item.abbr}`);
      }

      for (const point of poly) {
        if (typeof point.ra !== 'number' || typeof point.dec !== 'number') {
          throw new Error(`Point invalide pour ${item.abbr}`);
        }
      }
    }
  }
}
```

Puis l’appeler avant `toJsModule(normalized)`.

---

# 144. Recommandation pratique pour avancer sans friction

La meilleure stratégie n’est pas d’injecter les 88 constellations d’un seul bloc à la main.

La meilleure stratégie est :

1. préparer le script de conversion
2. tester avec 2 ou 3 constellations
3. valider le moteur polygonal
4. seulement ensuite injecter les 88

C’est plus sûr et beaucoup plus propre.

---

# 145. Prochaine sous-étape immédiate

La suite la plus logique, maintenant, est :

## créer le script de conversion prêt à l’emploi

Autrement dit, le prochain vrai pas concret serait de générer le fichier :

```text
/tools/convert-constellation-boundaries.js
```

avec les fonctions de parsing, normalisation et export.


---

# 146. Script prêt à l’emploi — `tools/convert-constellation-boundaries.js`

Voici une version exploitable du script. Elle accepte deux modes d’entrée :

- un fichier JSON déjà structuré
- un fichier texte intermédiaire de type `abbr|name|polygonIndex|ra|dec`

Ainsi, tu peux l’utiliser même si la source brute n’a pas exactement la même forme.

```javascript
import fs from 'node:fs';
import path from 'node:path';

const INPUT_JSON = path.resolve('tools/raw-constellation-boundaries.json');
const INPUT_TXT = path.resolve('tools/raw-constellation-boundaries.txt');
const OUTPUT_JS = path.resolve('js/data/constellationsPolygons.js');

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
}

function normalizeRa(ra) {
  let value = Number(ra);
  value %= 360;
  if (value < 0) value += 360;
  return value;
}

function normalizeDec(dec) {
  return Number(dec);
}

function parseJsonInput(rawText) {
  const parsed = JSON.parse(rawText);

  if (!Array.isArray(parsed)) {
    throw new Error('Le fichier JSON doit contenir un tableau.');
  }

  return parsed.map(item => ({
    abbr: item.abbr,
    name: item.name,
    polygons: (item.polygons ?? []).map(poly =>
      poly.map(point => ({
        ra: normalizeRa(point.ra),
        dec: normalizeDec(point.dec)
      }))
    )
  }));
}

function parseDelimitedTextInput(rawText) {
  const lines = rawText
    .split(/?
/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  const map = new Map();

  for (const line of lines) {
    const parts = line.split('|').map(part => part.trim());

    if (parts.length !== 5) {
      throw new Error(`Ligne invalide: ${line}`);
    }

    const [abbr, name, polygonIndexRaw, raRaw, decRaw] = parts;
    const polygonIndex = Number(polygonIndexRaw);
    const ra = normalizeRa(raRaw);
    const dec = normalizeDec(decRaw);

    if (!map.has(abbr)) {
      map.set(abbr, {
        abbr,
        name,
        polygons: []
      });
    }

    const entry = map.get(abbr);

    if (!entry.polygons[polygonIndex]) {
      entry.polygons[polygonIndex] = [];
    }

    entry.polygons[polygonIndex].push({ ra, dec });
  }

  return [...map.values()].map(item => ({
    abbr: item.abbr,
    name: item.name,
    polygons: item.polygons.filter(Boolean)
  }));
}

function validatePolygons(items) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('Aucune constellation détectée.');
  }

  for (const item of items) {
    if (!item.abbr || !item.name) {
      throw new Error('Constellation invalide: abbr ou name manquant.');
    }

    if (!Array.isArray(item.polygons) || !item.polygons.length) {
      throw new Error(`Aucun polygone pour ${item.abbr}`);
    }

    for (const poly of item.polygons) {
      if (!Array.isArray(poly) || poly.length < 3) {
        throw new Error(`Polygone invalide pour ${item.abbr}`);
      }

      for (const point of poly) {
        if (typeof point.ra !== 'number' || Number.isNaN(point.ra)) {
          throw new Error(`RA invalide pour ${item.abbr}`);
        }

        if (typeof point.dec !== 'number' || Number.isNaN(point.dec)) {
          throw new Error(`DEC invalide pour ${item.abbr}`);
        }

        if (point.ra < 0 || point.ra >= 360) {
          throw new Error(`RA hors bornes pour ${item.abbr}`);
        }

        if (point.dec < -90 || point.dec > 90) {
          throw new Error(`DEC hors bornes pour ${item.abbr}`);
        }
      }
    }
  }
}

function sortConstellations(items) {
  return [...items].sort((a, b) => a.abbr.localeCompare(b.abbr));
}

function toJsModule(data) {
  return `export const CONSTELLATION_POLYGONS = ${JSON.stringify(data, null, 2)};
`;
}

function ensureOutputDirectory(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function loadSourceData() {
  const rawJson = readIfExists(INPUT_JSON);
  if (rawJson) {
    console.log(`Lecture du JSON source: ${INPUT_JSON}`);
    return parseJsonInput(rawJson);
  }

  const rawTxt = readIfExists(INPUT_TXT);
  if (rawTxt) {
    console.log(`Lecture du TXT source: ${INPUT_TXT}`);
    return parseDelimitedTextInput(rawTxt);
  }

  throw new Error(
    `Aucune source trouvée. Ajoute soit ${INPUT_JSON}, soit ${INPUT_TXT}`
  );
}

function main() {
  const data = loadSourceData();
  validatePolygons(data);
  const sorted = sortConstellations(data);
  const output = toJsModule(sorted);

  ensureOutputDirectory(OUTPUT_JS);
  fs.writeFileSync(OUTPUT_JS, output, 'utf-8');

  console.log(`Fichier généré: ${OUTPUT_JS}`);
  console.log(`Constellations exportées: ${sorted.length}`);
}

main();
```

---

# 147. Format attendu pour `raw-constellation-boundaries.txt`

Si tu utilises le mode texte intermédiaire, chaque ligne doit ressembler à ceci :

```text
Ari|Aries|0|28.0|20.0
Ari|Aries|0|32.0|20.0
Ari|Aries|0|32.0|25.0
Ari|Aries|0|28.0|25.0
```

Où :

- `Ari` = abréviation
- `Aries` = nom
- `0` = index du polygone
- `28.0` = ascension droite en degrés
- `20.0` = déclinaison en degrés

Si une constellation a plusieurs polygones, il suffit de changer l’index :

```text
Ser|Serpens|0|...
Ser|Serpens|0|...
Ser|Serpens|1|...
Ser|Serpens|1|...
```

---

# 148. Format attendu pour `raw-constellation-boundaries.json`

Si tu utilises le mode JSON, la structure attendue est :

```json
[
  {
    "abbr": "Ari",
    "name": "Aries",
    "polygons": [
      [
        { "ra": 28.0, "dec": 20.0 },
        { "ra": 32.0, "dec": 20.0 },
        { "ra": 32.0, "dec": 25.0 },
        { "ra": 28.0, "dec": 25.0 }
      ]
    ]
  }
]
```

---

# 149. Commande d’usage

Une fois le fichier source ajouté, la commande est simplement :

```bash
node tools/convert-constellation-boundaries.js
```

Le script générera automatiquement :

```text
js/data/constellationsPolygons.js
```

---

# 150. Vérification conseillée juste après génération

Après génération, il est utile de vérifier :

- le nombre de constellations exportées
- qu’aucune constellation n’a de polygone vide
- que l’application utilise bien `source: 'polygon'` sur les corps testés

---

# 151. Prochaine sous-étape logique

Une fois ce script posé, la prochaine vraie étape est toute simple :

## préparer un premier fichier source de test avec 2 ou 3 constellations

Cela permettra de valider l’intégration polygonale avant de charger les 88 d’un seul coup.


---

# 152. Jeu de test minimal — 3 constellations

Pour valider le pipeline sans charger tout le ciel d’un coup, on prépare un petit jeu de test avec :

- Aries
- Taurus
- Gemini

L’objectif n’est pas encore d’être scientifiquement complet, mais de vérifier :

- le format source
- le script de conversion
- le chargement du module généré
- le passage du moteur vers `source: 'polygon'`

---

# 153. Fichier de test — `tools/raw-constellation-boundaries.json`

Créer ce fichier de test minimal :

```json
[
  {
    "abbr": "Ari",
    "name": "Aries",
    "polygons": [
      [
        { "ra": 20.0, "dec": 10.0 },
        { "ra": 55.0, "dec": 10.0 },
        { "ra": 55.0, "dec": 30.0 },
        { "ra": 20.0, "dec": 30.0 }
      ]
    ]
  },
  {
    "abbr": "Tau",
    "name": "Taurus",
    "polygons": [
      [
        { "ra": 52.0, "dec": 0.0 },
        { "ra": 90.0, "dec": 0.0 },
        { "ra": 90.0, "dec": 35.0 },
        { "ra": 52.0, "dec": 35.0 }
      ]
    ]
  },
  {
    "abbr": "Gem",
    "name": "Gemini",
    "polygons": [
      [
        { "ra": 90.0, "dec": 10.0 },
        { "ra": 120.0, "dec": 10.0 },
        { "ra": 120.0, "dec": 35.0 },
        { "ra": 90.0, "dec": 35.0 }
      ]
    ]
  }
]
```

---

# 154. Pourquoi ce jeu de test est utile

Il est volontairement simple, mais il permet déjà de vérifier :

- que le format JSON est accepté
- que le script écrit correctement `constellationsPolygons.js`
- que le moteur va chercher les polygones avant le fallback
- que les constellations testées sont reconnues avec `source: 'polygon'`

---

# 155. Procédure de validation

Une fois le fichier ci-dessus créé :

## Étape 1

Lancer :

```bash
node tools/convert-constellation-boundaries.js
```

## Étape 2

Vérifier que le fichier suivant est bien généré :

```text
js/data/constellationsPolygons.js
```

## Étape 3

Ouvrir l’application et tester des corps dont la RA / DEC tombent dans les zones d’Aries, Taurus ou Gemini.

## Étape 4

Vérifier dans le rendu des corps :

```text
Source constellation : polygon
```

---

# 156. Vérification manuelle rapide du moteur

Tu peux aussi faire un petit test direct en console navigateur, si besoin :

```javascript
import { getConstellationByRaDec } from './js/astrology/constellations.js';

console.log(getConstellationByRaDec(30, 20));   // Ari attendu
console.log(getConstellationByRaDec(70, 20));   // Tau attendu
console.log(getConstellationByRaDec(100, 20));  // Gem attendu
```

---

# 157. Résultat attendu

Si tout fonctionne correctement, tu dois observer :

- `Ari` reconnu par polygone
- `Tau` reconnu par polygone
- `Gem` reconnu par polygone
- toutes les autres constellations continuent à passer par `optimized-fallback`

C’est exactement le comportement recherché à ce stade.

---

# 158. Étape suivante après validation du test minimal

Une fois ce mini-test validé, la prochaine étape sera très claire :

## remplacer le jeu de test par le vrai dataset complet des 88 constellations

À ce moment-là, l’intégration polygonale réelle pourra réellement basculer à grande échelle.


---

# 159. Source de données la plus propre à viser

Il existe un catalogue astronomique exploitable pour les frontières de constellations : le catalogue **VI/49 — Constellation Boundary Data**, présenté comme un catalogue informatique de données de frontières de constellations. Le site du CDS/VizieR le référence explicitement comme un catalogue lisible par machine. ([cdsarc.u-strasbg.fr](https://cdsarc.u-strasbg.fr/viz-bin/cat/VI/49?utm_source=chatgpt.com))

En parallèle, la documentation d’Astropy précise que la détermination de constellation s’appuie sur les frontières modernes tabulées à partir de Delporte/Roman et qu’elle précesse d’abord les coordonnées vers **B1875.0** pour faire le test. ([docs.astropy.org](https://docs.astropy.org/en/latest/api/astropy.coordinates.get_constellation.html?utm_source=chatgpt.com))

---

# 160. Ce que cela change dans notre stratégie

La bonne stratégie n’est donc plus de remplir manuellement `constellationsPolygons.js`, mais de cibler directement une source de type **VI/49** et d’adapter le script de conversion à son format. ([cdsarc.u-strasbg.fr](https://cdsarc.u-strasbg.fr/viz-bin/cat/VI/49?utm_source=chatgpt.com))

Il faut aussi garder en tête un point important : si l’on utilise les frontières historiques liées à Delporte, le moteur exact de détermination de constellation doit être cohérent avec le repère associé, ce qui explique pourquoi Astropy travaille en B1875 pour ce test. ([docs.astropy.org](https://docs.astropy.org/en/latest/api/astropy.coordinates.get_constellation.html?utm_source=chatgpt.com))

---

# 161. Sous-étape suivante vraiment juste

La prochaine sous-étape technique la plus juste est donc :

## adapter le script de conversion au catalogue VI/49

Cela veut dire :

- parser le format du catalogue source
- reconstruire les polygones par constellation
- choisir si l’on stocke une version B1875 ou une version déjà convertie
- garder le moteur de fallback tant que tout n’est pas validé

---

# 162. Conséquence importante pour le moteur exact

À partir du moment où l’on bascule sur les vraies frontières issues de Delporte/Roman, il faudra choisir l’une des deux approches suivantes :

### Approche A

Préconvertir tout le dataset en coordonnées directement utilisables dans notre moteur JavaScript, puis tester les points sans précession supplémentaire.

### Approche B

Conserver un dataset fidèle au repère historique utilisé pour les frontières et précesser le point céleste testé dans le même repère avant le test polygonal.

La seconde approche est plus fidèle à la logique utilisée par Astropy. ([docs.astropy.org](https://docs.astropy.org/en/latest/api/astropy.coordinates.get_constellation.html?utm_source=chatgpt.com))

---

# 163. Recommandation pratique

Pour notre projet, la voie la plus réaliste est :

- commencer par intégrer le catalogue machine-readable VI/49
- faire d’abord tourner le moteur exact sur un petit sous-ensemble
- ensuite décider si l’on garde un moteur “exact historique” ou un dataset déjà transformé pour l’usage applicatif

Cette approche évite de mélanger trop tôt fidélité scientifique et simplification applicative. ([cdsarc.u-strasbg.fr](https://cdsarc.u-strasbg.fr/viz-bin/cat/VI/49?utm_source=chatgpt.com))

---

# 164. Prochaine action concrète

La prochaine action concrète n’est donc plus : “remplir le fichier à la main”, mais :

## préparer le convertisseur pour le format VI/49

C’est cette étape qui fera réellement avancer l’intégration des 88 constellations polygonales exactes.

