import {SimpleEffectSheet5e} from '../simple-effect-sheet-5e.js'
import ActiveEffect5e from '../../../../systems/dnd5e/module/active-effect.js'

class SimpleActiveEffect extends ActiveEffect5e {
  /**
   * A cached reference to the source document to avoid recurring database lookups
   */
  _sourceDocument = null;

  
  async _getSourceDocument() {
    if (this._sourceDocument) return this._sourceDocument;
    if (!this.data.origin) return this._sourceDocument = null;

    const source = await fromUuid(this.data.origin);
    return this._sourceDocument = source ?? null;
  }


  /**
   * A cached property for obtaining the source name
   */
  get source() {
    if (this._sourceDocument === null) return this._getSourceDocument();
    return this._sourceDocument;
  }

  get sourceTransferredEffects() {
    if (this.source instanceof Item) {
      return this.source.transferredEffects;
    }
    return [];
  }

  /**
   * If this effect has a corresponding effect in the sourceTranferredEffects, we know it was transferred
   */
  get transferredFromSource() {
    return this.sourceTransferredEffects
      .some((effect) => effect.uuid === this.data.flags?.[SimpleEffectSheet5e.MODULE_NAME]?.sourceId)
  }

  get sourceName() {
    if (this.source === null) return "Unknown";
    return this.source?.name ?? "Unknown";
  }

  get isSourceItem() {
    // Brittle.
    // return this.effect.data.origin.includes('Item');

    return this.source?.documentName === 'Item';
  }

  get isSourceActor() {
    // Brittle
    // return this.effect.data.origin.includes('Actor') && !this.effect.data.origin.includes('Item');

    return this.source?.documentName === 'Actor';
  }

  /**
   * Assertion: Disabled is something which should not be possible for effects attached to Items.
   */
  get isEffectActive() {
    return !this.isSuppressed && !this.data.disabled;
  }

  get isParentOrigin() {
    return this.data.origin === this.parent.uuid;
  }

  get isParentItem() {
    return this.parent.documentName === 'Item';
  }

  get isParentActor() {
    return this.parent.documentName === 'Actor';
  }

  /**
   * We define "Passive" effects as one which is from an item which has no activation conditions.
   */
  get isPassiveItemEffect() {
    // disabled effects are not passive as they must be manually toggled
    if (this.data.disabled) {
      return false;
    }

    if (this.isParentItem) {
      return !this.parent.data.data.activation?.type || this.parent.data.data.activation?.type === 'none'
    }

    if (this.isSourceItem) {
      return !this.source.data.data.activation?.type || this.source.data.data.activation?.type === 'none'
    }

    return false;
  }

  // /**
  //  * We define "Passive Effect" as one which always takes effect for the parent Actor
  //  * once the Item requirements are met (isEffectActive).
  //  * 
  //  * - When configuring, this is "Transfer to Actor" and not "Suppressed" aka Disabled
  //  * - When on the actor, the transferred field is set to `false` by core, so we have to check 
  //  * the original item for its transferred effects
  //  */
  // get isPassiveEffect() {

  //   if (this.isParentItem) {
  //     return !this.parent.data.data.activation.type || this.parent.data.data.activation.type === 'none'
  //   }

  //   if (this.isSourceItem) {
  //     return !this.source.data.data.activation.type || this.source.data.data.activation.type === 'none'
  //   }
  //   // transfer is always false for effects on an actor, even those that were created from an item
  //   // so i need some other way to tell that the effect is only ever meant to be passive
  //   return (!!this.data.transfer || this.transferredFromSource) && !this.data.disabled;
  // }

  /**
   * This might be entirely derive-able? if parent/source is an item
   * it is unreliable to get the source of the effect, we instead must have data about this on the effect
   * @deprecated
   */
  get isSelfEffect() {
    // passive effects only ever affect the Origin's parent
    if (this.isPassiveEffect) {
      return true;
    }

    // if this Actor Effect originates from the Actor itself, yes
    if (this.isParentActor && this.isParentOrigin) {
      return true;
    }

  }


  /**
   * is this also derived from item usage???
   * 
   * We define 'application types' as:
   * - "Passive" meaning always applied the owning actor
   * - "Activated" meaning has to be applied as part of an item usage/roll
   */
   get applicationType() {
    // if this Effect originates from an Actor it is assumed to be active to allow toggling
    if (this.isSourceActor) {
      return 'active'
    }

    // any effect marked as 'disabled' is activatable e.g. Rage, Bless
    if (this.data.disabled) {
      return 'active'
    }

    // e.g. Cloak of Protection
    if (!this.data.disabled && this.data.transfer) {
      return 'passive'
    }

    // no SRD examples
    if (!this.data.disabled && !this.data.transfer) {
      return 'active'
    }

    // switch (true) {
    //   case this.isPassiveEffect:
    //     return 'passive';
    //   default:
    //     return 'active';
    // }
  }

