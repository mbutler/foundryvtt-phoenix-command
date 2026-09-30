import {ammunitionWeights} from '../data/ammunition-weights.mjs';
import {supplementAmmunitionWeights} from '../data/supplements/index.mjs';
export function ammunitionWeightDefaults(catalogId,quantity){
  const profile=ammunitionWeights[catalogId]??supplementAmmunitionWeights[catalogId];
  if(!profile||!Number.isInteger(quantity)||quantity<0)return null;
  if(profile.unit==='round')return {weightLb:profile.weightLb};
  if(!Number.isInteger(profile.capacity)||profile.capacity<1)return null;
  return {weightLb:profile.weightLb,packageCapacity:profile.capacity,packageCount:Math.ceil(quantity/profile.capacity),packageUnit:profile.unit};
}
// Keep carried feed devices after firing. AW supplies no empty-device weight, so use
// the printed loadout weight until the player removes the device from their loadout.
export function ammunitionPackageCount(system){
  return Math.max(system.packageCount??0,Math.ceil((system.quantity??0)/system.packageCapacity));
}
