import {hexRange} from './hex-scene.mjs';
// Foundry boundary helpers; injectable documents keep this independently testable.
export function snapshotActor(actor, { token = null } = {}) {
  return {
    id: token?.document.uuid ?? actor.uuid,
    actorUuid: actor.uuid, tokenUuid: token?.document.uuid ?? null,
    name: token?.name ?? actor.name,
    system: actor.system.toObject(),
    items: Array.from(actor.items, item => ({ id: item.id, name: item.name, type: item.type, system: item.system.toObject() }))
  };
}

export function buildRoster(actors, tokens, user) {
  const observable = actor => actor?.type === 'character' && actor.testUserPermission(user, 'OBSERVER');
  return [
    ...Array.from(tokens).filter(token => token.visible && observable(token.actor)).map(token => snapshotActor(token.actor, { token })),
    ...Array.from(actors).filter(observable).map(actor => snapshotActor(actor))
  ];
}

export function selectedAttackContext({ controlled, targets, scene, user, measurePath, geometryOnly=false }) {
  if (controlled.length !== 1 || targets.length !== 1) throw new Error('Control one attacker token and target one defender.');
  const [attacker] = controlled, [target] = targets;
  if (!attacker.actor?.testUserPermission(user, 'OWNER')) throw new Error('You must own the attacker.');
  if (!target.visible || (!geometryOnly&&!target.actor?.testUserPermission(user, 'OBSERVER'))) throw new Error('Target details require Observer permission. Ask the GM to resolve a hidden defender.');
  if (attacker.document.uuid === target.document.uuid) throw new Error('Choose a different target token.');
  if (attacker.actor.type !== 'character' || target.actor.type !== 'character') throw new Error('Choose Phoenix Command character tokens.');
  if (attacker.document.elevation !== target.document.elevation) throw new Error('Different elevations need a manually adjudicated range; open the ordinary calculator.');
  if (![attacker.center.x, attacker.center.y, target.center.x, target.center.y].every(Number.isFinite)) throw new Error('Token positions are unavailable.');
  const measured=hexRange(scene,[attacker.center,target.center],measurePath);
  return {
    attacker: attacker.document.uuid, target: target.document.uuid, ...measured,
    measurement: `${measured.hexes} hexes at ${measured.geometry.feetPerHex} feet per hex, equal elevation. Cover and visibility require adjudication.`
  };
}

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

// The resolved-attack card. It opens with what happened in plain sentences, so the chat log
// reads as a record of the fight, and keeps the full calculation in a compact list below.
const traceValue = (trace, label) => trace?.find(entry => entry.label === label)?.value;
const keyRows = new Set(['EAL', 'Hit threshold (inclusive, d00–99)', 'Effective PEN', 'Physical damage']);
const rollNames = { hit: 'hit', location: 'location', armor: 'armor', damage: 'damage' };
// When it happened, for the card's top line: the encounter's phase and impulse.
const when = timing => timing?.phase ? ` · Phase ${timing.phase} · Impulse ${timing.impulse}` : '';
export function traceHTML(result) {
  const e = escapeHTML;
  const rolls = Object.entries(result.rolls ?? {}).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object');
  return `<details class="pc-trace"><summary>How it was calculated</summary>
    ${rolls.length ? `<p class="pc-trace-rolls">Rolls · ${rolls.map(([k, v]) => `${e(rollNames[k] ?? k)} ${e(v)}`).join(' · ')}</p>` : ''}
    <dl class="pc-trace-list">${(result.trace ?? []).map(entry => `<div${keyRows.has(entry.label) ? ' data-key' : ''}><dt>${e(entry.label)}</dt><dd>${e(entry.value)}</dd></div>`).join('')}</dl>
    ${result.source ? `<p class="pc-trace-source">${e(result.source)}</p>` : ''}</details>`;
}
export function shotSummary(result, context) {
  const input = context.input ?? {}, trace = result.trace ?? [];
  const aim = Number(input.aimActions);
  const ammo = input.ammunitionKey ? String(input.ammunitionKey).toUpperCase() : null;
  const detail = [ammo, aim > 0 ? `${aim} aim action${aim === 1 ? '' : 's'}` : null].filter(Boolean).join(', ');
  const lines = [`${context.attacker.name} shot at ${context.target.name} with the ${input.weapon?.name ?? 'weapon'}${detail ? ` (${detail})` : ''}${input.distance ? `, ${input.distance.value} ${input.distance.unit}` : ''}.`];
  const ducked = [input.reactions?.shooterDucking ? `${context.attacker.name} ducked (−10)` : null, input.reactions?.targetDucking ? `${context.target.name} ducked (−5)` : null].filter(Boolean);
  if (ducked.length) lines.push(`${ducked.join('; ')}.`);
  const roll = Number(result.rolls?.hit);
  if (Number.isFinite(roll) && Number.isFinite(Number(result.threshold)))
    lines.push(`Needed ${Number(result.threshold) < 0 ? 'the impossible' : `00–${String(result.threshold).padStart(2, '0')}`} (EAL ${result.eal}); rolled ${String(roll).padStart(2, '0')}: ${result.hit ? 'hit' : 'miss'}.`);
  if (result.hit) {
    const pf = Number(traceValue(trace, 'Armor PF') ?? 0), epf = traceValue(trace, 'EPF'), epen = Number(traceValue(trace, 'Effective PEN'));
    const pen = result.band?.penetration;
    const armor = pf > 0 ? `armor PF ${pf} (EPF ${epf})` : 'no armor there';
    lines.push(Number.isFinite(epen) && epen <= 0
      ? `Struck the ${result.location}; ${armor} stopped PEN ${pen}. No damage.`
      : `Struck the ${result.location}: PEN ${pen}, ${armor}, ${result.physicalDamage} PD${result.disabled ? ', a disabling injury' : ''}.`);
  }
  return lines;
}

