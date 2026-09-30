import {activities} from '../data/activities.mjs';
import {postureEffect} from '../rules/posture.mjs';
import {weaponActivity,reloadCapacity,thrownMode} from '../rules/weapon-timing.mjs';
import {equippedModes,supportsOrder,compatibleAmmunition} from './weapon-order-options.mjs';

// Rounds of this stock that are not already loaded in a weapon. Quantity includes loaded rounds.
function spareRounds(items,ammo){
  const reserved=items.filter(i=>i.type==='weapon'&&i.system.loaded?.ammunitionItemId===ammo.id)
    .reduce((sum,i)=>sum+(i.system.loaded.rounds??0),0);
  return (ammo.system.quantity??0)-reserved;
}
function fullMagazineReason(items,row){
  const name=row.weapon.name,cap=reloadCapacity(row.mode),rounds=row.weapon.system.loaded?.rounds??0;
  const ammunition=compatibleAmmunition(items,row),loadedId=row.weapon.system.loaded?.ammunitionItemId;
  const same=ammunition.filter(ammo=>!loadedId||ammo.id===loadedId);
  const other=ammunition.filter(ammo=>loadedId&&ammo.id!==loadedId&&spareRounds(items,ammo)>0);
  if(!ammunition.length)return `${name} is full (${rounds}/${cap}) and has no carried ammunition it can load.`;
  if(same.some(ammo=>spareRounds(items,ammo)>0))return `${name} is full (${rounds}/${cap}).`;
  if(other.length)return `${name} is full (${rounds}/${cap}). Unload it before loading other ammunition.`;
  return `${name} is full (${rounds}/${cap}). Ammunition totals include rounds already loaded, and nothing remains to add.`;
}

// Presentation uses the same eligibility and printed cost rules as commitment.
export function quickOrders(actor,options={}){
  const posture=[],preparation=[],reload=[];
  for(const row of activities){
    try{
      const effect=postureEffect(row.id,actor,options);if(!effect)continue;
      if(effect.field){preparation.push({label:`${row.label} · ${row.cost.actions} action${row.cost.actions===1?'':'s'}`,command:{kind:'activity',continuous:true,catalog:{id:row.id,parameters:{}}}});continue;}
      posture.push({label:`${effect.after[0].toUpperCase()+effect.after.slice(1)} · ${row.cost.actions} action${row.cost.actions===1?'':'s'}`,command:{kind:'activity',continuous:true,catalog:{id:row.id,parameters:{}}}});
    }catch{/* Invalid current posture, consciousness or injury. */}
  }
  const rows=equippedModes(actor.items).filter(r=>supportsOrder(r,'reload'));
  const blocked=[];
  for(const row of rows){
    const cap=reloadCapacity(row.mode),rounds=row.weapon.system.loaded?.rounds??0;
    if(Number.isSafeInteger(cap)&&rounds>=cap){blocked.push(fullMagazineReason(actor.items,row));continue;}
    const ammunition=compatibleAmmunition(actor.items,row);
    if(!ammunition.length){blocked.push(`${row.weapon.name} has no carried ammunition it can load.`);continue;}
    const errors=[];
    for(const ammo of ammunition){
      const request={kind:'reload',weaponId:row.weapon.id,modeId:row.modeId,ammunitionId:ammo.id};
      try{
        const plan=weaponActivity(actor,request,options);
        reload.push({label:thrownMode(row.mode)?`Ready next ${row.weapon.name} · ${plan.cost} actions`:`${row.weapon.name} · ${row.modeId} · ${ammo.name} · ${plan.cost} actions`,command:{kind:'activity',continuous:true,weaponRequest:request}});
      }catch(error){errors.push(error.message);}
    }
    if(errors.length&&!reload.some(order=>order.command.weaponRequest.weaponId===row.weapon.id&&order.command.weaponRequest.modeId===row.modeId))
      blocked.push(`${row.weapon.name}: ${[...new Set(errors)].join(' ')}`);
  }
  if(!rows.length)blocked.push('No equipped firearm can be reloaded. During a fight, draw or unsling one with Other actions.');
  return {posture,preparation,reload,reloadBlocked:reload.length?[]:[...new Set(blocked)]};
}
