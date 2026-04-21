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
  const config = {
    maxOrb: 4,
    includeFast: true,
    includeAngles: true,
    includeMinorImportance: false,
    ...(options ?? {})
  };

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
  const slowCount = aspects.filter((item) => item.transitSpeedClass === 'slow').length;
  const strongCount = aspects.filter((item) => item.importance === 'très fort' || item.importance === 'fort').length;
  const lines = [];

  lines.push(`Le climat de transit actuel met en avant ${strongCount} aspect(s) fort(s) ou très fort(s).`);

  if (slowCount > 0) {
    lines.push('Des planètes lentes participent au climat général, ce qui suggère des mouvements moins ponctuels et plus structurants.');
  } else {
    lines.push('Le climat semble surtout porté par des mouvements rapides ou intermédiaires.');
  }

  lines.push(...top.map((item) =>
    `${item.bodyA} ${item.aspect} ${item.bodyB} — orbe ${item.orb.toFixed(2)}°, intensité ${item.importance}.`
  ));

  return lines;
}

export function buildTransitComparison(natalInput, transitInput, options = {}, natalOptions = null) {
  const natalChart = buildChart(natalInput, natalOptions ?? {});
  const transitChart = buildChart(transitInput, natalOptions ?? {});

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
    tresFort: aspects.filter((a) => a.importance === 'très fort').length,
    fort: aspects.filter((a) => a.importance === 'fort').length,
    modere: aspects.filter((a) => a.importance === 'modéré').length,
    leger: aspects.filter((a) => a.importance === 'léger').length
  };

  return {
    natalChart,
    transitChart,
    aspects,
    summary,
    synthesis: buildTransitSynthesis(aspects)
  };
}
