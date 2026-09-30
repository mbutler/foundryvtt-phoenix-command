// LEG10204 Chapter 5's optional rules are "agreed upon by all players before the start of the
// game" (PDF 28), so each is a world setting, off by default, and basic play never reads one.
const scope='phoenix-command';
// A normal space before the section sign wraps "§5.12" onto its own line in the settings list.
const ruleName=(title,book,section)=>`Optional rule: ${title} (${book}\u00a0${section})`;
export const meleeOptionalRuleSettings=Object.freeze({
  chainsaws:{key:'optionalChainsaws',name:ruleName('Chainsaws','LEG10204','§5.7'),
    hint:'Chainsaws cut by Cutting Power (ID less an Armor Adjustment) for six times the Base PD, and may continue a cut on the next impulse. Off, a chainsaw cannot strike.'},
  whips:{key:'optionalWhips',name:ruleName('Whips','LEG10204','§5.9'),
    hint:'A whip does §5.8 Surface Cut damage read on the Blunt table. Entangling, disarming and pulling off balance are not built. Off, a whip cannot strike.'}
});
export function registerMeleeOptionalRules(){
  for(const {key,name,hint} of Object.values(meleeOptionalRuleSettings))
    game.settings.register(scope,key,{name,hint,scope:'world',config:true,type:Boolean,default:false});
}
// The world's choices as the rules read them: {chainsaws:true|false, whips:true|false}.
export function meleeOptionalRules(){
  return Object.fromEntries(Object.entries(meleeOptionalRuleSettings).map(([rule,{key}])=>{
    try{return [rule,game.settings.get(scope,key)===true];}catch{return [rule,false];}
  }));
}

// LEG10200 Chapter 5's optional rules, the same way: world settings, off by default.
export const smallArmsOptionalRuleSettings=Object.freeze({
  secondShot:{key:'optionalSecondShot',name:ruleName('Second Shot Accuracy','LEG10200','§5.8'),
    hint:'A second shot at a target in the same hex as the shooter\u2019s previous shot gets +1 action of aim, if he has stayed in his hex and kept his posture and firing stance.'},
  knockDown:{key:'optionalKnockDown',name:ruleName('Knock Down','LEG10200','§5.12'),
    hint:'A hit\u2019s Knock Down value against its location (a blast\u2019s concussion against the Explosive table) costs the target 1, 2 or 4 actions, or knocks him down, even when armor stops the round.'},
  pinningFire:{key:'optionalPinningFire',name:ruleName('Pinning Fire','LEG10200','§5.9'),
    hint:'From a firing stance a shooter may pin one hex; a shot at someone who appears there gets +1 action of aim. His field of view narrows to 10 degrees while he does.'},
  coverFire:{key:'optionalCoverFire',name:ruleName('Cover Fire','LEG10200','§5.10'),
    hint:'An automatic weapon covers an arc of hexes with a burst every impulse, at Target Size +10. If a burst is on target, anyone exposed in those hexes is attacked by Table 5A.'},
  incapacitationEffects:{key:'optionalIncapacitationEffects',name:ruleName('Incapacitation Effects','LEG10200','§5.13'),
    hint:'A failed knockout roll is Knocked Out, Stunned, Dazed or Disoriented by where the roll falls, each for its Table 8B time on the encounter clock.'}
});
export function registerSmallArmsOptionalRules(){
  for(const {key,name,hint} of Object.values(smallArmsOptionalRuleSettings))
    game.settings.register(scope,key,{name,hint,scope:'world',config:true,type:Boolean,default:false});
}
export function smallArmsOptionalRules(){
  return Object.fromEntries(Object.entries(smallArmsOptionalRuleSettings).map(([rule,{key}])=>{
    try{return [rule,game.settings.get(scope,key)===true];}catch{return [rule,false];}
  }));
}
