import {postureForStance} from '../foundry/hex-move.mjs';
export function preferredMovementStance(entry,posture){
  const previous=entry?.movement?.stance;
  if(previous&&postureForStance[previous]===posture)return previous;
  return {standing:'standing',kneeling:'hands-and-knees',prone:'belly-crawl'}[posture]??'';
}
export function movementInvestment({balance,cost,progress=0,manual=null}){
  if(!Number.isSafeInteger(balance)||balance<1)throw new Error('No actions are available for movement.');
  if(!Number.isSafeInteger(cost)||!Number.isSafeInteger(progress)||progress<0||progress>=cost)throw new Error('This movement has no unpaid action cost.');
  const maximum=Math.min(balance,cost-progress);
  const amount=manual===null?maximum:manual;
  if(!Number.isSafeInteger(amount)||amount<1||amount>maximum)throw new Error(`Choose between 1 and ${maximum} actions.`);
  return {amount,remaining:cost-progress-amount,complete:amount===cost-progress};
}
