import {supplementGroups,supplementWeaponSystem,supplementExplosiveGroups,supplementShotgunGroups,supplementShotgunSystem} from '../data/supplements/index.mjs';
import {threeRoundBurstRecord} from '../data/three-round-burst.mjs';
import {weaponImage} from '../data/weapon-images.mjs';
import {firearms, firearmSystem} from '../data/firearms.mjs';
import {automaticWeapons, automaticWeaponSystem} from '../data/automatic-weapons.mjs';
import {
  gunFileAutomaticWeapons, gunFileAutomaticWeaponSystem,
  gunFileFirearms, gunFileFirearmSystem
} from '../data/gun-file-weapons.mjs';
import {shotguns, shotgunItem} from '../data/shotguns.mjs';
import {gunSummary,gunCardHTML,grenadeSummary,grenadeCardHTML,launcherSummary,launcherCardHTML} from './weapon-card.mjs';
import {grenades,grenadeItemFor,grenadeAmmunitionItemFor,grenadeSource} from '../data/grenades.mjs';
import {launchers,launcherItemFor,launcherAmmunitionItemFor,launcherSource} from '../data/launchers.mjs';
import {explosiveImagePath,presentImage} from '../data/explosive-images.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

const gunFileAutomaticIds = new Set(gunFileAutomaticWeapons.map(entry => entry.id));
const gunFileFirearmIds = new Set(gunFileFirearms.map(entry => entry.id));
export const catalogFirearms = Object.freeze([...firearms, ...gunFileFirearms]);
export const catalogAutomaticWeapons = Object.freeze([...automaticWeapons, ...gunFileAutomaticWeapons]);

const groups = [
  {
    label:'Pistols and rifles',
    entries:catalogFirearms,
    build:entry=>gunFileFirearmIds.has(entry.id)
      ? gunFileFirearmSystem(entry)
      : firearmSystem(entry)
  },
  {
    label:'Automatic weapons',
    entries:catalogAutomaticWeapons,
    build:entry=>gunFileAutomaticIds.has(entry.id)
      ? gunFileAutomaticWeaponSystem(entry)
      : automaticWeaponSystem(entry)
  },
  {label:'Shotguns', entries:shotguns, build:entry=>shotgunItem(entry.id,{loadedRounds:0}).system},
  // One group per weapon data supplement, after the core groups so their keys never move.
  ...supplementGroups.map(group=>({label:group.label,entries:group.entries,build:supplementWeaponSystem,supplement:true})),
  ...supplementShotgunGroups.map(group=>({label:group.label,entries:group.entries,build:supplementShotgunSystem,supplement:true}))
];

export function gunCatalogItem(key) {
  const [groupIndex,id] = String(key).split(':');
  const group = groups.find((_,index)=>String(index)===groupIndex);
  const entry = group?.entries.find(entry=>entry.id===id);
  if (!entry) throw new Error('Choose a gun from the catalog.');
  const system = group.build(entry);
  system.catalogId = entry.id;
  // A `**` weapon's 3RB row (LEG10203 §6.3), read by the three-round burst.
  const threeRound = threeRoundBurstRecord(entry.id);
  if (Object.keys(threeRound).length) for (const mode of Object.values(system.firearmModes ?? {})) mode.threeRoundBurst = structuredClone(threeRound);
  system.loaded = {ammunitionItemId:null,rounds:0,chamber:'empty'};
  const item={name:entry.name,type:'weapon',system};
  const img=weaponImage(item);
  return {...item,...(img?{img}: {})};
}

export const gunCatalogGroups = groups;

function entryFor(key){
  const [groupIndex,id]=String(key).split(':');
  const group=groups.find((_,index)=>String(index)===groupIndex);
  return {group,entry:group?.entries.find(entry=>entry.id===id)};
}

// Grenades, charges and grenade launchers (LEG10200 §3.6) share the gun picker. They are added
// ready to use: a grenade as its charges plus the throw, in hand; a launcher loaded, with
// rounds. A stack's quantity counts everything owned, including what is loaded, and the
// throw Item carries no weight of its own, so a grenade is not weighed twice.
const kinds={grenade:{summary:grenadeSummary,unit:'grenade',defaultCount:3},launcher:{summary:launcherSummary,unit:'round',defaultCount:6}};
const explosiveGroups=[
  {label:'Grenades and charges',prefix:'grenade',kind:'grenade',entries:grenades,source:grenadeSource,...kinds.grenade},
  {label:'Launchers and rockets',prefix:'launcher',kind:'launcher',entries:launchers,source:launcherSource,...kinds.launcher},
  ...supplementExplosiveGroups.map(group=>({...group,...kinds[group.kind]}))];
const explosiveFor=key=>{
  const [prefix,id]=String(key).split(':');
  const group=explosiveGroups.find(g=>g.prefix===prefix);
  return {group,entry:group?.entries.find(entry=>entry.id===id)};
};
export const explosiveCatalogGroups=explosiveGroups;

