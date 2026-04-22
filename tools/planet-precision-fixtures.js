export const PLANET_PRECISION_FIXTURES = [
  {
    id: 'planet-jpl-2026-03-20T12-00Z',
    label: 'JPL Horizons geocentric vectors at 2026-03-20 12:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT', VEC_TABLE='1'",
    input: {
      date: '2026-03-20',
      time: '12:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: 0.6366388481814688, yAu: -0.2555703029382477, zAu: 0.01273413643198865 },
      Venus: { xAu: 1.536000415166325, yAu: 0.4721125634914466, zAu: -0.02456959079468354 },
      Mars: { xAu: 2.219855929498976, yAu: -0.647406619065419, zAu: -0.04341044155660503 },
      Jupiter: { xAu: -1.253706571218433, yAu: 4.724407510005614, zAu: 0.03066760293060049 },
      Saturn: { xAu: 10.45678011254170, yAu: 0.6858289301018267, zAu: -0.3886924041152329 },
      Uranus: { xAu: 10.60598534411476, yAu: 16.93173204897345, zAu: -0.06169908803349636 },
      Neptune: { xAu: 30.86053486435837, yAu: 0.7584375550991777, zAu: -0.7040046405597251 }
    }
  },
  {
    id: 'planet-jpl-2026-09-23T00-00Z',
    label: 'JPL Horizons geocentric vectors at 2026-09-23 00:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT', VEC_TABLE='1'",
    input: {
      date: '2026-09-23',
      time: '00:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: -1.197367452727679, yAu: -0.4147518502662128, zAu: -0.01664952927206931 },
      Venus: { xAu: -0.3176746268937148, yAu: -0.2324719793664413, zAu: -0.04285333613639752 },
      Mars: { xAu: -0.7693842864455247, yAu: 1.53678363776316, zAu: 0.02633122331968828 },
      Jupiter: { xAu: -4.447575204396785, yAu: 4.040303076646493, zAu: 0.06030392874016314 },
      Saturn: { xAu: 8.266335856549231, yAu: 1.729506603144957, zAu: -0.3989999377429906 },
      Uranus: { xAu: 7.955390359862622, yAu: 17.26209271719097, zAu: -0.05207272625275085 },
      Neptune: { xAu: 28.83537070215505, yAu: 1.361485883594321, zAu: -0.7155262262161117 }
    }
  }
];
