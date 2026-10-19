# How to play Phoenix Command in Foundry

This guide is for **players and GMs running a game**. It describes what to click, not how the system is built.

Phoenix Command is detailed. This Foundry module handles the bookkeeping so you can focus on decisions: who to shoot, where to move, when to duck, and how long to aim.

---

## What you need

- **Foundry VTT v14** with the Phoenix Command system installed.
- A **hex map** (the module expects **6-foot hexes** for gun combat).
- **Tokens** on the map for your characters and enemies.
- An active **Combat** encounter on that scene (the GM sets this up).

---

## For the GM: start a fight in five steps

1. **Open the scene** with the map and tokens.
2. **Create or open Combat** (Combat Tracker sidebar) and add the combatants.
3. **Assign action allowances** — select each combatant in the tracker and set their actions per phase (or accept a derived value if offered). Every fighter needs an allowance before the fight can start.
4. Click **Begin encounter** at the bottom of the Combat Tracker.
5. Tell players to **select their token** on the map. The **action bar** appears above the hotbar.

**Tips**

- Mark **cover** on walls and regions once per scene (scene tools) so shots read the map instead of re-asking every time.
- Optional: mark **movement terrain** on regions (rubble, water, slopes) if it matters for that area.
- After everyone fires in an impulse, use **Resolve … fire & total impulse** (tracker footer) before **Next impulse**.
- If someone is wounded during an impulse, **total the impulse** (knockout checks) before advancing.

Players do most work from the **map action bar**. The Combat Tracker is the shared clock and the GM’s control panel.

---

## Your character sheet

Open your character from the action bar (**More → Character sheet**) or by clicking the token and opening the sheet.

**Combat actions per impulse** is at the top: four large values show your base allowance, with a total per phase. This is a reference schedule; the combat tracker shows encounter allowances and actions remaining. Missing characteristics or carried weights produce an explanation instead of a guessed number. Accuracy, maximum speed, knockout value, damage, and condition are also visible here.

Weapons and aiming accuracy come next. Characteristics use aligned columns, and equipment has direct add buttons. Detailed calculations, ballistic tables, and injury history remain available in the supporting sections.

### Equip a weapon and ammunition

1. Save any character edits, then click **Choose a gun** under **Weapons & attacks**.
2. Select a gun and click **Equip gun**. Its attack tables and weight are filled in, and **Carried** and **Equipped** are already enabled.
3. Click **Load gun** beside the weapon’s loaded-round count.
4. Choose existing ammunition or **Add new ammunition stock**. For new stock, choose its type (such as FMJ), total rounds owned, and weight per round if known. Unknown weight leaves encumbrance unresolved.
5. Enter rounds to load and click **Load gun**. This readies a chambered round and links the ammunition automatically. Stock includes loaded rounds; loading does not spend it.

During combat, use **Reload** on the action bar. It pays the reload on its own.

The Foundry **Items** sidebar contains items created in your world; a new world can have an empty list. The gun catalog works without any sidebar items. You can also drag existing Items onto your character or create custom equipment from the sheet.

### Armor

Equip armor items the same way (Carried + Equipped). The sheet shows what each piece covers.

---

## The map action bar

**Select your token** on the map. A panel appears with your name, the current phase and impulse, and how many **actions you have left this impulse**.

The status line under your name is the next step (“Aiming at Guard. Fires when ready.”, “Your decision: hold position or duck.”, “Waiting for GM.”).

The same eight buttons stay in the same places. A greyed-out button says why. Keys are **Shift** plus the letter (you can rebind them in Foundry’s keybindings). **Shift+F** takes the one decision the moment requires.

| Button | Key | What it does |
|--------|-----|----------------|
| **Attack** | Shift+A | Shoot, or strike someone next to you. |
| **Move** | Shift+M | Plan a paid route on the map. |
| **Turn** | Shift+T | Turn to face. A shot at someone outside your arc includes the turn. |
| **Reload** | Shift+R | Reload the equipped weapon. |
| **Posture** | Shift+P | Kneel, stand, go prone, and the other posture changes you can make. |
| **Defend** | Shift+D | Parry, Dodge, or Cover Up. |
| **More** | Shift+O | Other actions, Wait, and the character sheet. |
| **Done** | Shift+N | Done for this impulse. |

While an order is underway the bar offers **Cancel order** above those buttons. A target who is leaving offers **Fire** with the aim you already have.

---

## How to shoot (typical rifle shot)

1. Select your token and target the enemy (Foundry targeting), or click the enemy after **Attack**.
2. Click **Attack**. The card names the weapon, the target, the range, and how many rounds are loaded.
3. Choose when it fires. **Snap** shoots with the shortest aim. **This impulse** uses the rest of the impulse if that is a better shot. A later button (**I2**, **Full aim**) waits for that moment. **Other aim times** lists every printed aim time in between.
4. The shot fires on its own once the aim is paid. You do not press Fire again unless something changed — a wound while aiming, an empty gun, a concealed target — and the bar then names the reason.
5. When someone shoots at you, choose **Hold position** or **Duck**.
6. The GM presses **Resolve impulse** once those choices are in, then advances the clock.

