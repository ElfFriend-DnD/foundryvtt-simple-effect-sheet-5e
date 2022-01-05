import { SimpleEffectSheet5e } from '../simple-effect-sheet-5e.js'
import { SimpleEffect } from './simple-effect.js';

/**
 * Handles all the logic related to Actors
 */
export class SimpleEffectSheet5eActor {

  constructor(actor) {
    this.actor = actor;
    this.actorSimpleEffectSheet = actor.effects;

    SimpleEffectSheet5e.log('SimpleEffectSheet5eActor constructor:', {
      actor: this.actor,
      actorSimpleEffectSheet: this.actorSimpleEffectSheet,
    });
  }

  get passiveItemActiveEffects() {
    return this.actorSimpleEffectSheet.filter(
      (easyEffect) => {
        return easyEffect.isPassiveItemEffect && easyEffect.isEffectActive
      }
    )
  }
  
  // this can false positive on active effects from an item on the owning actor when the item
  // is not equipped (e.g. an active item not equipped but rolled)
  get passiveItemSuppressedEffects() {
    return this.actorSimpleEffectSheet.filter(
      (easyEffect) => {
        return easyEffect.isPassiveItemEffect && !easyEffect.isEffectActive
      }
    )
  }

  get actorPassiveEffects() {
    // no such thing. all effects created directly on the actor must be manually toggled on/off and thus are "self active effects"?
  }

  get targetedActiveEffects() {
    return this.actorSimpleEffectSheet.filter(
      (easyEffect) => {
        return !easyEffect.isPassiveItemEffect && easyEffect.isEffectActive && !easyEffect.isSelfEffect
      }
    )
  }

  get selfActiveEffects() {
    return this.actorSimpleEffectSheet.filter(
      (easyEffect) => {
        return !easyEffect.isPassiveItemEffect && easyEffect.isEffectActive && easyEffect.isSelfEffect
      }
    )
  }
}

export class SimpleEffectSheet5eActorSheet {

  constructor(actor, html) {
    this.actor = actor;
    this.easyEffectActor = new SimpleEffectSheet5eActor(actor);
    this.html = html;
    this.targetTab = $(html).find('.tab.effects');
  }

  static init() {
    Hooks.on('renderActorSheet', (app, html) => {

      const actor = app.actor;

      const easyEffectsActorSheet = new SimpleEffectSheet5eActorSheet(actor, html);

      easyEffectsActorSheet.replaceTab();
    })
  }

  async replaceTab() {

    if (!this.targetTab) {
      return;
    }
    
    SimpleEffectSheet5e.log('Replacing Tab:', {
      html: this.html,
      tab: this.targetTab,
      actor: this.easyEffectActor,
      effects: this.easyEffectActor.actorSimpleEffectSheet,
    });

    const effectsCategories = {
      passiveItemEffects: this.easyEffectActor.passiveItemActiveEffects,
      inactivePassiveItemEffects: this.easyEffectActor.passiveItemSuppressedEffects,
      targetedActiveEffects: this.easyEffectActor.targetedActiveEffects,
      selfActiveEffects: this.easyEffectActor.selfActiveEffects,
    }

    SimpleEffectSheet5e.log('Actor Effects:', effectsCategories);

    const newHtml = await renderTemplate(`modules/${SimpleEffectSheet5e.MODULE_NAME}/templates/simple-effect-sheet-actor-tab.hbs`, effectsCategories);

    this.targetTab.html(newHtml);
  }
}
