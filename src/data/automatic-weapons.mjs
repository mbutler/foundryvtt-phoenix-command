// Fully automatic weapons. Seeded from phoenix-functions by `scripts/import-automatic-weapons.mjs`;
// the Foundry catalogue is authoritative and will push back to the library later.
//
// PROVENANCE. The numbers are phoenix-functions', which the user confirmed as accurate and
// which were spot-checked against renders of LEG10200's weapon data tables (PDF 80-85): the
// M16A1/M16A2 line, the Steyr LSW, the FN MAG, the HK 13E and the HK 11E all agree field for
// field. They are NOT a fresh transcription of all twenty pages, and no weapon here has been
// checked cell by cell against the book.
//
// WHAT IS MISSING AND WHY. Only weapons the library gives a Minimum Arc are here, because
// only for those can the printed `ROF *N` burst form be told apart from a chambering cost or
// a bare self-loading `*` - the import script's header explains the test and the pages it was
// checked on. Everything the library holds that does NOT print one is in
// `src/data/firearms.mjs` instead, where the ROF form was settled weapon by weapon. Shotguns
// are transcribed from PDF 86 in `shotguns.mjs` and explosives from PDF 88 and 90; the
// library's own explosive rows are not used (D51).
//
// A range column the page leaves blank is OMITTED rather than stored as a zero (D52). The M61
// Skorpion's row stops at 200 hexes, and a shot past it is now refused as beyond the weapon's
// printed data instead of resolving against a PEN of 0.
//
// THE PRINTED ROF CELL is now carried through as `printedRateOfFire`, because the library
// records it (see its own header). `**N` marks a weapon that also has a three-round-burst
// mode with its own `3RB` ALM row; `threeRoundBurst` records which weapons those are, and
// nothing reads it yet - the full-auto burst size is N either way. Both are null for a weapon
// whose cell nobody has read. Five supplement weapons (BAR A2, Bren Mk1, M1919 A6,
// Thompson M1928A1, Type 100) are page-verified for ROF on LEG10206; the rest remain
// library spot-checked on LEG10200. The Ballistic Accuracy and Time of Flight rows are
// still not carried; bursts do not read them.
//
// Ranges are printed in 2-yard hexes and stored in feet, at six feet to the hex.
export const automaticWeaponSource=Object.freeze({
  library:'phoenix-functions src/weapons.js',
  spotChecked:Object.freeze(['LEG10200 PDF 80','PDF 81','PDF 82']),
  status:'library-import-not-fully-reverified',
  selection:'weapons with a printed Minimum Arc, which is what identifies the ROF *N burst form'});

