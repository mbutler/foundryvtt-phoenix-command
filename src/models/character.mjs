import {defaultCharacterConditions} from '../rules/condition-defaults.mjs';
import { boolean, number, unknownNumber, text, choice, schema, records, strings, itemId, side } from './fields.mjs';
import { summarizeInjuries, summarizeInventory, inspectLoadout } from '../rules/summary.mjs';

export class CharacterData extends foundry.abstract.TypeDataModel {
  static migrateData(source,options) {
    return defaultCharacterConditions(super.migrateData(source,options));
  }

  static defineSchema() {
    const hand = () => schema({ itemId: itemId(), modeId: text() });
    return {
      schemaVersion: number({ initial: 1, min: 1, integer: true }),
      attributes: schema(Object.fromEntries(['strength', 'agility', 'intelligence', 'will', 'health']
        .map(key => [key, unknownNumber({ min: 1 })]))),
      skills: schema(Object.fromEntries(['gun', 'melee', 'unarmed']
        .map(key => [key, unknownNumber({ min: 0, max: 20, integer: true })]))),
      profile: schema({ catalogId: text(), revision: text() }),
      condition: schema({
        posture: choice(['unknown', 'standing', 'kneeling', 'prone'], 'standing'),
        braced: boolean(false), firingStance: boolean(false),
        // Table 7B: looking over or around cover (Key 6B's look-over column when shot at).
        looking: boolean(false),
        consciousness: choice(['unknown', 'conscious', 'incapacitated'], 'conscious'),
        speedFeetPerSecond: number({ min: 0 }), actionPenalty: number({ min: 0 })
      }),
      hands: schema({ dominant: choice(['left', 'right', 'ambidextrous'], 'right'), left: hand(), right: hand() }),
      injuries: records(schema({
        resolutionId: text(), attackId: text(), combatUuid: text(), location: text(), side: side(),
        physicalDamage: number({ min: 0 }), disabledRegions: strings(),
        // Table 6C, PDF 65: shock counts toward the Knockout Roll in the impulse the wound
        // is inflicted and is never part of the PD Total, so it is kept apart from
        // physicalDamage rather than folded into it. Wounds recorded before this field
        // existed read as zero, which is what they were: nothing determined disabling then.
        shockPhysicalDamage: number({ min: 0 }),
        phase: unknownNumber({ min: 1, integer: true }), impulse: unknownNumber({ min: 1, max: 4, integer: true }),
        // World time when the wound was taken: §2.9's Critical Time Period and §2.10's hour and
        // healing days are counted from it. Wounds recorded before this field read as unknown.
        worldTime: unknownNumber(),
        status: choice(['active', 'healed', 'reversed'], 'active'), notes: text()
      })),
      // §2.9 and §2.10's aftermath, recorded once the fight is over. Null throughout until
      // a recovery is actually resolved: an unresolved recovery is not a survival, and an
      // absent action penalty is not a penalty of zero. Characters saved before this block
      // existed read as unresolved, which is what they were.
      recovery: schema({
        resolvedAtWorldTime: unknownNumber(),
        // Earliest active wound's world time at resolution; the healing clock runs from it.
        injuredAtWorldTime: unknownNumber(),
        physicalDamage: unknownNumber({ min: 0 }), damageTotal: unknownNumber({ min: 0 }),
        tableLine: unknownNumber({ min: 0 }),
        care: choice(['unknown', 'none', 'first-aid', 'aid-station', 'field-hospital', 'trauma-center'], 'unknown'),
        techLevel: unknownNumber({ min: 13, max: 18, integer: true }),
        criticalTimePeriod: text(), recoveryRoll: unknownNumber({ min: 0, max: 99, integer: true }),
        roll: unknownNumber({ min: 0, max: 99, integer: true }),
        outcome: choice(['unknown', 'survived', 'died'], 'unknown'),
        healingTimeDays: unknownNumber({ min: 0 }), healingReducedByDays: unknownNumber({ min: 0 }),
        incapacitationTime: text(), incapacitationRoll: unknownNumber({ min: 0, max: 9, integer: true }),
        // §2.10's Combat Action penalty. Kept apart from `condition.actionPenalty`, which is
        // a manual note, so a derived figure is never mistaken for one a GM typed.
        actionPenalty: unknownNumber({ min: 0, integer: true }), penaltyCategory: text(),
        source: text(), notes: text()
      }),
      // §2.9: the best Medical Aid reached so far for wounds not yet resolved. It sets which
      // Critical Time Period is running; recorded by the GM, counted from the wound.
      aid: schema({
        care: choice(['none', 'first-aid', 'aid-station', 'field-hospital', 'trauma-center'], 'none'),
        techLevel: unknownNumber({ min: 13, max: 18, integer: true }),
        recordedAtWorldTime: unknownNumber()
      }),
      adjustments: records(schema({ path: text(), value: unknownNumber(), reason: text(), source: text() }))
    };
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    // Convert only at the Foundry boundary. Rules receive plain snapshots.
    const items = Array.from(this.parent?.items ?? [], item => ({ id: item.id, type: item.type, system: item.system.toObject() }));
    this.summary = {
      ...summarizeInjuries(this.injuries, this.attributes.health),
      inventory: summarizeInventory(items),
      loadoutIssues: inspectLoadout(items)
    };
  }
}
