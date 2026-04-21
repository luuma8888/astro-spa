export const PRECISION_FIXTURES = [
  {
    id: 'crediton-2026-02-01',
    source: 'https://aa.usno.navy.mil/calculated/rstt/oneday?date=2026-02-01&dst=false&label=Crediton&lat=50.7921&lon=-3.6503&submit=Get+Data&tz=0.00&tz_label=false&tz_sign=1',
    label: 'Crediton, UK',
    input: {
      date: '2026-02-01',
      time: '12:00:00',
      latitude: 50.7921,
      longitude: -3.6503,
      utcOffset: 0
    },
    reference: {
      sunRiseLocal: '07:51',
      sunSetLocal: '17:06',
      moonRiseLocal: '16:32',
      moonSetLocal: '07:57',
      illuminationPercent: 100
    }
  },
  {
    id: 'pec-2026-02-14',
    source: 'https://aa.usno.navy.mil/calculated/rstt/oneday?date=2026-02-14&dst=false&label=Pec&lat=42.6667&lon=20.3&submit=Get+Data&tz=1.00&tz_label=false&tz_sign=1',
    label: 'Pec, XK',
    input: {
      date: '2026-02-14',
      time: '12:00:00',
      latitude: 42.6667,
      longitude: 20.3,
      utcOffset: 1
    },
    reference: {
      sunRiseLocal: '06:37',
      sunSetLocal: '17:09',
      moonRiseLocal: '05:06',
      moonSetLocal: '13:48',
      illuminationPercent: 10
    }
  },
  {
    id: 'male-2026-02-12',
    source: 'https://aa.usno.navy.mil/calculated/rstt/oneday?date=2026-02-12&dst=false&label=Male&lat=4.2&lon=73.5333&submit=Get+Data&tz=5.00&tz_label=false&tz_sign=1',
    label: 'Male, MV',
    input: {
      date: '2026-02-12',
      time: '12:00:00',
      latitude: 4.2,
      longitude: 73.5333,
      utcOffset: 5
    },
    reference: {
      sunRiseLocal: '06:21',
      sunSetLocal: '18:19',
      moonRiseLocal: '01:56',
      moonSetLocal: '14:02',
      illuminationPercent: 25
    }
  },
  {
    id: 'dawei-2026-02-21',
    source: 'https://aa.usno.navy.mil/calculated/rstt/oneday?date=2026-02-21&dst=false&label=Dawei&lat=14.1&lon=98.21667&submit=Get+Data&tz=6.50&tz_label=false&tz_sign=1',
    label: 'Dawei, MM',
    input: {
      date: '2026-02-21',
      time: '12:00:00',
      latitude: 14.1,
      longitude: 98.21667,
      utcOffset: 6.5
    },
    reference: {
      sunRiseLocal: '06:18',
      sunSetLocal: '18:04',
      moonRiseLocal: '08:43',
      moonSetLocal: '21:31',
      illuminationPercent: 16
    }
  },
  {
    id: 'apuka-2026-02-21',
    source: 'https://aa.usno.navy.mil/calculated/rstt/oneday?date=2026-02-21&dst=false&label=Apuka&lat=60.43333&lon=169.66667&submit=Get+Data&tz=12.00&tz_label=false&tz_sign=1',
    label: 'Apuka, RU',
    input: {
      date: '2026-02-21',
      time: '12:00:00',
      latitude: 60.43333,
      longitude: 169.66667,
      utcOffset: 12
    },
    reference: {
      sunRiseLocal: '08:05',
      sunSetLocal: '17:46',
      moonRiseLocal: '08:26',
      moonSetLocal: '23:24',
      illuminationPercent: 14
    }
  }
];