export const automaticWeapons=Object.freeze([
 {
  "id": "aa-762",
  "name": "AA 762",
  "category": "Machine Gun",
  "description": "Standard MG of the French army. AA 52 converted to 7.62mm NATO.",
  "weightLb": 28.5,
  "lengthIn": "39/45",
  "knockDown": 10,
  "feedDevice": "Blt",
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -30,
   "2": -20,
   "3": -14,
   "4": -9,
   "5": -8,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "12": 0
  },
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
  "ballisticAmmunitionWeightLb": 6.5,
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
  }
 },
 {
  "id": "akm-47",
  "name": "AKM 47",
  "category": "Assault Rifle",
  "description": "New model AK 47. The most widely exported communist weapon.",
  "weightLb": 8.7,
  "lengthIn": "35",
  "knockDown": 7,
  "feedDevice": "Mag",
  "burstRounds": 5,
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
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
  "ballisticAmmunitionWeightLb": 1.8,
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
      "penetration": 11,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9.8,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 8.6,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 7.5,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.8,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2,
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
      "penetration": 10,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9.4,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 8.3,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 7.2,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.7,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.9,
      "damageClass": 3
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 16,
      "damageClass": 7
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
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.8,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.4,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.8,
      "damageClass": 2
     }
    }
   }
  }
 },
 {
  "id": "akr",
  "name": "AKR",
  "category": "Sub-Machinegun",
  "description": "SMG version of the AKS 74 rifle. In service with Soviet forces.",
  "weightLb": 7.3,
  "lengthIn": "17/27",
  "knockDown": 3,
  "feedDevice": "Mag",
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
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
   "8": -3
  },
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
    "arcHexes": 0.6
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
  "ballisticAmmunitionWeightLb": 1.3,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 11,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 10,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9.4,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 8.1,
      "damageClass": 4
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 7.1,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.4,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 2.7,
      "damageClass": 2
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.7,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 10,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 9.9,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 7.8,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 6.8,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.2,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 2.6,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.6,
      "damageClass": 2
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 15,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 4
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.2,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.8,
      "damageClass": 2
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.4,
      "damageClass": 1
     }
    }
   }
  }
 },
 {
  "id": "bar-a2",
  "name": "BAR A2",
  "category": "Assault Rifle",
  "description": "The Browning Automatic Rifle served as a light machine-gun through WWII and the Korean war. It is heavy and has limited capacity, but is very robust and reliable.",
  "weightLb": 19.7,
  "lengthIn": "48",
  "knockDown": 10,
  "feedDevice": null,
  "burstRounds": 4,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*4",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 10,
  "sourceNote": "Printed ROF *4, LEG10206 PDF 10.",
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -27,
   "2": -17,
   "3": -11,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "11": -1,
   "12": 0,
   "13": 1,
   "14": 2,
   "15": 3,
   "16": 4
  },
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
  "ballisticAmmunitionWeightLb": 1.8,
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
      "penetration": 8.1,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6,
      "damageClass": 6
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
      "penetration": 11,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.8,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.7,
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
      "penetration": 16,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 11,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 8.4,
      "damageClass": 5
     }
    }
   }
  }
 },
 {
  "id": "beretta-sc-70",
  "name": "Beretta SC 70",
  "category": "Assault Rifle",
  "description": "Folding stock version of the Beretta AR 70 rifle. This weapon is replacing the BM 59 and is in service with the Italian Special Forces.",
  "weightLb": 9.3,
  "lengthIn": "29/38",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
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
    "arcHexes": 1
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
    "arcHexes": 10
   }
  },
  "ballisticAmmunitionWeightLb": 1.1,
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
      "penetration": 11,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 10,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.3,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.5,
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
      "penetration": 9.5,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.8,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.4,
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
      "penetration": 20,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 18,
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
      "penetration": 8.8,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.6,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.5,
      "damageClass": 2
     }
    }
   }
  }
 },
 {
  "id": "bren-l4",
  "name": "Bren L4",
  "category": "Machine Gun",
  "description": "L4 series Bren gun in 7.62mm NATO. Used by all British forces.",
  "weightLb": 23.6,
  "lengthIn": "45",
  "knockDown": 10,
  "feedDevice": "Mag",
  "burstRounds": 4,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*4",
  "threeRoundBurst": false,
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -28,
   "2": -19,
   "3": -12,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "11": -1,
   "13": 1
  },
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
  "ballisticAmmunitionWeightLb": 2.6,
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
  }
 },
 {
  "id": "bren-mk1",
  "name": "Bren Mk1",
  "category": "Machine Gun",
  "description": "Reliable light machine gun developed in the 1930s.",
  "weightLb": 24.1,
  "lengthIn": "45",
  "knockDown": 10,
  "feedDevice": "Mag",
  "burstRounds": 4,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*4",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 13,
  "sourceNote": "Printed ROF *4, LEG10206 PDF 13.",
  "capacity": 30,
  "reloadTimeActions": 8,
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
   "11": -1,
   "12": 0,
   "13": 1,
   "14": 2,
   "15": 3,
   "16": 4
  },
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
    "arcHexes": 2
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
  "ballisticAmmunitionWeightLb": 2.2,
  "ammunition": {
   "fmj": {
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
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 10,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.5,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.6,
      "damageClass": 4
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 17,
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
      "penetration": 9.6,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 7.2,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 5.4,
      "damageClass": 6
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 25,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 24,
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
      "penetration": 11,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.9,
      "damageClass": 4
     }
    }
   }
  }
 },
 {
  "id": "f1",
  "name": "F1",
  "category": "Sub-Machinegun",
  "description": "Australian Sub-Machinegun unusual for its top loading magazine.",
  "weightLb": 8.6,
  "lengthIn": "28",
  "knockDown": 3,
  "feedDevice": "Mag",
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "capacity": 34,
  "reloadTimeActions": 9,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -3,
   "10": -2
  },
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
  "ballisticAmmunitionWeightLb": 1.4,
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
      "penetration": 0.8,
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
  }
 },
 {
  "id": "fa-mas",
  "name": "FA MAS",
  "category": "Assault Rifle",
  "description": "New French army rifle of lightweight, bullpup design.",
  "weightLb": 9,
  "lengthIn": "30",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 8,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**8",
  "threeRoundBurst": true,
  "capacity": 25,
  "reloadTimeActions": 10,
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
  "ballisticAmmunitionWeightLb": 1,
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
      "penetration": 2.5,
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
  }
 },
 {
  "id": "fn-fal",
  "name": "FN FAL",
  "category": "Assault Rifle",
  "description": "Highly successful weapon exported to over 90 countries including the United Kingdom and Israel.",
  "weightLb": 10.8,
  "lengthIn": "43",
  "knockDown": 10,
  "feedDevice": "Mag",
  "burstRounds": 6,
  "sustainedBurstPenalty": 5,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -13,
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
    "arcHexes": 3
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
    "arcHexes": 13
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
  "ballisticAmmunitionWeightLb": 1.4,
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
      "penetration": 7.5,
      "damageClass": 5
     }
    }
   }
  }
 },
 {
  "id": "fn-fnc",
  "name": "FN FNC",
  "category": "Assault Rifle",
  "description": "Modern successor to the FN CAL. This weapon has three round burst capability and like the FN FAL has been marketed for export",
  "weightLb": 9.6,
  "lengthIn": "30/39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**6",
  "threeRoundBurst": true,
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
  "ballisticAmmunitionWeightLb": 1.2,
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
      "penetration": 7,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.6,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3,
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
      "penetration": 6.7,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.4,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.9,
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
      "penetration": 9.9,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.5,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.3,
      "damageClass": 2
     }
    }
   }
  }
 },
 {
  "id": "fn-mag",
  "name": "FN MAG",
  "category": "Machine Gun",
  "description": "Reliable weapon considered one of the best GPMGs made.",
  "weightLb": 27.2,
  "lengthIn": "50",
  "knockDown": 10,
  "feedDevice": "Blt",
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "capacity": 50,
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
   "10": -2,
   "12": -1,
   "14": 1
  },
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
  "ballisticAmmunitionWeightLb": 3.2,
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
      "penetration": 7.5,
      "damageClass": 5
     }
    }
   }
  }
 },
 {
  "id": "hk-11e",
  "name": "HK 11E",
  "category": "Machine Gun",
  "description": "Squad Automatic Weapon variant of the HK 11A1 LMG.",
  "weightLb": 19.5,
  "lengthIn": "41",
  "knockDown": 10,
  "feedDevice": "Mag",
  "burstRounds": 7,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "**7",
  "threeRoundBurst": true,
  "capacity": 20,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -27,
   "2": -17,
   "3": -11,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "12": 0
  },
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
  "ballisticAmmunitionWeightLb": 1.5,
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
      "penetration": 17,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 16,
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
      "penetration": 9.2,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.5,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.7,
      "damageClass": 4
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 17,
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
      "penetration": 14,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 12,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 8.8,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.3,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.5,
      "damageClass": 6
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 25,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 24,
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
      "penetration": 9.2,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6.6,
      "damageClass": 4
     }
    }
   }
  }
 },
 {
  "id": "hk-13e",
  "name": "HK 13E",
  "category": "Machine Gun",
  "description": "Squad Automatic Weapon version of the HK 13 LMG.",
  "weightLb": 18.7,
  "lengthIn": "41",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 6,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "**6",
  "threeRoundBurst": true,
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -27,
   "2": -17,
   "3": -11,
   "4": -8,
   "5": -7,
   "6": -6,
   "7": -4,
   "8": -3,
   "9": -3,
   "10": -2,
   "12": 0
  },
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
  "ballisticAmmunitionWeightLb": 1.1,
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
      "penetration": 7.7,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.4,
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
      "penetration": 7.3,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.9,
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
      "penetration": 7.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.8,
      "damageClass": 2
     }
    }
   }
  }
 },
 {
  "id": "hk-53",
  "name": "HK 53",
  "category": "Sub-Machinegun",
  "description": "Short version of the HK 33 which can be used as n SMG or rifle.",
  "weightLb": 8.1,
  "lengthIn": "22/30",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "capacity": 40,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -21,
   "2": -11,
   "3": -8,
   "4": -7,
   "5": -5,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1
  },
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
    "arcHexes": 11
   }
  },
  "ballisticAmmunitionWeightLb": 1.4,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 10,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 9.9,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 9,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 7.9,
      "damageClass": 4
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 6.9,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.4,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 2.8,
      "damageClass": 2
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.8,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 10,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 9.5,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 8.7,
      "damageClass": 6
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 7.5,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 6.6,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 4.2,
      "damageClass": 5
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 2.7,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.7,
      "damageClass": 2
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 15,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 14,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 13,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 11,
      "damageClass": 4
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 9.7,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.1,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.9,
      "damageClass": 2
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.5,
      "damageClass": 1
     }
    }
   }
  }
 },
 {
  "id": "hk-mp5",
  "name": "HK MP5",
  "category": "Sub-Machinegun",
  "description": "Widely exported SMG used by W German police & border guards.",
  "weightLb": 6.8,
  "lengthIn": "19/27",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -20,
   "2": -10,
   "3": -8,
   "4": -6,
   "5": -5,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1
  },
  "minimumArc": {
   "r10": {
    "distanceFeet": 60,
    "arcHexes": 0.4
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
    "arcHexes": 4
   },
   "r200": {
    "distanceFeet": 1200,
    "arcHexes": 7
   },
   "r300": {
    "distanceFeet": 1800,
    "arcHexes": 11
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 14
   }
  },
  "ballisticAmmunitionWeightLb": 1.2,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.5,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
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
      "penetration": 2.4,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
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
      "penetration": 3.6,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.8,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.7,
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
  }
 },
 {
  "id": "m16a2",
  "name": "M16A2",
  "category": "Assault Rifle",
  "description": "Late version of the M16A1 with three round burst capability.",
  "weightLb": 8.5,
  "lengthIn": "39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "**7",
  "threeRoundBurst": true,
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
  "ballisticAmmunitionWeightLb": 1,
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
      "penetration": 7.7,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.1,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.4,
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
      "penetration": 7.4,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.9,
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
      "penetration": 7.2,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.8,
      "damageClass": 2
     }
    }
   }
  }
 },
 {
  "id": "m1919-a6",
  "name": "M1919 A6",
  "category": "Machine Gun",
  "description": "Developed in 1943, the M1919 A6 is a modified M1919 A4. A shoulder stock and bipod were added.",
  "weightLb": 48,
  "lengthIn": "53",
  "knockDown": 11,
  "feedDevice": "Blt",
  "burstRounds": 4,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*4",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 13,
  "sourceNote": "Full row read off LEG10206 PDF 13; printed ROF *4.",
  "capacity": 250,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -33,
   "2": -23,
   "3": -17,
   "4": -12,
   "5": -9,
   "6": -7,
   "7": -6,
   "8": -4,
   "9": -3,
   "10": -2,
   "11": -1
  },
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
    "arcHexes": 5
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 7
   }
  },
  "ballisticAmmunitionWeightLb": 15.5,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 22,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 21,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 18,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 17,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 13,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 9.3,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6.9,
      "damageClass": 6
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 21,
      "damageClass": 9
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 20,
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 19,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 18,
      "damageClass": 9
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 16,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 12,
      "damageClass": 8
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 8.9,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6.6,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 31,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 30,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 28,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 26,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 24,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 18,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 13,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 9.7,
      "damageClass": 6
     }
    }
   }
  }
 },
 {
  "id": "m249",
  "name": "M249",
  "category": "Machine Gun",
  "description": "Belgium designed Squad Automatic Weapon adopted by the US army.",
  "weightLb": 22,
  "lengthIn": "41",
  "knockDown": 4,
  "feedDevice": null,
  "burstRounds": 7,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
  "capacity": 200,
  "reloadTimeActions": 14,
  "aimModifiers": {
   "1": -28,
   "2": -18,
   "3": -11,
   "4": -9,
   "5": -7,
   "6": -6,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "12": 0
  },
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
  "ballisticAmmunitionWeightLb": 6.9,
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
      "penetration": 7,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.6,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3,
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
      "penetration": 6.7,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4.4,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.9,
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
      "penetration": 9.9,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 6.5,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 4.3,
      "damageClass": 2
     }
    }
   }
  }
 },
 {
  "id": "m2hb",
  "name": "M2HB",
  "category": "Machine Gun",
  "description": "Standard US Heavy Machine Gun in service since 1933.",
  "weightLb": 157.5,
  "lengthIn": "65",
  "knockDown": 45,
  "feedDevice": null,
  "burstRounds": 5,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "capacity": 105,
  "reloadTimeActions": 14,
  "aimModifiers": {
   "1": -37,
   "2": -27,
   "3": -21,
   "4": -17,
   "5": -14,
   "6": -10,
   "7": -8,
   "8": -6,
   "10": -4,
   "12": -2,
   "14": 0
  },
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
    "arcHexes": 0.6
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
    "arcHexes": 6
   }
  },
  "ballisticAmmunitionWeightLb": 28.8,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 40,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 39,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 37,
      "damageClass": 10
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 35,
      "damageClass": 10
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 34,
      "damageClass": 10
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 28,
      "damageClass": 10
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 23,
      "damageClass": 10
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 19,
      "damageClass": 10
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 38,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 37,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 36,
      "damageClass": 10
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 34,
      "damageClass": 10
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 32,
      "damageClass": 10
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 27,
      "damageClass": 10
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 22,
      "damageClass": 10
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 19,
      "damageClass": 10
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 56,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 55,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 53,
      "damageClass": 10
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 50,
      "damageClass": 10
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 47,
      "damageClass": 10
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 39,
      "damageClass": 10
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 33,
      "damageClass": 10
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 27,
      "damageClass": 10
     }
    }
   }
  }
 },
 {
  "id": "m60",
  "name": "M60",
  "category": "Machine Gun",
  "description": "Adopted in the 1950s, this is the standard GPMG of US forces.",
  "weightLb": 29.7,
  "lengthIn": "44",
  "knockDown": 10,
  "feedDevice": "Blt",
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
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
   "12": 0
  },
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
  "ballisticAmmunitionWeightLb": 6.5,
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
      "penetration": 19,
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
  }
 },
 {
  "id": "m61-skorpion",
  "name": "M61 Skorpion",
  "category": "Sub-Machinegun",
  "description": "The Skorpion SMP is intended for vehicular crews and heavily loaded infantry.",
  "weightLb": 4.4,
  "lengthIn": "11/20",
  "knockDown": 2,
  "feedDevice": "Mag",
  "burstRounds": 7,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
  "capacity": 20,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -19,
   "2": -11,
   "3": -8,
   "4": -7,
   "5": -6,
   "6": -5,
   "7": -4
  },
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
   }
  },
  "ballisticAmmunitionWeightLb": 0.9,
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
      "damageClass": 1
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.8,
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
      "penetration": 1.1,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1,
      "damageClass": 2
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
      "damageClass": 1
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
  }
 },
 {
  "id": "mat-49",
  "name": "MAT 49",
  "category": "Sub-Machinegun",
  "description": "Well made weapon used by the French army.",
  "weightLb": 9.2,
  "lengthIn": "18/28",
  "knockDown": 3,
  "feedDevice": "Mag",
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "capacity": 32,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2
  },
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
  "ballisticAmmunitionWeightLb": 1.5,
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
  }
 },
 {
  "id": "pa3-dm",
  "name": "PA3-DM",
  "category": "Sub-Machinegun",
  "description": "Standard Sub-Machinegun of the Argentine military.",
  "weightLb": 8.7,
  "lengthIn": "21/27",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "capacity": 25,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2
  },
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
    "arcHexes": 2
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
    "arcHexes": 7
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 9
   }
  },
  "ballisticAmmunitionWeightLb": 1.1,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.5,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
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
      "penetration": 2.4,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
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
      "penetration": 3.6,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.8,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.7,
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
  }
 },
 {
  "id": "spectre",
  "name": "Spectre",
  "category": "Sub-Machinegun",
  "description": "New SMG firing from a closed bolt using a four column magazine.",
  "weightLb": 7.6,
  "lengthIn": "14/23",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 8,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*8",
  "threeRoundBurst": false,
  "capacity": 50,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -20,
   "2": -10,
   "3": -7,
   "4": -5,
   "5": -4,
   "6": -3,
   "7": -2,
   "8": -1
  },
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
  "ballisticAmmunitionWeightLb": 1.6,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.5,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
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
      "penetration": 2.4,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
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
      "penetration": 3.6,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.8,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.7,
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
  }
 },
 {
  "id": "steyr-aug",
  "name": "Steyr AUG",
  "category": "Assault Rifle",
  "description": "New Austrian rifle with an optical scope in its carrying handle.",
  "weightLb": 9,
  "lengthIn": "31",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
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
    "arcHexes": 1
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
    "arcHexes": 10
   }
  },
  "ballisticAmmunitionWeightLb": 1.1,
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
      "penetration": 11,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 9.9,
      "damageClass": 5
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6.3,
      "damageClass": 4
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 4,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.5,
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
      "penetration": 14,
      "damageClass": 8
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
      "penetration": 9.5,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 6,
      "damageClass": 6
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 3.8,
      "damageClass": 4
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 2.4,
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
      "penetration": 20,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 18,
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
      "penetration": 8.8,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 5.6,
      "damageClass": 3
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 3.5,
      "damageClass": 2
     }
    }
   }
  }
 },
 {
  "id": "steyr-lsw",
  "name": "Steyr LSW",
  "category": "Machine Gun",
  "description": "Light Support Weapon version of the Army Universal Gun.",
  "weightLb": 12.3,
  "lengthIn": "35",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 6,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
  "capacity": 42,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -8,
   "4": -6,
   "5": -5,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -1,
   "10": 0,
   "12": 1
  },
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
    "arcHexes": 2
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
    "arcHexes": 7
   },
   "r400": {
    "distanceFeet": 2400,
    "arcHexes": 9
   }
  },
  "ballisticAmmunitionWeightLb": 1.5,
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
  }
 },
 {
  "id": "steyr-mpi-81",
  "name": "Steyr MPi 81",
  "category": "Sub-Machinegun",
  "description": "Steyr SMG used by the police & military.",
  "weightLb": 7.8,
  "lengthIn": "17/24",
  "knockDown": 3,
  "feedDevice": "Mag",
  "burstRounds": 6,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*6",
  "threeRoundBurst": false,
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
   "8": -3,
   "9": -2
  },
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
    "arcHexes": 11
   }
  },
  "ballisticAmmunitionWeightLb": 1.4,
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
  }
 },
 {
  "id": "thompson-m1928a1",
  "name": "Thompson M1928A1",
  "category": "Sub-Machinegun",
  "description": "First model of the Thompson sub-machinegun with drum magazine.",
  "weightLb": 14.8,
  "lengthIn": "34",
  "knockDown": 5,
  "feedDevice": "Drm",
  "burstRounds": 7,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*7",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 6,
  "sourceNote": "Printed ROF *7, LEG10206 PDF 6.",
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -26,
   "2": -16,
   "3": -10,
   "4": -8,
   "5": -7,
   "6": -6,
   "7": -5,
   "8": -4,
   "9": -3,
   "10": -2,
   "11": -1,
   "12": 0,
   "13": 0,
   "14": 0,
   "15": 0,
   "16": 0
  },
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
  "ballisticAmmunitionWeightLb": 5.5,
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
      "penetration": 1.5,
      "damageClass": 3
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
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.5,
      "damageClass": 4
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
      "penetration": 2.3,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.8,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.4,
      "damageClass": 1
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
   }
  }
 },
 {
  "id": "type-100",
  "name": "Type 100",
  "category": "Sub-Machinegun",
  "description": "This SMG appeared in 1940 and used the underpowered 8mm Taisho 14 round.",
  "weightLb": 9.2,
  "lengthIn": "35",
  "knockDown": 3,
  "feedDevice": "Mag",
  "burstRounds": 4,
  "sustainedBurstPenalty": 2,
  "printedRateOfFire": "*4",
  "threeRoundBurst": false,
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 4,
  "sourceNote": "Printed ROF *4, LEG10206 PDF 4.",
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -3,
   "10": -2,
   "11": -1,
   "12": 0,
   "13": 1,
   "14": 2,
   "15": 3,
   "16": 4
  },
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
  "ballisticAmmunitionWeightLb": 1.2,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.9,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.8,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.2,
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
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.7,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.2,
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
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.7,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.5,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.7,
      "damageClass": 1
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
  }
 },
 {
  "id": "type-67",
  "name": "Type 67",
  "category": "Machine Gun",
  "description": "Chinese designed machine gun adopted in the early 1970s.",
  "weightLb": 27.7,
  "lengthIn": "45",
  "knockDown": 12,
  "feedDevice": "Blt",
  "burstRounds": 5,
  "sustainedBurstPenalty": 4,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "capacity": 100,
  "reloadTimeActions": 12,
  "aimModifiers": {
   "1": -29,
   "2": -20,
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
  "ballisticAmmunitionWeightLb": 5.8,
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
      "penetration": 10,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 8,
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
      "damageClass": 9
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 20,
      "damageClass": 9
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 19,
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
      "penetration": 10,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.6,
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
  }
 },
 {
  "id": "uzi",
  "name": "Uzi",
  "category": "Sub-Machinegun",
  "description": "Sturdy, reliable weapon popular with police and secret service.",
  "weightLb": 9,
  "lengthIn": "19/26",
  "knockDown": 4,
  "feedDevice": "Mag",
  "burstRounds": 5,
  "sustainedBurstPenalty": 3,
  "printedRateOfFire": "*5",
  "threeRoundBurst": false,
  "capacity": 32,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -23,
   "2": -12,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3
  },
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
  "ballisticAmmunitionWeightLb": 1.3,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.5,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.2,
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
      "penetration": 2.4,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.2,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.9,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.5,
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
      "penetration": 3.6,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3.3,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.8,
      "damageClass": 3
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 2.2,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.7,
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
  }
 }
].map(w=>Object.freeze(w)));

