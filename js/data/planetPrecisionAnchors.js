export const PLANET_PRECISION_ANCHORS = [
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
      Mercury: { xAu: 0.6366388481814688, yAu: -0.2555703029382477, zAu: 0.01273413643198865, raJ2000Deg: 339.38506, decJ2000Deg: -7.53219 },
      Venus: { xAu: 1.536000415166325, yAu: 0.4721125634914466, zAu: -0.02456959079468354, raJ2000Deg: 16.08016, decJ2000Deg: 5.89939 },
      Mars: { xAu: 2.219855929498976, yAu: -0.647406619065419, zAu: -0.04341044155660503, raJ2000Deg: 345.43197, decJ2000Deg: -7.38899 },
      Jupiter: { xAu: -1.253706571218433, yAu: 4.724407510005614, zAu: 0.03066760293060049, raJ2000Deg: 106.17222, decJ2000Deg: 22.96834 },
      Saturn: { xAu: 10.45678011254170, yAu: 0.6858289301018267, zAu: -0.3886924041152329, raJ2000Deg: 4.28521, decJ2000Deg: -0.45864 },
      Uranus: { xAu: 10.60598534411476, yAu: 16.93173204897345, zAu: -0.06169908803349636, raJ2000Deg: 55.71808, decJ2000Deg: 19.52771 },
      Neptune: { xAu: 30.86053486435837, yAu: 0.7584375550991777, zAu: -0.7040046405597251, raJ2000Deg: 1.81027, decJ2000Deg: -0.63914 }
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
      Mercury: { xAu: -1.197367452727679, yAu: -0.4147518502662128, zAu: -0.01664952927206931, raJ2000Deg: 197.33745, decJ2000Deg: -8.17443 },
      Venus: { xAu: -0.3176746268937148, yAu: -0.2324719793664413, zAu: -0.04285333613639752, raJ2000Deg: 211.70962, decJ2000Deg: -19.44081 },
      Mars: { xAu: -0.7693842864455247, yAu: 1.53678363776316, zAu: 0.02633122331968828, raJ2000Deg: 118.79647, decJ2000Deg: 21.69796 },
      Jupiter: { xAu: -4.447575204396785, yAu: 4.040303076646493, zAu: 0.06030392874016314, raJ2000Deg: 140.37035, decJ2000Deg: 16.06172 },
      Saturn: { xAu: 8.266335856549231, yAu: 1.729506603144957, zAu: -0.3989999377429906, raJ2000Deg: 11.92160, decJ2000Deg: 2.18114 },
      Uranus: { xAu: 7.955390359862622, yAu: 17.26209271719097, zAu: -0.05207272625275085, raJ2000Deg: 63.35791, decJ2000Deg: 21.02283 },
      Neptune: { xAu: 28.83537070215505, yAu: 1.361485883594321, zAu: -0.7155262262161117, raJ2000Deg: 3.04374, decJ2000Deg: -0.22841 }
    }
  },
  {
    id: 'planet-jpl-2026-01-15T00-00Z',
    label: 'JPL Horizons geocentric vectors at 2026-01-15 00:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS' and EPHEM_TYPE='OBSERVER', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT'",
    input: {
      date: '2026-01-15',
      time: '00:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: 0.4955160466171754, yAu: -1.341106810788516, zAu: -0.04445628194823775, raJ2000Deg: 292.21596, decJ2000Deg: -23.66999 },
      Venus: { xAu: 0.7619847523778646, yAu: -1.530641089349779, zAu: -0.02913356466815242, raJ2000Deg: 298.67640, decJ2000Deg: -21.81972 },
      Mars: { xAu: 0.9416888036719535, yAu: -2.205039646666774, zAu: -0.04049723022587748, raJ2000Deg: 295.13105, decJ2000Deg: -22.41230 },
      Jupiter: { xAu: -1.387379162041778, yAu: 4.003153665015153, zAu: 0.01985802550739652, raJ2000Deg: 110.73180, decJ2000Deg: 22.34274 },
      Saturn: { xAu: 9.908044888055825, yAu: -0.5596588240924391, zAu: -0.3839739225573999, raJ2000Deg: 357.91315, decJ2000Deg: -3.31933 },
      Uranus: { xAu: 10.23980568969235, yAu: 15.92999359080528, zAu: -0.06495490111951595, raJ2000Deg: 55.03062, decJ2000Deg: 19.35719 },
      Neptune: { xAu: 30.27844766325808, yAu: -0.3321586471456199, zAu: -0.6999023280329680, raJ2000Deg: 359.94918, decJ2000Deg: -1.46523 }
    }
  },
  {
    id: 'planet-jpl-2026-06-21T12-00Z',
    label: 'JPL Horizons geocentric vectors at 2026-06-21 12:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS' and EPHEM_TYPE='OBSERVER', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT'",
    input: {
      date: '2026-06-21',
      time: '12:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: -0.2893120573142566, yAu: 0.6707613781316246, zAu: -0.001393687961810300, raJ2000Deg: 115.16179, decJ2000Deg: 21.31577 },
      Venus: { xAu: -0.6999221422086646, yAu: 0.8653820698674349, zAu: 0.03847960752931925, raJ2000Deg: 131.94836, decJ2000Deg: 19.92615 },
      Mars: { xAu: 1.242258978717393, yAu: 1.734673038367124, zAu: -0.01536909334301257, raJ2000Deg: 52.12856, decJ2000Deg: 18.46736 },
      Jupiter: { xAu: -2.866394544744866, yAu: 5.439156912262546, zAu: 0.04578522667432728, raJ2000Deg: 119.96059, decJ2000Deg: 21.02232 },
      Saturn: { xAu: 9.383840777013251, yAu: 2.225223039300101, zAu: -0.3944937588888547, raJ2000Deg: 13.18418, decJ2000Deg: 3.10658 },
      Uranus: { xAu: 9.290978645583140, yAu: 18.11657919549894, zAu: -0.05697137183700773, raJ2000Deg: 60.82806, decJ2000Deg: 20.57130 },
      Neptune: { xAu: 29.85722308104867, yAu: 2.076323876622305, zAu: -0.7098469473586502, raJ2000Deg: 4.18906, decJ2000Deg: 0.33384 }
    }
  },
  {
    id: 'planet-jpl-2026-12-15T00-00Z',
    label: 'JPL Horizons geocentric vectors at 2026-12-15 00:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS' and EPHEM_TYPE='OBSERVER', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT'",
    input: {
      date: '2026-12-15',
      time: '00:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: -0.4104345488396369, yAu: -1.330989987926645, zAu: -0.002856742002726913, raJ2000Deg: 251.39917, decJ2000Deg: -22.45559 },
      Venus: { xAu: -0.4167742932073449, yAu: -0.3194338321769596, zAu: 0.02585740660192042, raJ2000Deg: 216.05151, decJ2000Deg: -11.33630 },
      Mars: { xAu: -0.9640197295269781, yAu: 0.4269785119711693, zAu: 0.05001240351589165, raJ2000Deg: 158.90373, decJ2000Deg: 11.79443 },
      Jupiter: { xAu: -4.029694455167540, yAu: 2.653177987048013, zAu: 0.07232231569230321, raJ2000Deg: 149.16313, decJ2000Deg: 13.44334 },
      Saturn: { xAu: 9.022222220530912, yAu: 1.198505709594738, zAu: -0.4019749785216993, raJ2000Deg: 7.94544, decJ2000Deg: 0.67811 },
      Uranus: { xAu: 8.538953631656833, yAu: 16.41190643753843, zAu: -0.04771163475686792, raJ2000Deg: 60.47270, decJ2000Deg: 20.51796 },
      Neptune: { xAu: 29.69765872207868, yAu: 0.6402500532632350, zAu: -0.7205120750195337, raJ2000Deg: 1.68480, decJ2000Deg: -0.78404 }
    }
  },
  {
    id: 'planet-jpl-2026-08-12T00-00Z',
    label: 'JPL Horizons geocentric vectors at 2026-08-12 00:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS' and EPHEM_TYPE='OBSERVER', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT'",
    input: {
      date: '2026-08-12',
      time: '00:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: -6.207679772302747E-01, yAu: 9.392066217114777E-01, zAu: 9.171753907086352E-03, raJ2000Deg: 125.87781, decJ2000Deg: 19.83481 },
      Venus: { xAu: -7.094537016485494E-01, yAu: -5.962883834112005E-02, zAu: -1.316384642725964E-02, raJ2000Deg: 183.98906, decJ2000Deg: -2.88102 },
      Mars: { xAu: -2.062937674098388E-03, yAu: 1.950083455382218E+00, zAu: 8.195866863386476E-03, raJ2000Deg: 90.06203, decJ2000Deg: 23.67994 },
      Jupiter: { xAu: -3.957561276475605E+00, yAu: 4.883144447769309E+00, zAu: 5.388842502019306E-02, raJ2000Deg: 131.58950, decJ2000Deg: 18.47519 },
      Saturn: { xAu: 8.558462386201885E+00, yAu: 2.158071305354227E+00, zAu: -3.971351134916190E-01, raJ2000Deg: 14.02411, decJ2000Deg: 3.20493 },
      Uranus: { xAu: 8.342342363244828E+00, yAu: 1.785200586315738E+01, zAu: -5.428473004088823E-02, raJ2000Deg: 63.03784, decJ2000Deg: 20.96746 },
      Neptune: { xAu: 2.908135487645997E+01, yAu: 1.887935897899978E+00, zAu: -7.129927542449687E-01, raJ2000Deg: 3.96412, decJ2000Deg: 0.18990 }
    }
  },
  {
    id: 'planet-jpl-2026-12-10T00-00Z',
    label: 'JPL Horizons geocentric vectors at 2026-12-10 00:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS' and EPHEM_TYPE='OBSERVER', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT'",
    input: {
      date: '2026-12-10',
      time: '00:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: -5.652423214752680E-01, yAu: -1.221899248800750E+00, zAu: 1.117237674829069E-02, raJ2000Deg: 243.32744, decJ2000Deg: -20.69303 },
      Venus: { xAu: -4.075107381329144E-01, yAu: -2.701629267138340E-01, zAu: 2.082809838819670E-02, raJ2000Deg: 212.15471, decJ2000Deg: -10.40240 },
      Mars: { xAu: -9.920344409058538E-01, yAu: 4.701516859662545E-01, zAu: 4.918603776110887E-02, raJ2000Deg: 157.45368, decJ2000Deg: 12.19684 },
      Jupiter: { xAu: -4.089586740535625E+00, yAu: 2.693438958503658E+00, zAu: 7.162478801270154E-02, raJ2000Deg: 149.14801, decJ2000Deg: 13.42654 },
      Saturn: { xAu: 8.944039624552097E+00, yAu: 1.185882406774031E+00, zAu: -4.018221497603712E-01, raJ2000Deg: 7.94086, decJ2000Deg: 0.65309 },
      Uranus: { xAu: 8.470584470728012E+00, yAu: 1.641851085462365E+01, zAu: -4.797411382327851E-02, raJ2000Deg: 60.67981, decJ2000Deg: 20.55556 },
      Neptune: { xAu: 2.961249394860727E+01, yAu: 6.389531654498385E-01, zAu: -7.202125971889315E-01, raJ2000Deg: 1.68711, decJ2000Deg: -0.78676 }
    }
  },
  {
    id: 'planet-jpl-2034-03-20T12-00Z',
    label: 'JPL Horizons geocentric vectors at 2034-03-20 12:00 UTC',
    source: "https://ssd.jpl.nasa.gov/api/horizons.api with EPHEM_TYPE='VECTORS' and EPHEM_TYPE='OBSERVER', CENTER='500@399', REF_PLANE='ECLIPTIC', TIME_TYPE='UT'",
    input: {
      date: '2034-03-20',
      time: '12:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0
    },
    reference: {
      Mercury: { xAu: 9.843135525481354E-01, yAu: -4.719182556786645E-01, zAu: -3.678073919566589E-02, raJ2000Deg: 336.97045, decJ2000Deg: -11.69960 },
      Venus: { xAu: 1.523746477697166E+00, yAu: 4.844764639374090E-01, zAu: -2.367419153590540E-02, raJ2000Deg: 16.58301, decJ2000Deg: 6.13590 },
      Mars: { xAu: 1.393306596540393E+00, yAu: 1.470552546587339E+00, zAu: 2.126767726181803E-02, raJ2000Deg: 43.89447, decJ2000Deg: 17.35826 },
      Jupiter: { xAu: 5.899593898009395E+00, yAu: -8.226597926538228E-01, zAu: -1.063341759334731E-01, raJ2000Deg: 353.11148, decJ2000Deg: -4.08983 },
      Saturn: { xAu: -2.099302795252092E+00, yAu: 8.481996053742364E+00, zAu: -2.432102225546443E-02, raJ2000Deg: 105.07684, decJ2000Deg: 22.55519 },
      Uranus: { xAu: -5.246303340820099E-01, yAu: 1.886808217970738E+01, zAu: 8.966095728476239E-02, raJ2000Deg: 91.73802, decJ2000Deg: 23.70184 },
      Neptune: { xAu: 2.916663049633092E+01, yAu: 9.797791247579021E+00, zAu: -8.511601328983347E-01, raJ2000Deg: 17.73398, decJ2000Deg: 5.81064 }
    }
  }
];
