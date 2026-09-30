import {coverProtectionFactor} from '../data/cover.mjs';
import {reusableShotConditions} from '../foundry/shot-conditions.mjs';
import {localCoordinatorSession} from '../application/coordinator.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {sceneCover} from '../foundry/cover-scene.mjs';
import {arcOccupants} from '../foundry/burst-scene.mjs';
import {firearmOptions} from '../rules/attacks.mjs';
import {coverMenu,coverFromKey} from './cover-menu.mjs';
import {savedCoverStance} from '../rules/cover.mjs';
import {movedThisPhase} from '../rules/timing.mjs';
import {dueFireSummary} from '../application/resolve-due-fire.mjs';
import {startFireWorkflow} from '../application/fire-workflow.mjs';
import {strikeReviewContext,strikeChoices,explosiveChoices} from '../foundry/strike-review.mjs';
import {strikeFields,readStrikeFields} from './shot-review.mjs';
import {parryOptions} from '../foundry/strike-review.mjs';
import {parryChoiceMarkup,keepParryTicks} from './parry-choice.mjs';

const drafts=new WeakMap();
// A launcher round, a thrown grenade or a burst of grenades: reviewed for the throw only.
const explosiveRow=shot=>['grenade','launcher'].includes(shot.plan.kind)||shot.plan.explosive===true;

export function queueCover(combat,shot){
  try{
    const shooter=combat.combatants.get(shot.combatantId)?.token?.object;
    const targets=shot.plan.kind==='burst'?arcOccupants(combat,shot.combatantId,shot.arc).atRange:combat.combatants.filter(c=>c.token?.uuid===shot.plan.targetUuid);
    // §5.10: cover fire at hexes nobody stands in has no one whose cover could matter.
    if(!shooter||!targets.length)return !!shooter&&shot.plan?.coverFire===true;
    return targets.every(c=>{const token=c.token?.object;if(!token)return false;const reading=sceneCover(combat.scene,shooter.center,token.center);return reading.mapped&&!reading.ambiguous;});
  }catch{return false;}
}
export function queueChoices({coverKey,visibility,coverStance='firing-over',calledShot=null,applyTargetWidth=false,applyPelletWidth=false,pelletGrouping=false,coverPF=null,coverReason='',stance='derived',brace='derived'}){
  if(!coverKey)throw new Error('Choose cover for each unresolved attack.');
  if(!firearmOptions.visibility.includes(visibility))throw new Error('Choose visibility.');
  const cover=coverKey==='adjudicated'?{...coverProtectionFactor({adjudicated:Number(coverPF),reason:coverReason}),stance:coverStance}:coverFromKey(coverKey,coverStance);
  if(coverKey!=='scene'&&cover===undefined)throw new Error('Choose a supported cover entry.');
  return {reuseConditions:true,coverKey,coverStance,...(stance==='derived'?{}:{firingStance:stance==='prepared'}),...(brace==='derived'?{}:{braced:brace==='yes'}),...(coverKey==='scene'?{}:{cover,coverOverride:true}),visibility:[visibility],calledShot,applyTargetWidth,applyPelletWidth,pelletGrouping};
}

// A strike's row: what was derived, what only the GM can say, and the fields prefilled.
function strikeRow(combat,shot){
  try{
    const ctx=strikeReviewContext(combat,shot.combatantId,shot.adjudication?.choices??{});
    const summary=[`${ctx.stroke} stroke`,ctx.defaultColumn?`parry ${ctx.defaultColumn}`:null,ctx.defaults.damageBonus!=null?`DB ${ctx.defaults.damageBonus}`:null,ctx.stationary?null:'moved'].filter(Boolean).join(' · ');
    return `<p class="pc-help">${e(summary)}</p>${ctx.open.map(o=>`<p role="alert">${e(o.detail)}</p>`).join('')}${strikeFields(ctx)}`;
  }catch(error){return `<p role="alert">${e(error.message)}</p>`;}
}

