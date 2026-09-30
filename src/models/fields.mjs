import { sourceVerifications } from '../data/source-verification.mjs';

const f = foundry.data.fields;
export const number = (options = {}) => new f.NumberField({ required: true, nullable: false, initial: 0, ...options });
export const unknownNumber = (options = {}) => number({ nullable: true, initial: null, ...options });
export const text = (options = {}) => new f.StringField({ required: true, nullable: false, initial: '', ...options });
export const choice = (choices, initial) => text({ choices, initial });
export const boolean = (initial = false) => new f.BooleanField({ required: true, initial });
export const schema = (fields, options = {}) => new f.SchemaField(fields, options);
export const records = (field) => new f.TypedObjectField(field, { required: true, initial: {} });
export const strings = () => new f.ArrayField(text({ blank: false }), { required: true, initial: [] });
// Sibling Item IDs are resolved against parent.items by the adapter, never as global UUIDs.
export const itemId = () => text({ nullable: true, initial: null });
export const side = () => choice(['left', 'right', 'both', 'center'], 'center');
export const source = () => schema({
  bookId: text(), table: text(), section: text(), pdfPage: unknownNumber({ min: 1, integer: true }),
  verification: choice([...sourceVerifications], 'unverified'), note: text()
});

export function physicalFields() {
  return {
    schemaVersion: number({ initial: 1, min: 1, integer: true }),
    catalogId: text(), catalogRevision: text(), source: source(),
    weightLb: unknownNumber({ min: 0 }), quantity: number({ initial: 1, min: 0, integer: true }),
    carried: boolean(true), equipped: boolean(), attachedToId: itemId(),
    weightNote: text(), notes: text()
  };
}

export function meleeProfile() {
  return schema({
    grip: text(), skill: choice(['melee', 'unarmed'], 'melee'),
    hands: number({ initial: 1, min: 1, max: 2, integer: true }),
    weaponSpeed: unknownNumber({ min: 0 }), weaponClass: unknownNumber(),
    reachMinFeet: unknownNumber({ min: 0 }), reachMaxFeet: unknownNumber({ min: 0 }),
    tipReachFeet: unknownNumber({ min: 0 }),
    attacks: records(schema({
      motion: choice(['slash', 'thrust'], 'slash'),
      damageFamily: choice(['cutting', 'stabbing', 'flange', 'blunt'], 'cutting'),
      impactFormula: text(),
      // Unarmed blows are priced per attack on Table 3B rather than by a Weapon Speed - a kick
      // is slower than a jab and a fist has no speed to look up - and a few carry their own
      // Weapon Class. Null on a weapon, whose costs come from §3.1's table (D66).
      actionCosts: schema({ set: unknownNumber({ min: 0 }), strike: unknownNumber({ min: 0 }), recover: unknownNumber({ min: 0 }) }),
      weaponClass: unknownNumber(),
      traits: strings()
    })),
    preparation: schema({
      sets: number({ min: 0, max: 2, integer: true }),
      progressActions: number({ min: 0 }), recoveryRequired: boolean()
    })
  });
}

export function protection() {
  return schema({
    region: text(), side: side(), ballisticPF: unknownNumber({ min: 0 }),
    meleeClass: text({ nullable: true, initial: null, choices: ['NO', 'LT', 'ML', 'BR', 'PL', 'I'] }),
    // A string preserves the distinct 3+ table category.
    bpf: text({ nullable: true, initial: null }), material: text()
  });
}
