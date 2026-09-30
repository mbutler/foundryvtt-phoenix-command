// Small arms catalogue. Printed Rate of Fire cells are page-verified against LEG10200
// (or marked when the weapon is absent from that book's text layer). Minimum Arc selects
// the automatic catalogue; it does not invent the asterisk count.
//
// DO NOT EDIT BY HAND. 38 automatic + 12 non-automatic.
// Art is optional (`assets/weapons/<id>.png`).
import { automaticWeaponSystem as buildAutomatic } from './automatic-weapons.mjs';
import { firearmSystem as buildFirearm } from './firearms.mjs';

export const gunFileWeaponSource = Object.freeze({
  status: 'page-verified-rof'
});

export const gunFileAutomaticWeapons = Object.freeze([
 {
  "id": "ak-74",
  "name": "AK 74",
  "category": "Assault Rifle",
  "description": "New Soviet rifle with an effective muzzle brake. It is replacing the AKM 47.",
  "weightLb": 8.7,
  "lengthIn": "37",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1
  },
  "ballisticAmmunitionWeightLb": 1.1,
  "burstRounds": 5,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.3
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.5
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 0.9
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 1
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 3
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 4
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 5
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 14,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 13,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 12,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 10,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 9.1,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 5.8,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.7,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.4,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 13,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 13,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 11,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 10,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 8.8,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 5.6,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.6,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.3,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 13,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 8.2,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.3,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 80,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 80."
 },
 {
  "id": "amd-65",
  "name": "AMD 65",
  "category": "Assault Rifle",
  "description": "Hungarian modified AKM 63 with folding stock and foregrip.",
  "weightLb": 9,
  "lengthIn": "26/34",
  "knockDown": 7,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -13,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -4,
   "7": -3,
   "8": -2
  },
  "ballisticAmmunitionWeightLb": 1.8,
  "burstRounds": 5,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 12
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 16
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 11,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 10,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9.4,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 8.3,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 7.2,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.6,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.9,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 10,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 9.9,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9.1,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 7.9,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 6.9,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.4,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 2.8,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.8,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.5,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.7,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 78,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 78."
 },
 {
  "id": "armscor-bxp",
  "name": "Armscor BXP",
  "category": "Sub-Machinegun",
  "description": "Compact, light Sub-Machinegun which can be fired one handed.",
  "weightLb": 6.3,
  "lengthIn": "14/22",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 32,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -21,
   "2": -11,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3
  },
  "ballisticAmmunitionWeightLb": 1.2,
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.5
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 5
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 8
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.7,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.3,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.6,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.5,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.9,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.3,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.1,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.8,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 76,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 76."
 },
 {
  "id": "beretta-bm-59",
  "name": "Beretta BM 59",
  "category": "Assault Rifle",
  "description": "Standard rifle of the Italian army. Similar to the M1 Garand.",
  "weightLb": 11.3,
  "lengthIn": "43",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.5,
  "burstRounds": 6,
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.6
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 1
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 4
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 6
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 12
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 18
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 24
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.8,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 17,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 16,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 13,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.4,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.7,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.8,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 26,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 25,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 24,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 21,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 19,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 14,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 9.9,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.1,
      "damageClass": 5
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 79,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 79."
 },
 {
  "id": "beretta-m12s",
  "name": "Beretta M12S",
  "category": "Sub-Machinegun",
  "description": "Widely exported SMG used in Italy, Africa, and South America.",
  "weightLb": 8.4,
  "lengthIn": "17/26",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 32,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -22,
   "2": -12,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3
  },
  "ballisticAmmunitionWeightLb": 1.3,
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.4
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.8
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 1
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 4
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 6
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 8
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.3,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.1,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.8,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.4,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.1,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.2,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.7,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 3
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3.2,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.9,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.5,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 75,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 75."
 },
 {
  "id": "beretta-m70-78",
  "name": "Beretta M70-78",
  "category": "Machine Gun",
  "description": "Squad Automatic Weapon based on the AR70 rifle.",
  "weightLb": 13.4,
  "lengthIn": "38",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 40,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -25,
   "2": -15,
   "3": -10,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.7,
  "burstRounds": 6,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.4
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.8
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 1
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 4
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 6
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 8
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.6,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.7,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 14,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.3,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.5,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 19,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 17,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.3,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.9,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.8,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 83,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 83."
 },
 {
  "id": "bushmaster",
  "name": "Bushmaster",
  "category": "Sub-Machinegun",
  "description": "Powerful SMG designed for 1 hand fire braced against the forearm.",
  "weightLb": 6.2,
  "lengthIn": "21",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -21,
   "2": -12,
   "3": -11,
   "4": -10,
   "5": -9,
   "6": -8
  },
  "ballisticAmmunitionWeightLb": 1,
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.7
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 7
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 10
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 13
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 13,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 12,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 11,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 9.9,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 8.6,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 5.3,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.3,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.1,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 13,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 12,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 11,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 9.5,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 8.2,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 5.1,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.2,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 16,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 14,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 12,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.5,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.7,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.9,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 76,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 76."
 },
 {
  "id": "car-16",
  "name": "CAR 16",
  "category": "Assault Rifle",
  "description": "Shortened M16 with folding stock often used by officers and NCOs.",
  "weightLb": 7.1,
  "lengthIn": "28/31",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -22,
   "2": -11,
   "3": -9,
   "4": -7,
   "5": -5,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1
  },
  "ballisticAmmunitionWeightLb": 1,
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 11
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 15
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 14,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 13,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 12,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 9.3,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 5.9,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.7,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.3,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 14,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 13,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 12,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 10,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 8.9,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 5.6,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.5,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.2,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 20,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 13,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 8.3,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.3,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 81,
  "sourceNote": "Printed ROF *7, LEG10200 PDF 81."
 },
 {
  "id": "enfield-iw",
  "name": "Enfield IW",
  "category": "Assault Rifle",
  "description": "New British rifle replacing the L1A1.",
  "weightLb": 9.2,
  "lengthIn": "31",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 10,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -8,
   "4": -6,
   "5": -5,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1,
   "10": 0,
   "11": 1
  },
  "ballisticAmmunitionWeightLb": 1,
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.6
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 6
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 9
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 13
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.5,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.9,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.3,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.2,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.7,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.1,
      "damageClass": 4
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 23,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 22,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 18,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 16,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 11,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.6,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 80,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 80."
 },
 {
  "id": "enfield-lsw",
  "name": "Enfield LSW",
  "category": "Machine Gun",
  "description": "Squad Automatic Weapon variant of the Enfield IW rifle.",
  "weightLb": 15.2,
  "lengthIn": "35",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 10,
  "aimModifiers": {
   "1": -26,
   "2": -16,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1,
   "10": 0,
   "12": 2
  },
  "ballisticAmmunitionWeightLb": 1,
  "burstRounds": 6,
  "sustainedBurstPenalty": 1,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.4
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.7
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 1
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 4
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 6
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 7
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.6,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.7,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 14,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.3,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.6,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 19,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 17,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.3,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.9,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.8,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 84,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 84."
 },
 {
  "id": "galil-ar",
  "name": "Galil AR",
  "category": "Assault Rifle",
  "description": "Galil Assault Rifle in 5.56mm NATO.",
  "weightLb": 10.2,
  "lengthIn": "29/39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 35,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -13,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.6,
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.5
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.9
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 5
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 7
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 9
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.8,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.3,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.7,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.5,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.1,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.6,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 17,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.5,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.9,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 79,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 79."
 },
 {
  "id": "galil-ar-762",
  "name": "Galil AR",
  "category": "Assault Rifle",
  "description": "Galil Assault Rifle in 7.62mm NATO. This weapon & the 5.56mm version are also available in a Short Assault Rifle (SAR) variant which is about 5 inches shorter.",
  "weightLb": 10.7,
  "lengthIn": "32/41",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 25,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -13,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 2,
  "burstRounds": 5,
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.5
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 1
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 4
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 5
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 11
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 16
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 21
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 20,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 18,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 11,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.6,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.5,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.3,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.2,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 28,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 27,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 25,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 23,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 21,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 15,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 11,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.7,
      "damageClass": 5
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 79,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 79."
 },
 {
  "id": "galil-arm",
  "name": "Galil ARM",
  "category": "Machine Gun",
  "description": " SAW version of the Galil Assault Rifle & light Machine gun (ARM).",
  "weightLb": 11.5,
  "lengthIn": "29/39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 50,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 2.2,
  "burstRounds": 5,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.4
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.8
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 1
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 4
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 6
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 8
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.8,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.3,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.7,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.5,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.1,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.6,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 17,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.5,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.9,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 83,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 83."
 },
 {
  "id": "heckler-koch-21e",
  "name": "Heckler & Koch 21E",
  "category": "Machine Gun",
  "description": "Newest version of the HK 21A1.",
  "weightLb": 27,
  "lengthIn": "45",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -29,
   "2": -19,
   "3": -13,
   "4": -9,
   "5": -8,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "12": 0
  },
  "ballisticAmmunitionWeightLb": 6.5,
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**7",
  "threeRoundBurst": true,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 12
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 16
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.4,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.3,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.9,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.1,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.1,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 27,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 26,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 25,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 22,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 20,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 15,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 10,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.5,
      "damageClass": 5
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 83,
  "sourceNote": "Printed ROF **7, LEG10200 PDF 83."
 },
 {
  "id": "heckler-koch-23e",
  "name": "Heckler & Koch 23E",
  "category": "Machine Gun",
  "description": "New version of the HK 21A1 in 5.56mm NATO.",
  "weightLb": 25.5,
  "lengthIn": "41",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 200,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -29,
   "2": -19,
   "3": -12,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "12": 0
  },
  "ballisticAmmunitionWeightLb": 6.2,
  "burstRounds": 6,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "**6",
  "threeRoundBurst": true,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.3
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.7
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 1
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 3
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 5
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 7
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 15,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.6,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.3,
      "damageClass": 3
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.3,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.8,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.2,
      "damageClass": 4
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 23,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 22,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 21,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 18,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 16,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 11,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.7,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 83,
  "sourceNote": "Printed ROF **6, LEG10200 PDF 83."
 },
 {
  "id": "heckler-koch-g11",
  "name": "Heckler & Koch G11",
  "category": "Assault Rifle",
  "description": "Advanced caseless rifle under development.",
  "weightLb": 8.7,
  "lengthIn": "30",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 50,
  "reloadTimeActions": 10,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -8,
   "4": -6,
   "5": -5,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1,
   "10": 0,
   "11": 1
  },
  "ballisticAmmunitionWeightLb": 0.77,
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**5",
  "threeRoundBurst": true,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.5
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.9
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 5
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 7
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 9
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.9,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.1,
      "damageClass": 3
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 17,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 16,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 13,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.5,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.8,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.9,
      "damageClass": 4
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 26,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 25,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 24,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 21,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 19,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 14,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 10,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.2,
      "damageClass": 3
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 78,
  "sourceNote": "Printed ROF **5, LEG10200 PDF 78."
 },
 {
  "id": "heckler-koch-g3",
  "name": "Heckler & Koch G3",
  "category": "Assault Rifle",
  "description": "Standard rifle of the West German army. It is also widely used in Africa and South America.",
  "weightLb": 11.1,
  "lengthIn": "40",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.4,
  "burstRounds": 5,
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.5
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 1
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 5
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 10
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 14
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 19
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 17,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 15,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 14,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 13,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 8.9,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.3,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.5,
      "damageClass": 4
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 15,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 12,
      "damageClass": 8
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 8.5,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.1,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.3,
      "damageClass": 6
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 24,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 23,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 22,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 20,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 18,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 13,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 8.9,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6.4,
      "damageClass": 4
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 78,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 78."
 },
 {
  "id": "heckler-koch-g41",
  "name": "Heckler & Koch G41",
  "category": "Assault Rifle",
  "description": "5.56mm NATO version of the G3. This weapon is considerably lighter than the G3  and has three round burst capability.",
  "weightLb": 8.6,
  "lengthIn": "39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.1,
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**7",
  "threeRoundBurst": true,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 11
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 15
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.4,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.9,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.2,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.1,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.7,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.1,
      "damageClass": 4
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 23,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 22,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 18,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 16,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.9,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.5,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 78,
  "sourceNote": "Printed ROF **7, LEG10200 PDF 78."
 },
 {
  "id": "heckler-koch-mp5k",
  "name": "Heckler & Koch MP5K",
  "category": "Sub-Machinegun",
  "description": "Short MP5 designed for anti-terrorist units.",
  "weightLb": 5.6,
  "lengthIn": "13",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -19,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7,
   "7": -6
  },
  "ballisticAmmunitionWeightLb": 1.2,
  "burstRounds": 8,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**8",
  "threeRoundBurst": true,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 12
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 17
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.2,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.7,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.1,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.6,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 3
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3.1,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.9,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.4,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.9,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.4,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 75,
  "sourceNote": "Printed ROF **8, LEG10200 PDF 75."
 },
 {
  "id": "ingram-mac-10",
  "name": "Ingram MAC 10",
  "category": "Sub-Machinegun",
  "description": "Compact Sub-Machinegun chambered for 9mm Parabellum .",
  "weightLb": 7.6,
  "lengthIn": "11/22",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 32,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -22,
   "2": -12,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3
  },
  "ballisticAmmunitionWeightLb": 1.4,
  "burstRounds": 9,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*9",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 12
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 15
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.1,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.6,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.7,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.3,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.8,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.4,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 76,
  "sourceNote": "Printed ROF *9, LEG10200 PDF 76."
 },
 {
  "id": "ingram-mac-10-45",
  "name": "Ingram MAC 10",
  "category": "Sub-Machinegun",
  "description": "MAC 10 chambered for 45 ACP. It's high recoil hinders one hand fire.",
  "weightLb": 8.4,
  "lengthIn": "11/22",
  "knockDown": 5,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -22,
   "2": -12,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3
  },
  "ballisticAmmunitionWeightLb": 2.2,
  "burstRounds": 10,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*10",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.6
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 1
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 4
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 6
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 11
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 19
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 25
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.7,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.3,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.6,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.5,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.3,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.4,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.9,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 76,
  "sourceNote": "Printed ROF *10, LEG10200 PDF 76."
 },
 {
  "id": "l7a2",
  "name": "L7A2",
  "category": "Machine Gun",
  "description": "Based on the FN MAG, the L7A2 is the standard GPMG at the British army.",
  "weightLb": 32.8,
  "lengthIn": "49",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -31,
   "2": -21,
   "3": -15,
   "4": -10,
   "5": -8,
   "6": -7,
   "7": -5,
   "8": -4,
   "10": -3,
   "12": -1,
   "15": 1
  },
  "ballisticAmmunitionWeightLb": 6.5,
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.6
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 6
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 10
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 13
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.3,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.3,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.8,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.1,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 27,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 26,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 24,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 22,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 20,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 14,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 10,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.4,
      "damageClass": 5
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 85,
  "sourceNote": "Printed ROF *7, LEG10200 PDF 85."
 },
 {
  "id": "m14",
  "name": "M14",
  "category": "Assault Rifle",
  "description": "Standard US army rifle adopted in 1957. The M14 was often replaced by the M16 starting in 1962 but remains in service. Most noteably with the US Marine Corp.",
  "weightLb": 11.2,
  "lengthIn": "44",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -10,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "12": 0
  },
  "ballisticAmmunitionWeightLb": 1.5,
  "burstRounds": 6,
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.6
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 1
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 4
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 6
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 12
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 19
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 25
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 20,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 18,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 11,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.7,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.5,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.4,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.3,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 28,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 27,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 25,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 23,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 21,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 15,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 11,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.8,
      "damageClass": 5
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 81,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 81."
 },
 {
  "id": "m16a1",
  "name": "M16A1",
  "category": "Assault Rifle",
  "description": "Standard US army rifle adopted in 1962. it was used extensively in Vietnam.",
  "weightLb": 8,
  "lengthIn": "39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -22,
   "2": -12,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1,
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 11
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 15
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 17,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 15,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.1,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.5,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.9,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.8,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.4,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.8,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 23,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 22,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 18,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 16,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.4,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.1,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 81,
  "sourceNote": "Printed ROF *7, LEG10200 PDF 81."
 },
 {
  "id": "m60e3",
  "name": "M60E3",
  "category": "Machine Gun",
  "description": "Light version of the M60 adopted by the US Navy and Marine Corps.",
  "weightLb": 25.5,
  "lengthIn": "42",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -29,
   "2": -19,
   "3": -12,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "12": 0
  },
  "ballisticAmmunitionWeightLb": 6.5,
  "burstRounds": 5,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.6
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 6
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 9
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 12
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 20,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 20,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 18,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 17,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 11,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.8,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.6,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 18,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.5,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.4,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 28,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 28,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 26,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 23,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 21,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 15,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 11,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.9,
      "damageClass": 5
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 85,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 85."
 },
 {
  "id": "m951r",
  "name": "M951R",
  "category": "Pistol",
  "description": "Modified large capacity M1951 with fully automatic fire capabil-ity.",
  "weightLb": 3.2,
  "lengthIn": "7",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 10,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -18,
   "2": -12,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.44,
  "burstRounds": 6,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 1
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 12
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 16
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.4,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.3,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.1,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.8,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.4,
      "damageClass": 3
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3.4,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3.1,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.6,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 72,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 72."
 },
 {
  "id": "mg3",
  "name": "MG3",
  "category": "Machine Gun",
  "description": "The MG3 is based on the World War ii MG42.",
  "weightLb": 30.9,
  "lengthIn": "48",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -30,
   "2": -20,
   "3": -14,
   "4": -10,
   "5": -8,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "11": -1
  },
  "ballisticAmmunitionWeightLb": 6.5,
  "burstRounds": 10,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*10",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.5
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 1
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 5
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 10
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 14
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 19
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.7,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 17,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 16,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 14,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 13,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.3,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.7,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.8,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 26,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 25,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 23,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 21,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 19,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 14,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 9.8,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7,
      "damageClass": 5
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 83,
  "sourceNote": "Printed ROF *10, LEG10200 PDF 83."
 },
 {
  "id": "mini-uzi",
  "name": "Mini Uzi",
  "category": "Sub-Machinegun",
  "description": "Small version of the Uzi intended for police and security forces. ",
  "weightLb": 7.3,
  "lengthIn": "14/24",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 32,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -22,
   "2": -12,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3
  },
  "ballisticAmmunitionWeightLb": 1.3,
  "burstRounds": 8,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*8",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.7
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 7
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 10
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 13
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.8,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.7,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.4,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.7,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.5,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.1,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 85,
  "sourceNote": "Printed ROF *8, LEG10200 PDF 85."
 },
 {
  "id": "nsv",
  "name": "NSV",
  "category": "Machine Gun",
  "description": "The NSV was developed in 1969 and is found in all Soviet and Warsaw Pact armies. It is used as a heavy ground support, air defense, and tank air defense weapon. In the ground role it is mounted on a tripod and fitted with a shoulder stock, pistol grip, and optical sight (not shown).",
  "weightLb": 116,
  "lengthIn": "61",
  "knockDown": 49,
  "feedDevice": "Mag",
  "capacity": 50,
  "reloadTimeActions": 14,
  "aimModifiers": {
   "1": -33,
   "2": -23,
   "3": -16,
   "4": -12,
   "5": -8,
   "6": -6,
   "7": -4,
   "8": -2,
   "10": 0,
   "12": 1,
   "16": 4
  },
  "ballisticAmmunitionWeightLb": 17,
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.5
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 5
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 8
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 10
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 45,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 44,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 43,
      "damageClass": 10
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 40,
      "damageClass": 10
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 38,
      "damageClass": 10
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 32,
      "damageClass": 10
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 27,
      "damageClass": 10
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 23,
      "damageClass": 10
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 43,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 42,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 41,
      "damageClass": 10
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 39,
      "damageClass": 10
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 37,
      "damageClass": 10
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 31,
      "damageClass": 10
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 26,
      "damageClass": 10
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 22,
      "damageClass": 10
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 63,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 62,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 60,
      "damageClass": 10
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 57,
      "damageClass": 10
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 54,
      "damageClass": 10
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 45,
      "damageClass": 10
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 38,
      "damageClass": 10
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 32,
      "damageClass": 10
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 84,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 84."
 },
 {
  "id": "pkm",
  "name": "PKM",
  "category": "Machine Gun",
  "description": "Standard LMG in the Soviet army. It has replaced the RP 46.",
  "weightLb": 25.5,
  "lengthIn": "46",
  "knockDown": 12,
  "feedDevice": "Mag",
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -29,
   "2": -19,
   "3": -12,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "12": 0,
   "13": 0
  },
  "ballisticAmmunitionWeightLb": 5.7,
  "burstRounds": 6,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 12
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 16
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 23,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 22,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 21,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 19,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 18,
      "damageClass": 8
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 13,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 10,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.7,
      "damageClass": 6
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 18,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 17,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 13,
      "damageClass": 9
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 9.7,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.4,
      "damageClass": 8
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 32,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 31,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 29,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 27,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 25,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 19,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 14,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 11,
      "damageClass": 6
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 84,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 84."
 },
 {
  "id": "r4",
  "name": "R4",
  "category": "Assault Rifle",
  "description": "Modified Galil AR. South African Defense Force's standard rifle.",
  "weightLb": 11.2,
  "lengthIn": "29/40",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 35,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1
  },
  "ballisticAmmunitionWeightLb": 1.8,
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.4
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.9
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 1
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 4
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 6
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 9
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.5,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.6,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 14,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.3,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.5,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 19,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 17,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.2,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.8,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.7,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 79,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 79."
 },
 {
  "id": "rp-46",
  "name": "RP 46",
  "category": "Machine Gun",
  "description": "Developed in 1946, it is still in service in the third world.",
  "weightLb": 43,
  "lengthIn": "51",
  "knockDown": 12,
  "feedDevice": "Mag",
  "capacity": 250,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -32,
   "2": -22,
   "3": -17,
   "4": -11,
   "5": -9,
   "6": -7,
   "7": -6,
   "8": -5,
   "9": -4,
   "11": -2,
   "12": 0,
   "13": 0
  },
  "ballisticAmmunitionWeightLb": 14.3,
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.5
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 5
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 8
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 10
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 23,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 23,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 22,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 20,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 18,
      "damageClass": 8
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 14,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 11,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 8.1,
      "damageClass": 6
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 22,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 21,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 19,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 18,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 13,
      "damageClass": 9
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 10,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.7,
      "damageClass": 8
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 33,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 32,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 30,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 28,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 26,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 20,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 15,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 11,
      "damageClass": 6
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 84,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 84."
 },
 {
  "id": "rpd",
  "name": "RPD",
  "category": "Machine Gun",
  "description": "Obsolete in the Soviet army, it is still found in Africa and Asia.",
  "weightLb": 22,
  "lengthIn": "41",
  "knockDown": 7,
  "feedDevice": "Mag",
  "capacity": 100,
  "reloadTimeActions": 14,
  "aimModifiers": {
   "1": -28,
   "2": -18,
   "3": -11,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "11": 1,
   "12": 0,
   "13": 0
  },
  "ballisticAmmunitionWeightLb": 5.3,
  "burstRounds": 6,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.5
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.9
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 5
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 7
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 9
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 11,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 10,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9.4,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 8.2,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 7.2,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.6,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.9,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 10,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 9.9,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 7.9,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 6.9,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.4,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 2.8,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.8,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 14,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.5,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.7,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 84,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 84."
 },
 {
  "id": "rpk",
  "name": "RPK",
  "category": "Machine Gun",
  "description": "This SAW has replaced the RPD in the Soviet arsenal.",
  "weightLb": 15.7,
  "lengthIn": "41",
  "knockDown": 7,
  "feedDevice": "Mag",
  "capacity": 75,
  "reloadTimeActions": 10,
  "aimModifiers": {
   "1": -26,
   "2": -16,
   "3": -10,
   "4": -8,
   "5": -7,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "12": 0
  },
  "ballisticAmmunitionWeightLb": 4.6,
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.5
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 5
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 8
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 10
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 12,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 11,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 10,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 9.1,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 7.9,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 5.1,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.3,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.1,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 11,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 11,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 10,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 8.7,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 7.6,
      "damageClass": 8
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.9,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.2,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.1,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 17,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 15,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.2,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.7,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 84,
  "sourceNote": "Printed ROF *6, LEG10200 PDF 84."
 },
 {
  "id": "rpk-74",
  "name": "RPK 74",
  "category": "Machine Gun",
  "description": "Squad Automatic Weapon version of the AK 74 rifle.",
  "weightLb": 11.4,
  "lengthIn": "45",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 40,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -10,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.5,
  "burstRounds": 5,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.2
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.4
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 0.8
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 1
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 2
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 4
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 6
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 8
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 17,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 15,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 12,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.5,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.9,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.2,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 16,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 14,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 13,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 11,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 7.2,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.7,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.1,
      "damageClass": 4
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 24,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 23,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 21,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 19,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 16,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 11,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.9,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.5,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 83,
  "sourceNote": "Printed ROF *5, LEG10200 PDF 83."
 },
 {
  "id": "sig-550",
  "name": "SIG 550",
  "category": "Assault Rifle",
  "description": "Standard Swiss army rifle adopted in 1984.",
  "weightLb": 10.1,
  "lengthIn": "30/39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "capacity": 30,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -23,
   "2": -13,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.1,
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**7",
  "threeRoundBurst": true,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.6
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 6
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 10
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 13
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 12,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.4,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.6,
      "damageClass": 2
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 14,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 9.7,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.2,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.9,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.5,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 21,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 19,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.1,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.7,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.6,
      "damageClass": 2
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 80,
  "sourceNote": "Printed ROF **7, LEG10200 PDF 80."
 },
 {
  "id": "sterling-mk-7",
  "name": "Sterling Mk 7",
  "category": "Sub-Machinegun",
  "description": "Special purpose paratroopers machine pistol.",
  "weightLb": 5.7,
  "lengthIn": "14",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 34,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -20,
   "2": -12,
   "3": -11,
   "4": -10,
   "5": -9,
   "6": -8,
   "7": -8,
   "8": -7
  },
  "ballisticAmmunitionWeightLb": 1.2,
  "burstRounds": 8,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*8",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.8
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 2
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 3
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 8
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 13
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 17
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.3,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.1,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.8,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.4,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.1,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.2,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.7,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 3
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3.2,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.9,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.5,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 76,
  "sourceNote": "Printed ROF *8, LEG10200 PDF 76."
 },
 {
  "id": "type-64",
  "name": "Type 64",
  "category": "Assault Rifle",
  "description": "Standard rifle of the Japanese army using a reduced load 7.62mm round.",
  "weightLb": 11.3,
  "lengthIn": "39",
  "knockDown": 8,
  "feedDevice": "Mag",
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.6,
  "burstRounds": 4,
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*4",
  "threeRoundBurst": false,
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.3
   },
   "r20": {
    "distanceFeet": 120,
    "arcHexes": 0.7
   },
   "r40": {
    "distanceFeet": 240,
    "arcHexes": 1
   },
   "r70": {
    "distanceFeet": 420,
    "arcHexes": 2
   },
   "r100": {
    "distanceFeet": 600,
    "arcHexes": 3
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 7
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 10
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 14
   }
  },
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 13,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 13,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 12,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 9.7,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.7,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.7,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.3,
      "damageClass": 3
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 13,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 12,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 11,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 10,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 9.3,
      "damageClass": 8
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.5,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.5,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.2,
      "damageClass": 5
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.5,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.6,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.6,
      "damageClass": 3
     }
    }
   }
  },
  "provenance": "page-verified",
  "pdfPage": 79,
  "sourceNote": "Printed ROF *4, LEG10200 PDF 79."
 }
].map(w => Object.freeze(w)));
export const gunFileFirearms = Object.freeze([
 {
  "id": "5-45-psm",
  "name": "5.45 PSM",
  "category": "Pistol",
  "description": "Soviet pistol issued to internal security forces. It has an underpowered cartridge.",
  "weightLb": 1.1,
  "lengthIn": "6",
  "knockDown": 1,
  "feedDevice": "Mag",
  "capacity": 8,
  "reloadTimeActions": 5,
  "aimModifiers": {
   "1": -15,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8
  },
  "ballisticAmmunitionWeightLb": 0.25,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 73.",
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 73,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.1,
      "damageClass": 1
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.5,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1,
      "damageClass": 1
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.5,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.7,
      "damageClass": 1
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.5,
      "damageClass": 1
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.3,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.7,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 73."
 },
 {
  "id": "asp-9mm",
  "name": "ASP 9mm",
  "category": "Pistol",
  "description": "Modified Smith & Wesson M39 with Guttersnipe sights intended for high level security.",
  "weightLb": 1.4,
  "lengthIn": "7",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 7,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -16,
   "2": -12,
   "3": -10
  },
  "ballisticAmmunitionWeightLb": 0.7,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 73.",
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 73,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.8,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.7,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.4,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.7,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.5,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.1,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 73."
 },
 {
  "id": "hk-vp70m",
  "name": "HK VP70M",
  "category": "Pistol",
  "description": "Late model pistol with three round burst capability when its shoulder stock is attached.",
  "weightLb": 2.5,
  "lengthIn": "8/21",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 18,
  "reloadTimeActions": 5,
  "aimModifiers": {
   "1": -17,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.69,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF **, LEG10200 PDF 72.",
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "**",
  "threeRoundBurst": true,
  "provenance": "page-verified",
  "pdfPage": 72,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.8,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.9,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.6,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.7,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.3,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF **, LEG10200 PDF 72."
 },
 {
  "id": "l1a1",
  "name": "L1A1",
  "category": "Assault Rifle",
  "description": "Patterned on the FN FAL, the L1A1 is the standard British service rifle. Normally a semi-automatic weapon, it can easily be modified for fully automatic fire.",
  "weightLb": 11,
  "lengthIn": "45",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.5,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 80.",
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 80,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.3,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.3,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 18,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 15,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 9.8,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.1,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 27,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 26,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 24,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 22,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 20,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 14,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 10,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.4,
      "damageClass": 5
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 80."
 },
 {
  "id": "m15",
  "name": "M15",
  "category": "Pistol",
  "description": "The M15 General Officers Pistol is a shortened version of the M1911A1.",
  "weightLb": 2.8,
  "lengthIn": "8",
  "knockDown": 5,
  "feedDevice": "Mag",
  "capacity": 7,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -18,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.7,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 73.",
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 73,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.5,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.4,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.4,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.1,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.8,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.1,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.7,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 73."
 },
 {
  "id": "m1951",
  "name": "M1951",
  "category": "Pistol",
  "description": "This Beretta pistol is used by the Italian & Israeli armies. It is also popular in the civilian market.",
  "weightLb": 1.9,
  "lengthIn": "8",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 8,
  "reloadTimeActions": 5,
  "aimModifiers": {
   "1": -16,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.4,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 72.",
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 72,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.8,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.7,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.4,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.7,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.5,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.1,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 72."
 },
 {
  "id": "m40a1",
  "name": "M40A1",
  "category": "Assault Rifle",
  "description": "Remington bolt action rifle with heavy barrel and USMC 10x sniper scope. \"This is the standard sniper's weapon of the US Marine Corps.",
  "weightLb": 14.8,
  "lengthIn": "44",
  "knockDown": 10,
  "feedDevice": "Mag",
  "capacity": 5,
  "reloadTimeActions": 16,
  "aimModifiers": {
   "1": -25,
   "2": -15,
   "3": -8,
   "4": -6,
   "5": -4,
   "6": -3,
   "7": -1,
   "8": 1,
   "9": 2,
   "10": 3,
   "12": 4
  },
  "ballisticAmmunitionWeightLb": 0.6,
  "feed": "manual",
  "rateOfFire": 3,
  "feedNote": "Printed ROF 3, LEG10200 PDF 81.",
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "3",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 81,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 20,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 19,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 18,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 15,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 11,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.7,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.5,
      "damageClass": 5
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 19,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 18,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 17,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 16,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 14,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.4,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.3,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 28,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 27,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 25,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 23,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 21,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 15,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 11,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.8,
      "damageClass": 5
     }
    }
   }
  },
  "sourceNote": "Printed ROF 3, LEG10200 PDF 81."
 },
 {
  "id": "m92f",
  "name": "M92F",
  "category": "Pistol",
  "description": "Beretta 9mm which has become extremely popular since its successes in U.S. military trials.",
  "weightLb": 2.4,
  "lengthIn": "9",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 15,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -17,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.6,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 73.",
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 73,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.4,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.3,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.1,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.8,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.4,
      "damageClass": 3
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3.4,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3.1,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.6,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 73."
 },
 {
  "id": "m93r",
  "name": "M93R",
  "category": "Pistol",
  "description": " Beretta with three round burst capability. Issued to the Italian Special Forces.",
  "weightLb": 3.1,
  "lengthIn": "9",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 20,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -18,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.69,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF **, LEG10200 PDF 72.",
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "**",
  "threeRoundBurst": true,
  "provenance": "page-verified",
  "pdfPage": 72,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.2,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.7,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.1,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.6,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.3,
      "damageClass": 3
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3.1,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.9,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.4,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.9,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.4,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF **, LEG10200 PDF 72."
 },
 {
  "id": "makarov-pm",
  "name": "Makarov PM",
  "category": "Pistol",
  "description": "Dating back to the 1950s, this is still the standard pistol of the Soviet military.",
  "weightLb": 1.7,
  "lengthIn": "6",
  "knockDown": 2,
  "feedDevice": "Mag",
  "capacity": 8,
  "reloadTimeActions": 5,
  "aimModifiers": {
   "1": -16,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8
  },
  "ballisticAmmunitionWeightLb": 0.4,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 72.",
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 72,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.2,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.8,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.7,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.6,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.2,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 72."
 },
 {
  "id": "s-w-m469",
  "name": "S&W M469",
  "category": "Pistol",
  "description": "Shortened version of the Smith and Wesson M459 designed for the US Air Force",
  "weightLb": 1.9,
  "lengthIn": "7",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 12,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -16,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8
  },
  "ballisticAmmunitionWeightLb": 0.5,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 73.",
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 73,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.8,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.9,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.6,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.7,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.3,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 73."
 },
 {
  "id": "sig-p226",
  "name": "SIG P226",
  "category": "Pistol",
  "description": "Well balanced. large capacity version of the SIG P220 with ambidextrous magazine catch.",
  "weightLb": 2.2,
  "lengthIn": "8",
  "knockDown": 3,
  "feedDevice": "Mag",
  "capacity": 15,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -17,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.55,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 72.",
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "pdfPage": 72,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.8,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.7,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.4,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.3,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.1,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.7,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.5,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.1,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.6,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.1,
      "damageClass": 1
     }
    }
   }
  },
  "sourceNote": "Printed ROF *, LEG10200 PDF 72."
 }
].map(w => Object.freeze(w)));

export const gunFileAutomaticWeaponsById = Object.freeze(Object.fromEntries(gunFileAutomaticWeapons.map(w => [w.id, w])));
export const gunFileFirearmsById = Object.freeze(Object.fromEntries(gunFileFirearms.map(w => [w.id, w])));

export function gunFileAutomaticWeaponSystem(entry, options) {
  const system = buildAutomatic(entry, options);
  system.source = {
    bookId: 'LEG10200',
    verification: entry.provenance === 'page-verified' ? 'visual' : 'legacy',
    note: entry.sourceNote ?? gunFileWeaponSource.status,
    pdfPage: entry.pdfPage ?? null
  };
  return system;
}

export function gunFileFirearmSystem(entry, options) {
  const system = buildFirearm(entry, options);
  system.source = {
    bookId: 'LEG10200',
    verification: 'visual',
    note: entry.sourceNote ?? gunFileWeaponSource.status,
    pdfPage: entry.pdfPage ?? null
  };
  return system;
}
