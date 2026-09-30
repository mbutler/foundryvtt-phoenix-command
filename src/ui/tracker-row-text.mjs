// The words on a combatant's tracker row. Players read plain game facts; where a value came
// from (book, table, page, derivation) is kept for the GM in a separate Sources section.
// Internal state names never reach the row.

const shotChips=Object.freeze({ready:['ATTACK QUEUED','warn'],rolled:['DICE ROLLED','warn'],applied:['RESOLVED','good'],
  abandoned:['ABANDONED',null],undone:['UNDONE',null]});
export function shotChip(status){const [label,tone]=shotChips[status]??['ATTACK',null];return {label,tone};}
// A finished order stays on the combatant until he is given another, but the row shows it only
// while it matters: unfinished, finished in this impulse, or with its attack still waiting
// to be resolved. After that it is history, not what he is doing now.
export function currentOrder(state,id,shot=null){
  const entry=state.entries?.[id],a=entry?.activity;
  if(!a)return null;
  if(a.progress<a.cost||['ready','rolled'].includes(shot?.status))return a;
  return entry.history?.some(h=>h.activityId===a.id&&h.phase===state.phase&&h.impulse===state.impulse)?a:null;
}

const sightWords=Object.freeze({visible:'in sight',appearing:'coming into view',departing:'leaving sight',concealed:'out of sight'});
export const sightlineWords=status=>sightWords[status]??'sightline recorded';
export function sightlineChip(status){
  return {label:sightlineWords(status).toUpperCase(),tone:status==='departing'?'danger':status==='concealed'?'warn':'good'};
}

// `c` holds plain values read from the encounter; nothing here reads Foundry.
export function rowNotes(c){
  const notes=[],sources=[];
  notes.push(`${c.spent??0} action${c.spent===1?'':'s'} spent this impulse.`);
  if(c.partHex)notes.push(`Entering ${c.partHex.label} · ${c.partHex.progress}/${c.partHex.cost}. The token moves once it is paid for.`);
  if(Number.isFinite(c.movedHexes))notes.push(`Moved ${c.movedHexes} hex${c.movedHexes===1?'':'es'} this phase.`);
  if(c.reactionPending&&c.unfinished)notes.push(c.aimAtRisk?'Ducking gives up this unfinished aim.':'Ducking pauses this order until the GM rules on it.');
  if(c.sightline){
    const {targetName,status,interval}=c.sightline;
    notes.push(`${targetName} is ${sightlineWords(status)}.${interval?` In the open since Phase ${interval.from.phase} Impulse ${interval.from.impulse}.`:''}${status==='departing'?' Fire this impulse or lose the aim.':''}`);
  }
  if(c.ducking)notes.push('Ducking: −5 to be hit, −10 to his own fire.');
  if(c.duckedViewers)sources.push(c.duckedViewers.length?`Ducked behind cover. Still recorded as seeing him: ${c.duckedViewers.join(', ')}. Mark a departure (Sightline) for those the cover now hides him from.`:'Ducked behind cover. No observer has a recorded sightline to him.');
  if(c.reactionPending)notes.push('Hold or duck before the dice are rolled.');
  if(c.interrupted)notes.push('Interrupted: paused until the GM rules on the work already done.');
  const mode=m=>m==='hand-to-hand'?'hand-to-hand':'gun combat';
  if(c.allowance){
    notes.push(`${c.allowance} Combat Actions a phase (${c.schedule.join(' / ')}), ${mode(c.combatMode)}.`);
    sources.push(`${c.allowanceSource==='derived'?'Derived':'GM-set'} allowance.${c.reason?` ${c.reason}`:''}`);
  }else notes.push('Combat Actions are not available yet.');
  if(c.pendingCombatMode)notes.push(`Uses ${mode(c.pendingCombatMode)} Combat Actions from the next phase.`);
  if(c.timingSource)sources.push(c.timingSource);
  if(c.catalogSource)sources.push(`${c.catalogSource.book} · Table ${c.catalogSource.table} · PDF ${c.catalogSource.pdfPage}`);
  return {notes,sources};
}

// Movement and superseded work read nothing like an activity's action count, so each
// history kind says what actually happened to it.
export function historyDetail(record){
  switch(record.kind){
    case 'complete':return 'finished';
    case 'cancel':return 'cancelled; work done so far lost';
    case 'move':return `${record.after} / ${record.cost} actions · ${record.status==='entered'?'hex entered':'still entering'}`;
    case 'abandonMove':return `part-entered hex abandoned; ${record.progress} actions lost`;
    case 'supersededPosture':return `replaced by a movement stance; ${record.progress} actions lost`;
    case 'meleeDefence':return 'defence declared';
    case 'followUpDropped':return `not started · ${record.reason}`;
    case 'fireNow':return 'fired with the aim paid so far';
    case 'duck':return record.detail?`ducked · ${record.detail}`:'ducked';
    case 'reconcileInterruption':return `GM ruling · ${record.after} actions kept`;
    case 'incapacitation':return record.after===undefined?'':`${record.after} action${record.after===1?'':'s'} lost`;
    case 'knockDown':return record.after===undefined?'knocked off balance':`${record.after} action${record.after===1?'':'s'} lost`;
    default:return `${record.after} action${record.after===1?'':'s'} invested${record.status==='reversed'?' · undone':''}`;
  }
}

// What must never appear in text a player reads on the row or bar.
export const developerText=/\bPDF\b|LEG\d|§|\bTable \d|\bledger\b|telemetry|adjudicat|\bderiv|undefined|\bnull\b|NaN|SHOT ·|SIGHTLINE ·|\bstate:/i;
