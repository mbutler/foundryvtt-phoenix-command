// Axe or Mace and Club, LEG10204 Weapon Data Table 1A, PDF 42.
// One-handed rows only. The two-handed lines on the same rows are not here.
// A slash uses the cutting die on the weapon's own table: flange for the mace,
// blunt for the club. A thrust uses the stabbing die on that same table.

export const impactWeaponSource = Object.freeze({
  bookId: 'LEG10204', table: '1A', pdfPage: 42, verification: 'visual'
});

function item(id, name, weightLb, weaponSpeed, weaponClass, slash, thrust, section) {
  return {
    id, name, type: 'weapon',
    system: {
      schemaVersion: 1, catalogId: id, catalogRevision: '', weightLb,
      quantity: 1, carried: true, equipped: true, attachedToId: null, weightNote: '', notes: '',
      source: { ...impactWeaponSource, section, note: '' },
      selectedModeId: 'oneHanded',
      firearmModes: {},
      loaded: { ammunitionItemId: null, rounds: 0, chamber: 'unknown' },
      meleeModes: {
        oneHanded: {
          grip: 'One handed', skill: 'melee', hands: 1,
          weaponSpeed, weaponClass,
          reachMinFeet: 2, reachMaxFeet: 2, tipReachFeet: null,
          attacks: {
            slash: { motion: 'slash', damageFamily: slash.family, impactFormula: slash.formula, traits: [] },
            thrust: { motion: 'thrust', damageFamily: thrust.family, impactFormula: thrust.formula, traits: [] }
          },
          preparation: { sets: 0, progressActions: 0, recoveryRequired: false }
        }
      }
    }
  };
}

export function maceItem() {
  return item('axe-or-mace', 'Axe or Mace', 3.3, 2.1, -2,
    { family: 'flange', formula: '1d4 + 4' }, { family: 'flange', formula: '1d3' }, 'Archaic weapons');
}

export function clubItem() {
  return item('club', 'Club', 2.2, 2.2, 0,
    { family: 'blunt', formula: '1d4 + 3' }, { family: 'blunt', formula: '1d3' }, 'Blunt impact weapons');
}