export function mountFireQueue(footer,combat,{command}){
  const due=dueFireSummary(combat).due.filter(s=>['ready','rolled'].includes(s.status));
  if(!due.length||combat.timing.batch?.complete)return;
  const stored=combat.getFlag('phoenix-command','fireWorkflow');
  const request=stored?.clockRevision===combat.timing.clockRevision?stored:null;
  const missingArc=due.some(shot=>shot.status==='ready'&&shot.plan.kind==='burst'&&!shot.arc);
  const waiting=request?.status==='waiting'&&request.session===localCoordinatorSession();
  let draft=drafts.get(combat);
  if(draft?.clock!==combat.timing.clockRevision){draft={clock:combat.timing.clockRevision,shots:{}};drafts.set(combat,draft);}
  const section=document.createElement('section');section.className='pc-fire-queue';
  section.innerHTML=`<strong>GM · Impulse fire</strong>${request?.error?`<p role="alert">${e(request.error)}</p>`:''}
    ${due.map(shot=>{
      const saved=draft.shots[shot.id]??request?.choices?.[shot.id]??shot.adjudication?.choices??reusableShotConditions(combat,shot);
      const supported=['shot','burst','shotgun'].includes(shot.plan.kind)&&!explosiveRow(shot);
      const cover=saved?.coverKey??(queueCover(combat,shot)?'scene':'');
      const target=combat.targetFor(shot.plan)?.name??(shot.plan.explosive?'Grenade burst':shot.plan.kind==='burst'?'Burst arc':'Target');
      return `<article data-queue-shot="${e(shot.id)}"><strong>${e(combat.combatants.get(shot.combatantId)?.name??'Attacker')} → ${e(target)}</strong>
      ${shot.status==='ready'&&shot.plan.kind==='burst'&&!shot.arc?`<button type="button" data-queue-arc="${e(shot.combatantId)}">Choose burst arc</button>`:''}
      ${shot.status==='ready'&&shot.plan.kind==='strike'?strikeRow(combat,shot):''}
      ${shot.status==='ready'&&explosiveRow(shot)?`<label>Visibility<select name="visibility" ${waiting?'disabled':''}>${firearmOptions.visibility.map(v=>`<option ${v===(shot.adjudication?.choices?.visibility?.[0]??'Good Visibility')?'selected':''}>${e(v)}</option>`).join('')}</select></label>
      <label class="pc-custom-toggle"><input name="elevated" type="checkbox" ${shot.adjudication?.choices?.elevatedHex?'checked':''}> Highly elevated hex (+15)</label>
      <label class="pc-custom-toggle"><input name="shrapnelSize" type="checkbox" ${shot.adjudication?.choices?.applyShrapnelSize?'checked':''}> Adjust shrapnel for target size (§3.7)</label>`:''}
      ${shot.status==='ready'&&supported?`<label>Cover<select name="cover" ${waiting?'disabled':''}><option value="">Choose cover…</option>${[['scene','Use mapped cover'],['open','In the open'],...coverMenu,['adjudicated','Custom cover PF']].map(([key,label])=>`<option value="${e(key)}" ${cover===key?'selected':''}>${e(label)}</option>`).join('')}</select></label>
      <label>Visibility<select name="visibility" ${waiting?'disabled':''}>${firearmOptions.visibility.map(v=>`<option ${v===(saved?.visibility?.[0]??'Good Visibility')?'selected':''}>${e(v)}</option>`).join('')}</select></label>
      <details><summary>Attack options</summary><label>Stance<select name="stance">${[['derived','Use paid preparation'],['hip','Hip fire'],['prepared','Prepared']].map(([key,label])=>`<option value="${key}" ${key===(saved?.stance??(typeof saved?.firingStance==='boolean'?(saved.firingStance?'prepared':'hip'):'derived'))?'selected':''}>${label}</option>`).join('')}</select></label><label>Braced<select name="brace">${[['derived','Use paid preparation'],['no','Unbraced'],['yes','Braced']].map(([key,label])=>`<option value="${key}" ${key===(saved?.brace??(typeof saved?.braced==='boolean'?(saved.braced?'yes':'no'):'derived'))?'selected':''}>${label}</option>`).join('')}</select></label><label>Custom PF<input name="coverPF" type="number" min="0" step="any" value="${e(saved?.coverPF??saved?.cover?.pf??'')}"></label><label>Cover name<input name="coverReason" value="${e(saved?.coverReason??saved?.cover?.label??'')}"></label><label>Cover exposure<select name="coverStance"><option value="firing-over">Firing over</option><option value="looking-over" ${(saved?.coverStance??savedCoverStance(combat.targetFor(shot.plan)?.actor?.system.condition,{moving:movedThisPhase(combat.timing,combat.targetFor(shot.plan)?.id)}))==='looking-over'?'selected':''}>Looking over</option></select></label>
      ${shot.plan.kind==='shot'?`<label>Aim at<select name="calledShot">${[['','Whole exposed target'],['Head','Head'],['Body','Body'],['Legs','Legs']].map(([k,v])=>`<option value="${k}" ${saved?.calledShot===k?'selected':''}>${v}</option>`).join('')}</select></label>`:`<label><input name="width" type="checkbox" ${saved?.applyTargetWidth||saved?.applyPelletWidth?'checked':''}> Optional target width</label><label><input name="grouping" type="checkbox" ${saved?.pelletGrouping==='random'?'checked':''}> Random pellet grouping</label>`}</details>`:shot.status==='ready'?'':'Dice saved'}
      </article>`;
    }).join('')}
    <div class="pc-queue-reactions">${Object.entries(combat.timing.reactions?.choices??{}).map(([id,choice])=>`<div data-reaction-for="${e(id)}"><span>${e(combat.combatants.get(id)?.name??'Combatant')}</span>${choice===null?`${parryChoiceMarkup(parryOptions(combat,id),{scope:id})}<button type="button" data-react="hold" data-person="${e(id)}">Hold</button><button type="button" data-react="duck" data-person="${e(id)}">Duck</button>`:`<span>${e(combat.timing.reactions?.unable?.includes(id)?'holds · not conscious':choice)}</span>`}</div>`).join('')}</div>
    <button type="button" data-queue-resolve ${waiting||missingArc?'disabled':''}>${waiting?'Waiting for reactions':request?.status==='paused'||request?.status==='resolving'?'Resume resolution':'Resolve impulse'}</button><p data-queue-error role="alert"></p>`;
  const readRow=row=>{
    const value=name=>row.querySelector(`[name=${name}]`)?.value;
    return {coverPF:value('coverPF'),coverReason:value('coverReason'),stance:value('stance'),brace:value('brace'),coverKey:value('cover'),visibility:value('visibility'),coverStance:value('coverStance'),calledShot:value('calledShot')||null,applyTargetWidth:row.querySelector('[name=width]')?.checked??false,applyPelletWidth:row.querySelector('[name=width]')?.checked??false,pelletGrouping:row.querySelector('[name=grouping]')?.checked?'random':false};
  };
  const rawFields=row=>Object.fromEntries([...row.querySelectorAll('input[name],select[name]')].map(input=>[input.name,input.type==='checkbox'?input.checked:input.value]));
  section.addEventListener('change',event=>{
    const row=event.target.closest('[data-queue-shot]');
    if(!row)return;
    const shot=due.find(s=>s.id===row.dataset.queueShot);
    if(shot&&(shot.plan.kind==='strike'||explosiveRow(shot))){draft.raw={...draft.raw,[shot.id]:rawFields(row)};return;}
    const value=readRow(row);draft.shots[row.dataset.queueShot]={...value,visibility:[value.visibility]};
  });
  // Restore what the GM already typed into strike and explosive rows across re-renders.
  for(const row of section.querySelectorAll('[data-queue-shot]'))for(const [name,value] of Object.entries(draft.raw?.[row.dataset.queueShot]??{})){
    const input=row.querySelector(`[name="${name}"]`);if(!input)continue;
    if(input.type==='checkbox')input.checked=value;else input.value=value;
  }
  keepParryTicks(section);
  if(waiting)section.querySelectorAll('article input,article select').forEach(input=>input.disabled=true);
  section.querySelectorAll('[data-queue-arc]').forEach(button=>button.addEventListener('click',()=>command(combat,combat.timing,button.dataset.queueArc,'designateArc',button)));
  section.querySelectorAll('[data-react]').forEach(button=>button.addEventListener('click',()=>command(combat,combat.timing,button.dataset.person,button.dataset.react,button)));
  section.querySelectorAll('[data-queue-review]').forEach(button=>button.addEventListener('click',()=>command(combat,combat.timing,button.dataset.queueReview,'reviewShot',button)));
  section.querySelector('[data-queue-resolve]').addEventListener('click',async event=>{
    const button=event.currentTarget;button.disabled=true;
    try{
      const choices={};
      for(const shot of due){
        const row=[...section.querySelectorAll('[data-queue-shot]')].find(row=>row.dataset.queueShot===shot.id);
        const name=combat.combatants.get(shot.combatantId)?.name??'Attacker';
        if(shot.status==='ready'&&shot.plan.kind==='strike'){
          try{choices[shot.id]=strikeChoices(strikeReviewContext(combat,shot.combatantId,shot.adjudication?.choices??{}),readStrikeFields(row));}
          catch(error){throw new Error(`${name}: ${error.message}`);}
          continue;
        }
        if(shot.status==='ready'&&explosiveRow(shot)){
          choices[shot.id]=explosiveChoices({visibility:row.querySelector('[name=visibility]').value,elevatedHex:row.querySelector('[name=elevated]').checked,applyShrapnelSize:row.querySelector('[name=shrapnelSize]').checked});
          continue;
        }
        if(!row.querySelector('[name=cover]'))continue;
        const fields=readRow(row);
        if(fields.coverKey==='scene'&&!queueCover(combat,shot))throw new Error(`${combat.combatants.get(shot.combatantId)?.name??'Attacker'}: the map cannot resolve cover. Choose it in the queue.`);
        choices[shot.id]=queueChoices(fields);
      }
      await startFireWorkflow(combat,choices);
    }catch(error){section.querySelector('[data-queue-error]').textContent=error.message;}finally{button.disabled=false;}
  });
  footer.prepend(section);
}
