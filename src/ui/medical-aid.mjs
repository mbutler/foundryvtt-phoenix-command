import {careAvailableIn} from '../rules/medical.mjs';
import {careLevels,careLabels,techLevels} from '../data/medical.mjs';
import {criticalTime,formatRemaining} from '../rules/critical-time.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

const scope='phoenix-command';
const option=(value,label,selected)=>`<option value="${e(value)}" ${value===selected?'selected':''}>${e(label)}</option>`;

export const actorCriticalTime=(actor,now=game.time.worldTime)=>criticalTime({injuries:actor.system.injuries,recovery:actor.system.recovery,
  health:actor.system.attributes?.health,physicalDamage:actor.system.summary?.physicalDamage??0,aid:actor.system.aid,now});

function campaignTechLevel(){
  try{const year=game.settings.get(scope,'campaignYear');return Number.isInteger(year)?careAvailableIn(year).techLevel??null:null;}
  catch{return null;}
}

// §2.9: the GM records the best aid reached. Better aid lengthens the Critical Time Period, which
// still runs from the wound; the record is stamped with the time it was reached.
export async function recordCareReached(actor){
  if(!game.user.isGM)throw new Error('Recording medical aid is a GM ruling.');
  const aid=actor.system.aid??{};
  const current=Number.isFinite(aid.recordedAtWorldTime)?aid.care:'none';
  const answer=await foundry.applications.api.DialogV2.prompt({window:{title:`Care reached · ${actor.name}`},content:`
    <div class="pc-dialog"><p class="pc-record-kicker">MEDICAL · CARE REACHED</p>
    <p class="pc-help">The Critical Time Period for this care still counts from the wound (§2.9).</p>
    <label>Best care reached<select name="care">${careLevels.map(level=>option(level,careLabels[level],current)).join('')}</select></label>
    <label>Trauma centre technology<select name="techLevel"><option value="">Not a trauma centre</option>${techLevels.map(level=>option(String(level),`Level ${level}`,String(aid.techLevel??campaignTechLevel()??''))).join('')}</select></label></div>`,
    ok:{label:'Record care',callback:(event,button,dialog)=>{
      const form=dialog.element,care=form.querySelector('[name=care]').value,tech=form.querySelector('[name=techLevel]').value;
      return {care,techLevel:care==='trauma-center'&&tech!==''?Number(tech):null};
    }},rejectClose:false});
  if(!answer)return null;
  if(answer.care==='trauma-center'&&!techLevels.includes(answer.techLevel))throw new Error('Choose the trauma centre’s technology level.');
  await actor.update({'system.aid':{...answer,recordedAtWorldTime:game.time.worldTime}});
  return answer;
}

// Tell the GM once when a running Critical Time Period ends. Nothing is rolled or killed.
export function criticalTimeAlerts(actors,now){
  const due=[];
  for(const actor of actors){
    if(actor?.type!=='character')continue;
    const ct=actorCriticalTime(actor,now);
    if(ct.state!=='due'||actor.getFlag(scope,'criticalTimeAlert')===ct.deadline)continue;
    due.push({actor,ct});
  }
  return due;
}

export function registerCriticalTimeAlerts(){
  Hooks.on('updateWorldTime',async worldTime=>{
    if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
    const actors=new Map();
    for(const actor of game.actors)actors.set(actor.uuid,actor);
    for(const combat of game.combats)for(const c of combat.combatants)if(c.actor)actors.set(c.actor.uuid,c.actor);
    for(const {actor,ct} of criticalTimeAlerts(actors.values(),worldTime)){
      try{
        await actor.setFlag(scope,'criticalTimeAlert',ct.deadline);
        ui.notifications.warn(`${actor.name}: ${ct.detail}`);
        await foundry.documents.ChatMessage.create({whisper:game.users.filter(u=>u.isGM).map(u=>u.id),
          content:`<section class="phoenix-command"><p class="pc-record-kicker">MEDICAL · CRITICAL TIME</p><h2>${e(actor.name)}</h2><p>${e(ct.detail)}</p><p class="pc-help">Resolve recovery from the character sheet.</p></section>`});
      }catch(error){console.error('Phoenix Command critical time alert',error);}
    }
  });
}

export {formatRemaining};
