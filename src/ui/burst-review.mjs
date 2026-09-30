import { automaticBallisticProtection } from '../rules/automatic-protection.mjs';
import {movedThisPhase} from '../rules/timing.mjs';
import {preparationDefaults} from '../rules/shot-situation.mjs';
// What the GM still has to say about a burst, and the protection on each round that hit.
// Posture, range, the arc and who stands in it are read. Cover, visibility, stance and
// whether §3.7's optional width shift is in use are asked, once, for the whole arc.
import { firearmOptions } from '../rules/attacks.mjs';
import { coverProtectionFactor } from '../data/cover.mjs';
import { coverMenu, coverFromKey } from './cover-menu.mjs';
import { arcOccupants } from '../foundry/burst-scene.mjs';
import { sceneCover } from '../foundry/cover-scene.mjs';
import { escapeHTML as e } from '../foundry/context.mjs';

function readCover(form) {
  const key = form.querySelector('[name=cover]').value;
  const stance = form.querySelector('[name=coverStance]').value;
  if (key === 'scene') return undefined;
  if (key !== 'adjudicated') return coverFromKey(key, stance);
  const pf = Number(form.querySelector('[name=coverPF]').value);
  const reason = form.querySelector('[name=coverReason]').value;
  return { ...coverProtectionFactor({ adjudicated: pf, reason }), stance };
}

export async function reviewBurst(combat, combatantId) {
  const shot = combat.getFlag('phoenix-command', `shots.${combat.timing.entries[combatantId]?.activity?.shotId}`);
  if (!shot || shot.status !== 'ready' || shot.plan.kind !== 'burst') throw new Error('Complete a paid burst before reviewing it.');
  if (!shot.arc) throw new Error('Designate the arc before reviewing this burst.');
  const { atRange } = arcOccupants(combat, combatantId, shot.arc);
  if (!atRange.length) throw new Error('Nobody at the swept hexes’ range stands in the arc, so the burst has no elevation target.');
  const moving=movedThisPhase(combat.timing,combatantId);
  const previous={...preparationDefaults(combat.combatants.get(combatantId)?.actor?.system.condition,moving),
    ...shot.adjudication?.choices,...(moving?{firingStance:false,braced:false}:{})};
  const names = atRange.map(man => man.name).join(', ');
  const shooter = combat.combatants.get(combatantId)?.token;
  const from = shooter?.getCenterPoint({ x: shooter.x, y: shooter.y });
  const readings = from ? atRange.map(man => sceneCover(combat.scene, from,
    man.token.getCenterPoint({ x: man.token.x, y: man.token.y }))) : [];
  const mapReady = readings.length === atRange.length && readings.every(reading => reading.mapped && !reading.ambiguous);
  const selectedCover = previous.coverKey ?? (mapReady ? 'scene' : '');
  const coverReadings = readings.map((reading, index) => ({
    targetId: atRange[index].id, name: atRange[index].name,
    mapped: !!reading.mapped, ambiguous: !!reading.ambiguous,
    detail: reading.detail ?? '', label: reading.cover?.label ?? null, pf: reading.cover?.pf ?? null
  }));
  const unresolved = coverReadings.filter(reading => reading.ambiguous || !reading.mapped);
  return foundry.applications.api.DialogV2.prompt({
    window: { title: 'Review burst' }, position: { width: 560 },
    content: `<div class="pc-dialog"><p class="pc-record-kicker">TACTICAL REVIEW · BURST</p><div class="pc-telemetry"><span class="pc-chip" data-state="ready">${e(String(shot.arc.arcHexes))} ARC</span><span class="pc-chip">${e(String(shot.arc.rangeHexes))} HEX RANGE</span><span class="pc-chip" data-tone="${mapReady?'good':'warn'}">${mapReady?'COVER MAPPED':'COVER REVIEW'}</span></div>
      <p>${e(names)}</p><p class="pc-help">One elevation is shared across the arc. Incompatible speed, size, or cover is refused at roll time.</p>
      ${unresolved.length ? `<p class="pc-help">${unresolved.map(reading => `${e(reading.name)}: ${e(reading.detail || 'Map has no cover reading.')}`).join(' ')}</p>` : ''}
      <label>Cover for the arc <select name="cover" required><option value="">Choose…</option><option value="scene" ${selectedCover==='scene'?'selected':''}>Use mapped cover per target</option><option value="open" ${selectedCover==='open'?'selected':''}>Open</option>${coverMenu.map(([k, v]) => `<option value="${e(k)}" ${selectedCover===k?'selected':''}>${e(v)}</option>`).join('')}<option value="adjudicated" ${selectedCover==='adjudicated'?'selected':''}>GM adjudication</option></select></label>
      <label>Behind that cover they are<select name="coverStance"><option value="firing-over">Firing over or around it</option><option value="looking-over">Looking over or around it</option></select></label>
      <details><summary>Adjudicated cover</summary><label>Protection Factor<input name="coverPF" type="number" min="0" step="any"></label><label>What it is<input name="coverReason" value="${e(previous.cover?.label ?? '')}"></label></details>
      <label>Firing stance<select name="stance"><option value="hip">Unprepared: hip fire (−6)</option><option value="prepared">GM confirms prepared stance</option></select></label>
      <label><input name="braced" type="checkbox" ${previous.braced ? 'checked' : ''}> GM confirms braced</label>
      <label>Visibility<select name="visibility">${firearmOptions.visibility.map(v => `<option ${v === (previous.visibility?.[0] ?? 'Good Visibility') ? 'selected' : ''}>${e(v)}</option>`).join('')}</select></label>
      <label class="pc-custom-toggle"><input name="width" type="checkbox" ${previous.applyTargetWidth ? 'checked' : ''}> Apply target width</label>
      <details><summary>Target width</summary><p class="pc-help">Off uses Table 5A’s base values, matching §3.4’s worked example.</p></details>
      <label><input name="grouping" type="checkbox" ${previous.pelletGrouping === 'random' ? 'checked' : ''}> Randomize later shotgun pellets inside hit spacing</label></div>`,
    ok: { label: 'Save review', callback: (_event, _button, dialog) => {
      const form = dialog.element;
      const read = name => form.querySelector(`[name=${name}]`).value;
      const stated = readCover(form);
      return {
        cover: stated, coverKey: read('cover'), coverStance: read('coverStance'),
        ...(stated !== undefined && read('cover') !== 'scene' ? { coverOverride: true } : {}),
        coverProvenance: {
          basis: read('cover') === 'scene' && mapReady ? 'read-from-scene' : read('cover') === 'scene' ? 'scene-requested' : mapReady ? 'gm-override' : 'stated',
          readings: coverReadings.map(({ targetId, mapped, ambiguous, detail, label, pf }) => ({ targetId, mapped, ambiguous, detail, label, pf }))
        },
        firingStance: read('stance') === 'prepared',
        braced: form.querySelector('[name=braced]').checked,
        visibility: [read('visibility')],
        applyTargetWidth: form.querySelector('[name=width]').checked,
        pelletGrouping: form.querySelector('[name=grouping]').checked ? 'random' : false
      };
    } },
    rejectClose: false
  });
}

