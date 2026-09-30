// Fighting with a weapon in each hand, LEG10204 §3.1, PDF 19 / printed 15.
//
// "In essence, the weapon in the Off-Hand takes the place of a Shield and is normally used as
// the primary Parrying device. When fighting with two weapons, either weapon may be used to
// Parry normally as discussed in detail in Section 3.2. The weapon in the Off-Hand, however,
// is limited for attack purposes unless the combatant has high Agility or has sufficient skill
// to make him ambidextrous."
//
// The limits are printed against the Agility Skill Factor (D64):
//
//   less than 20   Short Stroke Stabs Only
//   20 - 23        Short and Normal Stroke Stabs Only
//   24 - 25        Stabs and Short Stroke Slashes Only
//   26 - 27        Stabs and Short and Normal Stroke Slashes Only
//   28 +           No Limitations
//
// Read carefully, "Stabs and Short Stroke Slashes Only" allows EVERY stab - short, normal and
// long - and short slashes; the stab restriction has lifted by then. Only the first two bands
// limit how long a stab may be set for.
//
// THE AGILITY SKILL FACTOR IS STATED, NOT DERIVED. §1.2 Step 6 of the melee book makes it the
// Agility Characteristic plus Combat Effectiveness, and neither that chain nor Table 2D is
// implemented here - the system derives LEG10200's §1.3 instead. So it is asked for, like the
// damage bonus and for the same reason.
//
// The page says the limits apply to "offensive blows (and Offensive Weapon Parries) with the
// Off-Hand". Offensive Weapon Parries are a separate rule this system does not implement, so
// only the blows are checked.

export const offHandSource = 'LEG10204 §3.1 Off-Hand Attack Limitations, PDF 19';

// [low, high, longest stab, longest slash] as set counts; null means the motion is barred.
const bands = Object.freeze([
  [-Infinity, 19, 0, null],
  [20, 23, 1, null],
  [24, 25, 2, 0],
  [26, 27, 2, 1],
  [28, Infinity, 2, 2]
].map(row => Object.freeze(row)));

export function offHandLimit(agilitySkillFactor) {
  if (!Number.isSafeInteger(agilitySkillFactor) || agilitySkillFactor < 0) {
    throw new Error('The Agility Skill Factor is a whole number. §1.2 Step 6 makes it Agility plus Combat Effectiveness, and this system does not derive it, so state it.');
  }
  const [, , stab, slash] = bands.find(([low, high]) => agilitySkillFactor >= low && agilitySkillFactor <= high);
  return { agilitySkillFactor, longestStabSets: stab, longestSlashSets: slash };
}

const strokeName = sets => ['short', 'normal', 'long'][sets];

// A blow thrown with the off-hand weapon. `motion` is the attack's own, 'thrust' for a stab
// and 'slash' for a cut; `sets` is how many sets it is thrown after, which is what makes it
// short, normal or long.
export function assertOffHandBlow({ agilitySkillFactor, motion, sets } = {}) {
  if (motion !== 'thrust' && motion !== 'slash') throw new Error('An off-hand blow is a stab or a slash.');
  if (!Number.isSafeInteger(sets) || sets < 0 || sets > 2) throw new Error('A blow is thrown after no set, one set or two.');
  const limit = offHandLimit(agilitySkillFactor);
  const longest = motion === 'thrust' ? limit.longestStabSets : limit.longestSlashSets;
  if (longest === null) {
    throw new Error(`An Agility Skill Factor of ${agilitySkillFactor} allows no slashes with the off-hand weapon, only stabs.`);
  }
  if (sets > longest) {
    throw new Error(`An Agility Skill Factor of ${agilitySkillFactor} allows ${strokeName(longest)}-stroke ${motion === 'thrust' ? 'stabs' : 'slashes'} at most with the off-hand weapon, and this is a ${strokeName(sets)} stroke.`);
  }
  return { ...limit, motion, sets, stroke: strokeName(sets) };
}
