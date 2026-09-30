// Display saved firing semantics without treating a burst size as an action cost.
export function weaponRof(mode) {
 const threeRound=Object.keys(mode.threeRoundBurst??{}).length>0;
 const three=' It also fires a three-round burst: an aimed shot that can put up to three rounds into the target.';
 if(Number.isSafeInteger(mode.burstRounds)&&mode.burstRounds>0)return {value:`${mode.burstRounds} rounds / burst${threeRound?' · three-round burst':''}`,detail:`Automatic ROF: rounds in a half-second burst. This is not a chambering action cost.${threeRound?three:''}`};
 if(mode.feed==='self-loading')return {value:threeRound?'** · Self-loading, three-round burst':'* · Self-loading',detail:`A round chambers automatically while ammunition remains. No extra chambering actions; aim and firing still take actions.${threeRound?three:''}`};
 if(mode.feed==='manual')return {value:Number.isSafeInteger(mode.rateOfFire)&&mode.rateOfFire>0?`${mode.rateOfFire} actions`:'Unknown',detail:'Actions to prepare the next shot, in addition to aim. An already chambered shot does not pay this cost.'};
 if(mode.feed==='single-load')return {value:'— · Single-load',detail:'No separate ROF. Preparing the next shot uses the weapon’s reload time.'};
 return {value:'Unknown',detail:'Record the weapon’s feed type and ROF before firing.'};
}
