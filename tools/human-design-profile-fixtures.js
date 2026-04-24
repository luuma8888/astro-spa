export const HUMAN_DESIGN_PROFILE_FIXTURES = [
  {
    id: 'hd-profile-01',
    input: {
      date: '1970-07-28',
      time: '10:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 1,
      timeZone: 'Europe/Brussels'
    },
    expected: {
      conscious: {
        Sun: { gate: 31, line: 4, color: 1, tone: 3, base: 2 },
        Earth: { gate: 41, line: 4, color: 1, tone: 3, base: 2 },
        Moon: { gate: 16, line: 5, color: 5, tone: 1, base: 5 },
        NorthNode: { gate: 55, line: 4, color: 2, tone: 3, base: 1 },
        SouthNode: { gate: 59, line: 4, color: 2, tone: 3, base: 1 },
        Mercury: { gate: 29, line: 2, color: 1, tone: 4, base: 3 },
        Venus: { gate: 47, line: 1, color: 6, tone: 5, base: 4 },
        Mars: { gate: 31, line: 5, color: 5, tone: 5, base: 2 },
        Jupiter: { gate: 50, line: 2, color: 4, tone: 2, base: 5 },
        Saturn: { gate: 23, line: 3, color: 4, tone: 6, base: 2 },
        Uranus: { gate: 18, line: 2, color: 5, tone: 5, base: 5 },
        Neptune: { gate: 14, line: 4, color: 6, tone: 3, base: 4 }
      },
      unconscious: {
        Sun: { gate: 27, line: 6, color: 2, tone: 2, base: 1 },
        Earth: { gate: 28, line: 6, color: 2, tone: 2, base: 1 },
        Moon: { gate: 61, line: 2, color: 1, tone: 1, base: 2 },
        NorthNode: { gate: 37, line: 5, color: 4, tone: 6, base: 2 },
        SouthNode: { gate: 40, line: 5, color: 4, tone: 6, base: 2 },
        Mercury: { gate: 23, line: 4, color: 5, tone: 6, base: 2 },
        Venus: { gate: 8, line: 6, color: 3, tone: 6, base: 3 },
        Mars: { gate: 16, line: 1, color: 2, tone: 4, base: 5 },
        Jupiter: { gate: 50, line: 5, color: 2, tone: 3, base: 2 },
        Saturn: { gate: 24, line: 5, color: 1, tone: 3, base: 1 },
        Uranus: { gate: 18, line: 2, color: 5, tone: 4, base: 1 },
        Neptune: { gate: 34, line: 1, color: 1, tone: 1, base: 3 }
      }
    }
  },
  {
    id: 'hd-profile-02',
    input: {
      date: '1985-05-01',
      time: '06:36:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 2,
      timeZone: 'Europe/Brussels'
    },
    expected: {
      conscious: {
        Sun: { gate: 24, line: 4, color: 3, tone: 1, base: 2 },
        Earth: { gate: 44, line: 4, color: 3, tone: 1, base: 2 },
        Moon: { gate: 47, line: 3, color: 6, tone: 4, base: 3 },
        NorthNode: { gate: 2, line: 6, color: 2, tone: 5, base: 3 },
        SouthNode: { gate: 1, line: 6, color: 2, tone: 5, base: 3 },
        Mercury: { gate: 21, line: 5, color: 5, tone: 6, base: 2 },
        Venus: { gate: 17, line: 4, color: 1, tone: 2, base: 2 },
        Mars: { gate: 20, line: 4, color: 3, tone: 4, base: 2 },
        Jupiter: { gate: 13, line: 2, color: 6, tone: 6, base: 4 },
        Saturn: { gate: 14, line: 2, color: 3, tone: 6, base: 5 },
        Uranus: { gate: 26, line: 1, color: 3, tone: 2, base: 4 },
        Neptune: { gate: 10, line: 6, color: 4, tone: 2, base: 1 }
      },
      unconscious: {
        Sun: { gate: 19, line: 6, color: 3, tone: 6, base: 1 },
        Earth: { gate: 33, line: 6, color: 3, tone: 6, base: 1 },
        Moon: { gate: 45, line: 6, color: 6, tone: 1, base: 4 },
        NorthNode: { gate: 23, line: 6, color: 4, tone: 4, base: 3 },
        SouthNode: { gate: 43, line: 6, color: 4, tone: 4, base: 3 },
        Mercury: { gate: 60, line: 5, color: 3, tone: 5, base: 3 },
        Venus: { gate: 25, line: 2, color: 2, tone: 1, base: 5 },
        Mars: { gate: 25, line: 2, color: 1, tone: 1, base: 4 },
        Jupiter: { gate: 60, line: 3, color: 4, tone: 6, base: 1 },
        Saturn: { gate: 14, line: 3, color: 6, tone: 1, base: 2 },
        Uranus: { gate: 5, line: 6, color: 6, tone: 4, base: 4 },
        Neptune: { gate: 10, line: 5, color: 4, tone: 5, base: 3 }
      }
    }
  },
  {
    id: 'hd-profile-03',
    input: {
      date: '1965-03-18',
      time: '21:40:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0,
      timeZone: 'Europe/Brussels'
    },
    expected: {
      conscious: {
        Sun: { gate: 36, line: 6, color: 5, tone: 4, base: 5 },
        Earth: { gate: 6, line: 6, color: 5, tone: 4, base: 5 },
        Moon: { gate: 57, line: 1, color: 6, tone: 4, base: 5 },
        NorthNode: { gate: 45, line: 1, color: 2, tone: 1, base: 2 },
        SouthNode: { gate: 26, line: 1, color: 2, tone: 1, base: 2 },
        Mercury: { gate: 51, line: 2, color: 1, tone: 1, base: 4 },
        Venus: { gate: 22, line: 6, color: 2, tone: 1, base: 2 },
        Mars: { gate: 64, line: 4, color: 6, tone: 6, base: 5 },
        Jupiter: { gate: 23, line: 5, color: 2, tone: 6, base: 5 },
        Saturn: { gate: 37, line: 5, color: 4, tone: 4, base: 3 },
        Uranus: { gate: 64, line: 1, color: 5, tone: 6, base: 3 },
        Neptune: { gate: 43, line: 2, color: 1, tone: 1, base: 1 }
      },
      unconscious: {
        Sun: { gate: 10, line: 2, color: 6, tone: 3, base: 4 },
        Earth: { gate: 15, line: 2, color: 6, tone: 3, base: 4 },
        Moon: { gate: 33, line: 2, color: 2, tone: 5, base: 1 },
        NorthNode: { gate: 12, line: 1, color: 3, tone: 3, base: 2 },
        SouthNode: { gate: 11, line: 1, color: 3, tone: 3, base: 2 },
        Mercury: { gate: 11, line: 1, color: 3, tone: 3, base: 4 },
        Venus: { gate: 34, line: 4, color: 2, tone: 5, base: 1 },
        Mars: { gate: 47, line: 4, color: 6, tone: 2, base: 1 },
        Jupiter: { gate: 2, line: 4, color: 5, tone: 3, base: 5 },
        Saturn: { gate: 55, line: 1, color: 2, tone: 6, base: 3 },
        Uranus: { gate: 64, line: 4, color: 5, tone: 2, base: 2 },
        Neptune: { gate: 43, line: 1, color: 2, tone: 1, base: 1 }
      }
    }
  },
  {
    id: 'hd-profile-04',
    input: {
      date: '1946-09-09',
      time: '12:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 1,
      timeZone: 'Europe/Paris'
    },
    expected: {
      conscious: {
        Sun: { gate: 64, line: 6, color: 1, tone: 4, base: 3 },
        Earth: { gate: 63, line: 6, color: 1, tone: 4, base: 3 },
        Moon: { gate: 49, line: 4, color: 2, tone: 4, base: 1 },
        NorthNode: { gate: 35, line: 6, color: 3, tone: 5, base: 1 },
        SouthNode: { gate: 5, line: 6, color: 3, tone: 5, base: 1 },
        Mercury: { gate: 40, line: 6, color: 5, tone: 2, base: 3 },
        Venus: { gate: 28, line: 1, color: 3, tone: 3, base: 2 },
        Mars: { gate: 57, line: 6, color: 1, tone: 2, base: 3 },
        Jupiter: { gate: 50, line: 1, color: 4, tone: 1, base: 4 },
        Saturn: { gate: 31, line: 3, color: 5, tone: 2, base: 4 },
        Uranus: { gate: 45, line: 5, color: 6, tone: 5, base: 3 },
        Neptune: { gate: 18, line: 4, color: 6, tone: 3, base: 3 }
      },
      unconscious: {
        Sun: { gate: 45, line: 2, color: 2, tone: 3, base: 2 },
        Earth: { gate: 26, line: 2, color: 2, tone: 3, base: 2 },
        Moon: { gate: 32, line: 2, color: 2, tone: 5, base: 1 },
        NorthNode: { gate: 45, line: 5, color: 1, tone: 3, base: 2 },
        SouthNode: { gate: 26, line: 5, color: 1, tone: 3, base: 2 },
        Mercury: { gate: 15, line: 1, color: 6, tone: 2, base: 2 },
        Venus: { gate: 53, line: 5, color: 6, tone: 5, base: 5 },
        Mars: { gate: 4, line: 6, color: 3, tone: 6, base: 1 },
        Jupiter: { gate: 57, line: 3, color: 4, tone: 1, base: 5 },
        Saturn: { gate: 62, line: 3, color: 4, tone: 6, base: 3 },
        Uranus: { gate: 45, line: 1, color: 4, tone: 5, base: 5 },
        Neptune: { gate: 18, line: 3, color: 1, tone: 5, base: 1 }
      }
    }
  },
  {
    id: 'hd-profile-05',
    input: {
      date: '1968-03-03',
      time: '06:00:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 0,
      timeZone: 'Europe/Brussels'
    },
    expected: {
      conscious: {
        Sun: { gate: 63, line: 2, color: 3, tone: 5, base: 1 },
        Earth: { gate: 64, line: 2, color: 3, tone: 5, base: 1 },
        Moon: { gate: 3, line: 2, color: 3, tone: 6, base: 5 },
        NorthNode: { gate: 51, line: 5, color: 2, tone: 2, base: 4 },
        SouthNode: { gate: 57, line: 5, color: 2, tone: 2, base: 4 },
        Mercury: { gate: 13, line: 5, color: 6, tone: 4, base: 3 },
        Venus: { gate: 13, line: 2, color: 5, tone: 1, base: 4 },
        Mars: { gate: 21, line: 3, color: 1, tone: 6, base: 1 },
        Jupiter: { gate: 29, line: 6, color: 2, tone: 1, base: 1 },
        Saturn: { gate: 21, line: 2, color: 6, tone: 5, base: 2 },
        Uranus: { gate: 6, line: 6, color: 4, tone: 1, base: 4 },
        Neptune: { gate: 14, line: 3, color: 1, tone: 6, base: 4 }
      },
      unconscious: {
        Sun: { gate: 5, line: 4, color: 4, tone: 3, base: 5 },
        Earth: { gate: 35, line: 4, color: 4, tone: 3, base: 5 },
        Moon: { gate: 55, line: 1, color: 5, tone: 6, base: 1 },
        NorthNode: { gate: 3, line: 1, color: 3, tone: 3, base: 1 },
        SouthNode: { gate: 50, line: 1, color: 3, tone: 3, base: 1 },
        Mercury: { gate: 34, line: 4, color: 1, tone: 4, base: 3 },
        Venus: { gate: 50, line: 5, color: 1, tone: 3, base: 5 },
        Mars: { gate: 41, line: 3, color: 4, tone: 3, base: 2 },
        Jupiter: { gate: 59, line: 6, color: 5, tone: 2, base: 5 },
        Saturn: { gate: 17, line: 2, color: 6, tone: 3, base: 1 },
        Uranus: { gate: 46, line: 1, color: 4, tone: 6, base: 2 },
        Neptune: { gate: 14, line: 1, color: 3, tone: 1, base: 5 }
      }
    }
  },
  {
    id: 'hd-profile-06',
    input: {
      date: '1963-12-27',
      time: '14:25:00',
      latitude: 0,
      longitude: 0,
      utcOffset: 1,
      timeZone: 'Europe/Paris'
    },
    expected: {
      conscious: {
        Sun: { gate: 58, line: 2, color: 2, tone: 4, base: 4 },
        Earth: { gate: 52, line: 2, color: 2, tone: 4, base: 4 },
        Moon: { gate: 8, line: 1, color: 2, tone: 2, base: 3 },
        NorthNode: { gate: 39, line: 2, color: 5, tone: 6, base: 3 },
        SouthNode: { gate: 38, line: 2, color: 5, tone: 6, base: 3 },
        Mercury: { gate: 54, line: 6, color: 6, tone: 1, base: 4 },
        Venus: { gate: 41, line: 3, color: 6, tone: 1, base: 3 },
        Mars: { gate: 54, line: 2, color: 6, tone: 6, base: 4 },
        Jupiter: { gate: 21, line: 1, color: 6, tone: 4, base: 4 },
        Saturn: { gate: 49, line: 2, color: 2, tone: 1, base: 2 },
        Uranus: { gate: 40, line: 5, color: 4, tone: 2, base: 3 },
        Neptune: { gate: 1, line: 5, color: 1, tone: 3, base: 3 }
      },
      unconscious: {
        Sun: { gate: 18, line: 4, color: 3, tone: 3, base: 3 },
        Earth: { gate: 17, line: 4, color: 3, tone: 3, base: 3 },
        Moon: { gate: 37, line: 2, color: 1, tone: 3, base: 3 },
        NorthNode: { gate: 53, line: 2, color: 6, tone: 6, base: 4 },
        SouthNode: { gate: 54, line: 2, color: 6, tone: 6, base: 4 },
        Mercury: { gate: 47, line: 5, color: 1, tone: 1, base: 5 },
        Venus: { gate: 57, line: 1, color: 4, tone: 2, base: 5 },
        Mars: { gate: 44, line: 6, color: 2, tone: 5, base: 5 },
        Jupiter: { gate: 51, line: 1, color: 3, tone: 1, base: 1 },
        Saturn: { gate: 13, line: 4, color: 5, tone: 5, base: 3 },
        Uranus: { gate: 40, line: 2, color: 6, tone: 6, base: 5 },
        Neptune: { gate: 1, line: 1, color: 5, tone: 6, base: 5 }
      }
    }
  }
];
