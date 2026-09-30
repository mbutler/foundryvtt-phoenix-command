// Keep engine definitions for existing tokens, but expose only appropriate HUD choices.
export function configureTokenOptions(config){
  // Conditions are set through the actor-backed Situation control, not cosmetic effects.
  for(const effect of config.statusEffects)effect.hud=false;
  const movement=config.Token.movement;
  movement.defaultAction='walk';
  for(const [id,action] of Object.entries(movement.actions)){
    action.canSelect=()=>id==='walk';
    if(id==='walk')action.label='Move';
  }
}
