import { number, unknownNumber, text, boolean, choice, schema, records, strings, itemId, physicalFields, meleeProfile, protection } from './fields.mjs';

export class EquipmentData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return physicalFields(); }
}

export class WeaponData extends EquipmentData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      selectedModeId: text(),
      // §3.1: "the weapon in the Off-Hand ... is limited for attack purposes" by the Agility
      // Skill Factor, and §3.2 makes it the primary parrying device. Which hand holds it is
      // therefore a rule input, not decoration. `unstated` is the truth about a weapon nobody
      // has said, and an off-hand blow is refused until it is said (D64).
      heldIn: choice(['unstated', 'primary', 'off'], 'unstated'),
      // Separate maps make mode-specific fields explicit, without opaque blobs.
      firearmModes: records(schema({
        skill: choice(['gun'], 'gun'), fireTypes: strings(),
        aimModifiers: records(number()), rateOfFire: unknownNumber({ min: 0 }),
        // The `*N` printed Rate of Fire: rounds sent in one half-second burst. It is kept
        // apart from `rateOfFire` on purpose. Both are printed in the same place on a weapon
        // data line and both are called Rate of Fire, but a bare number is a cost in Combat
        // Actions to chamber a round and `*N` is a burst size - the contract's §2 table
        // spells the four forms out. A weapon whose ROF was imported without its asterisk
        // would otherwise make a bolt rifle fire three-round bursts.
        burstRounds: unknownNumber({ min: 1, integer: true }),
        // §3.4's SAB: subtracted from the preceding burst's elevation EAL for each succeeding
        // burst of a continuous string. It applies to nothing else.
        sustainedBurstPenalty: unknownNumber({ min: 0 }),
        // §3.4's Minimum Arc, printed per range on the weapon's own line. Recoil forces a
        // burst to be tracked over at least this many hexes.
        minimumArc: records(schema({ distanceFeet: number({ min: 0 }), arcHexes: number({ min: 0 }) })),
        // LEG10203 §6.3's 3RB, printed per range on a `**` weapon's line: the three-round
        // burst's scatter, read with the shot's EAL on Table 9B. Empty on every other weapon.
        threeRoundBurst: records(schema({ distanceFeet: number({ min: 0 }), value: number() })),
        feed: choice(['unknown','self-loading','manual','single-load'],'unknown'),
        capacity: unknownNumber({min:1,integer:true}),
        reloadTimeActions: unknownNumber({min:1,integer:true}),
        // §3.6 Arm Time, in Combat Actions, paid before a grenade is thrown. Null on a firearm.
        armTimeActions: unknownNumber({ min: 1, integer: true }),
        // §3.6 Range: how far this grenade is thrown, in 2-yard hexes, from a kneeling
        // stance. Null on anything that is not thrown, and on a grenade written before the
        // field existed - an unstated range is refused rather than assumed.
        throwRangeHexes: unknownNumber({ min: 1, integer: true }),
        ammunition: records(schema({
          // Printed beside the shot type. Null on a slug, which has no pattern.
          pelletNumber: unknownNumber({ min: 1, integer: true }),
          // §3.6 Fuse Length in 2-second phases. Null is an impact fuse (printed "I").
          fusePhases: unknownNumber({ min: 1, integer: true }),
          ranges: records(schema({
            distanceFeet: number({ min: 0 }), penetration: unknownNumber({ min: 0 }),
            damageClass: unknownNumber({ min: 0, integer: true }),
            // §3.5. A column with a SALM and no pellet chance is the close-range one-mass
            // case: the pattern has not spread. A slug leaves all four null.
            salm: unknownNumber(),
            pelletChance: unknownNumber(),
            pelletRounds: unknownNumber({ min: 1, integer: true }),
            patternRadiusHexes: unknownNumber({ min: 0 })
          })),
          // §3.6 explosion columns, keyed C, 0, 1, 2, 3, 5, 10. Empty on a firearm.
          // A cell the page leaves blank is null, which is not the same as zero: a printed
          // BSHC of 0 is still hit on a roll of 00 and can be shifted by §3.7, where a blank
          // prints no chance at all. A column with no BSHC throws no shrapnel (D47), so its
          // PEN and DC are blank too - except a blast grenade's contact column, which prints
          // a PEN for the armour case and no chance of a piece.
          burst: records(schema({
            penetration: unknownNumber({ min: 0 }),
            damageClass: unknownNumber({ min: 1, max: 10, integer: true }),
            shrapnelChance: unknownNumber(),
            shrapnelRounds: unknownNumber({ min: 1, integer: true }),
            baseConcussion: number({ min: 0 })
          }))
        }))
      })),
      meleeModes: records(meleeProfile()),
      // Section 5.11 (PDF 57) charges a printed Rate of Fire only for a second or subsequent
      // shot, so whether a round is ready decides whether a shot pays it. Self-loading modes
      // ignore this - "a round is always ready for fire until the magazine is empty" - and
      // every other form refuses to fire on `unknown` rather than assume either way. A
      // weapon written before this field existed reads as `unknown`, which is the truth
      // about it; no migration makes a claim on its behalf.
      loaded: schema({ ammunitionItemId: itemId(), rounds: number({ min: 0, integer: true }),
        chamber: choice(['unknown','ready','empty'],'unknown') })
    };
  }

  static validateJoint(data) {
    super.validateJoint(data);
    const firearm = data.firearmModes ?? {};
    const melee = data.meleeModes ?? {};
    if (Object.keys(firearm).some(id => Object.hasOwn(melee, id))) throw new Error('Attack mode IDs must be unique across firearm and melee modes.');
    if (data.selectedModeId && !Object.hasOwn(firearm, data.selectedModeId) && !Object.hasOwn(melee, data.selectedModeId)) {
      throw new Error('Selected attack mode does not exist.');
    }
    for (const mode of Object.values(firearm)) {
      for (const ammo of Object.values(mode.ammunition ?? {})) {
        for (const range of Object.values(ammo.ranges ?? {})) {
          if (range.pelletChance != null && range.pelletRounds != null) throw new Error('A shotgun column prints a pellet count or a percentage, not both.');
        }
        for (const column of Object.values(ammo.burst ?? {})) {
          if (column.shrapnelChance != null && column.shrapnelRounds != null) throw new Error('A burst column prints a shrapnel count or a percentage, not both.');
        }
      }
    }
    for (const mode of Object.values(melee)) {
      if (mode.reachMinFeet !== null && mode.reachMaxFeet !== null && mode.reachMinFeet > mode.reachMaxFeet) throw new Error('Minimum reach exceeds maximum reach.');
      if (mode.tipReachFeet !== null && mode.reachMaxFeet !== null && mode.tipReachFeet < mode.reachMaxFeet) throw new Error('Tip reach is shorter than normal reach.');
    }
    if (data.loaded?.rounds > 0 && !data.loaded.ammunitionItemId) throw new Error('Loaded rounds require an ammunition Item reference.');
  }
}

export class AmmunitionData extends EquipmentData {
  static defineSchema() {
    return { ...super.defineSchema(), ammunitionKey: text(), compatibleCatalogIds: strings(), packageCapacity:unknownNumber({min:1,integer:true}), packageCount:unknownNumber({min:0,integer:true}), packageUnit:text() };
  }
}

export class ArmorData extends EquipmentData {
  static defineSchema() { return { ...super.defineSchema(), coverage: records(protection()) }; }
}

export class ShieldData extends EquipmentData {
  static defineSchema() {
    return {
      ...super.defineSchema(), partialParry: unknownNumber({ min: 1, max: 9, integer: true }),
      strapped: boolean(), strikeModes: records(meleeProfile())
    };
  }
}

export const itemModels = Object.freeze({ weapon: WeaponData, ammunition: AmmunitionData, armor: ArmorData, shield: ShieldData, equipment: EquipmentData });
