// Recovery after a blow (U5). A weapon left out of position (LEG10204 §3.1) is recovered by
// a routine order the player would always give, so it is queued for him when he has no other
// order: a continuous Recover. A Parry clears the same debt, so he can still cancel it and
// parry instead. §5.7's continued chainsaw cut is a real choice and is left to him while it
// is still possible, the impulse after the cut.
const next=({phase,impulse})=>impulse===4?{phase:phase+1,impulse:1}:{phase,impulse:impulse+1};

export function recoveryToQueue(state,id,{weapons=[],combatUuid,queuedShot=false,conscious=true}={}){
  const entry=state.entries?.[id],a=entry?.activity;
  // A man who is out recovers nothing; he is not ordered to, and the GM is not warned about it.
  if(!conscious)return null;
  if(!state.phase||state.reactions||state.batch||state.pendingEffect||!entry?.allowance)return null;
  if(entry.waiting||queuedShot||(a&&a.progress<a.cost))return null;
  for(const weapon of weapons){
    if(!weapon.carried||!weapon.equipped)continue;
    const cut=weapon.chainsawCut;
    if(cut?.cuttingPower>0&&cut.combatUuid===combatUuid){
      const n=next(cut);
      if(n.phase===state.phase&&n.impulse===state.impulse)continue;
    }
    for(const [modeId,mode] of Object.entries(weapon.meleeModes??{}))
      if(mode?.preparation?.recoveryRequired===true)return {weaponId:weapon.id,modeId};
  }
  return null;
}
