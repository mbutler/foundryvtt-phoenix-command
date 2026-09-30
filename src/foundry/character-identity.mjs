// New persistent characters share their Actor; explicitly unlinked troop templates remain independent.
export function defaultCharacterLink(actor,data){
  if(data.type==='character'&&data.prototypeToken?.actorLink===undefined&&data['prototypeToken.actorLink']===undefined)
    actor.updateSource({'prototypeToken.actorLink':true});
}
export function characterIdentity(actor){
  if(actor.isToken)return {label:`Independent scene character · based on ${actor.token?.baseActor?.name??actor.name}`,detail:'Changes apply only to this token. The original character in Actors is separate.',independent:true};
  return {label:'Shared character record',detail:'Linked tokens use these same stats, equipment, and wounds. Independent tokens keep their own changes.',independent:false};
}
