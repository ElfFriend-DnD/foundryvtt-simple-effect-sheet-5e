import { SimpleEffectSheet5e } from '../simple-effect-sheet-5e.js'
import { SimpleEffect } from './simple-effect.js';

/**
 * Custom Active Effect Sheet
 */
export class SimpleEffectSheet5eSheet extends ActiveEffectConfig {

  /**
   * Register the Sheet and register any HBS Helpers
   */
  static init() {
    DocumentSheetConfig.registerSheet(ActiveEffect, "simple-effect-sheet-5e", SimpleEffectSheet5eSheet, {
      label: 'Simple Effect Sheet', makeDefault: false
    });

    loadTemplates([
      `modules/${SimpleEffectSheet5e.MODULE_NAME}/templates/simple-effect-sheet-sheet.hbs`
    ])

    Handlebars.registerHelper('simple-effect-sheet-radioBoxes', (name, choices, options) => {
      const checked = options.hash['checked'] || null;
      const localize = options.hash['localize'] || false;
      const disabled = options.hash['disabled'] || false;
      let html = "";
      for (let [key, label] of Object.entries(choices)) {
        if (localize) label = game.i18n.localize(label);
        const isChecked = checked === key;
        html += `<label class="checkbox"><input type="radio" name="${name}" value="${key}" ${isChecked ? "checked" : ""} ${disabled ? 'disabled' : ''}> ${label}</label>`;
      }
      return new Handlebars.SafeString(html);
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      closeOnSubmit: false,
      submitOnChange: true,
      classes: ["dnd5e", "sheet", "item", "active-effect-sheet", "simple-effect-sheet"],
    });
  }

  get title() {
    return `Easy Effect Config: ${this.object.data.label}`
  }

