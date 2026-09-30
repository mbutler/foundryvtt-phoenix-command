// Compatibility data, not reverified against the
// book - with two exceptions.
//
// `oddsOfHitting_4G` HAS been reverified, against LEG10200 PDF 63 (28 September 2026, user
// ruling to follow the page). EAL 28 to -2 agreed. Below that the page leaves Single Shot
// blank - no roll hits - and prints Burst Elevation at -3, -4, -5, -6, -8 (03), -10 (02),
// -15 (01), -17 (00) and -22 (blank); the port had listed every EAL to -11 with shifted values.
// A blank is stored as -1, which no 00-99 roll is at or under. The EALs the page skips are
// filled with the next lower printed line (the standing ambiguous-heading rule), so every EAL
// from 28 to -22 has a row and -22 is the floor.
//
// `movementModifiers_4D` HAS been reverified, against LEG10200 PDF 63, and 23 of its cells
// were wrong. The error ran through the speed rows 20 to 100 only, and always in the same
// direction: the ported value came from one column too far left, so every fast mover was
// penalised more than the book says. Infantry speeds - the rows up to 10 - were already
// correct, as were 110 and above. The key "Speed HPI" is the book's own label for that axis
// and is kept, though D17 rules the figure entered there is hexes per phase.
//
// The corrected values satisfy the table's own structure: every row is monotonic across
// range, every column is monotonic down speed, and each row's printed run ends exactly where
// its shading begins. See docs/decisions.md and runtime verification.
//
// "Speed HPI" is the printed row's own speed, not a bucket. A speed between two rows reads
// the HIGHER of them - the first row equal to or greater than the actual speed - which is
// the convention §2.4 states for this table's range axis. All seventeen printed rows are
// present; 120 is no longer folded into an open-ended catch-all, so a speed beyond the
// table's domain is refused rather than silently read as 120.
export const legacyFirearm = {
  "skillAccuracy_1C": [
    {
      "Skill Level": 0,
      "SAL": 0
    },
    {
      "Skill Level": 1,
      "SAL": 5
    },
    {
      "Skill Level": 2,
      "SAL": 7
    },
    {
      "Skill Level": 3,
      "SAL": 9
    },
    {
      "Skill Level": 4,
      "SAL": 10
    },
    {
      "Skill Level": 5,
      "SAL": 11
    },
    {
      "Skill Level": 6,
      "SAL": 12
    },
    {
      "Skill Level": 7,
      "SAL": 13
    },
    {
      "Skill Level": 8,
      "SAL": 14
    },
    {
      "Skill Level": 9,
      "SAL": 15
    },
    {
      "Skill Level": 10,
      "SAL": 16
    },
    {
      "Skill Level": 11,
      "SAL": 17
    },
    {
      "Skill Level": 12,
      "SAL": 18
    },
    {
      "Skill Level": 13,
      "SAL": 19
    },
    {
      "Skill Level": 14,
      "SAL": 20
    },
    {
      "Skill Level": 15,
      "SAL": 21
    },
    {
      "Skill Level": 16,
      "SAL": 22
    },
    {
      "Skill Level": 17,
      "SAL": 23
    },
    {
      "Skill Level": 18,
      "SAL": 24
    },
    {
      "Skill Level": 19,
      "SAL": 25
    },
    {
      "Skill Level": 20,
      "SAL": 26
    }
  ],
  "oddsOfHitting_4G": [
    {
      "EAL": 28,
      "Single Shot": 99,
      "Burst Elevation": 99
    },
    {
      "EAL": 27,
      "Single Shot": 98,
      "Burst Elevation": 98
    },
    {
      "EAL": 26,
      "Single Shot": 96,
      "Burst Elevation": 98
    },
    {
      "EAL": 25,
      "Single Shot": 94,
      "Burst Elevation": 97
    },
    {
      "EAL": 24,
      "Single Shot": 90,
      "Burst Elevation": 95
    },
    {
      "EAL": 23,
      "Single Shot": 86,
      "Burst Elevation": 92
    },
    {
      "EAL": 22,
      "Single Shot": 80,
      "Burst Elevation": 90
    },
    {
      "EAL": 21,
      "Single Shot": 74,
      "Burst Elevation": 86
    },
    {
      "EAL": 20,
      "Single Shot": 67,
      "Burst Elevation": 82
    },
    {
      "EAL": 19,
      "Single Shot": 60,
      "Burst Elevation": 77
    },
    {
      "EAL": 18,
      "Single Shot": 53,
      "Burst Elevation": 73
    },
    {
      "EAL": 17,
      "Single Shot": 46,
      "Burst Elevation": 68
    },
    {
      "EAL": 16,
      "Single Shot": 39,
      "Burst Elevation": 62
    },
    {
      "EAL": 15,
      "Single Shot": 33,
      "Burst Elevation": 57
    },
    {
      "EAL": 14,
      "Single Shot": 27,
      "Burst Elevation": 52
    },
    {
      "EAL": 13,
      "Single Shot": 22,
      "Burst Elevation": 47
    },
    {
      "EAL": 12,
      "Single Shot": 18,
      "Burst Elevation": 43
    },
    {
      "EAL": 11,
      "Single Shot": 15,
      "Burst Elevation": 38
    },
    {
      "EAL": 10,
      "Single Shot": 12,
      "Burst Elevation": 34
    },
    {
      "EAL": 9,
      "Single Shot": 9,
      "Burst Elevation": 31
    },
    {
      "EAL": 8,
      "Single Shot": 7,
      "Burst Elevation": 27
    },
    {
      "EAL": 7,
      "Single Shot": 6,
      "Burst Elevation": 24
    },
    {
      "EAL": 6,
      "Single Shot": 5,
      "Burst Elevation": 21
    },
    {
      "EAL": 5,
      "Single Shot": 4,
      "Burst Elevation": 19
    },
    {
      "EAL": 4,
      "Single Shot": 3,
      "Burst Elevation": 17
    },
    {
      "EAL": 3,
      "Single Shot": 2,
      "Burst Elevation": 15
    },
    {
      "EAL": 2,
      "Single Shot": 2,
      "Burst Elevation": 13
    },
    {
      "EAL": 1,
      "Single Shot": 1,
      "Burst Elevation": 11
    },
    {
      "EAL": 0,
      "Single Shot": 1,
      "Burst Elevation": 10
    },
    {
      "EAL": -1,
      "Single Shot": 1,
      "Burst Elevation": 9
    },
    {
      "EAL": -2,
      "Single Shot": 0,
      "Burst Elevation": 8
    },
    {
      "EAL": -3,
      "Single Shot": -1,
      "Burst Elevation": 7
    },
    {
      "EAL": -4,
      "Single Shot": -1,
      "Burst Elevation": 6
    },
    {
      "EAL": -5,
      "Single Shot": -1,
      "Burst Elevation": 5
    },
    {
      "EAL": -6,
      "Single Shot": -1,
      "Burst Elevation": 4
    },
    {
      "EAL": -7,
      "Single Shot": -1,
      "Burst Elevation": 3
    },
    {
      "EAL": -8,
      "Single Shot": -1,
      "Burst Elevation": 3
    },
    {
      "EAL": -9,
      "Single Shot": -1,
      "Burst Elevation": 2
    },
    {
      "EAL": -10,
      "Single Shot": -1,
      "Burst Elevation": 2
    },
    {
      "EAL": -11,
      "Single Shot": -1,
      "Burst Elevation": 1
    },
    {
      "EAL": -12,
      "Single Shot": -1,
      "Burst Elevation": 1
    },
    {
      "EAL": -13,
      "Single Shot": -1,
      "Burst Elevation": 1
    },
    {
      "EAL": -14,
      "Single Shot": -1,
      "Burst Elevation": 1
    },
    {
      "EAL": -15,
      "Single Shot": -1,
      "Burst Elevation": 1
    },
    {
      "EAL": -16,
      "Single Shot": -1,
      "Burst Elevation": 0
    },
    {
      "EAL": -17,
      "Single Shot": -1,
      "Burst Elevation": 0
    },
    {
      "EAL": -18,
      "Single Shot": -1,
      "Burst Elevation": -1
    },
    {
      "EAL": -19,
      "Single Shot": -1,
      "Burst Elevation": -1
    },
    {
      "EAL": -20,
      "Single Shot": -1,
      "Burst Elevation": -1
    },
    {
      "EAL": -21,
      "Single Shot": -1,
      "Burst Elevation": -1
    },
    {
      "EAL": -22,
      "Single Shot": -1,
      "Burst Elevation": -1
    }
  ],
  "movementModifiers_4D": [
          {
                "10": -6,
                "20": -5,
                "40": -5,
                "70": -5,
                "100": -5,
                "200": -5,
                "300": -5,
                "400": -5,
                "600": -5,
                "800": -5,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 0.5
          },
          {
                "10": -8,
                "20": -6,
                "40": -5,
                "70": -5,
                "100": -5,
                "200": -5,
                "300": -5,
                "400": -5,
                "600": -5,
                "800": -5,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 1
          },
          {
                "10": -10,
                "20": -8,
                "40": -6,
                "70": -5,
                "100": -5,
                "200": -5,
                "300": -5,
                "400": -5,
                "600": -5,
                "800": -5,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 2
          },
          {
                "10": -10,
                "20": -10,
                "40": -7,
                "70": -6,
                "100": -5,
                "200": -5,
                "300": -5,
                "400": -5,
                "600": -5,
                "800": -5,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 3
          },
          {
                "10": -10,
                "20": -10,
                "40": -8,
                "70": -6,
                "100": -6,
                "200": -5,
                "300": -5,
                "400": -5,
                "600": -5,
                "800": -5,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 4
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -8,
                "200": -6,
                "300": -5,
                "400": -5,
                "600": -5,
                "800": -5,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 10
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -8,
                "300": -7,
                "400": -6,
                "600": -5,
                "800": -5,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 20
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -8,
                "400": -7,
                "600": -6,
                "800": -6,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 30
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -9,
                "400": -8,
                "600": -7,
                "800": -6,
                "1000": -5,
                "1200": -5,
                "1500": -5,
                "Speed HPI": 40
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -9,
                "600": -8,
                "800": -7,
                "1000": -6,
                "1200": -6,
                "1500": -5,
                "Speed HPI": 50
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -10,
                "600": -8,
                "800": -7,
                "1000": -6,
                "1200": -6,
                "1500": -6,
                "Speed HPI": 60
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -10,
                "600": -9,
                "800": -8,
                "1000": -7,
                "1200": -6,
                "1500": -6,
                "Speed HPI": 70
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -10,
                "600": -9,
                "800": -8,
                "1000": -7,
                "1200": -7,
                "1500": -6,
                "Speed HPI": 80
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -10,
                "600": -10,
                "800": -9,
                "1000": -8,
                "1200": -7,
                "1500": -6,
                "Speed HPI": 90
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -10,
                "600": -10,
                "800": -9,
                "1000": -8,
                "1200": -7,
                "1500": -7,
                "Speed HPI": 100
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -10,
                "600": -10,
                "800": -10,
                "1000": -9,
                "1200": -8,
                "1500": -7,
                "Speed HPI": 110
          },
          {
                "10": -10,
                "20": -10,
                "40": -10,
                "70": -10,
                "100": -10,
                "200": -10,
                "300": -10,
                "400": -10,
                "600": -10,
                "800": -10,
                "1000": -9,
                "1200": -8,
                "1500": -7,
                "Speed HPI": 120
          }
    ],
  "situationAndStanceModifiers_4B": [
    {
      "Situation": "Standing",
      "ALM": 0
    },
    {
      "Situation": "Standing & Braced",
      "ALM": 4
    },
    {
      "Situation": "Kneeling",
      "ALM": 3
    },
    {
      "Situation": "Kneeling & Braced",
      "ALM": 5
    },
    {
      "Situation": "Prone",
      "ALM": 6
    },
    {
      "Situation": "Prone & Braced",
      "ALM": 7
    },
    {
      "Situation": "Using Sling for Support",
      "ALM": 1
    },
    {
      "Situation": "Firing from the Hip",
      "ALM": -6
    },
    {
      "Situation": "Firing Rifle with One Hand",
      "ALM": -7
    },
    {
      "Situation": "Firing Pistol with One Hand",
      "ALM": -4
    },
    {
      "Situation": "Folding Stock Not Used",
      "ALM": -4
    },
    {
      "Situation": "Firing Pistol Double Action",
      "ALM": -3
    },
    {
      "Situation": "Deployed Bipod Not Braced",
      "ALM": -2
    },
    {
      "Situation": "Bipod Mounted Weapon",
      "ALM": 3
    },
    {
      "Situation": "Tripod Mounted Weapon",
      "ALM": 5
    },
    {
      "Situation": "Turret Mounted Weapon",
      "ALM": 11
    },
    {
      "Situation": "Pistol with Shoulder Stock",
      "ALM": 3
    }
  ],
  "visibilityModifiers_4C": [
    {
      "Visibility": "Good Visibility",
      "ALM": 0
    },
    {
      "Visibility": "Dusk",
      "ALM": -2
    },
    {
      "Visibility": "Night - Full Moon",
      "ALM": -4
    },
    {
      "Visibility": "Night - 1/2 Moon",
      "ALM": -6
    },
    {
      "Visibility": "Night - No Moon",
      "ALM": -12
    },
    {
      "Visibility": "Firing at Muzzle Flash",
      "ALM": -10
    },
    {
      "Visibility": "Smoke, Haze, Fog",
      "ALM": -6
    },
    {
      "Visibility": "Looking into a Light",
      "ALM": -8
    },
    {
      "Visibility": "Optical Scope under 8 hexes",
      "ALM": -6
    },
    {
      "Visibility": "Optical Scope Broken",
      "ALM": -4
    },
    {
      "Visibility": "Advanced Aiming System Broken",
      "ALM": -8
    },
    {
      "Visibility": "Weapon Sights Broken",
      "ALM": -4
    },
    {
      "Visibility": "Firing from Teargas, No Mask",
      "ALM": -8
    },
    {
      "Visibility": "Shooter Not Looking",
      "ALM": -14
    }
  ],
  "standardTargetSizeModifiers_4E": [
    {
      "Position": "Look Over/Around",
      "Target Size": -4,
      "Auto Elev": -3,
      "Auto Width": -3
    },
    {
      "Position": "Fire Over/Around",
      "Target Size": 0,
      "Auto Elev": 2,
      "Auto Width": 2
    },
    {
      "Position": "Standing Exposed",
      "Target Size": 7,
      "Auto Elev": 14,
      "Auto Width": 1
    },
    {
      "Position": "Kneeling Exposed",
      "Target Size": 6,
      "Auto Elev": 11,
      "Auto Width": 3
    },
    {
      "Position": "Prone/Crawl",
      "Target Size": 2,
      "Auto Elev": 2,
      "Auto Width": 2
    },
    {
      "Position": "Running",
      "Target Size": 8,
      "Auto Elev": 14,
      "Auto Width": 1
    },
    {
      "Position": "Low Crouch",
      "Target Size": 7,
      "Auto Elev": 11,
      "Auto Width": 2
    },
    {
      "Position": "Hands and Knees",
      "Target Size": 6,
      "Auto Elev": 8,
      "Auto Width": 1
    },
    {
      "Position": "Low Prone",
      "Target Size": 1,
      "Auto Elev": 0,
      "Auto Width": 5
    },
    {
      "Position": "Head",
      "Target Size": -3,
      "Auto Elev": 0,
      "Auto Width": -3
    },
    {
      "Position": "Body",
      "Target Size": 5,
      "Auto Elev": 8,
      "Auto Width": 3
    },
    {
      "Position": "Legs",
      "Target Size": 4,
      "Auto Elev": 8,
      "Auto Width": 0
    }
  ],
  "effectiveArmorProtectionFactor_6D": [
    {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "PF": 0
    },
    {
      "0": 2,
      "1": 2,
      "2": 3,
      "3": 3,
      "4": 3,
      "5": 3,
      "6": 4,
      "7": 4,
      "8": 4,
      "9": 5,
      "PF": 2
    },
    {
      "0": 4,
      "1": 5,
      "2": 5,
      "3": 6,
      "4": 6,
      "5": 7,
      "6": 7,
      "7": 8,
      "8": 9,
      "9": 10,
      "PF": 4
    },
    {
      "0": 7,
      "1": 7,
      "2": 8,
      "3": 9,
      "4": 9,
      "5": 10,
      "6": 11,
      "7": 12,
      "8": 13,
      "9": 15,
      "PF": 6
    },
    {
      "0": 11,
      "1": 12,
      "2": 13,
      "3": 14,
      "4": 16,
      "5": 17,
      "6": 19,
      "7": 20,
      "8": 22,
      "9": 24,
      "PF": 10
    },
    {
      "0": 17,
      "1": 19,
      "2": 21,
      "3": 23,
      "4": 25,
      "5": 27,
      "6": 30,
      "7": 32,
      "8": 35,
      "9": 39,
      "PF": 16
    },
    {
      "0": 22,
      "1": 24,
      "2": 26,
      "3": 28,
      "4": 31,
      "5": 34,
      "6": 37,
      "7": 41,
      "8": 44,
      "9": 48,
      "PF": 20
    },
    {
      "0": 33,
      "1": 36,
      "2": 39,
      "3": 43,
      "4": 47,
      "5": 51,
      "6": 56,
      "7": 61,
      "8": 66,
      "9": 73,
      "PF": 30
    },
    {
      "0": 44,
      "1": 48,
      "2": 52,
      "3": 57,
      "4": 62,
      "5": 68,
      "6": 74,
      "7": 81,
      "8": 89,
      "9": 97,
      "PF": 40
    },
    {
      "0": 55,
      "1": 60,
      "2": 65,
      "3": 71,
      "4": 78,
      "5": 85,
      "6": 93,
      "7": 101,
      "8": 111,
      "9": 121,
      "PF": 50
    },
    {
      "0": 66,
      "1": 72,
      "2": 78,
      "3": 85,
      "4": 93,
      "5": 102,
      "6": 111,
      "7": 122,
      "8": 133,
      "9": 145,
      "PF": 60
    },
    {
      "0": 76,
      "1": 84,
      "2": 91,
      "3": 100,
      "4": 109,
      "5": 119,
      "6": 130,
      "7": 142,
      "8": 155,
      "9": 169,
      "PF": 70
    },
    {
      "0": 87,
      "1": 95,
      "2": 104,
      "3": 114,
      "4": 124,
      "5": 136,
      "6": 148,
      "7": 162,
      "8": 177,
      "9": 194,
      "PF": 80
    },
    {
      "0": 98,
      "1": 107,
      "2": 117,
      "3": 128,
      "4": 140,
      "5": 153,
      "6": 167,
      "7": 182,
      "8": 199,
      "9": 218,
      "PF": 90
    },
    {
      "0": 109,
      "1": 119,
      "2": 130,
      "3": 142,
      "4": 156,
      "5": 170,
      "6": 186,
      "7": 203,
      "8": 221,
      "9": 242,
      "PF": 100
    },
    {
      "0": 131,
      "1": 143,
      "2": 156,
      "3": 171,
      "4": 187,
      "5": 204,
      "6": 223,
      "7": 243,
      "8": 266,
      "9": 290,
      "PF": 120
    },
    {
      "0": 153,
      "1": 167,
      "2": 182,
      "3": 199,
      "4": 218,
      "5": 238,
      "6": 260,
      "7": 284,
      "8": 310,
      "9": 339,
      "PF": 140
    },
    {
      "0": 197,
      "1": 215,
      "2": 235,
      "3": 256,
      "4": 280,
      "5": 306,
      "6": 334,
      "7": 365,
      "8": 399,
      "9": 435,
      "PF": 180
    },
    {
      "0": 218,
      "1": 239,
      "2": 261,
      "3": 285,
      "4": 311,
      "5": 340,
      "6": 371,
      "7": 405,
      "8": 443,
      "9": 484,
      "PF": 200
    }
  ],
  "hitLocationDamage_6A": {
    "DC 1": [
      {
        "1": 5,
        "2": 7,
        "3": 7,
        "5": 7,
        "10": 7,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance",
        "0.5": 1,
        "1.5": 7
      },
      {
        "1": 1000,
        "2": 2000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead",
        "0.5": 11,
        "1.5": 2000
      },
      {
        "1": 1000,
        "2": 3000,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose",
        "0.5": 4,
        "1.5": 2000
      },
      {
        "1": 3,
        "2": 45,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth",
        "0.5": 1,
        "1.5": 3
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 4,
        "2": 5,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine",
        "0.5": 3,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 2,
        "2": 4,
        "3": 4,
        "5": 4,
        "10": 4,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder",
        "0.5": 1,
        "1.5": 2
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 7,
        "10": 7,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow",
        "0.5": 1,
        "1.5": 2
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 6,
        "10": 6,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 0,
        "2": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical",
        "0.5": 0,
        "1.5": 0
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 3,
        "2": 7,
        "3": 200,
        "5": 300,
        "10": 300,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck",
        "0.5": 1,
        "1.5": 6
      },
      {
        "1": 1,
        "2": 71,
        "3": 79,
        "5": 79,
        "10": 79,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib",
        "0.5": 1,
        "1.5": 64
      },
      {
        "1": 40,
        "2": 51,
        "3": 51,
        "5": 51,
        "10": 51,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung",
        "0.5": 37,
        "1.5": 51
      },
      {
        "1": 2000,
        "2": 3000,
        "3": 4000,
        "5": 4000,
        "10": 4000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart",
        "0.5": 1,
        "1.5": 3000
      },
      {
        "1": 6,
        "2": 42,
        "3": 49,
        "5": 49,
        "10": 49,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib",
        "0.5": 1,
        "1.5": 31
      },
      {
        "1": 27,
        "2": 35,
        "3": 35,
        "5": 35,
        "10": 35,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver",
        "0.5": 4,
        "1.5": 28
      },
      {
        "1": 4,
        "2": 27,
        "3": 38,
        "5": 38,
        "10": 38,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib",
        "0.5": 1,
        "1.5": 19
      },
      {
        "1": 17,
        "2": 28,
        "3": 28,
        "5": 28,
        "10": 28,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach",
        "0.5": 3,
        "1.5": 19
      },
      {
        "1": 2,
        "2": 41,
        "3": 50,
        "5": 50,
        "10": 50,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen",
        "0.5": 1,
        "1.5": 25
      },
      {
        "1": 47,
        "2": 58,
        "3": 58,
        "5": 58,
        "10": 58,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney",
        "0.5": 2,
        "1.5": 49
      },
      {
        "1": 44,
        "2": 53,
        "3": 53,
        "5": 53,
        "10": 53,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney",
        "0.5": 4,
        "1.5": 45
      },
      {
        "1": 12,
        "2": 200,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine",
        "0.5": 4,
        "1.5": 12
      },
      {
        "1": 17,
        "2": 21,
        "3": 21,
        "5": 21,
        "10": 21,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines",
        "0.5": 3,
        "1.5": 21
      },
      {
        "1": 3,
        "2": 200,
        "3": 200,
        "5": 300,
        "10": 300,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine",
        "0.5": 1,
        "1.5": 3
      },
      {
        "1": 10,
        "2": 19,
        "3": 21,
        "5": 21,
        "10": 21,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis",
        "0.5": 3,
        "1.5": 11
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 2,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh",
        "0.5": 1,
        "1.5": 3
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 5,
        "10": 16,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 2,
        "3": 2,
        "5": 3,
        "10": 4,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 2,
        "10": 14,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone",
        "0.5": 1,
        "1.5": 1
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot",
        "0.5": 1,
        "1.5": 1
      }
    ],
    "DC 2": [
      {
        "1": 16,
        "2": 24,
        "3": 24,
        "5": 24,
        "10": 24,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance",
        "1.5": 24,
        "2.5": 24
      },
      {
        "1": 4000,
        "2": 6000,
        "3": 8000,
        "5": 8000,
        "10": 8000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead",
        "1.5": 5000,
        "2.5": 8000
      },
      {
        "1": 4000,
        "2": 10000,
        "3": 10000,
        "5": 10000,
        "10": 10000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose",
        "1.5": 5000,
        "2.5": 10000
      },
      {
        "1": 11,
        "2": 200,
        "3": 800,
        "5": 800,
        "10": 800,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth",
        "1.5": 12,
        "2.5": 800
      },
      {
        "1": 5,
        "2": 5,
        "3": 5,
        "5": 5,
        "10": 5,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh",
        "1.5": 5,
        "2.5": 5
      },
      {
        "1": 15,
        "2": 700,
        "3": 800,
        "5": 800,
        "10": 800,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine",
        "1.5": 17,
        "2.5": 800
      },
      {
        "1": 2,
        "2": 2,
        "3": 2,
        "5": 2,
        "10": 2,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance",
        "1.5": 2,
        "2.5": 2
      },
      {
        "1": 7,
        "2": 14,
        "3": 14,
        "5": 14,
        "10": 14,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder",
        "1.5": 8,
        "2.5": 14
      },
      {
        "1": 2,
        "2": 2,
        "3": 2,
        "5": 2,
        "10": 2,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance",
        "1.5": 2,
        "2.5": 2
      },
      {
        "1": 3,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh",
        "1.5": 3,
        "2.5": 3
      },
      {
        "1": 1,
        "2": 3,
        "3": 5,
        "5": 23,
        "10": 23,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone",
        "1.5": 2,
        "2.5": 4
      },
      {
        "1": 4,
        "2": 9,
        "3": 10,
        "5": 10,
        "10": 10,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow",
        "1.5": 7,
        "2.5": 10
      },
      {
        "1": 2,
        "2": 2,
        "3": 2,
        "5": 2,
        "10": 2,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh",
        "1.5": 2,
        "2.5": 2
      },
      {
        "1": 6,
        "2": 1,
        "3": 4,
        "5": 20,
        "10": 20,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone",
        "1.5": 1,
        "2.5": 2
      },
      {
        "1": 1,
        "2": 1,
        "3": 1,
        "5": 1,
        "10": 1,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand",
        "1.5": 1,
        "2.5": 1
      },
      {
        "1": 0,
        "2": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical",
        "1.5": 0,
        "2.5": 0
      },
      {
        "1": 3,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance",
        "1.5": 3,
        "2.5": 3
      },
      {
        "1": 12,
        "2": 24,
        "3": 800,
        "5": 800,
        "10": 900,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck",
        "1.5": 21,
        "2.5": 500
      },
      {
        "1": 1,
        "2": 87,
        "3": 98,
        "5": 98,
        "10": 98,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib",
        "1.5": 79,
        "2.5": 98
      },
      {
        "1": 50,
        "2": 62,
        "3": 62,
        "5": 62,
        "10": 62,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung",
        "1.5": 62,
        "2.5": 62
      },
      {
        "1": 8000,
        "2": 10000,
        "3": 10000,
        "5": 10000,
        "10": 10000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart",
        "1.5": 10000,
        "2.5": 10000
      },
      {
        "1": 21,
        "2": 100,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib",
        "1.5": 100,
        "2.5": 200
      },
      {
        "1": 94,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver",
        "1.5": 98,
        "2.5": 100
      },
      {
        "1": 6,
        "2": 37,
        "3": 53,
        "5": 53,
        "10": 53,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib",
        "1.5": 27,
        "2.5": 45
      },
      {
        "1": 24,
        "2": 40,
        "3": 40,
        "5": 40,
        "10": 40,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach",
        "1.5": 27,
        "2.5": 40
      },
      {
        "1": 6,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen",
        "1.5": 64,
        "2.5": 100
      },
      {
        "1": 100,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney",
        "1.5": 100,
        "2.5": 200
      },
      {
        "1": 200,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney",
        "1.5": 200,
        "2.5": 200
      },
      {
        "1": 41,
        "2": 700,
        "3": 900,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine",
        "1.5": 43,
        "2.5": 900
      },
      {
        "1": 23,
        "2": 28,
        "3": 28,
        "5": 28,
        "10": 28,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines",
        "1.5": 28,
        "2.5": 28
      },
      {
        "1": 11,
        "2": 600,
        "3": 800,
        "5": 800,
        "10": 800,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine",
        "1.5": 12,
        "2.5": 800
      },
      {
        "1": 18,
        "2": 32,
        "3": 35,
        "5": 35,
        "10": 35,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis",
        "1.5": 19,
        "2.5": 35
      },
      {
        "1": 3,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance",
        "1.5": 3,
        "2.5": 3
      },
      {
        "1": 6,
        "2": 12,
        "3": 12,
        "5": 12,
        "10": 12,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh",
        "1.5": 12,
        "2.5": 12
      },
      {
        "1": 3,
        "2": 4,
        "3": 5,
        "5": 16,
        "10": 57,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone",
        "1.5": 3,
        "2.5": 4
      },
      {
        "1": 3,
        "2": 9,
        "3": 12,
        "5": 13,
        "10": 13,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee",
        "1.5": 7,
        "2.5": 10
      },
      {
        "1": 3,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh",
        "1.5": 3,
        "2.5": 3
      },
      {
        "1": 1,
        "2": 1,
        "3": 2,
        "5": 8,
        "10": 47,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone",
        "1.5": 1,
        "2.5": 1
      },
      {
        "1": 1,
        "2": 2,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot",
        "1.5": 1,
        "2.5": 3
      }
    ],
    "DC 3": [
      {
        "1": 57,
        "2": 83,
        "3": 83,
        "5": 83,
        "10": 83,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance",
        "1.5": 83,
        "2.5": 83
      },
      {
        "1": 10000,
        "2": 20000,
        "3": 30000,
        "5": 30000,
        "10": 30000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead",
        "1.5": 20000,
        "2.5": 30000
      },
      {
        "1": 10000,
        "2": 40000,
        "3": 40000,
        "5": 40000,
        "10": 40000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose",
        "1.5": 20000,
        "2.5": 40000
      },
      {
        "1": 37,
        "2": 500,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth",
        "1.5": 40,
        "2.5": 3000
      },
      {
        "1": 11,
        "2": 11,
        "3": 11,
        "5": 11,
        "10": 11,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh",
        "1.5": 11,
        "2.5": 11
      },
      {
        "1": 54,
        "2": 3000,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine",
        "1.5": 60,
        "2.5": 3000
      },
      {
        "1": 3,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance",
        "1.5": 3,
        "2.5": 3
      },
      {
        "1": 23,
        "2": 49,
        "3": 49,
        "5": 49,
        "10": 49,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder",
        "1.5": 27,
        "2.5": 49
      },
      {
        "1": 3,
        "2": 3,
        "3": 3,
        "5": 3,
        "10": 3,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance",
        "1.5": 3,
        "2.5": 3
      },
      {
        "1": 9,
        "2": 9,
        "3": 9,
        "5": 9,
        "10": 9,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh",
        "1.5": 9,
        "2.5": 9
      },
      {
        "1": 5,
        "2": 9,
        "3": 16,
        "5": 81,
        "10": 81,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone",
        "1.5": 7,
        "2.5": 13
      },
      {
        "1": 14,
        "2": 30,
        "3": 34,
        "5": 34,
        "10": 34,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow",
        "1.5": 25,
        "2.5": 34
      },
      {
        "1": 6,
        "2": 6,
        "3": 6,
        "5": 6,
        "10": 6,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh",
        "1.5": 6,
        "2.5": 6
      },
      {
        "1": 4,
        "2": 8,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone",
        "1.5": 6,
        "2.5": 15
      },
      {
        "1": 4,
        "2": 4,
        "3": 4,
        "5": 4,
        "10": 4,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand",
        "1.5": 4,
        "2.5": 4
      },
      {
        "1": 0,
        "2": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical",
        "1.5": 0,
        "2.5": 0
      },
      {
        "1": 5,
        "2": 5,
        "3": 5,
        "5": 5,
        "10": 5,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance",
        "1.5": 5,
        "2.5": 5
      },
      {
        "1": 40,
        "2": 83,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck",
        "1.5": 74,
        "2.5": 2000
      },
      {
        "1": 2,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib",
        "1.5": 100,
        "2.5": 100
      },
      {
        "1": 71,
        "2": 89,
        "3": 89,
        "5": 89,
        "10": 89,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung",
        "1.5": 89,
        "2.5": 89
      },
      {
        "1": 30000,
        "2": 30000,
        "3": 50000,
        "5": 50000,
        "10": 50000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart",
        "1.5": 30000,
        "2.5": 40000
      },
      {
        "1": 75,
        "2": 500,
        "3": 600,
        "5": 600,
        "10": 600,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib",
        "1.5": 400,
        "2.5": 600
      },
      {
        "1": 300,
        "2": 400,
        "3": 400,
        "5": 400,
        "10": 400,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver",
        "1.5": 300,
        "2.5": 400
      },
      {
        "1": 11,
        "2": 63,
        "3": 89,
        "5": 89,
        "10": 89,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib",
        "1.5": 46,
        "2.5": 89
      },
      {
        "1": 41,
        "2": 67,
        "3": 67,
        "5": 67,
        "10": 67,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach",
        "1.5": 45,
        "2.5": 67
      },
      {
        "1": 19,
        "2": 300,
        "3": 400,
        "5": 400,
        "10": 400,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen",
        "1.5": 200,
        "2.5": 400
      },
      {
        "1": 400,
        "2": 500,
        "3": 500,
        "5": 500,
        "10": 500,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney",
        "1.5": 400,
        "2.5": 500
      },
      {
        "1": 500,
        "2": 600,
        "3": 600,
        "5": 600,
        "10": 600,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney",
        "1.5": 600,
        "2.5": 600
      },
      {
        "1": 100,
        "2": 2000,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine",
        "1.5": 200,
        "2.5": 3000
      },
      {
        "1": 37,
        "2": 45,
        "3": 45,
        "5": 45,
        "10": 45,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines",
        "1.5": 45,
        "2.5": 45
      },
      {
        "1": 35,
        "2": 2000,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine",
        "1.5": 39,
        "2.5": 3000
      },
      {
        "1": 37,
        "2": 67,
        "3": 73,
        "5": 73,
        "10": 73,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis",
        "1.5": 40,
        "2.5": 73
      },
      {
        "1": 5,
        "2": 5,
        "3": 5,
        "5": 5,
        "10": 5,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance",
        "1.5": 5,
        "2.5": 5
      },
      {
        "1": 22,
        "2": 42,
        "3": 42,
        "5": 42,
        "10": 42,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh",
        "1.5": 42,
        "2.5": 42
      },
      {
        "1": 10,
        "2": 14,
        "3": 18,
        "5": 55,
        "10": 200,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone",
        "1.5": 10,
        "2.5": 15
      },
      {
        "1": 12,
        "2": 30,
        "3": 41,
        "5": 47,
        "10": 47,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee",
        "1.5": 25,
        "2.5": 35
      },
      {
        "1": 9,
        "2": 9,
        "3": 9,
        "5": 9,
        "10": 9,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh",
        "1.5": 9,
        "2.5": 9
      },
      {
        "1": 2,
        "2": 4,
        "3": 7,
        "5": 29,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone",
        "1.5": 2,
        "2.5": 4
      },
      {
        "1": 3,
        "2": 7,
        "3": 12,
        "5": 12,
        "10": 12,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot",
        "1.5": 4,
        "2.5": 9
      }
    ],
    "DC 4": [
      {
        "1": 100,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance",
        "2.5": 200
      },
      {
        "1": 30000,
        "2": 50000,
        "3": 60000,
        "5": 60000,
        "10": 60000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead",
        "2.5": 60000
      },
      {
        "1": 30000,
        "2": 80000,
        "3": 80000,
        "5": 80000,
        "10": 80000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose",
        "2.5": 80000
      },
      {
        "1": 77,
        "2": 1000,
        "3": 6000,
        "5": 6000,
        "10": 6000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth",
        "2.5": 50000
      },
      {
        "1": 19,
        "2": 19,
        "3": 19,
        "5": 19,
        "10": 19,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh",
        "2.5": 19
      },
      {
        "1": 100,
        "2": 5000,
        "3": 6000,
        "5": 6000,
        "10": 6000,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine",
        "2.5": 6000
      },
      {
        "1": 5,
        "2": 5,
        "3": 5,
        "5": 5,
        "10": 5,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance",
        "2.5": 5
      },
      {
        "1": 48,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder",
        "2.5": 100
      },
      {
        "1": 5,
        "2": 5,
        "3": 5,
        "5": 5,
        "10": 5,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance",
        "2.5": 5
      },
      {
        "1": 18,
        "2": 18,
        "3": 18,
        "5": 18,
        "10": 18,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh",
        "2.5": 18
      },
      {
        "1": 10,
        "2": 20,
        "3": 34,
        "5": 100,
        "10": 100,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone",
        "2.5": 28
      },
      {
        "1": 29,
        "2": 62,
        "3": 71,
        "5": 71,
        "10": 71,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow",
        "2.5": 71
      },
      {
        "1": 12,
        "2": 12,
        "3": 12,
        "5": 12,
        "10": 12,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh",
        "2.5": 12
      },
      {
        "1": 8,
        "2": 17,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone",
        "2.5": 38
      },
      {
        "1": 8,
        "2": 8,
        "3": 8,
        "5": 8,
        "10": 8,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand",
        "2.5": 8
      },
      {
        "1": 0,
        "2": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical",
        "2.5": 0
      },
      {
        "1": 7,
        "2": 7,
        "3": 7,
        "5": 7,
        "10": 7,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance",
        "2.5": 7
      },
      {
        "1": 83,
        "2": 200,
        "3": 6000,
        "5": 6000,
        "10": 6000,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck",
        "2.5": 3000
      },
      {
        "1": 2,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib",
        "2.5": 200
      },
      {
        "1": 96,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung",
        "2.5": 100
      },
      {
        "1": 60000,
        "2": 70000,
        "3": 100000,
        "5": 100000,
        "10": 100000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart",
        "2.5": 80000
      },
      {
        "1": 200,
        "2": 1000,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib",
        "2.5": 1000
      },
      {
        "1": 700,
        "2": 900,
        "3": 900,
        "5": 900,
        "10": 900,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver",
        "2.5": 900
      },
      {
        "1": 16,
        "2": 95,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib",
        "2.5": 100
      },
      {
        "1": 62,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach",
        "2.5": 100
      },
      {
        "1": 37,
        "2": 600,
        "3": 800,
        "5": 800,
        "10": 800,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen",
        "2.5": 800
      },
      {
        "1": 700,
        "2": 900,
        "3": 900,
        "5": 900,
        "10": 900,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney",
        "2.5": 900
      },
      {
        "1": 1000,
        "2": 1000,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney",
        "2.5": 1000
      },
      {
        "1": 300,
        "2": 5000,
        "3": 7000,
        "5": 7000,
        "10": 7000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine",
        "2.5": 7000
      },
      {
        "1": 53,
        "2": 66,
        "3": 66,
        "5": 66,
        "10": 66,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines",
        "2.5": 66
      },
      {
        "1": 71,
        "2": 4000,
        "3": 5000,
        "5": 5000,
        "10": 5000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine",
        "2.5": 5000
      },
      {
        "1": 63,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis",
        "2.5": 100
      },
      {
        "1": 7,
        "2": 7,
        "3": 7,
        "5": 7,
        "10": 7,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance",
        "2.5": 7
      },
      {
        "1": 46,
        "2": 88,
        "3": 88,
        "5": 88,
        "10": 88,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh",
        "2.5": 88
      },
      {
        "1": 21,
        "2": 29,
        "3": 38,
        "5": 100,
        "10": 400,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone",
        "2.5": 31
      },
      {
        "1": 24,
        "2": 62,
        "3": 86,
        "5": 97,
        "10": 97,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee",
        "2.5": 73
      },
      {
        "1": 18,
        "2": 18,
        "3": 18,
        "5": 18,
        "10": 18,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh",
        "2.5": 18
      },
      {
        "1": 4,
        "2": 9,
        "3": 14,
        "5": 60,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone",
        "2.5": 9
      },
      {
        "1": 6,
        "2": 14,
        "3": 25,
        "5": 25,
        "10": 25,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot",
        "2.5": 20
      }
    ],
    "DC 5": [
      {
        "1": 200,
        "2": 300,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance"
      },
      {
        "1": 50000,
        "2": 80000,
        "3": 80000,
        "5": 80000,
        "10": 80000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead"
      },
      {
        "1": 50000,
        "2": 100000,
        "3": 100000,
        "5": 100000,
        "10": 100000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose"
      },
      {
        "1": 100,
        "2": 12000,
        "3": 9000,
        "5": 10000,
        "10": 10000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth"
      },
      {
        "1": 29,
        "2": 29,
        "3": 29,
        "5": 29,
        "10": 29,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh"
      },
      {
        "1": 200,
        "2": 9000,
        "3": 10000,
        "5": 10000,
        "10": 10000,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine"
      },
      {
        "1": 6,
        "2": 6,
        "3": 6,
        "5": 6,
        "10": 6,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance"
      },
      {
        "1": 80,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder"
      },
      {
        "1": 6,
        "2": 6,
        "3": 6,
        "5": 6,
        "10": 6,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance"
      },
      {
        "1": 31,
        "2": 31,
        "3": 31,
        "5": 31,
        "10": 31,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh"
      },
      {
        "1": 17,
        "2": 33,
        "3": 57,
        "5": 100,
        "10": 100,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone"
      },
      {
        "1": 46,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow"
      },
      {
        "1": 20,
        "2": 20,
        "3": 20,
        "5": 20,
        "10": 20,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh"
      },
      {
        "1": 13,
        "2": 29,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone"
      },
      {
        "1": 14,
        "2": 14,
        "3": 14,
        "5": 14,
        "10": 14,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand"
      },
      {
        "1": 0,
        "2": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical"
      },
      {
        "1": 9,
        "2": 9,
        "3": 9,
        "5": 9,
        "10": 9,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance"
      },
      {
        "1": 100,
        "2": 300,
        "3": 10000,
        "5": 10000,
        "10": 10000,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck"
      },
      {
        "1": 3,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib"
      },
      {
        "1": 100,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung"
      },
      {
        "1": 100000,
        "2": 100000,
        "3": 200000,
        "5": 200000,
        "10": 200000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart"
      },
      {
        "1": 300,
        "2": 2000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib"
      },
      {
        "1": 1000,
        "2": 1000,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver"
      },
      {
        "1": 22,
        "2": 100,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib"
      },
      {
        "1": 87,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach"
      },
      {
        "1": 60,
        "2": 1000,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen"
      },
      {
        "1": "-Kidney",
        "2": 1000,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney"
      },
      {
        "1": 2000,
        "2": 2000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney"
      },
      {
        "1": 500,
        "2": 9000,
        "3": 10000,
        "5": 10000,
        "10": "IT",
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine"
      },
      {
        "1": 73,
        "2": 89,
        "3": 89,
        "5": 89,
        "10": 89,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines"
      },
      {
        "1": 100,
        "2": 7000,
        "3": 9000,
        "5": 9000,
        "10": 9000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine"
      },
      {
        "1": 94,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis"
      },
      {
        "1": 9,
        "2": 9,
        "3": 9,
        "5": 9,
        "10": 9,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance"
      },
      {
        "1": 78,
        "2": "l",
        "3": "H",
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh"
      },
      {
        "1": 35,
        "2": 48,
        "3": 63,
        "5": 200,
        "10": 700,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone"
      },
      {
        "1": 40,
        "2": 100,
        "3": 100,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee"
      },
      {
        "1": 31,
        "2": 31,
        "3": 31,
        "5": 31,
        "10": 31,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh"
      },
      {
        "1": 7,
        "2": 14,
        "3": 24,
        "5": 100,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone"
      },
      {
        "1": 9,
        "2": 24,
        "3": 42,
        "5": 42,
        "10": 42,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot"
      }
    ],
    "DC 6": [
      {
        "1": 300,
        "2": 400,
        "3": 400,
        "5": 400,
        "10": 400,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance"
      },
      {
        "1": 70000,
        "2": 100000,
        "3": 100000,
        "5": 100000,
        "10": 100000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead"
      },
      {
        "1": 80000,
        "2": 200000,
        "3": 200000,
        "5": 200000,
        "10": 200000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose"
      },
      {
        "1": 200,
        "2": 3000,
        "3": 10000,
        "5": 10000,
        "10": 10000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth"
      },
      {
        "1": 39,
        "2": 39,
        "3": 39,
        "5": 39,
        "10": 39,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh"
      },
      {
        "1": 10000,
        "2": 10000,
        "3": 10000,
        "5": 10000,
        "10": 700,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine"
      },
      {
        "1": 7,
        "2": 7,
        "3": 7,
        "5": 7,
        "10": 7,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance"
      },
      {
        "1": 100,
        "2": 300,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder"
      },
      {
        "1": 7,
        "2": 7,
        "3": 7,
        "5": 7,
        "10": 7,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance"
      },
      {
        "1": 46,
        "2": 46,
        "3": 46,
        "5": 46,
        "10": 46,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh"
      },
      {
        "1": 26,
        "2": 49,
        "3": 85,
        "5": 100,
        "10": 100,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone"
      },
      {
        "1": 72,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow"
      },
      {
        "1": 31,
        "2": 31,
        "3": 31,
        "5": 31,
        "10": 31,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh"
      },
      {
        "1": 20,
        "2": 43,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone"
      },
      {
        "1": 15,
        "2": 15,
        "3": 15,
        "5": 15,
        "10": 15,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand"
      },
      {
        "1": 0,
        "2": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical"
      },
      {
        "1": 11,
        "2": 11,
        "3": 11,
        "5": 11,
        "10": 11,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance"
      },
      {
        "1": 200,
        "2": 400,
        "3": 20000,
        "5": 20000,
        "10": 20000,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck"
      },
      {
        "1": 3,
        "2": 300,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib"
      },
      {
        "1": 200,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung"
      },
      {
        "1": 200000,
        "2": 200000,
        "3": 300000,
        "5": 300000,
        "10": 300000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart"
      },
      {
        "1": 400,
        "2": 3000,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib"
      },
      {
        "1": 2000,
        "2": 2000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver"
      },
      {
        "1": 29,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib"
      },
      {
        "1": 100,
        "2": 100,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach"
      },
      {
        "1": 88,
        "2": 2000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen"
      },
      {
        "1": 1000,
        "2": 2000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney"
      },
      {
        "1": 3000,
        "2": 3000,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney"
      },
      {
        "1": 700,
        "2": 10000,
        "3": 20000,
        "5": 20000,
        "10": 20000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine"
      },
      {
        "1": 95,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines"
      },
      {
        "1": 200,
        "2": 10000,
        "3": 10000,
        "5": "IT",
        "10": 10000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine"
      },
      {
        "1": 100,
        "2": 200,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis"
      },
      {
        "1": 11,
        "2": 11,
        "3": 11,
        "5": 11,
        "10": 11,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance"
      },
      {
        "1": 100,
        "2": 100,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh"
      },
      {
        "1": 53,
        "2": 72,
        "3": 95,
        "5": 300,
        "10": 700,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone"
      },
      {
        "1": 60,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee"
      },
      {
        "1": 46,
        "2": 46,
        "3": 46,
        "5": 46,
        "10": 46,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh"
      },
      {
        "1": 11,
        "2": 22,
        "3": 35,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone"
      },
      {
        "1": 63,
        "2": 33,
        "3": 84,
        "5": 95,
        "10": 95,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot"
      }
    ],
    "DC 7": [
      {
        "1": 700,
        "2": 1000,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance"
      },
      {
        "1": 200000,
        "2": 300000,
        "3": 300000,
        "5": 300000,
        "10": 300000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead"
      },
      {
        "1": 200000,
        "2": 400000,
        "3": 400000,
        "5": 400000,
        "10": 400000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose"
      },
      {
        "1": 400,
        "2": 7000,
        "3": 30000,
        "5": 30000,
        "10": 30000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth"
      },
      {
        "1": 79,
        "2": 79,
        "3": 79,
        "5": 79,
        "10": 79,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh"
      },
      {
        "1": 30000,
        "2": 30000,
        "3": 30000,
        "5": 30000,
        "10": 1000,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine"
      },
      {
        "1": 11,
        "2": 11,
        "3": 11,
        "5": 11,
        "10": 11,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance"
      },
      {
        "1": 300,
        "2": 600,
        "3": 600,
        "5": 600,
        "10": 600,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder"
      },
      {
        "1": 11,
        "2": 11,
        "3": 11,
        "5": 11,
        "10": 11,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance"
      },
      {
        "1": 100,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh"
      },
      {
        "1": 60,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone"
      },
      {
        "1": 100,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow"
      },
      {
        "1": 50,
        "2": 50,
        "3": 50,
        "5": 50,
        "10": 50,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh"
      },
      {
        "1": 47,
        "2": 60,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone"
      },
      {
        "1": 15,
        "2": 15,
        "3": 15,
        "5": 15,
        "10": 15,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand"
      },
      {
        "1": 0,
        "2": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical"
      },
      {
        "1": 16,
        "2": 16,
        "3": 16,
        "5": 16,
        "10": 16,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance"
      },
      {
        "1": 500,
        "2": 1000,
        "3": 40000,
        "5": 40000,
        "10": 900,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck"
      },
      {
        "1": 6,
        "2": 500,
        "3": 500,
        "5": 500,
        "10": 500,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib"
      },
      {
        "1": 300,
        "2": 300,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung"
      },
      {
        "1": 400000,
        "2": 400000,
        "3": 600000,
        "5": 600000,
        "10": 600000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart"
      },
      {
        "1": 900,
        "2": 6000,
        "3": 7000,
        "5": 7000,
        "10": 7000,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib"
      },
      {
        "1": 4000,
        "2": 5000,
        "3": 5000,
        "5": 5000,
        "10": 5000,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver"
      },
      {
        "1": 56,
        "2": 300,
        "3": 500,
        "5": 500,
        "10": 500,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib"
      },
      {
        "1": 200,
        "2": 200,
        "3": 400,
        "5": 400,
        "10": 400,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach"
      },
      {
        "1": 200,
        "2": 4000,
        "3": 4000,
        "5": 4000,
        "10": 4000,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen"
      },
      {
        "1": 2000,
        "2": 4000,
        "3": 5000,
        "5": 5000,
        "10": 5000,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney"
      },
      {
        "1": 6000,
        "2": 8000,
        "3": 8000,
        "5": 8000,
        "10": 8000,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney"
      },
      {
        "1": 2000,
        "2": 30000,
        "3": 40000,
        "5": 40000,
        "10": 40000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine"
      },
      {
        "1": 200,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines"
      },
      {
        "1": 400,
        "2": 20000,
        "3": 30000,
        "5": 30000,
        "10": 30000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine"
      },
      {
        "1": 300,
        "2": 500,
        "3": 500,
        "5": 500,
        "10": 500,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis"
      },
      {
        "1": 16,
        "2": 16,
        "3": 16,
        "5": 16,
        "10": 16,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance"
      },
      {
        "1": 200,
        "2": 300,
        "3": 500,
        "5": 500,
        "10": 500,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh"
      },
      {
        "1": 100,
        "2": 200,
        "3": 200,
        "5": 700,
        "10": 700,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone"
      },
      {
        "1": 100,
        "2": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee"
      },
      {
        "1": 100,
        "2": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh"
      },
      {
        "1": 26,
        "2": 50,
        "3": 82,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone"
      },
      {
        "1": 95,
        "2": 84,
        "3": 95,
        "5": 95,
        "10": 95,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot"
      }
    ],
    "DC 8": [
      {
        "1": 1000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance"
      },
      {
        "1": 300000,
        "3": 500000,
        "5": 600000,
        "10": 600000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead"
      },
      {
        "1": 300000,
        "3": 800000,
        "5": 800000,
        "10": 800000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose"
      },
      {
        "1": 800,
        "3": 10000,
        "5": 60000,
        "10": 60000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh"
      },
      {
        "1": 1000,
        "3": 50000,
        "5": 60000,
        "10": 60000,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine"
      },
      {
        "1": 15,
        "3": 15,
        "5": 15,
        "10": 15,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance"
      },
      {
        "1": 400,
        "3": 900,
        "5": 900,
        "10": 900,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder"
      },
      {
        "1": 15,
        "3": 15,
        "5": 15,
        "10": 15,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow"
      },
      {
        "1": 50,
        "3": 50,
        "5": 50,
        "10": 50,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh"
      },
      {
        "1": 60,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone"
      },
      {
        "1": 15,
        "3": 15,
        "5": 15,
        "10": 15,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand"
      },
      {
        "1": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical"
      },
      {
        "1": 22,
        "3": 22,
        "5": 22,
        "10": 22,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance"
      },
      {
        "1": 900,
        "3": 2000,
        "5": 60000,
        "10": 70000,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck"
      },
      {
        "1": 9,
        "3": 700,
        "5": 800,
        "10": 800,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib"
      },
      {
        "1": 400,
        "3": 500,
        "5": 500,
        "10": 500,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung"
      },
      {
        "1": 600000,
        "3": 700000,
        "5": 1000000,
        "10": 1000000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart"
      },
      {
        "1": 2000,
        "3": 10000,
        "5": 10000,
        "10": 10000,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib"
      },
      {
        "1": 7000,
        "3": 9000,
        "5": 9000,
        "10": 9000,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver"
      },
      {
        "1": 90,
        "3": 500,
        "5": 800,
        "10": 800,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib"
      },
      {
        "1": 400,
        "3": 400,
        "5": 600,
        "10": 600,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach"
      },
      {
        "1": 400,
        "3": 6000,
        "5": 8000,
        "10": 8000,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen"
      },
      {
        "1": 5000,
        "3": 7000,
        "5": 9000,
        "10": 9000,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney"
      },
      {
        "1": 10000,
        "3": 10000,
        "5": 10000,
        "10": 10000,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney"
      },
      {
        "1": 3000,
        "3": 50000,
        "5": 70000,
        "10": 70000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine"
      },
      {
        "1": 300,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines"
      },
      {
        "1": 700,
        "3": 40000,
        "5": 50000,
        "10": 50000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine"
      },
      {
        "1": 500,
        "3": 800,
        "5": 900,
        "10": 900,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis"
      },
      {
        "1": 22,
        "3": 22,
        "5": 22,
        "10": 22,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance"
      },
      {
        "1": 500,
        "3": 500,
        "5": 600,
        "10": 600,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh"
      },
      {
        "1": 200,
        "3": 300,
        "5": 400,
        "10": 700,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone"
      },
      {
        "1": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh"
      },
      {
        "1": 45,
        "3": 89,
        "5": 100,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone"
      },
      {
        "1": 95,
        "3": 95,
        "5": 95,
        "10": 95,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot"
      }
    ],
    "DC 9": [
      {
        "1": 2000,
        "3": 2000,
        "5": 2000,
        "10": 3000,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance"
      },
      {
        "1": 500000,
        "3": 800000,
        "5": 1000000,
        "10": 1000000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead"
      },
      {
        "1": 600000,
        "3": 1000000,
        "5": 1000000,
        "10": 1000000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose"
      },
      {
        "1": 1000,
        "3": 20000,
        "5": 100000,
        "10": 100000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth"
      },
      {
        "1": 300,
        "3": 300,
        "5": 300,
        "10": 300,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh"
      },
      {
        "1": 200000,
        "3": 100000,
        "5": 100000,
        "10": 100000,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine"
      },
      {
        "1": 22,
        "3": 22,
        "5": 22,
        "10": 22,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance"
      },
      {
        "1": 2000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder"
      },
      {
        "1": 800,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow"
      },
      {
        "1": 50,
        "3": 50,
        "5": 50,
        "10": 50,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh"
      },
      {
        "1": 60,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone"
      },
      {
        "1": 15,
        "3": 15,
        "5": 15,
        "10": 15,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand"
      },
      {
        "1": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical"
      },
      {
        "1": 32,
        "3": 32,
        "5": 32,
        "10": 32,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance"
      },
      {
        "1": 2000,
        "3": 4000,
        "5": 100000,
        "10": 100000,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck"
      },
      {
        "1": 17,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib"
      },
      {
        "1": 700,
        "3": 900,
        "5": 900,
        "10": 900,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung"
      },
      {
        "1": 1000000,
        "3": 2000000,
        "5": 2000000,
        "10": 2000000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart"
      },
      {
        "1": 3000,
        "3": 20000,
        "5": 30000,
        "10": 30000,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib"
      },
      {
        "1": 10000,
        "3": 20000,
        "5": 20000,
        "10": 20000,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver"
      },
      {
        "1": 200,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib"
      },
      {
        "1": 600,
        "3": 700,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach"
      },
      {
        "1": 800,
        "3": 10000,
        "5": 20000,
        "10": 20000,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen"
      },
      {
        "1": 9000,
        "3": 20000,
        "5": 20000,
        "10": 20000,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney"
      },
      {
        "1": 30000,
        "3": 50000,
        "5": 70000,
        "10": 70000,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney"
      },
      {
        "1": 7000,
        "3": 100000,
        "5": 200000,
        "10": 200000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine"
      },
      {
        "1": 500,
        "3": 700,
        "5": 700,
        "10": 700,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines"
      },
      {
        "1": 2000,
        "3": 80000,
        "5": 100000,
        "10": 100000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine"
      },
      {
        "1": 1000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis"
      },
      {
        "1": 32,
        "3": 32,
        "5": 32,
        "10": 32,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance"
      },
      {
        "1": 600,
        "3": 600,
        "5": 600,
        "10": 600,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh"
      },
      {
        "1": 500,
        "3": 700,
        "5": 700,
        "10": 700,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone"
      },
      {
        "1": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh"
      },
      {
        "1": 100,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone"
      },
      {
        "1": 95,
        "3": 95,
        "5": 95,
        "10": 95,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot"
      }
    ],
    "DC 10": [
      {
        "1": 6000,
        "3": 8000,
        "5": 8000,
        "10": 8000,
        "Fire": [
          0,
          3
        ],
        "Open": [
          0,
          1
        ],
        "Hit Location": "Head Glance"
      },
      {
        "1": 700000,
        "3": 1000000,
        "5": 1000000,
        "10": 1000000,
        "Fire": [
          3,
          17
        ],
        "Open": [
          1,
          3
        ],
        "Hit Location": "Forehead"
      },
      {
        "1": 1000000,
        "3": 2000000,
        "5": 2000000,
        "10": 2000000,
        "Fire": [
          17,
          22
        ],
        "Open": [
          3,
          4
        ],
        "Hit Location": "Eye - Nose"
      },
      {
        "1": 2000,
        "3": 40000,
        "5": 200000,
        "10": 200000,
        "Fire": [
          22,
          33
        ],
        "Open": [
          4,
          6
        ],
        "Hit Location": "Mouth"
      },
      {
        "1": 600,
        "3": 600,
        "5": 600,
        "10": 600,
        "Fire": [
          33,
          35
        ],
        "Open": [
          6,
          7
        ],
        "Hit Location": "Neck Flesh"
      },
      {
        "1": 3000,
        "3": 200000,
        "5": 200000,
        "10": 200000,
        "Fire": [
          35,
          37
        ],
        "Open": [
          7,
          8
        ],
        "Hit Location": "Neck Spine"
      },
      {
        "1": 32,
        "3": 32,
        "5": 32,
        "10": 32,
        "Fire": [
          37,
          49
        ],
        "Open": [
          8,
          9
        ],
        "Hit Location": "Shoulder Glance"
      },
      {
        "1": 2000,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": [
          49,
          61
        ],
        "Open": [
          9,
          10
        ],
        "Hit Location": "Shoulder"
      },
      {
        "1": 32,
        "3": 32,
        "5": 32,
        "10": 32,
        "Fire": [
          61,
          67
        ],
        "Open": [
          10,
          11
        ],
        "Hit Location": "Arm Glance"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          67,
          72
        ],
        "Open": [
          11,
          12
        ],
        "Hit Location": "Arm Flesh"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          72,
          75
        ],
        "Open": [
          12,
          13
        ],
        "Hit Location": "Arm Bone"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": [
          75,
          79
        ],
        "Open": [
          13,
          14
        ],
        "Hit Location": "Elbow"
      },
      {
        "1": 50,
        "3": 50,
        "5": 50,
        "10": 50,
        "Fire": [
          79,
          82
        ],
        "Open": [
          14,
          15
        ],
        "Hit Location": "Forearm Flesh"
      },
      {
        "1": 60,
        "3": 60,
        "5": 60,
        "10": 60,
        "Fire": [
          82,
          88
        ],
        "Open": [
          15,
          16
        ],
        "Hit Location": "Forearm Bone"
      },
      {
        "1": 15,
        "3": 15,
        "5": 15,
        "10": 15,
        "Fire": [
          88,
          94
        ],
        "Open": [
          16,
          17
        ],
        "Hit Location": "Hand"
      },
      {
        "1": 0,
        "3": 0,
        "5": 0,
        "10": 0,
        "Fire": [
          94,
          100
        ],
        "Open": [
          17,
          18
        ],
        "Hit Location": "Weapon Critical"
      },
      {
        "1": 47,
        "3": 47,
        "5": 47,
        "10": 47,
        "Fire": "",
        "Open": [
          18,
          20
        ],
        "Hit Location": "Torso Glance"
      },
      {
        "1": 4000,
        "3": 8000,
        "5": 300000,
        "10": 300000,
        "Fire": "",
        "Open": [
          20,
          22
        ],
        "Hit Location": "Base of Neck"
      },
      {
        "1": 32,
        "3": 3000,
        "5": 3000,
        "10": 3000,
        "Fire": "",
        "Open": [
          22,
          24
        ],
        "Hit Location": "Lung Rib"
      },
      {
        "1": 1000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          24,
          25
        ],
        "Hit Location": "Lung"
      },
      {
        "1": 3000000,
        "3": 3000000,
        "5": 5000000,
        "10": 5000000,
        "Fire": "",
        "Open": [
          25,
          26
        ],
        "Hit Location": "Heart"
      },
      {
        "1": 6000,
        "3": 40000,
        "5": 50000,
        "10": 50000,
        "Fire": "",
        "Open": [
          26,
          27
        ],
        "Hit Location": "Liver - Rib"
      },
      {
        "1": 30000,
        "3": 30000,
        "5": 30000,
        "10": 30000,
        "Fire": "",
        "Open": [
          27,
          28
        ],
        "Hit Location": "Liver"
      },
      {
        "1": 300,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          28,
          29
        ],
        "Hit Location": "Stomach - Rib"
      },
      {
        "1": 1000,
        "3": 2000,
        "5": 2000,
        "10": 2000,
        "Fire": "",
        "Open": [
          29,
          30
        ],
        "Hit Location": "Stomach"
      },
      {
        "1": 2000,
        "3": 30000,
        "5": 30000,
        "10": 30000,
        "Fire": "",
        "Open": [
          30,
          31
        ],
        "Hit Location": "Stomach - Spleen"
      },
      {
        "1": 30000,
        "3": 40000,
        "5": 40000,
        "10": 40000,
        "Fire": "",
        "Open": [
          31,
          32
        ],
        "Hit Location": "Stomach - Kidney"
      },
      {
        "1": 50000,
        "3": 70000,
        "5": 70000,
        "10": 70000,
        "Fire": "",
        "Open": [
          32,
          33
        ],
        "Hit Location": "Liver - Kidney"
      },
      {
        "1": 10000,
        "3": 200000,
        "5": 300000,
        "10": 300000,
        "Fire": "",
        "Open": [
          33,
          36
        ],
        "Hit Location": "Liver - Spine"
      },
      {
        "1": 1000,
        "3": 1000,
        "5": 1000,
        "10": 1000,
        "Fire": "",
        "Open": [
          36,
          40
        ],
        "Hit Location": "Intestines"
      },
      {
        "1": 3000,
        "3": 200000,
        "5": 200000,
        "10": 200000,
        "Fire": "",
        "Open": [
          40,
          43
        ],
        "Hit Location": "Spine"
      },
      {
        "1": 2000,
        "3": 4000,
        "5": 4000,
        "10": 4000,
        "Fire": "",
        "Open": [
          43,
          57
        ],
        "Hit Location": "Pelvis"
      },
      {
        "1": 47,
        "3": 47,
        "5": 47,
        "10": 47,
        "Fire": "",
        "Open": [
          57,
          62
        ],
        "Hit Location": "Leg Glance"
      },
      {
        "1": 600,
        "3": 600,
        "5": 600,
        "10": 600,
        "Fire": "",
        "Open": [
          62,
          76
        ],
        "Hit Location": "Thigh Flesh"
      },
      {
        "1": 700,
        "3": 700,
        "5": 700,
        "10": 700,
        "Fire": "",
        "Open": [
          76,
          80
        ],
        "Hit Location": "Thigh Bone"
      },
      {
        "1": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          80,
          84
        ],
        "Hit Location": "Knee"
      },
      {
        "1": 100,
        "3": 100,
        "5": 100,
        "10": 100,
        "Fire": "",
        "Open": [
          84,
          89
        ],
        "Hit Location": "Shin Flesh"
      },
      {
        "1": 200,
        "3": 200,
        "5": 200,
        "10": 200,
        "Fire": "",
        "Open": [
          89,
          94
        ],
        "Hit Location": "Shin Bone"
      },
      {
        "1": 95,
        "3": 95,
        "5": 95,
        "10": 95,
        "Fire": "",
        "Open": [
          94,
          100
        ],
        "Hit Location": "Ankle - Foot"
      }
    ]
  }
};
