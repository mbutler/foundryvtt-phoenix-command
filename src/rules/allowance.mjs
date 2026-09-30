// Deriving a character's small-arms action allowance from the printed tables.
// Chain: encumbrance -> Base Speed (1A) -> Maximum Speed (1B); gun skill -> SAL (1C);
// ISF = INT + SAL; (MS, ISF) -> Combat Actions (1D); CA -> per-impulse schedule (1E).
// Sections 1.3 steps 3-8, PDF 10-11 / printed 5-6. See docs/basic-impulse-contract.md.
//
// Malformed input throws. A legal character the printed tables do not cover returns an
// unresolved result naming the reason: the tables are never extrapolated or clamped.
import {
  characterTableSource, encumbranceColumnsLb, baseSpeedTable, baseSpeedColumns,
  maximumSpeedTable, skillAccuracyLevels, isfColumns, combatActionTable
} from '../data/character-tables.mjs';
import { actionSchedule } from './timing.mjs';
import { handToHandTableSource, asfColumns, damageBonusTable } from '../data/hand-to-hand-tables.mjs';

export const allowanceSource = 'Small Arms §1.3 Steps 3-8, PDF 10-11; Tables 1A-1E, PDF 60 · visual check';

const resolved = (value, trace) => ({ resolved: true, value, trace });
const unresolved = (reason, detail) => ({ resolved: false, reason, detail });

// This system keeps "unknown" distinct from zero, so an unset characteristic is an
// unresolved derivation rather than an error. A present but malformed value still throws.
const isUnknown = value => value === null || value === undefined;

function requireInteger(value, label, low, high) {
  if (!Number.isInteger(value)) throw new RangeError(`${label} must be a whole number.`);
  if (value < low || value > high) return false;
  return true;
}

function unknownInput(entries) {
  const missing = entries.filter(([, value]) => isUnknown(value)).map(([label]) => label);
  return missing.length
    ? unresolved('unknown-characteristic', `${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} unknown, so the allowance cannot be derived.`)
    : null;
}

// Table 1A states "Encumbrance should be rounded off to the nearest column".
// An exact midpoint is not covered by that sentence; we take the heavier column,
// which is the slower and more conservative reading, and record it in the trace.
function nearestEncumbranceColumn(encumbranceLb) {
  let index = 0;
  let best = Infinity;
  for (let i = 0; i < encumbranceColumnsLb.length; i += 1) {
    const distance = Math.abs(encumbranceColumnsLb[i] - encumbranceLb);
    if (distance < best - 1e-9) { best = distance; index = i; }
  }
  return index;
}

export function deriveBaseSpeed({ strength, encumbranceLb }) {
  const missing = unknownInput([['Strength', strength], ['Encumbrance', encumbranceLb]]);
  if (missing) return missing;
  if (!Number.isFinite(encumbranceLb) || encumbranceLb < 0) throw new RangeError('Encumbrance must be a nonnegative number of pounds.');
  if (!requireInteger(strength, 'Strength', 1, 21)) {
    return unresolved('strength-out-of-domain', `Table 1A prints STR 1 to 21; got ${strength}.`);
  }
  const last = encumbranceColumnsLb.at(-1);
  if (encumbranceLb > last) {
    return unresolved('encumbrance-out-of-domain', `Table 1A's heaviest printed column is ${last} lb; got ${encumbranceLb}.`);
  }
  const index = nearestEncumbranceColumn(encumbranceLb);
  const column = encumbranceColumnsLb[index];
  const value = baseSpeedTable[strength][index];
  if (value === null) {
    return unresolved('base-speed-blank', `Table 1A prints no Base Speed for STR ${strength} at the ${column} lb column. The blank means the load cannot be carried, not zero speed.`);
  }
  return resolved(value, { table: '1A', strength, encumbranceLb, column, tieRule: 'nearest column; an exact midpoint takes the heavier column' });
}

