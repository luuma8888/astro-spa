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
