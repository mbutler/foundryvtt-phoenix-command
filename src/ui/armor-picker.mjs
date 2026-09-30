import {unifiedArmorCatalog,unifiedArmorById,unifiedArmorItem,armorEras} from '../data/armor-catalog.mjs';
import {armorSummary,armorCardHTML} from './armor-card.mjs';

// One Armor list: medieval, modern and high-tech armor from both books, with its coverage and
// protection shown before it is added.
export async function addArmorFromCatalog(actor){
  if(!actor?.isOwner)throw new Error('Adding armor needs ownership of this character.');
  const {pickFromCatalog}=await import('./weapon-picker.mjs');
  const id=await pickFromCatalog({
    title:`Choose armor · ${actor.name}`,noun:'armor',okLabel:'Wear armor',
    intro:'The armor is added carried and worn, covering the parts of the body shown.',
    groups:armorEras.map(era=>({label:era,options:unifiedArmorCatalog.filter(entry=>entry.era===era)
      .map(entry=>({key:entry.id,name:entry.name,summary:armorSummary(entry),search:[entry.name,era,armorSummary(entry)].join(' ')}))})),
    card:id=>armorCardHTML(unifiedArmorById[id],{gm:game.user.isGM})
  });
  if(!id)return null;
  const items=await actor.createEmbeddedDocuments('Item',[unifiedArmorItem(id)]);
  if(items.length)ui.notifications.info(`Wearing ${items[0].name}.`);
  return items.length?items:null;
}
