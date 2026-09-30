import {firearms} from './firearms.mjs';
import {automaticWeapons} from './automatic-weapons.mjs';
import {gunFileFirearms,gunFileAutomaticWeapons} from './gun-file-weapons.mjs';
import {shotguns} from './shotguns.mjs';

// LEG10200 §5.12 Knock Down (optional), PDF 57–58 / printed 52–53, read from the page at 4x.
// "cross-index the weapon's KD value with the Hit Location on the following Projectile Knock
// Down Table. If the KD is greater than or equal to the entry, that level of Knock Down effect
// is imposed on the target." Explosions read the Base Concussion on the Explosive Knock Down
// Table the same way; the Power Armor columns are not carried, as there is no power armor.
export const knockDownSource=Object.freeze({book:'LEG10200',section:'5.12',pdfPages:[57,58],verification:'visual'});
export const knockDownLevels=Object.freeze([1,2,4,'down']);
export const projectileKnockDown=Object.freeze({
  head:Object.freeze([2,3,4,10]),
  body:Object.freeze([11,14,17,19]),
  arm:Object.freeze([2,3,4,16]),
  leg:Object.freeze([3,4,5,6])});
export const explosiveKnockDown=Object.freeze([50,66,82,90]);

// The printed KD of each catalogue gun, by catalogue id. Items do not carry it; a gun with
// no catalogue id (a custom one) has no Knock Down value.
export const knockDownByCatalogId=Object.freeze(Object.fromEntries(
  [...firearms,...gunFileFirearms,...automaticWeapons,...gunFileAutomaticWeapons,...shotguns]
    .filter(entry=>Number.isFinite(entry.knockDown)).map(entry=>[entry.id,entry.knockDown])));
