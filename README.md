# Simple Active Effect Sheet D&D5e

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FElfFriend-DnD%2Ffoundryvtt-simple-effect-sheet-5e%2Fmain%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)
![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FElfFriend-DnD%2Ffoundryvtt-simple-effect-sheet-5e%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fsimple-effect-sheet-5e&colorB=4aa94a)
[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fsimple-effect-sheet-5e%2Fshield%2Fendorsements)](https://www.foundryvtt-hub.com/package/simple-effect-sheet-5e/)
[![Foundry Hub Comments](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fsimple-effect-sheet-5e%2Fshield%2Fcomments)](https://www.foundryvtt-hub.com/package/simple-effect-sheet-5e/)

[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coke-%23FF5E5B)](https://ko-fi.com/elffriend)
[![patreon](https://img.shields.io/badge/-patreon-%23FF424D)](https://www.patreon.com/ElfFriend_DnD)

This module aims to extend the Active Effects sheet for dnd5e in a way that makes GM's lives easier and the whole mechanism simpler to understand.

## Core Principles/Assumptions

> All effects should originate from an Item. This Item represents how the effect came into being on the actor.
> One Item can contain One Effect

There are 2 kinds of active effect:
- Passive effects which always apply to the Actor they are a part of.
- Activated Effects which must be activated as a part of some other feature or item.

Activated Effects are applied as part of another item/feature/spell's usage.

Example Passive Effects:
- Cloak of Protection's +1 to AC and Saving Throws

Example Activated Effects:
- Mage Armor's change to the AC formula
- Barbarian's Rage bonus to weapon damage
- Bane, Bless, etc etc etc.

Some Activated Effects only ever target the user activating them, these should be applied to the user when the feature they are a part of is rolled.
- Barbarian Rage
- Comprehend Languages
- Alter Self

## UI changes

When an Item with any effect which is an Activated Effect attached and is not sole-ly self-targeting is rolled, the chat card will display a "Apply Active Effects" button that will apply the effects from the item to the selected token.

## Active Effect Sheet Overhaul

Active Effects have a new sheet which more readily categorizes them into "Activated" or "Passive" as well as makes it clear whether or not the AE will apply to the actor who rolls an item, or to a potential target.

Duration is completely useless and has been removed. (change my mind?)

## Actor Sheet Effect Display Overhaul

Active Effects will be displayed split into their two categories: Passive and Activated
For all effects, the change to the actor will be summarized.
For activated effects, only effects which have the Actor themself as the source will be displayed when not on (as opposed to items on the actor, to activate an item's effect, use the item).
For activated effects applied to the Actor, the source of that effect will be displayed (e.g. what spell and what actor did this to you?)


## Effect Behavior changes
Duration is fucking useless and confusing. We'll either figure out how to make it useful or completely remove it from the UI so it doesn't distract people.

An Activated effect does not need to exist on the Actor unless it is currently on. We will hide these from the actor if somehow they end up transferred to the Actor.

A Passive effect should not be toggleable. The item providing that effect should be unequiped/unattuned or the effect itself should be removed (or turned into an activated effect).

## Conditions
Some effects must break these assumptions, these are always conditions. Conditions originate from nowhere sometimes.

Other times, conditions originate from Activated Effects.

Conditions behave like activated effects, but items might want to use those conditions as a starting point for their own effects.

---

Active Effect Attributes:
- Skills
  - Check Bonus (slieght of hand +5)
  - Passive Bonus (passive +5)
- Individual Abilities
  - Check Bonus
  - Save Bonus
- All Abilities
  - Check Bonus
  - Save Bonus
- Senses
  - Darkvision
  - Blindsight
- Movement
  - All Speeds
  - Individual Speeds
- Damage
  - Vulnerabilities
  - Resistances
  - Immunities
- Condition Immunities
- Size
- AC
  - Bonus
  - Calc
  - Formula
- Initiative Modifier
- Weapon Attacks
  - Bonus to Hit
  - Bonus to Damage

--> Applies "Some Condition"

---

Bonuses: Targeted Effects. An add-on module which adds a panel when an item is rolled with activated effects to apply those effects to the token that was targeted at the time of usage. This does not replace anything, simply adds to.

Make Effects from Items editable always, in fact encouraged. If an Effect on an Actor has a source that is an Item, warn the user about editing that actor effect.

Derive Passive Active Effects from Items so there's no wierdness with editing the item's effect?

---

AE Data Model should not be modified.


### Item Effects
There are 2 main things on an Item's Active Effects that determine how they interact with the actor when applied

`transfer: boolean` - This determines if the effect is immediately put on the actor when the item is put on the actor.

`disabled: boolean` - This determines if that effect is active as soon as it is put on the actor.

An Effect with:
- `transfer: false` and `disabled: true` has no effect on anything
- `transfer: false` and `disabled: false` implies that this effect would be active on whatever it is applied to, but that it should not be applied to the owning actor by default (e.g. offensive abilities, a lot of effects should be this way)
- `transfer: true` and `disabled: true` is applied to the actor but left off until activated --> We assume this means the effect is one that is expected to apply to the owning actor but must be activated as part of an ability (most effects are this way)
- `transfer: true` and `disabled: false` is applied to the actor immedaitely and immediately activated --> We assume this means the effect is one which should always be applied to the actor, e.g. a passive effect from an item or other ability.

####  Initial Assumptions

We assume `transfer: true` and `disabled: true` means this effect should be an activated self effect. This assumption is incomplete.
- Fire Shield - True
- Barkskin - True
- Shield - True
- Rage - True

These have that combination of effect properties, but also have activation effects and target types other than `self`.
- Mage Armor - False
- Bless - False
- Bane - False


We assume `transfer: true` and `disabled: false` should be a passive self effect. EVEN if there is an activation condition on the item.
- Staff of Power - True --> Has Activation Condition on item but no target type.
- Robe of Archmagi - True
- Ring of Protection - True
- Cloak of Protection - True
- Bracers of Defense - True
- Unarmored Movement - True
- Ki: Empty Body - True
- Fighting Styles - True
- Fiendish Resilience - True

We assume `transfer: false` and any `disabled` means this should be a targeted effect.
- There are no examples of this in the SRD compendia

**Problem:** Spells like "Bane" and "Bless" are configured with `transfer: true` and `disabled: true`. These are clearly not self-effects as the parent item has a target of not 'self'


#### New Assumptions

We have to use the source item to determine if an effect is a `self` effect.

If there is no source item it should be a `self` effect as the effect was created directly on the actor. We assume this must allow toggling at will, therefore it is an "Activated Self Effect".

If the source item is not on this actor, it cannot be a self effect.

If the source item has a target of "self" and is on this actor, it must be a Self Effect.

IF an item is involved, the item's targeting must be the source of truth for the effect target.
- No Target Type: Self Effect? Don't think so. Weapons don't typically have target types. I would expect an effect on a weapon to be either able to apply to the 'self' (e.g. resistance to cold damage) or to the 'target' (e.g. you are poisoned)

IF no item is involved, the effect is a Self Effect and must be toggleable at will. (sketchy assumption)

If an Item is involved and that item has an activation condition and target type, use that target type.
If an Item is involved that does not have an activation condition, use "self".
If an Item is involved that does have an activation condition but does not have a target type, assume "self passive" but allow override to "targeted" -> "self" means `transfer: true` `disabled: false`; targeted means `transfer: false`


Core defines "temporary effects" as ones which have a duration. This is a reasonable approximation of our "activated effects". It does not cover a self-made effect which can be toggled at will.


When creating an effect on an item, pre-populate the duration field and target/type fields per the item details.


On the original item effect:
If `disabled: true` -> This is an inactive activated effect
If `disabled: false` -> This is a passive effect OR an active activated effect
If `disabled: false` and `transfer: true` -> This is a passive and self effect.
THEREFORE
If `disabled: false` but `transfer: false` -> This is an activated effect?
OR `disabled: true` ~~but `transfer: true`~~ -> This is an activated effect?

#### Getting Target/Type from Effect Data
|                   | `transfer: true`                     | `transfer: false`                       |
| ----------------- | ------------------------------------ | --------------------------------------- |
| `disabled: true`  | Type: **Active** \ Target: *Unknown* | Type: **Active** \ Target: **Targeted** |
| `disabled: false` | Type: **Passive** \ Target: **Self** | Type: **Active** \ Target: **Targeted** |


#### Making Effect Data from Target/Type
|                    | `type: passive`                           | `type: active`                       |
| ------------------ | ----------------------------------------- | ------------------------------------ |
| `target: targeted` | N/A (`disabled:false` / `transfer:false`) | `disabled: true` / `transfer: false` |
| `target: self`     | `disabled:false` / `transfer:true`        | `disabled: true` / `transfer: true`  |

Problem:
The actor effect once transferred is always `transfer: false`.

Goal is to display the effects on an actor as "Self / Targeted" and "Active / Passive"

If an effect came from an item and has a duration (and this duration may be derived if not), it is an "Active" effect.

Need entirely different logic between if the Actor is the parent or if the Item is the parent in order to keep the two somewhat in sync.
