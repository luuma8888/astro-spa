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

    while (placed.some((item) => angleDistance(item.longitudeDeg, body.longitudeDeg) < 6 && item.level === level)) {
      level += 1;
    }

    placed.push({ ...body, level });
  }

  return placed;
}

function aspectStrokeStyle(name) {
  switch (name) {
    case 'conjonction':
      return '#666';
    case 'opposition':
      return '#c44';
    case 'carré':
      return '#d80';
    case 'trigone':
      return '#2a8';
    case 'sextile':
      return '#48c';
    default:
      return '#999';
  }
}

function drawAspectLines(ctx, cx, cy, radius, placedBodies, aspects) {
  const bodyMap = new Map(placedBodies.map((item) => [item.labelKey, item]));

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
    { labelKey: 'Soleil', key: 'sun', body: chart.bodies?.sun },
    { labelKey: 'Lune', key: 'moon', body: chart.bodies?.moon },
    ...Object.entries(chart.planets ?? {}).map(([key, body]) => ({ labelKey: key, key, body }))
  ]
    .filter((item) => item.body && Number.isFinite(item.body.longitudeDeg))
    .map((item) => ({
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