  /**
   * Get Target Type from the effect data, See readme for table
   * 
   * 
   * 
   * We define target types as:
   * - "Self" meaning either the effect was created on the Actor or the Origin Item is "self" targeting; this effect will only ever affect the Origin's Actor parent
   * - "Targets" meaning that it is possible to affect other Actors
   */
  get targetType() {
    // if this Actor Effect originates from the Actor itself, self
    if (this.isParentActor && this.isParentOrigin) {
      return 'self';
    }

    if (!this.data.transfer) {
      return 'targetable';
    }

    if (this.data.transfer && !this.data.disabled) {
      return 'self';
    }

    if (this.data.transfer && this.data.disabled) {
      // we default to `self` in this case for the form, providing a prompt about the suggestion

      // this is uncertain and should instead by `this.derivedTargetType` for actual operations
      return this.derivedTargetType;
    }
  }

  /**
   * Derive the TargetType for this effect:
   * Targeted if the source is an item and that item has a target type and it is not 'self'
   * Self if:
   *  - This is a passive effect
   *  - The source Item has a target type of "self"
   *  - The source Item has no target type
   */
  get derivedTargetType() {
    if (!this.isParentItem && !this.isSourceItem) {
      return 'self'
    }

    if (this.isPassiveItemEffect) {
      return 'self'
    }

    let sourceItem;

    if (this.isParentItem) {
      sourceItem = this.parent;
    }

    if (this.isSourceItem) {
      sourceItem = this.source;
    }

    // if the source item has an activation and a target type that isn't 'self'
    if (
      !!sourceItem.data.data?.activation?.type && 
      !!sourceItem.data.data?.target?.type && 
      sourceItem.data.data?.target?.type !== 'self'
    ) {
      return 'targeted'
    }

    return 'self'
  }

  get itemDuration() {
    let itemData;
    if (this.isParentItem) {
      itemData = this.parent;
    }
    if (this.isSourceItem) {
      itemData = this.source;
    }

    if (!!itemData?.data.data.duration?.value) {

      let duration = {};

      switch (itemData.data.data.duration.units) {
        case 'hour':
          duration.seconds = itemData.data.data.duration?.value * 60 * 60;
        case 'minute':
          duration.seconds = itemData.data.data.duration?.value * 60;
        case 'day':
          duration.seconds = itemData.data.data.duration?.value * 60 * 60 * 24;
        case 'month':
          duration.seconds = itemData.data.data.duration?.value * 60 * 60 * 24 * 28;
        case 'year':
          duration.seconds = itemData.data.data.duration?.value * 60 * 60 * 24 * 365;
        case 'turn':
          duration.turns = itemData.data.data.duration?.value;
        case 'round':
          duration.rounds = itemData.data.data.duration?.value;
      }

      return {
        ...duration
      }
    }
  }

  get derivedDuration() {
    if (this.isSourceActor) {
      return this.data.duration;
    }

    if (!!this.data.duration?.rounds || !!this.data.duration?.turns || !!this.data.duration?.seconds) {
      return this.data.duration;
    }

    if (this.isParentItem || this.isSourceItem) {
      return {
        ...this.data.duration,
        ...this.itemDuration
      }
    }
  }

  /**
   * This can probably come from the item creating the active effect?
   */
  get durationType() {
    if (!!this.data.duration.seconds) {
      return 'seconds';
    }

    if (!!this.data.duration.rounds) {
      return 'rounds';
    }

    if (!!this.data.duration.turns) {
      return 'turns';
    }
  }

  get durationValue() {
    switch (this.durationType) {
      case 'seconds':
        return this.data.duration.seconds;
      case 'rounds':
        return this.data.duration.rounds;
      case 'turns':
        return this.data.duration.turns;
    }
  }

}

export function setupSimpleEffect() {
  CONFIG.ActiveEffect.documentClass = SimpleActiveEffect;
}

export class SimpleEffect {
  
  // TODO: Localize
  static ApplicationTypes = {
    passive: 'Passive',
    active: 'Active'
  }

  static TargetTypes = {
    self: 'Self',
    targetable: 'Targetable'
  }

  static DurationTypes = {
    seconds: 'Seconds',
    rounds: 'Rounds',
    turns: 'Turns',
  }
}