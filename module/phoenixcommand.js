/**
 * A small arms combat system
 * Author: mbutler
 * Software License: MIT
 */

// Import Modules
import { PhoenixItemSheet } from "./item-sheet.js";
import { PhoenixActorSheet } from "./actor-sheet.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Phoenix Command`);

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.initiative.formula = "1d20";

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("phoenixcommand", PhoenixActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("phoenixcommand", PhoenixItemSheet, {makeDefault: true});
});
