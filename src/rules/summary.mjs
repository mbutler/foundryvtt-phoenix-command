import {armorRegion} from './armor-regions.mjs';
import {ammunitionWeights} from '../data/ammunition-weights.mjs';
import {ammunitionPackageCount} from './ammunition-weight.mjs';
// Pure summaries of saved state. Unknown required data stays unknown.
export function summarizeInjuries(injuries = {}, health = null) {
  const active = Object.values(injuries).filter(i => i.status === 'active');
  let physicalDamage = 0;
  const disabled = new Set();
  for (const injury of active) {
    if (!Number.isFinite(injury.physicalDamage) || injury.physicalDamage < 0) {
      throw new RangeError('Injury damage must be a nonnegative number.');
    }
    physicalDamage += injury.physicalDamage;
    for (const region of injury.disabledRegions ?? []) disabled.add(region);
  }
  return {
    physicalDamage,
    // §2.9, PDF 23: "Damage Total (DT) = PD Total X 10 / Health Characteristic". The
    // quotient is kept as it falls. This used to be rounded to the nearest integer, which
    // was a guess at an unread rule; the book rounds at the table LOOKUP instead, and
    // downwards to a printed line - "A DT of 34 would use the DT 30 line". See
    // `src/rules/medical.mjs`.
    damageTotal: Number.isFinite(health) && health > 0 ? physicalDamage * 10 / health : null,
    disabledRegions: [...disabled].sort()
  };
}

// All ammunition remains in its ammunition Item, including loaded rounds.
// Loading reserves rounds by reference; it does not create a second quantity.
export function summarizeInventory(items = []) {
  let knownWeightLb = 0;
  const missingWeightIds = [];
  for (const item of items) {
    const { carried, weightLb, quantity } = item.system;
    let count=item.type==='ammunition'&&item.system.packageCapacity?ammunitionPackageCount(item.system):quantity;
    // Printed W is loaded weapon weight (LEG10200 PDF 11); its feed device is already included.
    if(item.type==='ammunition'){
      const included=items.filter(w=>w.type==='weapon'&&w.system.carried&&w.system.quantity>0&&w.system.loaded?.ammunitionItemId===item.id&&ammunitionWeights[w.system.catalogId]);
      count=Math.max(0,count-included.reduce((sum,w)=>sum+(item.system.packageCapacity?1:(w.system.loaded.rounds??0)),0));
    }
    if (!carried || count === 0) continue;
    if (!Number.isInteger(quantity) || quantity < 0) throw new RangeError('Invalid item quantity.');
    if (weightLb === null || weightLb === undefined) {
      missingWeightIds.push(item.id);
      continue;
    }
    if (!Number.isFinite(weightLb) || weightLb < 0) throw new RangeError('Invalid item weight.');
    knownWeightLb += weightLb * count;
  }
  return { knownWeightLb, totalWeightLb: missingWeightIds.length ? null : knownWeightLb, missingWeightIds };
}

export function inspectLoadout(items = []) {
  const byId = new Map(items.map(i => [i.id, i]));
  const issues = [];
  const reserved = new Map();
  for (const item of items) {
    const data = item.system;
    const parentId = data.attachedToId;
    if (parentId) {
      const parent = byId.get(parentId);
      if (!parent || parentId === item.id) issues.push({ itemId: item.id, code: 'invalidAttachment' });
      else if (data.carried !== parent.system.carried) issues.push({ itemId: item.id, code: 'attachmentCarriedMismatch' });
      const visited = new Set([item.id]);
      let cursor = parent;
      while (cursor) {
        if (visited.has(cursor.id)) { issues.push({ itemId: item.id, code: 'attachmentCycle' }); break; }
        visited.add(cursor.id);
        cursor = byId.get(cursor.system.attachedToId);
      }
    }
    const loaded = data.loaded;
    if (!loaded || loaded.rounds === 0) continue;
    const ammunition = byId.get(loaded.ammunitionItemId);
    if (!ammunition || ammunition.type !== 'ammunition') {
      issues.push({ itemId: item.id, code: 'missingLoadedAmmunition' });
    } else {
      reserved.set(ammunition.id, (reserved.get(ammunition.id) ?? 0) + loaded.rounds);
      if (!ammunition.system.carried && data.carried) issues.push({ itemId: item.id, code: 'ammunitionNotCarried' });
    }
  }
  for (const [itemId, count] of reserved) {
    if (count > byId.get(itemId).system.quantity) issues.push({ itemId, code: 'ammunitionOverReserved' });
  }
  return issues;
}

// Overlapping coverage needs a rule or explicit choice; never sum protections.
export function armorCandidates(items, region, side) {
  return items.filter(i => i.type === 'armor' && i.system.carried && i.system.equipped)
    .flatMap(item => Object.entries(item.system.coverage ?? {})
      .filter(([, coverage]) => armorRegion(coverage.region) === armorRegion(region) && (coverage.side === 'both' || coverage.side === side))
      .map(([coverageId, coverage]) => ({ itemId: item.id, coverageId, ...coverage })));
}