// The Items for an explosive pick: the stack first, then the weapon loaded from it.
export function explosiveCatalogItems(key,count){
  const {group,entry}=explosiveFor(key);
  if(!entry)throw new Error('Choose a grenade or launcher from the catalog.');
  if(!Number.isInteger(count)||count<1||count>99)throw new Error(`Choose how many ${group.unit}s, from 1 to 99.`);
  const source=group.source;
  if(group.kind==='grenade')return {stack:grenadeAmmunitionItemFor(entry,{quantity:count,source}),
    weapon:ammunitionItemId=>{const item=grenadeItemFor(entry,{loadedRounds:1,ammunitionItemId,source});
      item.system.weightLb=0;item.system.weightNote='Carried weight is on the charges.';return item;}};
  return {stack:launcherAmmunitionItemFor(entry,{quantity:count,roundKey:entry.rounds[0],source}),
    weapon:ammunitionItemId=>launcherItemFor(entry,{loadedRounds:1,ammunitionItemId,chamber:'ready',source})};
}

export async function addGunFromCatalog(actor) {
  if (!actor?.isOwner) throw new Error('Adding a gun needs ownership of this character.');
  const {pickFromCatalog} = await import('./weapon-picker.mjs');
  const explosiveImage=entry=>explosiveImagePath(entry.id);
  const picked = await pickFromCatalog({
    title:`Choose a gun or explosive · ${actor.name}`,noun:'weapon',okLabel:'Equip',
    intro:'Guns are added carried and equipped, unloaded: add ammunition and load before shooting. Grenades and launchers come ready, with their charges or rounds.',
    groups:[...groups.map((group,index)=>({label:group.label,options:group.entries.map(entry=>({key:`${index}:${entry.id}`,name:entry.name,
      summary:gunSummary(entry),search:[entry.name,entry.category,entry.description,entry.country,group.label].filter(Boolean).join(' ')}))})),
      ...explosiveGroups.map(group=>({label:group.label,options:group.entries.map(entry=>({key:`${group.prefix}:${entry.id}`,name:entry.name,
        summary:group.summary(entry),search:[entry.name,entry.country,group.label,group.prefix].filter(Boolean).join(' ')}))}))],
    card:key=>{
      const explosive=explosiveFor(key);
      if(explosive.entry){
        const source=`${explosive.group.source.book} ${explosive.group.source.table}, PDF page ${explosive.entry.pdfPage??explosive.group.source.pdfPage}`;
        const html=explosive.group.kind==='grenade'?grenadeCardHTML:launcherCardHTML;
        return html(explosive.entry,{img:explosiveImage(explosive.entry),gm:game.user.isGM,source});
      }
      const {group,entry}=entryFor(key);return gunCardHTML(entry,{group:group.label,img:group.supplement?explosiveImagePath(entry.id):weaponImage({name:entry.name,system:{catalogId:entry.id}}),gm:game.user.isGM});
    },
    extra:key=>{
      const {group,entry}=explosiveFor(key);if(!entry)return '';
      const what=group.kind==='grenade'?'Grenades':`${entry.rounds[0].toUpperCase()} rounds`;
      return `<label>${e(what)} carried <input name="count" type="number" min="1" max="99" step="1" value="${group.defaultCount}"></label>`
        +(group.kind==='launcher'&&entry.rounds.length>1?`<p class="pc-help">Other rounds (${e(entry.rounds.slice(1).map(r=>r.toUpperCase()).join(', '))}) can be added later with Load.</p>`:'');
    }
  });
  if (!picked) return null;
  const key=typeof picked==='string'?picked:picked.key;
  const explosive=explosiveFor(key);
  if(explosive.entry){
    const {stack,weapon}=explosiveCatalogItems(key,Number(picked.values?.count));
    const [ammo]=await actor.createEmbeddedDocuments('Item',[stack]);
    const item=weapon(ammo.id);
    const img=await presentImage(explosiveImage(explosive.entry));if(img)item.img=img;
    const items=await actor.createEmbeddedDocuments('Item',[item]);
    ui.notifications.info(explosive.group.kind==='grenade'?`Equipped ${items[0].name} · ${ammo.system.quantity} carried, one in hand.`:`Equipped ${items[0].name}, loaded · ${ammo.system.quantity} ${ammo.system.ammunitionKey.toUpperCase()} rounds.`);
    return [ammo,...items];
  }
  const gun=gunCatalogItem(key);
  if(entryFor(key).group?.supplement){const img=await presentImage(explosiveImagePath(entryFor(key).entry.id));if(img)gun.img=img;}
  const items = await actor.createEmbeddedDocuments('Item',[gun]);
  if (items.length) ui.notifications.info(`Equipped ${items[0].name}. It starts unloaded.`);
  return items.length ? items : null;
}
