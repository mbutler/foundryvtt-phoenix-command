// Presentation of the existing resolution gates; readiness is advisory, not a rule.
export function impulseWorkflow(state,shots=[],{wounded=false}={}){
  if(!state.phase)return {label:'Begin encounter',selector:'[data-timing="start"]'};
  if(state.pendingEffect)return {label:'Finish applying the current action',selector:'[data-resume-effect],[data-abandon-effect]'};
  if(state.batch)return state.batch.complete
    ?{label:'Impulse resolved',selector:'[data-timing="advance"]'}
    :{label:'Resolve wounds and knockout checks',selector:'[data-resolve-impulse]'};
  const due=shots.filter(s=>s.timing?.clockRevision===state.clockRevision&&['ready','rolled'].includes(s.status));
  if(state.reactions?.stage==='open'){
    const remaining=Object.values(state.reactions.choices??{}).filter(c=>c===null).length;
    return {label:remaining?`Waiting for ${remaining} reaction${remaining===1?'':'s'}`:'Reactions complete',selector:null,disabled:remaining>0};
  }
  if(!state.reactions&&due.some(s=>s.status==='ready'&&s.plan?.kind==='burst'&&!s.arc))return {label:'Choose burst arcs before reactions',selector:'[data-timing="designateArc"]'};
  if(due.length&&!state.reactions)return {label:'Attacks queued',selector:null};
  if(due.some(s=>s.status==='ready'))return {label:'Attacks queued',selector:null};
  if(due.length)return {label:'Resolving simultaneous fire',selector:null};
  if(wounded)return {label:'Resolve wounds and knockout checks',selector:'[data-resolve-impulse]'};
  return {label:'Choose actions',selector:'[data-timing="advance"]'};
}
