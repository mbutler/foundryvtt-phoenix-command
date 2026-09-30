// §3.4 Arc of Fire, LEG10200 PDF 30–31 / printed 25–26.
//
// The shooter designates where the burst starts and the hexes he sweeps it across. The
// width of that sweep is what Table 5A is entered with. Figure 3 then gives the sweep a
// depth: on level ground it runs up to 100 two-yard hexes toward the shooter, stopping at
// him rather than continuing past, and 100 two-yard hexes beyond the swept hexes. Everyone
// in that volume is an eligible target.
//
// An arc narrower than one hex is a track inside a single hex — the page prints Minimum
// Arcs of .4 and Trent's second burst is fired into one hex at .4. A hex grid cannot name
// part of a cell, so the fraction is the Table 5A width and the cell is the coverage.
import { printedArcs } from './automatic-fire.mjs';
import { asCube, cubeDistance, extendRay, hexLine, sameHex } from './hex-cube.mjs';

export const arcGeometrySource = 'LEG10200 §3.4 PDF 30–31 / printed 25–26; Figure 3 depth of 100 two-yard hexes';
export const ARC_DEPTH_TWO_YARD_HEXES = 100;

export function depthInGridHexes(feetPerHex) {
  if (feetPerHex !== 6 && feetPerHex !== 2) throw new Error('Arc depth is measured on a 6-foot small-arms map or a 2-foot melee map.');
  // 100 two-yard hexes is 600 feet, however wide the scene's own hexes are.
  return ARC_DEPTH_TWO_YARD_HEXES * 6 / feetPerHex;
}

function contiguous(swept) {
  for (let i = 1; i < swept.length; i++) {
    if (cubeDistance(swept[i - 1], swept[i]) !== 1) return false;
  }
  return true;
}

// The sweep the shooter named, checked against Table 5A's printed widths. This does not
// know the weapon's Minimum Arc — that depends on range and is checked with the weapon.
export function designateArc({ shooter, swept, arcHexes, feetPerHex = 6 }) {
  const origin = asCube(shooter);
  if (!Array.isArray(swept) || !swept.length) throw new Error('Designate the hexes the burst is swept across, in order.');
  const hexes = swept.map(asCube);
  if (new Set(hexes.map(h => `${h.q},${h.r},${h.s}`)).size !== hexes.length) throw new Error('A sweep names each hex once.');
  if (hexes.some(h => sameHex(h, origin))) throw new Error('The arc is tracked across the target, not across the shooter.');
  if (!contiguous(hexes)) throw new Error('The burst is swept across adjacent hexes. A gap is a second burst.');
  const ranges = hexes.map(h => cubeDistance(origin, h));
  if (ranges.some(r => r !== ranges[0])) throw new Error('§3.4 gives a burst one elevation, which is built from one range. These hexes are not the same distance from the shooter; sweep a line at one range.');
  if (!printedArcs.includes(arcHexes)) throw new Error(`Arc of Fire ${arcHexes} is not a printed Table 5A row. Printed arcs: ${printedArcs.join(', ')}.`);
  if (arcHexes < 1) {
    if (hexes.length !== 1) throw new Error('An arc narrower than one hex is tracked inside a single hex.');
  } else if (hexes.length !== arcHexes) {
    throw new Error(`An arc ${arcHexes} hexes wide is ${arcHexes} hexes on the map; ${hexes.length} were designated.`);
  }
  const depth = depthInGridHexes(feetPerHex);
  return {
    shooter: origin, swept: hexes, arcHexes, feetPerHex, rangeHexes: ranges[0],
    depthGridHexes: depth,
    nearHexes: Math.max(1, ranges[0] - depth),
    farHexes: ranges[0] + depth,
    source: arcGeometrySource
  };
}

// The column through one swept hex: from the shooter, out to 100 two-yard hexes past it.
// Joining the two legs keeps the swept hex itself on the line even when the bearing is not
// one of the six straight axes and rounding would otherwise step off it.
function column(shooter, hex, depth) {
  const end = extendRay(shooter, hex, depth);
  const outward = hexLine(hex, end);
  return [...hexLine(shooter, hex), ...outward.slice(1)];
}

// Who stands in the volume. `tokens` are `{id, hex}`. A man in the depth but not at the
// swept range is reported and not treated as this burst's elevation target — one elevation
// cannot be built from two ranges, which is the open question on mixed-range arcs.
export function personnelInArc({ shooter, swept, arcHexes, feetPerHex = 6, tokens = [] }) {
  const arc = designateArc({ shooter, swept, arcHexes, feetPerHex });
  const columns = arc.swept.map(hex => column(arc.shooter, hex, arc.depthGridHexes));
  const inside = [];
  for (const token of tokens) {
    const hex = asCube(token.hex);
    if (sameHex(hex, arc.shooter)) continue;
    const rangeHexes = cubeDistance(arc.shooter, hex);
    const along = columns.findIndex(line => line.some(step => sameHex(step, hex)));
    if (along < 0 || rangeHexes < arc.nearHexes || rangeHexes > arc.farHexes) continue;
    inside.push({ id: token.id, hex, rangeHexes, column: along, atSweptRange: rangeHexes === arc.rangeHexes });
  }
  return { ...arc, inside,
    atRange: inside.filter(man => man.atSweptRange),
    inDepth: inside.filter(man => !man.atSweptRange) };
}

// Men this burst can actually resolve: same range, same height, same speed, same cover,
// same duck. §3.4's one elevation is why. Anyone who differs is named rather than folded in.
export function sharedArcTargets(targets) {
  if (!Array.isArray(targets) || !targets.length) throw new Error('Nobody at the swept hexes’ range stands in the arc, so the burst has no elevation target.');
  const first = targets[0];
  const fields = ['targetSize', 'targetSpeed', 'coverKey', 'ducking'];
  for (const target of targets.slice(1)) {
    for (const field of fields) {
      if (JSON.stringify(target[field] ?? null) !== JSON.stringify(first[field] ?? null)) {
        throw new Error(`§3.4 gives a burst one elevation. ${target.name ?? target.id} and ${first.name ?? first.id} do not share ${field}; sweep them as separate bursts.`);
      }
    }
  }
  return {
    targetSize: first.targetSize, targetSpeed: first.targetSpeed, cover: first.cover,
    ducking: first.ducking ?? false, autoWidth: first.autoWidth ?? null,
    ids: targets.map(target => target.id)
  };
}
