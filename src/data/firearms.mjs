// Firearms that fire no burst - pistols, and the bolt-action and self-loading rifles.
// Seeded from phoenix-functions by `scripts/import-firearms.mjs`; ROF form and page
// references are maintained here as the authoritative catalogue (Foundry → library later).
//
// 20 weapons. Every printed Rate of Fire cell is page-verified: twelve from LEG10200 and
// eight from the weapon supplements (LEG10202, LEG10206, LEG10207). Ballistic, aim and
// physical rows for the supplement eight remain unchecked library data; only each weapon's
// ROF form and page reference were read off the book.
//
// THE ROF FORM is the thing this import had to settle. A weapon with a Minimum Arc fires
// bursts and lives in `automatic-weapons.mjs`; every weapon here lacks one, so its stored
// Rate of Fire is either a bare self-loading `*` (stored as 1) or a chambering cost in
// Combat Actions, and the library keeps both as a bare number. Each entry therefore carries
// its own `feed` and a `feedNote` saying how it was decided. Every weapon here is settled, and the
// `unknown` form the item model carries - which the timing rules refuse to fire until a GM
// records it - is what an unsettled one would get (D53, D55).
//
// A range column the page leaves blank is omitted rather than stored as a zero (D52), so a
// shot past where a weapon's row runs out is refused as beyond its printed data.
//
// Shotguns are not here: all six are transcribed from PDF 86 in `shotguns.mjs` (D39).
// Explosives are not here either; the library's rows for them are wrong in ways recorded in
// D51, and PDF 88 and 90 are transcribed instead.
//
// Ranges are printed in 2-yard hexes and stored in feet, at six feet to the hex.
export const firearmSource=Object.freeze({
  library:'phoenix-functions src/weapons.js',
  pageVerified:Object.freeze([
    "LEG10200 PDF 71","LEG10200 PDF 73","LEG10200 PDF 77","LEG10200 PDF 78","LEG10200 PDF 80",
    "LEG10202 PDF 16","LEG10202 PDF 21","LEG10206 PDF 3","LEG10206 PDF 7","LEG10206 PDF 10",
    "LEG10207 PDF 10","LEG10207 PDF 13"
  ]),
  status:'all-rof-page-verified',
  selection:'library weapons with no Minimum Arc, excluding shotguns and explosives'});

