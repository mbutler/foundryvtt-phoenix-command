import {meleeWeapons,meleeWeaponsById,meleeWeaponItem} from '../data/melee-weapons.mjs';
import {meleeSummary,meleeCardHTML} from './weapon-card.mjs';

// LEG10204 Weapon Data Tables 1A and 1B, grouped as the book prints them.
const sections=[...new Set(meleeWeapons.map(entry=>`${entry.table} · ${entry.section}`))];

export async function addMeleeWeaponFromCatalog(actor){
  if(!actor?.isOwner)throw new Error('Adding a weapon needs ownership of this character.');
  const {pickFromCatalog}=await import('./weapon-picker.mjs');
  const id=await pickFromCatalog({
    title:`Choose a hand weapon · ${actor.name}`,noun:'hand weapon',okLabel:'Equip weapon',
    intro:'The weapon is added carried and equipped, with its grips, speed, class, impact damage and reach.',
    groups:sections.map(section=>({label:section,options:meleeWeapons.filter(entry=>`${entry.table} · ${entry.section}`===section)
      .map(entry=>({key:entry.id,name:entry.name,summary:meleeSummary(entry),search:[entry.name,entry.section,entry.family].join(' ')}))})),
    card:id=>meleeCardHTML(meleeWeaponsById[id],{gm:game.user.isGM})
  });
  if(!id)return null;
  const items=await actor.createEmbeddedDocuments('Item',[meleeWeaponItem(id)]);
  if(items.length)ui.notifications.info(`Equipped ${items[0].name}.`);
  return items.length?items:null;
}
