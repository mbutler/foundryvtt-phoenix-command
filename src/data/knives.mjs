// The K-Bar, LEG10204 Weapon Data Table 1, the modern knives block.
// Weight 0.6, Weapon Speed 2.8, Weapon Class +2, cutting (3)+1, stabbing (3),
// range 1 two-foot hex. It is the knife in §5.19. Nothing else on that page is here.

export const knifeSource = Object.freeze({
  bookId: 'LEG10204', table: '1', section: 'Modern weapons', pdfPage: 42, verification: 'visual'
});

export function knifeItem(id = 'k-bar') {
  if (id !== 'k-bar') throw new Error(`No transcribed knife has id "${id}".`);
  return {
    id: 'k-bar', name: 'K-Bar Knife', type: 'weapon',
    system: {
      schemaVersion: 1, catalogId: 'k-bar', catalogRevision: '', weightLb: 0.6,
      quantity: 1, carried: true, equipped: true, attachedToId: null, weightNote: '', notes: '',
      source: { ...knifeSource, note: '' },
      selectedModeId: 'oneHanded',
      firearmModes: {},
      loaded: { ammunitionItemId: null, rounds: 0, chamber: 'unknown' },
      meleeModes: {
        oneHanded: {
          grip: 'One handed', skill: 'melee', hands: 1,
          weaponSpeed: 2.8, weaponClass: 2,
          reachMinFeet: 2, reachMaxFeet: 2, tipReachFeet: null,
          attacks: {
            slash: { motion: 'slash', damageFamily: 'cutting', impactFormula: '1d3 + 1', traits: [] },
            thrust: { motion: 'thrust', damageFamily: 'stabbing', impactFormula: '1d3', traits: [] }
          },
          preparation: { sets: 0, progressActions: 0, recoveryRequired: false }
        }
      }
    }
  };
}
