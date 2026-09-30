import {escapeHTML as e} from '../foundry/context.mjs';

export async function removeCharacterItem(actor,itemId) {
  if (!actor?.isOwner) throw new Error('Removing equipment needs ownership of this character.');
  const item=actor.items.get(itemId);
  if (!item) return false;
  const confirmed=await foundry.applications.api.DialogV2.confirm({
    window:{title:'Remove item from character'},
    content:`<p>Remove <strong>${e(item.name)}</strong> from <strong>${e(actor.name)}</strong>?</p><p>This permanently deletes this character’s item, including its saved settings. Items in the world sidebar and on other characters are unaffected.</p>`,
    yes:{label:'Remove item'},no:{label:'Keep item'},rejectClose:false
  });
  if (!confirmed) return false;
  // Use the document API so ownership and combat inventory hooks still apply.
  const removed=await actor.deleteEmbeddedDocuments('Item',[itemId]);
  return removed.length>0;
}
