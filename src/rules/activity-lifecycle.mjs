// Ordinary catalog activities finish with the clock. Weapon/posture/turn effects
// keep their existing confirmation and persistence paths.
export function finishTimedActivities(state){
  for(const entry of Object.values(state.entries)){
    const activity=entry.activity;
    if(activity?.catalog?.execution!=='manual'||activity.effect||activity.weaponPlan||activity.progress<activity.cost)continue;
    const completion={kind:'complete',activityId:activity.id,label:activity.label,
      phase:state.phase,impulse:state.impulse,cost:activity.cost,revision:state.revision};
    entry.history.push(completion);entry.lastCompleted=completion;entry.activity=null;
  }
  return state;
}