export const firearms=Object.freeze([
 {
  "id": "ar-15",
  "name": "AR-15",
  "category": "Assault Rifle",
  "description": "Lightweight sporting rifle based on the M16 assault rifle.",
  "weightLb": 8,
  "lengthIn": "39",
  "knockDown": 4,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10202 PDF 21.",
  "sustainedBurstPenalty": 3,
  "capacity": 30,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -22,
   "2": -11,
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
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "book": "LEG10202",
  "pdfPage": 21,
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
  "id": "arisaka-type-99",
  "name": "Arisaka Type 99",
  "category": "Assault Rifle",
  "description": "The Type 99 rifle was essentially a Meiji 38 rechambered for the 7.7 x 58 mm cartridge. The 7.7 x 58mm replaced the 6.5 x 50mrn round which was used in the Sino-Japanese war in Manchuria.",
  "weightLb": 9.4,
  "lengthIn": "44",
  "knockDown": 10,
  "feedDevice": "CS",
  "feed": "manual",
  "rateOfFire": 3,
  "feedNote": "Printed ROF 3, LEG10206 PDF 7.",
  "sustainedBurstPenalty": 6,
  "capacity": 5,
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
   "11": 0,
   "12": 1,
   "13": 2,
   "14": 3,
   "15": 4,
   "16": 5
  },
  "ballisticAmmunitionWeightLb": 0.35,
  "printedRateOfFire": "3",
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 7,
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
      "penetration": 8.8,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6.8,
      "damageClass": 6
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
      "penetration": 8.4,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6.5,
      "damageClass": 7
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 26,
      "damageClass": 7
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
      "penetration": 22,
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
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 12,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 9.6,
      "damageClass": 6
     }
    }
   }
  }
 },
 {
  "id": "colt-model-1851-navy",
  "name": "Colt Model 1851 Navy",
  "category": "Pistol",
  "description": "The revolver was used by both army and navy personnel, and saw service with both Union and Confederate forces.",
  "weightLb": 2.8,
  "lengthIn": "14",
  "knockDown": 2,
  "feedDevice": "Rnd",
  "feed": "manual",
  "rateOfFire": 2,
  "feedNote": "Printed ROF 2, LEG10207 PDF 10.",
  "sustainedBurstPenalty": 0,
  "capacity": 6,
  "reloadTimeActions": 120,
  "aimModifiers": {
   "1": -18,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7,
   "7": -6
  },
  "ballisticAmmunitionWeightLb": 0.2,
  "printedRateOfFire": "2",
  "provenance": "page-verified",
  "book": "LEG10207",
  "pdfPage": 10,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.1,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.5,
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
   }
  }
 },
 {
  "id": "colt-revolving-rifle",
  "name": "Colt Revolving Rifle",
  "category": "Assault Rifle",
  "description": "The Colt Revolving Rifle was introduced shortly before the American Civil War. It made use of a standard revolver action and was used for a short time by Berdan's sharpshooters before before the Sharp's rifles became available.",
  "weightLb": 10.3,
  "lengthIn": "56",
  "knockDown": 10,
  "feedDevice": "Rnd",
  "feed": "manual",
  "rateOfFire": 2,
  "feedNote": "Printed ROF 2, LEG10207 PDF 13.",
  "sustainedBurstPenalty": 0,
  "capacity": 5,
  "reloadTimeActions": 110,
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
   "11": 0,
   "12": 0,
   "13": 0,
   "14": 0,
   "15": 0,
   "16": 0
  },
  "ballisticAmmunitionWeightLb": 0.7,
  "printedRateOfFire": "2",
  "provenance": "page-verified",
  "book": "LEG10207",
  "pdfPage": 13,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.6,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.4,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.2,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.8,
      "damageClass": 6
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.5,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.3,
      "damageClass": 1
     }
    }
   }
  }
 },
 {
  "id": "dragunov-svd",
  "name": "Dragunov SVD",
  "category": "Assault Rifle",
  "description": "The Dragunov is equipped with a PSO-1 4x optical sight whose reticle is illuminated by a small battery. The scope is capable of detecting an infra-red source.",
  "weightLb": 10.2,
  "lengthIn": "48",
  "knockDown": 12,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 80.",
  "sustainedBurstPenalty": 6,
  "capacity": 10,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -22,
   "2": -12,
   "3": -7,
   "4": -5,
   "5": -4,
   "6": -2,
   "7": 0,
   "8": 1,
   "9": 2,
   "10": 3,
   "11": 4
  },
  "ballisticAmmunitionWeightLb": 0.68,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 80,
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
      "penetration": 7.8,
      "damageClass": 6
     }
    }
   },
   "jhp": {
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
      "penetration": 19,
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
      "penetration": 9.9,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.5,
      "damageClass": 6
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
      "penetration": 30,
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
  "id": "fn-mk-1",
  "name": "FN Mk 1",
  "category": "Pistol",
  "description": "Browning High-Power pistol. Manufactured & sold worldwide.",
  "weightLb": 2.3,
  "lengthIn": "8",
  "knockDown": 3,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 71.",
  "sustainedBurstPenalty": 4,
  "capacity": 13,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -17,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.5,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 71,
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
      "penetration": 1.8,
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
      "penetration": 2.9,
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
      "penetration": 0.6,
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
  "id": "fr-f2",
  "name": "FR F2",
  "category": "Assault Rifle",
  "description": "French sniper rifle with optical scope and bipod chambered in 7.62 mm NATO.",
  "weightLb": 12.5,
  "lengthIn": "45",
  "knockDown": 10,
  "feedDevice": "Mag",
  "feed": "manual",
  "rateOfFire": 3,
  "feedNote": "Printed ROF 3, LEG10200 PDF 78.",
  "sustainedBurstPenalty": 5,
  "capacity": 10,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -24,
   "2": -14,
   "3": -7,
   "4": -5,
   "5": -4,
   "6": -2,
   "7": 0,
   "8": 1,
   "9": 2,
   "10": 3,
   "11": 4,
   "12": 5
  },
  "ballisticAmmunitionWeightLb": 1.1,
  "printedRateOfFire": "3",
  "provenance": "page-verified",
  "pdfPage": 78,
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
      "penetration": 7,
      "damageClass": 5
     }
    }
   }
  }
 },
 {
  "id": "hk-p7m13",
  "name": "HK P7M13",
  "category": "Pistol",
  "description": "Modern pistol of innovative design used by the West German army and police.",
  "weightLb": 2.5,
  "lengthIn": "7",
  "knockDown": 3,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 71.",
  "sustainedBurstPenalty": 4,
  "capacity": 13,
  "reloadTimeActions": 3,
  "aimModifiers": {
   "1": -17,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.63,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 71,
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
  }
 },
 {
  "id": "kenju-type-94",
  "name": "Kenju Type 94",
  "category": "Pistol",
  "description": "This pistol was introduced in 1937 to supplement the Taisho 14. Of poor quality, a sharp blow can cause it to fire.",
  "weightLb": 1.9,
  "lengthIn": "7",
  "knockDown": 2,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10206 PDF 3.",
  "sustainedBurstPenalty": 3,
  "capacity": 6,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -16,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7,
   "7": -6,
   "8": -5,
   "9": -4,
   "10": -3,
   "11": -2,
   "12": -1,
   "13": 0,
   "14": 1,
   "15": 2,
   "16": 3
  },
  "ballisticAmmunitionWeightLb": 0.32,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 3,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.6,
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
      "damageClass": 1
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
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.5,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.4,
      "damageClass": 2
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.2,
      "damageClass": 2
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
      "damageClass": 1
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
  "id": "l1a1-f1",
  "name": "L1A1-F1",
  "category": "Assault Rifle",
  "description": "Standard Australian army rifle patterned after the FN FAL. It is being replaced by the Austrian Steyr AUG.",
  "weightLb": 12,
  "lengthIn": "42",
  "knockDown": 10,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 77.",
  "sustainedBurstPenalty": 5,
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
   "11": 0
  },
  "ballisticAmmunitionWeightLb": 1.6,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 77,
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
  "id": "m1-carbine",
  "name": "M1 Carbine",
  "category": "Assault Rifle",
  "description": "More M1 Carbines were produced in WWII than any other American weapon. It was designed as a light weapon for use by machine-gunners, mortarmen, and officers. Extremely popular, it was used throughout WWII and the Korean War.",
  "weightLb": 5.9,
  "lengthIn": "36",
  "knockDown": 5,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10206 PDF 10.",
  "sustainedBurstPenalty": 4,
  "capacity": 15,
  "reloadTimeActions": 8,
  "aimModifiers": {
   "1": -21,
   "2": -11,
   "3": -9,
   "4": -7,
   "5": -6,
   "6": -4,
   "7": -3,
   "8": -2,
   "9": -2,
   "10": -1,
   "11": 0,
   "12": 1,
   "13": 2,
   "14": 3,
   "15": 4,
   "16": 5
  },
  "ballisticAmmunitionWeightLb": 0.77,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 10,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 6.8,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 6.4,
      "damageClass": 6
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 5.8,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 4.9,
      "damageClass": 5
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 4.2,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 2.4,
      "damageClass": 2
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 1.4,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.8,
      "damageClass": 1
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 6.5,
      "damageClass": 7
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 6.2,
      "damageClass": 7
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 5.5,
      "damageClass": 7
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 4.7,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 4,
      "damageClass": 6
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 2.3,
      "damageClass": 3
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 1.3,
      "damageClass": 2
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.8,
      "damageClass": 1
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 9.6,
      "damageClass": 6
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 9.1,
      "damageClass": 5
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 8.1,
      "damageClass": 5
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 6.9,
      "damageClass": 4
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 5.9,
      "damageClass": 4
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 3.4,
      "damageClass": 2
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 2,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 1.1,
      "damageClass": 1
     }
    }
   }
  }
 },
 {
  "id": "m1-garand",
  "name": "M1 Garand",
  "category": "Assault Rifle",
  "description": "The M1 Garand was the first self-loading weapon accepted for military service. It entered service in 1936 and by 1941 was the standard US infantryman's weapon. The M1 Garand automatically ejects its ammo clip and single rounds cannot be fed to top off the clip.",
  "weightLb": 10,
  "lengthIn": "44",
  "knockDown": 11,
  "feedDevice": null,
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10206 PDF 10.",
  "sustainedBurstPenalty": 6,
  "capacity": 8,
  "reloadTimeActions": 7,
  "aimModifiers": {
   "1": -23,
   "2": -13,
   "3": -9,
   "4": -8,
   "5": -6,
   "6": -5,
   "7": -4,
   "8": -3,
   "9": -2,
   "10": -1,
   "11": -1,
   "12": 0
  },
  "ballisticAmmunitionWeightLb": 0.52,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "book": "LEG10206",
  "pdfPage": 10,
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
  "id": "m1911a1",
  "name": "M1911A1",
  "category": "Pistol",
  "description": "The Colt 45 Automatic Pistol has been the USA's standard military sidearm since WW I.",
  "weightLb": 3,
  "lengthIn": "9",
  "knockDown": 5,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 73.",
  "sustainedBurstPenalty": 5,
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
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 73,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1.6,
      "damageClass": 3
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
      "penetration": 1.5,
      "damageClass": 4
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.4,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1.2,
      "damageClass": 3
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
      "penetration": 2.2,
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
  "id": "m1949-56",
  "name": "M1949-56",
  "category": "Assault Rifle",
  "description": "This French army rifle is still in service and is being replaced by the FAMAS. The FA MAS is currently only available to elite troops.",
  "weightLb": 9.6,
  "lengthIn": "40",
  "knockDown": 9,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 77.",
  "sustainedBurstPenalty": 5,
  "capacity": 10,
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
  "ballisticAmmunitionWeightLb": 0.95,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 77,
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
      "penetration": 17,
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
      "damageClass": 8
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
      "damageClass": 7
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
      "penetration": 9.9,
      "damageClass": 5
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 7.1,
      "damageClass": 4
     }
    }
   }
  }
 },
 {
  "id": "mab-pa15",
  "name": "MAB PA15",
  "category": "Pistol",
  "description": "Modern, high capacity pistol. Standard pistol of the French army.",
  "weightLb": 2.8,
  "lengthIn": "8",
  "knockDown": 3,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 71.",
  "sustainedBurstPenalty": 4,
  "capacity": 15,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -18,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.6,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 71,
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
      "penetration": 1.8,
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
      "penetration": 2.9,
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
  "id": "remington-m700",
  "name": "Remington M700",
  "category": "Assault Rifle",
  "description": "The 308 Winchester was developed in 1952 and adopted by the US military in 1954 as the 7.62 mm NATO. It was designed to replace the 30'06, and since acceptance has proven to be an extremely accurate round. Today most world class shooting records are held by this cartridge. In part this is due to the thousands of rounds fired in matches each year, but the inherent accuracy of the cartridge cannot be disputed.",
  "weightLb": 11.8,
  "lengthIn": "44",
  "knockDown": 11,
  "feedDevice": null,
  "feed": "manual",
  "rateOfFire": 3,
  "feedNote": "Printed ROF 3, LEG10202 PDF 16.",
  "sustainedBurstPenalty": 6,
  "capacity": 5,
  "reloadTimeActions": 16,
  "aimModifiers": {
   "1": -23,
   "2": -13,
   "3": -7,
   "4": -5,
   "5": -4,
   "6": -2,
   "7": 0,
   "8": 1,
   "9": 2,
   "10": 3,
   "11": 4,
   "12": 4
  },
  "ballisticAmmunitionWeightLb": 0.06,
  "printedRateOfFire": "3",
  "provenance": "page-verified",
  "book": "LEG10202",
  "pdfPage": 16,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 20,
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
      "penetration": 17,
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
      "penetration": 9.1,
      "damageClass": 8
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 6.8,
      "damageClass": 7
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 20,
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
      "penetration": 17,
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
      "penetration": 6.8,
      "damageClass": 8
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 30,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 29,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 27,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 25,
      "damageClass": 7
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 23,
      "damageClass": 7
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 17,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 13,
      "damageClass": 6
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 10,
      "damageClass": 6
     }
    }
   }
  }
 },
 {
  "id": "type-51",
  "name": "Type 51",
  "category": "Pistol",
  "description": "Chinese copy of the Soviet TI33. Standard pistol of the Chinese army.",
  "weightLb": 1.9,
  "lengthIn": "8",
  "knockDown": 3,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 71.",
  "sustainedBurstPenalty": 4,
  "capacity": 8,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -16,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.33,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 71,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.7,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.5,
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
      "damageClass": 2
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
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 2.6,
      "damageClass": 5
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 2.4,
      "damageClass": 4
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 2.1,
      "damageClass": 4
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 1.6,
      "damageClass": 3
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.3,
      "damageClass": 2
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
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 3.8,
      "damageClass": 3
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 3.6,
      "damageClass": 3
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 3,
      "damageClass": 2
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 2.4,
      "damageClass": 2
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 1.9,
      "damageClass": 2
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 0.4,
      "damageClass": 1
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 0.2,
      "damageClass": 1
     }
    }
   }
  }
 },
 {
  "id": "walther-2000",
  "name": "Walther 2000",
  "category": "Assault Rifle",
  "description": "Specially designed sniper rifle with optical scope and biped.",
  "weightLb": 18.3,
  "lengthIn": "36",
  "knockDown": 13,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 78.",
  "sustainedBurstPenalty": 5,
  "capacity": 6,
  "reloadTimeActions": 10,
  "aimModifiers": {
   "1": -26,
   "2": -16,
   "3": -8,
   "4": -6,
   "5": -4,
   "6": -3,
   "7": -1,
   "8": 0,
   "9": 1,
   "10": 2,
   "12": 5
  },
  "ballisticAmmunitionWeightLb": 0.9,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 78,
  "ammunition": {
   "fmj": {
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
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 24,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 22,
      "damageClass": 8
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 17,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 13,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 9.8,
      "damageClass": 7
     }
    }
   },
   "jhp": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 26,
      "damageClass": 10
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 26,
      "damageClass": 10
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 24,
      "damageClass": 10
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 23,
      "damageClass": 10
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 21,
      "damageClass": 9
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 16,
      "damageClass": 9
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 12,
      "damageClass": 9
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 9.4,
      "damageClass": 8
     }
    }
   },
   "ap": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 39,
      "damageClass": 8
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 38,
      "damageClass": 8
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 36,
      "damageClass": 8
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 33,
      "damageClass": 8
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 31,
      "damageClass": 8
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 24,
      "damageClass": 7
     },
     "r300": {
      "distanceFeet": 1800,
      "penetration": 18,
      "damageClass": 7
     },
     "r400": {
      "distanceFeet": 2400,
      "penetration": 14,
      "damageClass": 6
     }
    }
   }
  }
 },
 {
  "id": "walther-p1",
  "name": "Walther P1",
  "category": "Pistol",
  "description": "Current version of the WW II P38. Standard pistol of the West German army.",
  "weightLb": 2.1,
  "lengthIn": "9",
  "knockDown": 3,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 71.",
  "sustainedBurstPenalty": 4,
  "capacity": 8,
  "reloadTimeActions": 5,
  "aimModifiers": {
   "1": -17,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8,
   "6": -7
  },
  "ballisticAmmunitionWeightLb": 0.41,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 71,
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
  }
 },
 {
  "id": "walther-ppk",
  "name": "Walther PPK",
  "category": "Pistol",
  "description": "Small, easily concealed pistol designed for police undercover use.",
  "weightLb": 1.4,
  "lengthIn": "6",
  "knockDown": 2,
  "feedDevice": "Mag",
  "feed": "self-loading",
  "rateOfFire": null,
  "feedNote": "Printed ROF *, LEG10200 PDF 71.",
  "sustainedBurstPenalty": 2,
  "capacity": 7,
  "reloadTimeActions": 4,
  "aimModifiers": {
   "1": -16,
   "2": -11,
   "3": -10,
   "4": -9,
   "5": -8
  },
  "ballisticAmmunitionWeightLb": 0.31,
  "printedRateOfFire": "*",
  "provenance": "page-verified",
  "pdfPage": 71,
  "ammunition": {
   "fmj": {
    "ranges": {
     "r10": {
      "distanceFeet": 60,
      "penetration": 1,
      "damageClass": 1
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 0.9,
      "damageClass": 1
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.3,
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
      "penetration": 0.9,
      "damageClass": 2
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 0.8,
      "damageClass": 1
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 0.7,
      "damageClass": 1
     },
     "r70": {
      "distanceFeet": 420,
      "penetration": 0.5,
      "damageClass": 1
     },
     "r100": {
      "distanceFeet": 600,
      "penetration": 0.3,
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
      "penetration": 1.4,
      "damageClass": 1
     },
     "r20": {
      "distanceFeet": 120,
      "penetration": 1.2,
      "damageClass": 1
     },
     "r40": {
      "distanceFeet": 240,
      "penetration": 1,
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
     },
     "r200": {
      "distanceFeet": 1200,
      "penetration": 0.2,
      "damageClass": 1
     }
    }
   }
  }
 }
].map(w=>Object.freeze(w)));