// Build a Weapon Item's `system` block from a catalogue entry. `rateOfFire` is deliberately
// null: these weapons print `*N`, which is a burst size and not a cost in Combat Actions, so
// claiming a chambering cost for them would be inventing one.
//
// `verification` is `legacy`, which is the model's own word for data ported from the sibling
// library and not read off a page. It used to say `library-import`, which is not one of the
// four the schema allows, so every weapon here was REJECTED by the item model (D54).
export function automaticWeaponSystem(entry,{modeId='auto'}={}){
  return {weightLb:entry.weightLb,quantity:1,carried:true,equipped:true,
    source:{bookId:entry.book??'LEG10200',
      verification:entry.provenance==='page-verified'?'visual':'legacy',
      pdfPage:entry.pdfPage??null,note:entry.sourceNote??(entry.pdfPage!=null?`${entry.book??'LEG10200'} PDF ${entry.pdfPage}.`:'')},
    selectedModeId:modeId,
    firearmModes:{[modeId]:{skill:'gun',fireTypes:['single','automatic'],
      aimModifiers:{...entry.aimModifiers},rateOfFire:null,
      burstRounds:entry.burstRounds,sustainedBurstPenalty:entry.sustainedBurstPenalty,
      minimumArc:structuredClone(entry.minimumArc),
      feed:'self-loading',capacity:entry.capacity,reloadTimeActions:entry.reloadTimeActions,
      ammunition:structuredClone(entry.ammunition)}},
    loaded:{ammunitionItemId:null,rounds:0,chamber:'unknown'}};
}

export const automaticWeaponsById=Object.freeze(Object.fromEntries(automaticWeapons.map(w=>[w.id,w])));