export function deriveMaximumSpeed({ agility, baseSpeed }) {
  const missing = unknownInput([['Agility', agility], ['Base Speed', baseSpeed]]);
  if (missing) return missing;
  if (!requireInteger(agility, 'Agility', 1, 21)) {
    return unresolved('agility-out-of-domain', `Table 1B prints AGI 1 to 21; got ${agility}.`);
  }
  const index = baseSpeedColumns.indexOf(baseSpeed);
  if (index === -1) {
    return unresolved('base-speed-off-column', `Table 1B prints Base Speed columns ${baseSpeedColumns.join(', ')}; got ${baseSpeed}.`);
  }
  return resolved(maximumSpeedTable[agility][index], { table: '1B', agility, baseSpeed });
}

export function skillAccuracyLevel(gunCombatSkill) {
  const missing = unknownInput([['Gun Combat Skill Level', gunCombatSkill]]);
  if (missing) return missing;
  const skill = gunCombatSkill;
  if (!requireInteger(skill, 'Gun Combat Skill Level', 0, skillAccuracyLevels.length - 1)) {
    return unresolved('skill-out-of-domain', `Table 1C prints skill levels 0 to ${skillAccuracyLevels.length - 1}; got ${skill}.`);
  }
  return resolved(skillAccuracyLevels[skill], { table: '1C', skill });
}

export function intelligenceSkillFactor({ intelligence, skillAccuracyLevel: sal }) {
  const missing = unknownInput([['Intelligence', intelligence]]);
  if (missing) return missing;
  if (!Number.isInteger(intelligence)) throw new RangeError('Intelligence must be a whole number.');
  if (!Number.isInteger(sal)) throw new RangeError('Skill Accuracy Level must be a whole number.');
  return resolved(intelligence + sal, { formula: 'ISF = INT + SAL', intelligence, skillAccuracyLevel: sal });
}

// Table 1D prints odd ISF columns 7 to 39 without a rounding rule.
// User ruling, 23 Sep 2026: use the next lower printed column automatically.
// Keep the applied policy in the calculation trace, not a player-facing prompt.
// LEG10204 Table 2D prints the same Combat Actions against the Agility Skill Factor; the user
// extended the ruling to even ASF values on 26 Sep 2026, so both lookups share this one.
function lookupCombatActions({ maximumSpeed, factor, factorName, table, columns, rounding: policy, maxSpeed = 13 }) {
  if (!requireInteger(maximumSpeed, 'Maximum Speed', 1, maxSpeed)) {
    return unresolved('maximum-speed-out-of-domain', `Table ${table} prints MS 1 to ${maxSpeed}; got ${maximumSpeed}.`);
  }
  if (!Number.isInteger(factor)) throw new RangeError(`${factorName} must be a whole number.`);
  const first = columns[0];
  const last = columns.at(-1);
  const code = factorName.toLowerCase();
  if (factor < first || factor > last) {
    return unresolved(`${code}-out-of-domain`, `Table ${table} prints ${factorName} ${first} to ${last}; got ${factor}.`);
  }
  policy ??= 'lower';
  let index = columns.indexOf(factor);
  let rounding = null;
  if (index === -1) {
    if (policy !== 'lower' && policy !== 'higher') {
      const below = columns.filter(c => c < factor).at(-1);
      const above = columns.find(c => c > factor);
      return unresolved(`${code}-off-column`, `${factorName} ${factor} falls between the printed ${below} and ${above} columns of Table ${table}, which states no rounding rule. Choose a policy deliberately and record the reason.`);
    }
    rounding = policy;
    index = policy === 'lower' ? columns.findLastIndex(c => c < factor) : columns.findIndex(c => c > factor);
  }
  return resolved(combatActionTable[maximumSpeed][index], {
    table, maximumSpeed, [code]: factor, column: columns[index],
    ...(rounding ? { [`${code}Rounding`]: rounding, adjudicated: true } : {})
  });
}

export function deriveCombatActions({ maximumSpeed, isf, isfRounding = null }) {
  return lookupCombatActions({ maximumSpeed, factor: isf, factorName: 'ISF', table: '1D', columns: isfColumns, rounding: isfRounding });
}