export function resultChatData(result, context) {
  const e = escapeHTML;
  const targetName=target=>target.name??context.targets?.find(actor=>[actor.id,actor.tokenUuid,actor.actorUuid].includes(target.id))?.name??'Target';
  const identity = actor => ({ id: actor.id, name: actor.name, actorUuid: actor.actorUuid, tokenUuid: actor.tokenUuid });
  if (result.kind === 'burst' || result.kind === 'grenade-burst' || result.kind === 'three-round-burst' || result.kind === 'shotgun' || result.kind === 'automatic-shotgun' || result.kind === 'grenade' || result.kind === 'launcher' || result.kind === 'detonation') {
    const lines = result.scheduled
      ? [`Fuse ${result.fusePhases} phase${result.fusePhases === 1 ? '' : 's'} · detonation scheduled for phase ${result.duePhase}`]
      : result.targets.map(target => result.kind === 'grenade' || result.kind === 'launcher' || result.kind === 'detonation' || result.kind === 'grenade-burst'
      ? `${targetName(target)}: ${target.shrapnel} shrapnel, ${target.concussion} concussion, ${target.physicalDamage} PD`
      : `${targetName(target)}: ${target.hit ? `${target.pellets ?? target.rounds} hit, ${target.physicalDamage} PD` : 'missed'}`);
    // §5.10: say whether the burst was on the hexes, and that an empty arc had nobody to attack.
    if (context.input?.coverFire && !result.scheduled) {
      lines.unshift(result.onTarget ? `On the covered hexes (${context.input.arcHexes} wide).` : 'Too high or low: the burst missed the covered hexes.');
      if (!result.targets.length) lines.push('No one was exposed there.');
    }
    // A burst of grenades: where its rounds went before who they reached.
    if (result.kind === 'grenade-burst') {
      lines.unshift(result.onTarget ? `On the arc: ${result.roundsFired} round${result.roundsFired === 1 ? '' : 's'} across ${context.input?.arcHexes} hex${context.input?.arcHexes === 1 ? '' : 'es'}.`
        : `Off the arc by ${result.scatter?.hexes} hex${result.scatter?.hexes === 1 ? '' : 'es'}.`);
      if (!result.targets.length) lines.push('No one was in reach of the blasts.');
    }
    const heading = context.input?.coverFire ? 'cover fire' : result.kind === 'grenade-burst' ? 'grenade burst' : result.kind === 'three-round-burst' ? 'three-round burst' : result.kind === 'grenade' || result.kind === 'detonation' ? 'grenade' : result.kind === 'launcher' ? 'launcher' : result.kind === 'shotgun' ? 'shotgun' : result.kind === 'automatic-shotgun' ? 'automatic shotgun' : 'automatic burst';
    const snapshot = { ...context, attacker: identity(context.attacker), targets: (context.targets ?? []).map(identity) };
    const rollChip = result.kind === 'grenade-burst' && Number.isFinite(Number(result.rolls?.elevation)) ? `<span class="pc-chip">ROLL ${e(result.rolls.elevation)}</span>` : Number.isFinite(Number(result.rolls?.hit)) ? `<span class="pc-chip">ROLL ${e(result.rolls.hit)}</span>` : (result.rolls ? '<span class="pc-chip" data-state="ready">DICE SAVED</span>' : '');
    return {
      content: `<section class="phoenix-command"><p class="pc-record-kicker">${e(heading[0].toUpperCase()+heading.slice(1))}${e(when(context.timing))}</p><h2>${e(context.attacker.name)}${context.input?.weapon?.name ? ` · ${e(context.input.weapon.name)}` : ''}</h2><div class="pc-result-summary">${lines.map(line => `<p>${e(line)}</p>`).join('')}</div><div class="pc-telemetry"><span class="pc-chip">${e(result.roundsFired)} RD</span>${rollChip}${result.arcHexes != null ? `<span class="pc-chip">ARC ${e(result.arcHexes)}</span>` : ''}${context.applicationId ? '<span class="pc-chip" data-tone="warn">APPLY PENDING</span>' : '<span class="pc-chip">NOT APPLIED</span>'}</div>${traceHTML(result)}</section>`,
      flags: { 'phoenix-command': { resolution: { schemaVersion: 1, systemVersion: context.systemVersion, result: structuredClone(result), context: structuredClone(snapshot) } } }
    };
  }
  const snapshot = { ...context, attacker: identity(context.attacker), target: identity(context.target) };
  return {
    content: `<section class="phoenix-command"><p class="pc-record-kicker">Shot${e(when(context.timing))}</p><h2>${result.hit?`Hit · ${e(result.location)} · ${e(result.physicalDamage)} PD`:'Miss'}</h2><div class="pc-result-summary">${shotSummary(result,context).map(line=>`<p>${e(line)}</p>`).join('')}</div><div class="pc-telemetry">${Number.isFinite(Number(result.rolls?.hit))?`<span class="pc-chip">ROLL ${e(result.rolls.hit)}</span>`:''}<span class="pc-chip">${e(context.input.distance.value)} ${e(context.input.distance.unit)}</span><span class="pc-chip">${e(context.input.weapon.name)}</span>${context.applicationId?'<span class="pc-chip" data-tone="warn">APPLY PENDING</span>':'<span class="pc-chip">NOT APPLIED</span>'}</div>${context.applicationId?'':'<p class="pc-sheet-muted">Resolved; injuries and resources have not been applied.</p>'}${traceHTML(result)}</section>`,
    flags: { 'phoenix-command': { resolution: { schemaVersion: 1, systemVersion: context.systemVersion, result: structuredClone(result), context: structuredClone(snapshot) } } }
  };
}