  get template() {
    return `modules/${SimpleEffectSheet5e.MODULE_NAME}/templates/simple-effect-sheet-sheet.hbs`
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.isEditable) html.find('img[data-edit]').click(ev => this._onEditImage(ev));
  }

  /**
   * Handle changing the actor profile image by opening a FilePicker
   * @private
   */
  _onEditImage(event) {
    const attr = event.currentTarget.dataset.edit;
    const current = getProperty(this.object.data, attr);
    const fp = new FilePicker({
      type: "image",
      current: current,
      callback: path => {
        event.currentTarget.src = path;
        this._onSubmit(event);
      },
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  getData(options) {
    const sheetData = super.getData(options);
    // const effect = this.object;
    // const effectData = this.object.data;

    // theory is this is EasyEffect now
    const easyEffect = this.object;

    if (easyEffect.isParentItem) {
      SimpleEffectSheet5e.log('Rendering Item Effect');
      // does this affect the item owner (self) or targets?
      // is this effect always on?
      // should this effect be prevented by attunement? --> I thing always yes?
      // should this effect be prevented by equipment? --> I think always yes.
    }

    if (easyEffect.isParentActor) {
      SimpleEffectSheet5e.log('Rendering Actor Effect');
      // basically readonly of the Item sheet?
      // is this effect always on? --> should be yes, otherwise there should be an item that can be rolled
    }

    // const targetTypeDerived = easyEffect.isParentItem || easyEffect.isSourceItem || (easyEffect.isParentActor && easyEffect.isParentOrigin);

    const targetType = this.data.transfer && this.data.disabled ? 'self' : easyEffect.targetType
    

    const ret = {
      applicationType: easyEffect.applicationType,
      applicationTypes: SimpleEffect.ApplicationTypes,
      changeOptionLookup: this.changeOptionLookup,
      changeOptions: this.changeOptions,
      changes: easyEffect.data.changes,
      derivedTargetType: easyEffect.derivedTargetType,
      durationType: easyEffect.durationType,
      durationTypes: SimpleEffect.DurationTypes,
      durationValue: easyEffect.durationValue,
      icon: easyEffect.data.icon,
      label: easyEffect.data.label,
      modes: sheetData.modes,
      originName: easyEffect.sourceName,
      targetType: easyEffect.targetType,
      targetTypes: SimpleEffect.TargetTypes,
    };

    SimpleEffectSheet5e.log({ easyEffect, effect: this.object, sheetData, ret });
    return ret;
  }

  _updateObject(event, formData) {
    const transfer = formData.applicationType === 'passive' || formData.targetType === 'self';
    const disabled = formData.applicationType !== 'passive';

    const otherDurations = Object.keys(SimpleEffect.DurationTypes).filter((key) => key !== formData.durationType);

    const duration = {
      [formData.durationType]: formData.durationValue,
    }

    // unset the other duration fields
    otherDurations.forEach(key => {
      duration[`-=${key}`] = null;
    });

    const updateData = {
      changes: formData.changes,
      label: formData.label,
      icon: formData.icon,
      tint: formData.tint,
      transfer,
      disabled,
      duration
    }


    SimpleEffectSheet5e.log('Updating Effect', { formData, updateData });

    return super._updateObject(event, updateData);
  }

  // optgroup: Abilities
  get abilityKeyOptions() {
    return Object.keys(CONFIG.DND5E.abilities).map((abilityKey) => {

      const checkBonus = `data.abilities.${abilityKey}.bonuses.check`;
      const checkBonusLabel = [CONFIG.DND5E.abilities[abilityKey], game.i18n.localize('DND5E.Ability'), game.i18n.localize('DND5E.AbilityCheckBonus')].join(' ');


      const saveBonus = `data.abilities.${abilityKey}.bonuses.save`;
      const saveBonusLabel = [CONFIG.DND5E.abilities[abilityKey], game.i18n.localize('DND5E.SaveBonus')].join(' ');

      const value = `data.abilities.${abilityKey}.value`; // sketchy
      const valueLabel = [CONFIG.DND5E.abilities[abilityKey], game.i18n.localize('DND5E.Ability')].join(' ');

      return [
        {
          key: checkBonus,
          label: checkBonusLabel,
        },
        {
          key: saveBonus,
          label: saveBonusLabel
        },
        {
          key: value,
          label: valueLabel,
        }
      ]

    }).flat();
  }

  // globals
  get globalAbilityOptions() {
    return [
      {
        key: 'data.bonuses.abilities.check',
        label: game.i18n.localize('DND5E.BonusAbilityCheck')
      },
      {
        key: 'data.bonuses.abilities.save',
        label: game.i18n.localize('DND5E.BonusAbilitySave')
      },
      {
        key: 'data.bonuses.abilities.skill',
        label: game.i18n.localize('DND5E.BonusAbilitySkill')
      },
    ]
  }

  // optgroup: AC
  // should some of these have 'select' instead of free form inputs?
  get acKeyOptions() {

    const acCalcValues = Object.keys(CONFIG.DND5E.armorClasses).reduce((acc, key) => {
      acc[key] = CONFIG.DND5E.armorClasses[key].label;
      return acc;
    }, {})

    return [
      {
        key: 'data.attributes.ac.bonus',
        label: `${game.i18n.localize('DND5E.ArmorClass')}: ${game.i18n.localize('DND5E.Bonus')}`
      },
      {
        key: 'data.attributes.ac.calc',
        label: `${game.i18n.localize('DND5E.ArmorClass')}: ${game.i18n.localize('DND5E.ArmorClassCalculation')}`,
        values: acCalcValues
      },
      {
        key: 'data.attributes.ac.formula',
        label: `${game.i18n.localize('DND5E.ArmorClass')}: ${game.i18n.localize('DND5E.ArmorClassFormula')}`
      },
      {
        key: 'data.attributes.ac.flat',
        label: `${game.i18n.localize('DND5E.ArmorClass')}: ${game.i18n.localize('DND5E.ArmorClassFlat')} ${game.i18n.localize('DND5E.ArmorClassFlat')}`
      }
    ]
  }

  // optgroup: Skills
  get initOption() {
    return {
      key: 'data.attributes.init.bonus',
      label: `${game.i18n.localize('DND5E.Initiative')}: ${game.i18n.localize('DND5E.Bonus')}`
    }
  }

  // optgroup: Physical Attributes
  get movementOptions() {
    return Object.keys(CONFIG.DND5E.movementTypes).map((movementKey) => {
      return {
        key: `data.attributes.movement.${movementKey}`,
        label: `${game.i18n.localize('DND5E.Speed')}: ${CONFIG.DND5E.movementTypes[movementKey]}`
      }
    })
  }

  get sensesOptions() {
    return Object.keys(CONFIG.DND5E.senses).map((senseKey) => {
      return {
        key: `data.attributes.senses.${senseKey}`,
        label: `${game.i18n.localize('DND5E.Senses')}: ${CONFIG.DND5E.senses[senseKey]}`
      }
    })
  }

  // optgroup: Combat Bonuses
  get attackBonusOptions() {
    return ["mwak", "rwak", "msak", "rsak"].map((weaponActionType) => {
      const preLabel = CONFIG.DND5E.itemActionTypes[weaponActionType];

      return [
        {
          key: `data.bonuses.${weaponActionType}.attack`,
          label: `${preLabel}: ${game.i18n.localize('DND5E.AttackRoll')} ${game.i18n.localize('DND5E.Bonus')}`
        },
        {
          key: `data.bonuses.${weaponActionType}.damage`,
          label: `${preLabel}: ${game.i18n.localize('DND5E.DamageRoll')} ${game.i18n.localize('DND5E.Bonus')}`
        },
      ]
    }).flat();
  }

  // spell dc bonus
  get saveBonusOption() {
    return {
      key: 'data.bonuses.spell.dc',
      label: game.i18n.localize('DND5E.BonusSpellDC'),
    }
  }

  // optgroup Skills
  get skillOptions() {
    return Object.keys(CONFIG.DND5E.skills).map((skillKey) => {
      const preLabel = CONFIG.DND5E.skills[skillKey];
      return [
        {
          key: `data.bonuses.skills.${skillKey}.bonuses.check`,
          label: `${preLabel}: ${game.i18n.localize('DND5E.SkillBonusCheck')}`
        },
        {
          key: `data.bonuses.skills.${skillKey}.bonuses.passive`,
          label: `${preLabel}: ${game.i18n.localize('DND5E.SkillBonusPassive')}`
        },
      ]
    }).flat();
  }

  // optgroup: Defenses
  // should some of these have 'select' instead of free form inputs?
  get defenseOptions() {
    return [
      {
        key: 'data.traits.ci.value',
        label: game.i18n.localize('DND5E.ConImm'),
        values: CONFIG.DND5E.conditionTypes
      },
      {
        key: 'data.traits.di.value',
        label: game.i18n.localize('DND5E.DamImm'),
        values: CONFIG.DND5E.damageTypes
      },
      {
        key: 'data.traits.dr.value',
        label: game.i18n.localize('DND5E.DamRes'),
        values: CONFIG.DND5E.damageTypes
      },
      {
        key: 'data.traits.dv.value',
        label: game.i18n.localize('DND5E.DamVuln'),
        values: CONFIG.DND5E.damageTypes
      }
    ]
  }

  get sizeOption() {
    return {
      key: 'data.traits.size',
      label: game.i18n.localize('DND5E.Size')
    }
  }

  static convertOptionsForLookup(inputArray) {
    return inputArray.reduce((acc, inputOption) => {
      acc[inputOption.key] = inputOption;
      return acc;
    }, {});
  }

  get changeOptionLookup() {
    return SimpleEffectSheet5eSheet.convertOptionsForLookup([
      ...this.abilityKeyOptions,
      ...this.globalAbilityOptions,
      ...this.skillOptions,
      this.initOption,
      ...this.acKeyOptions,
      ...this.defenseOptions,
      ...this.attackBonusOptions,
      this.saveBonusOption,
      ...this.movementOptions,
      ...this.sensesOptions,
      this.sizeOption
    ]);
  }

  get changeOptions() {
    return [
      {
        groupHeader: 'Abilities',
        options: [
          ...this.abilityKeyOptions,
          ...this.globalAbilityOptions,
        ]
      },
      {
        groupHeader: 'Skills',
        options: [
          ...this.skillOptions,
          this.initOption,
        ]
      },
      {
        groupHeader: 'Defensive',
        options: [
          ...this.acKeyOptions,
          ...this.defenseOptions,
        ]
      },
      {
        groupHeader: 'Offensive',
        options: [
          ...this.attackBonusOptions,
          this.saveBonusOption
        ]
      },
      {
        groupHeader: 'Misc',
        options: [
          ...this.movementOptions,
          ...this.sensesOptions,
          this.sizeOption
        ]
      }
    ];
  }
}