export function armorOptions(actor) {
  const options = [{ pf: 0, label: 'Confirmed unarmored' }];
  for (const item of actor.items) {
    if (item.type !== 'armor' || !item.system.carried || !item.system.equipped) continue;
    for (const coverage of Object.values(item.system.coverage ?? {})) {
      if (!Number.isFinite(coverage.ballisticPF)) continue;
      options.push({ pf: coverage.ballisticPF, label: `${item.name} · ${coverage.side} ${coverage.region} · PF ${coverage.ballisticPF}` });
    }
  }
  return options;
}

// `rounds` is one entry per round that hit: who, where, and the protections he is wearing.
// Cancelling leaves the dice saved and rolls nothing again.
//
// A round whose protection the armor coverage settles (automatic-protection.mjs: one piece at
// that location, or none, the same on either side) is settled without asking; the dialog shows
// only the rounds it cannot settle. A caller that passes no `actor` is always asked.
export async function confirmImpactArmor(allRounds) {
  if (!allRounds.length) return [];
  const settled = allRounds.map(round => {
    if (!round.actor || !round.location) return null;
    const items = Array.from(round.actor.items ?? [], item => ({ id: item.id, type: item.type, system: item.system?.toObject?.() ?? item.system }));
    const reading = automaticBallisticProtection(items, round.location);
    return reading.resolved ? reading.ballisticPF : null;
  });
  const asked = allRounds.map((round, index) => ({ round, index })).filter(({ index }) => settled[index] === null);
  if (!asked.length) return settled;
  const rounds = asked.map(({ round }) => round);
  const fields = rounds.map((round, index) => `<label>${e(round.targetName)} · ${e(round.location)}<select name="armor${index}">${
    round.options.map((option, optionIndex) => `<option value="${optionIndex}">${e(option.label)}</option>`).join('')
  }</select></label>`).join('');
  const answer = await foundry.applications.api.DialogV2.prompt({
    window: { title: 'Protection on each round' }, position: { width: 520 },
    content: `<div class="pc-dialog"><p class="pc-record-kicker">IMPACT PROTECTION</p><p class="pc-help">Choose protection at each hit location; overlapping armor is not added.</p>${fields}</div>`,
    ok: { label: 'Confirm', callback: (_event, _button, dialog) => rounds.map((round, index) => round.options[Number(dialog.element.querySelector(`[name=armor${index}]`).value)].pf) },
    rejectClose: false
  });
  if (!answer) return null;
  const result = [...settled];
  asked.forEach(({ index }, n) => { result[index] = answer[n]; });
  return result;
}
