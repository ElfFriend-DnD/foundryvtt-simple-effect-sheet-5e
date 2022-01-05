import { SimpleEffectSheet5eActorSheet } from "./classes/actor.js";
import { SimpleEffectSheet5eSheet } from "./classes/simple-effect-sheet.js";
import { setupSimpleEffect } from "./classes/simple-effect.js";

export class SimpleEffectSheet5e {
  static MODULE_NAME = "simple-effect-sheet-5e";
  static MODULE_TITLE = "Simple Effect Sheet DnD5e";

  static log(...args) {
    if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.MODULE_NAME)) {
      console.log(this.MODULE_TITLE, '|', ...args);
    }
  }
}

Hooks.on('init', () => {
  console.log(`${SimpleEffectSheet5e.MODULE_NAME} | Initializing ${SimpleEffectSheet5e.MODULE_TITLE}`);

  setupSimpleEffect();
})

Hooks.on("ready", async () => {

  // initialize item hooks
  SimpleEffectSheet5eItem.init();

  // initialize sheet
  SimpleEffectSheet5eSheet.init();

  SimpleEffectSheet5eActorSheet.init();

});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(SimpleEffectSheet5e.MODULE_NAME);
});

// initialize chat hooks
SimpleEffectSheet5eChat.init();

// initialize canvas hooks
SimpleEffectSheet5eCanvas.init();