// LEG10204 §1.2 Step 5 (PDF 7): Combat Effectiveness from the Hand-to-Hand Combat Skill Level on
// Table 2C, which prints skills 0-16 and equals LEG10200 Table 1C there. User ruling, 26 Sep 2026:
// skills 17-20, which the text allows, continue with Table 1C.
export function combatEffectiveness(handToHandSkill) {
  const missing = unknownInput([['Hand-to-Hand Combat Skill Level', handToHandSkill]]);
  if (missing) return missing;
  if (!requireInteger(handToHandSkill, 'Hand-to-Hand Combat Skill Level', 0, skillAccuracyLevels.length - 1)) {
    return unresolved('skill-out-of-domain', `Skill levels run 0 to ${skillAccuracyLevels.length - 1}; got ${handToHandSkill}.`);
  }
  return resolved(skillAccuracyLevels[handToHandSkill], handToHandSkill > 16
    ? { table: '1C', skill: handToHandSkill, continuation: 'LEG10204 Table 2C prints skills 0-16; LEG10200 Table 1C continues it (user ruling)' }
    : { table: '2C', skill: handToHandSkill });
}

// LEG10204 §1.2 Steps 6-7 (PDF 8): ASF = AGI + CE; Combat Actions and Damage Bonus are read on
// Table 2D against Maximum Speed and ASF; Table 2E (= Table 1E) spreads the actions by impulse.
// Table 2D prints MS 1-11 only, so a faster man has no printed Damage Bonus.
export function deriveHandToHand({ agility, handToHandSkill, maximumSpeed, asfRounding = null }) {
  const steps = {};
  const ce = combatEffectiveness(handToHandSkill);
  if (!ce.resolved) return ce;
  steps.combatEffectiveness = ce;
  const missing = unknownInput([['Agility', agility]]);
  if (missing) return missing;
  if (!requireInteger(agility, 'Agility', 0, 99)) throw new RangeError('Agility must be a whole number.');
  const asf = agility + ce.value;
  steps.agilitySkillFactor = resolved(asf, { formula: 'ASF = AGI + CE', agility, combatEffectiveness: ce.value });
  const combatActions = lookupCombatActions({ maximumSpeed, factor: asf, factorName: 'ASF', table: '2D', columns: asfColumns, rounding: asfRounding, maxSpeed: 11 });
  if (!combatActions.resolved) return combatActions;
  steps.combatActions = combatActions;
  const bonus = damageBonusTable[maximumSpeed][asfColumns.indexOf(combatActions.trace.column)];
  steps.damageBonus = resolved(bonus, { table: '2D', maximumSpeed, asf: combatActions.trace.column });
  return { resolved: true, combatEffectiveness: ce.value, agilitySkillFactor: asf, combatActions: combatActions.value,
    damageBonus: bonus, schedule: [...actionSchedule(combatActions.value)],
    provenance: { source: 'derived', rules: 'LEG10204 §1.2 Steps 5-7, PDF 7-8; Tables 2C-2E, PDF 44', table: handToHandTableSource, steps } };
}

// Knockout Value = .5 x Will x the highest Combat Skill Level, rounded off. LEG10200 §1.3 Step 8
// names the Gun Combat skill; LEG10204 §1.2 Step 8 (PDF 8) the greatest of Gun Combat,
// Hand-to-Hand and Unarmed. User ruling, 26 Sep 2026: the highest known skill applies. A skill
// that is not recorded is left out rather than read as zero; with none recorded, KV is unknown.
export function knockoutValue({ will, gunCombatSkill, handToHandSkill, unarmedSkill }) {
  const missing = unknownInput([['Will', will]]);
  if (missing) return missing;
  if (!Number.isInteger(will) || will < 0) throw new RangeError('Will must be a nonnegative whole number.');
  const skills = [['gun', gunCombatSkill], ['handToHand', handToHandSkill], ['unarmed', unarmedSkill]].filter(([, value]) => !isUnknown(value));
  if (!skills.length) return unknownInput([['Gun Combat Skill Level', gunCombatSkill]]);
  for (const [name, value] of skills) if (!Number.isInteger(value) || value < 0) throw new RangeError(`${name} skill level must be a nonnegative whole number.`);
  const [skillName, highest] = skills.reduce((best, entry) => entry[1] > best[1] ? entry : best);
  return resolved(Math.round(0.5 * will * highest), { formula: 'KV = .5 x WIL x highest Combat Skill Level', will, skill: skillName, skillLevel: highest });
}