The percentage on a single-shot button is your character’s own estimate. It does not include the target’s armor.

---

## How to strike

1. Stand next to the opponent and click **Attack**. A knife or other hand weapon opens a strike card.
2. Choose **Short**, **Normal**, or **Long**, then the blow (thrust, slash, and so on).
3. The blow lands when its actions are paid. Recovery is queued for you on the next impulse.
4. If you are the defender, tick a **Full parry** beside Hold or Duck before anyone rolls. You can parry only as many blows as you have full parries.

An off-hand weapon uses the Agility Skill Factor already on your sheet. A blow that factor does not allow is greyed out.

---

## How to move

1. Click **Move**.
2. Click hexes on the map to plan the route. The panel shows the cost and when you would arrive.
3. Choose a stance and commit.

A committed route keeps paying in later impulses on its own. **Cancel movement** stops it. Dragging your token during a fight opens the movement panel instead of moving for free.

---

## Reload and posture

- **Reload** names the weapon, the ammunition, and the action cost. It finishes on its own.
- **Posture** lists the changes your character can make now. Each one is a timed order, like aiming.

---

## Reactions

When someone fires and you might be exposed, the bar offers **Hold position** or **Duck**:

- **Hold** — stay as you are.
- **Duck** — take cover. Unfinished aim is lost.

A hand-to-hand defender also allocates full parries here. The fight waits on these decisions.

---

## What the GM still handles

- Starting the encounter and **Next impulse**. **Auto-advance** (off unless the GM turns it on) runs through impulses where nobody has a decision.
- **Resolve impulse** on the impulse panel, once Hold, Duck, and parries are in.
- Cover, visibility, and sightlines the map does not already know.
- Unusual calls: layered armor, a charge with no printed weapon class, and anything the status line marks **Waiting for GM**.

The impulse panel sits over the scene, so this does not require the Combat Tracker tab to be open.

---

## Quick troubleshooting

| Problem | Try this |
|---------|----------|
| No action bar | Select **one** owned token on the **encounter scene**. |
| Attack/Move greyed out | Read the status line; you may be in reactions, mid-move, or out of actions. |
| “Waiting for GM coordinator” | The GM client needs to be active; reload the page if the GM just reconnected. |
| “The impulse changed” | Combat updated — read the bar and try again (nothing should have been spent). |
| Can’t change gear mid-fight | Use **Reload** and **Posture** on the bar. Other gear changes are timed actions under **More**, or a GM call. |

---

## Scope of this module

This is an **infantry-focused** Phoenix Command implementation: firearms, melee, grenades, movement, armor, and timed combat. It does **not** cover everything in every Phoenix Command book (vehicles, artillery, full medical play, etc.).

When in doubt, trust the **status line on the action bar** and ask the GM.


### Attacks outside an encounter

The focused attack window reads range from scene tokens and protection from the target's equipped armor at the hit location. Exposure, visibility, cover and movement still need confirmation in this flow. Selections are remembered per weapon and target for the current client session; target state, token positions or facing, lighting, walls, regions, and relevant scene changes invalidate them. Reloading Foundry clears this session memory.

The ammunition selector chooses ballistic data; it does not create or load ammunition. The window selects the loaded ammunition type when available and checks for a loaded round and carried stock before rolling. An unloaded weapon can still use **Check odds**. **Apply result** spends ammunition and applies injuries, including spending ammunition on a miss; **Share** only posts the result. Application failures are labeled separately from Undo failures.

### Shared characters and independent troops

New characters default to **Link Actor Data** on their prototype token. A linked token and the Actors sidebar sheet share statistics, inventory, ammunition, and wounds. For a generic troop template, turn off Link Actor Data in its prototype before placing independent soldiers. Explicitly unlinked imports remain unlinked.

Independent token sheets display **Independent scene character · based on …**. Their generator saves to that token only. Existing placed tokens retain their current link setting; changing a prototype does not reconcile their data. Compare and preserve any independent changes before relinking an existing token.

### Ammunition weight

Catalog ammunition automatically uses the weapon's printed AW: pounds per magazine, belt, drum, or round. FA MAS is 1.0 lb per 25-round magazine and RT 10 Combat Actions (LEG10200 PDF 77). The magazine pouch is a separate 0.2 lb equipment item; it does not supply ammunition.

Rounds owned still includes loaded rounds. For feed devices, inventory tracks the number carried separately from rounds remaining, using the printed AW as the loadout weight. Firing does not automatically discard a magazine or reduce its weight; the book supplies no separate empty-device mass. Reduce Package Count when discarding an empty device, or turn off Carried when leaving the entire stock behind. This is a loadout accounting convention, not a claim about an empty magazine's physical weight. Explicit custom weights are preserved. Existing ammunition with a missing weight and exactly one recognized compatible weapon is repaired on the active GM's next reload.

Printed weapon W includes its loaded ammunition (LEG10200 PDF 11). A carried catalog weapon's assigned ammunition device is deducted from the separate ammunition load, avoiding double counting; spare devices still add AW.