// Build a Weapon Item's `system` block from a catalogue entry. `burstRounds` and
// `minimumArc` stay empty: these weapons print no `*N` and no MA row, so claiming either
// would be inventing one. `rateOfFire` carries a chambering cost and only that.
export function firearmSystem(entry,{modeId='fire'}={}){
  return {weightLb:entry.weightLb,quantity:1,carried:true,equipped:true,
    source:{bookId:entry.book??'LEG10200',verification:entry.provenance==='page-verified'?'visual':'legacy',
      pdfPage:entry.pdfPage,note:entry.feedNote},
    selectedModeId:modeId,
    firearmModes:{[modeId]:{skill:'gun',fireTypes:['single'],
      aimModifiers:{...entry.aimModifiers},rateOfFire:entry.rateOfFire,
      burstRounds:null,sustainedBurstPenalty:entry.sustainedBurstPenalty,minimumArc:{},
      feed:entry.feed,capacity:entry.capacity,reloadTimeActions:entry.reloadTimeActions,
      armTimeActions:null,throwRangeHexes:null,
      ammunition:structuredClone(entry.ammunition)}},
    meleeModes:{},
    loaded:{ammunitionItemId:null,rounds:0,chamber:'unknown'}};
}

export const firearmsById=Object.freeze(Object.fromEntries(firearms.map(w=>[w.id,w])));
