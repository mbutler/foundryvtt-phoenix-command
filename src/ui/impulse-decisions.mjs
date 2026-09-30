import {escapeHTML as e} from '../foundry/context.mjs';
import {movementBegan,activityBegan} from '../rules/timing.mjs';
import {exposureInterval} from '../rules/impulse-decisions.mjs';

const stamp=at=>`Phase ${at.phase} · Impulse ${at.impulse}`;

// Section 2.4, PDF 12: exposure runs "from the beginning of the Impulse they begin an action
// which exposes them, until the end of the Impulse in which they go into concealment". So
// the question is not only whether a target is visible now but since when, and the answer is
// usually already in the ledger: the impulse he began moving, or began the activity that
// exposed him. Both are offered rather than asked for.
export async function chooseSightline(combat,observerId,state=combat.timing){
  const targets=combat.combatants.filter(c=>c.id!==observerId&&c.token&&c.actor);
  if(!targets.length)throw new Error('This encounter has no other combatant to adjudicate a sightline to.');
  const now={phase:state.phase,impulse:state.impulse};
  const starts=Object.fromEntries(targets.map(c=>[c.id,{moved:movementBegan(state,c.id),
    acted:activityBegan(state,c.id),open:exposureInterval(state,observerId,c.id)}]));

  const root=document.createElement('div');root.className='pc-sightline pc-dialog';
  root.innerHTML=`<p class="pc-record-kicker">TACTICAL REVIEW · SIGHTLINE</p><p class="pc-help">Observer: ${e(combat.combatants.get(observerId)?.name)}. Records rule exposure without moving tokens.</p>
    <label>Target<select name="targetId">${targets.map(c=>`<option value="${e(c.id)}">${e(c.name)}</option>`).join('')}</select></label>
    <label>This impulse<select name="status">
      <option value="visible">Visible throughout</option>
      <option value="appearing">Becomes exposed: visible from the beginning</option>
      <option value="departing">Conceals: visible until the end</option>
      <option value="concealed">Concealed throughout</option></select></label>
    <label data-since hidden>Exposed since<select name="since"></select></label>
    <label>Reason<input name="reason" required placeholder="Corner, doorway or adjudicated line of sight"></label>
    <p data-note role="status" aria-live="polite"></p>
    <p>Resolve all departing targets before opening reactions. Foundry token hiding is separate from rule visibility.</p>`;
  const field=name=>root.querySelector(`[name=${name}]`);
  const since=field('since'),sinceLabel=root.querySelector('[data-since]'),note=root.querySelector('[data-note]');

  function update(){
    const target=starts[field('targetId').value],status=field('status').value;
    const running=target.open&&!target.open.closed?target.open.from:null;
    const exposing=['visible','appearing'].includes(status);
    sinceLabel.hidden=!exposing||!!running;
    if(exposing&&!running){
      const options=[{at:now,label:`This impulse · ${stamp(now)}`}];
      for(const [at,why] of [[target.moved,'he began moving'],[target.acted,'he began his current activity']])
        if(at&&(at.phase!==now.phase||at.impulse!==now.impulse))options.push({at,label:`${stamp(at)} · ${why}`});
      since.innerHTML=options.map((option,index)=>`<option value="${index}">${e(option.label)}</option>`).join('');
      since.dataset.options=JSON.stringify(options.map(option=>option.at));
      if(options.length>1)since.value='1'; // Prefer the impulse the exposing action began in.
    }
    note.textContent=running
      ?`Exposed since ${stamp(running)}; re-declaring visibility keeps that start. Only concealment ends the interval.`
      :status==='departing'?'Visible until the end of this impulse, then concealed.'
      :status==='concealed'?'No exposure interval is recorded while concealed.'
      :'Section 2.4 starts the interval at the beginning of the impulse the exposing action began in.';
  }
  root.addEventListener('change',update);update();

  const content=document.createElement('div');content.append(root);
  return foundry.applications.api.DialogV2.prompt({window:{title:'Adjudicate sightline'},content,
    render:(_event,app)=>{app.element.querySelector('.pc-sightline').replaceWith(root);update();},
    ok:{label:'Record sightline',callback:()=>{
      const fields={targetId:field('targetId').value,status:field('status').value,reason:field('reason').value};
      if(!sinceLabel.hidden&&since.value!==''){
        const at=JSON.parse(since.dataset.options)[Number(since.value)];
        if(at&&(at.phase!==now.phase||at.impulse!==now.impulse))fields.from=at;
      }
      return fields;
    }},rejectClose:false});
}

export async function reconcileInterruption(activity){
  return foundry.applications.api.DialogV2.prompt({window:{title:'Reconcile interrupted work'},content:`
    <div class="pc-dialog"><p class="pc-record-kicker">GM ADJUDICATION · INTERRUPTION</p><p>${e(activity.label)} · ${activity.progress} actions invested</p><p class="pc-help">The rules do not specify retained progress. Spent actions are not refunded.</p>
    <label>Retained progress<input name="progress" type="number" min="0" max="${activity.progress}" step="1" required></label>
    <label>Ruling and source<input name="reason" required></label></div>`,ok:{label:'Record ruling',callback:(event,button,dialog)=>({progress:Number(dialog.element.querySelector('[name=progress]').value),reason:dialog.element.querySelector('[name=reason]').value})},rejectClose:false});
}