// The whole chain. Maximum Speed may be supplied directly, as it is printed on every
// status sheet; otherwise it is derived from strength, agility and encumbrance.
export function deriveAllowance(character) {
  const { strength, agility, intelligence, will, gunCombatSkill, encumbranceLb, isfRounding = null,
    woundPenalty = 0, handToHandSkill, unarmedSkill, mode = 'gun' } = character;
  if (!['gun', 'hand-to-hand'].includes(mode)) throw new RangeError('Combat mode is gun or hand-to-hand.');
  const steps = {};
  if (!Number.isInteger(woundPenalty) || woundPenalty < 0) {
    throw new RangeError('A wound penalty is a whole number of Combat Actions of zero or more.');
  }

  let maximumSpeed = character.maximumSpeed;
  if (maximumSpeed === undefined || maximumSpeed === null) {
    const baseSpeed = deriveBaseSpeed({ strength, encumbranceLb });
    if (!baseSpeed.resolved) return baseSpeed;
    steps.baseSpeed = baseSpeed;
    const ms = deriveMaximumSpeed({ agility, baseSpeed: baseSpeed.value });
    if (!ms.resolved) return ms;
    steps.maximumSpeed = ms;
    maximumSpeed = ms.value;
  } else {
    steps.maximumSpeed = resolved(maximumSpeed, { supplied: true });
  }

  // User ruling, 26 Sep 2026: a combatant fighting hand-to-hand spends LEG10204's Combat Actions
  // (Table 2D against ASF); otherwise LEG10200's (Table 1D against ISF). Either way, one pool.
  let combatActions, damageBonus = null;
  if (mode === 'hand-to-hand') {
    const hand = deriveHandToHand({ agility, handToHandSkill, maximumSpeed });
    if (!hand.resolved) return hand;
    Object.assign(steps, { combatEffectiveness: hand.provenance.steps.combatEffectiveness, agilitySkillFactor: hand.provenance.steps.agilitySkillFactor });
    combatActions = hand.provenance.steps.combatActions;
    damageBonus = hand.damageBonus;
    steps.damageBonus = hand.provenance.steps.damageBonus;
  } else {
    const sal = skillAccuracyLevel(gunCombatSkill);
    if (!sal.resolved) return sal;
    steps.skillAccuracyLevel = sal;
    const isf = intelligenceSkillFactor({ intelligence, skillAccuracyLevel: sal.value });
    if (!isf.resolved) return isf;
    steps.intelligenceSkillFactor = isf;
    combatActions = deriveCombatActions({ maximumSpeed, isf: isf.value, isfRounding });
    if (!combatActions.resolved) return combatActions;
  }
  steps.combatActions = combatActions;

  // Section 2.10, PDF 24: an unhealed injury costs "a penalty of Healing Time / 20 points
  // subtracted from his Combat Actions", and an old one the same from the days remaining.
  // `src/rules/medical.mjs` works out the points; this is where they are actually spent.
  let value = combatActions.value;
  if (woundPenalty > 0) {
    value = combatActions.value - woundPenalty;
    if (value < 1) {
      return unresolved('wound-penalty-exceeds-allowance', `Section 2.10's wound penalty of ${woundPenalty} leaves ${combatActions.value} Combat Actions at ${value}, and Table 1E prints no distribution below 1. What a man with no actions left can do is not printed; rule on it and record an adjudicated allowance.`);
    }
    steps.woundPenalty = resolved(woundPenalty, { section: '2.10', before: combatActions.value, after: value });
  }

  let schedule;
  try {
    schedule = actionSchedule(value);
  } catch {
    return unresolved('allowance-beyond-table-1e', `Combat Actions must be a whole number from 1 to 24; received ${value}.`);
  }

  steps.actionSchedule = { source: value > 21 ? 'approved-library-continuation' : 'table-1e', value: [...schedule] };

  const kv = knockoutValue({ will, gunCombatSkill, handToHandSkill, unarmedSkill });
  if (!kv.resolved) return kv;
  steps.knockoutValue = kv;

  return {
    resolved: true,
    value,
    schedule,
    knockoutValue: kv.value,
    mode,
    ...(mode === 'hand-to-hand' ? { damageBonus } : {}),
    provenance: { source: 'derived', rules: mode === 'hand-to-hand' ? `${allowanceSource}; LEG10204 §1.2 Steps 5-7, Tables 2C-2E, PDF 44` : allowanceSource, table: characterTableSource, steps }
  };
}
