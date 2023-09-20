import { baseSpellEffect, generateStatusEffectChange } from "../specialSpells.js";
import DDBMacros from "../macros.js";
import { effectModules } from "../effects.js";

export async function greaseEffect(document) {

  if (!effectModules().activeAurasInstalled) {
    let effect = baseSpellEffect(document, document.name);
    effect.changes.push(generateStatusEffectChange("Prone"));
    document.effects.push(effect);

    return document;
  }

  // if we have active auras use a more advanced macro
  let effect = baseSpellEffect(document, document.name);
  // effect.changes.push(generateStatusEffectChange("Prone", 20, true));
  effect.changes.push(
    {
      key: "flags.midi-qol.OverTime",
      mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
      value: `turn=end,label=${document.name},saveRemove=false,saveDC=@attributes.spelldc,saveAbility=dex,saveDamage=nodamage,killAnim=true,macro=${DDBMacros.MACROS.ACTIVE_AURAS.AA_CONDITION_ON_ENTRY.name}`,
      priority: "20",
    },
  );

  const itemMacroText = await DDBMacros.loadMacroFile("generic", DDBMacros.MACROS.ACTIVE_AURAS.AA_CONDITION_ON_ENTRY.file);
  document = DDBMacros.generateItemMacroFlag(document, itemMacroText);
  DDBMacros.setMidiOnUseMacroFlag(document, "generic", DDBMacros.MACROS.ACTIVE_AURAS.AA_CONDITION_ON_ENTRY.file, ["preActiveEffects"]);
  effect.changes.push(DDBMacros.generateMacroChange({ macroValues: "@item.level @attributes.spelldc", macroType: "generic", macroName: DDBMacros.MACROS.ACTIVE_AURAS.AA_CONDITION_ON_ENTRY.file }));

  effect.flags["ActiveAuras"] = {
    isAura: true,
    aura: "All",
    radius: null,
    alignment: "",
    type: "",
    ignoreSelf: false,
    height: false,
    hidden: false,
    // hostile: true,
    onlyOnce: false,
    save: "dex",
    savedc: null,
    displayTemp: true,
  };
  setProperty(effect, "duration.seconds", 60);
  // setProperty(effect, "flags.dae.macroRepeat", "startEveryTurn");
  const aaMacroFlags = {
    applyStart: true,
    applyEnd: true,
    applyEntry: true,
    applyImmediate: true,
    everyEntry: true,
    removeOnOff: false,
    allowVsRemoveCondition: false,
    removalCheck: null,
    removalSave: null,
    saveRemoves: false,
    condition: "Prone",
    save: document.system.save.ability,
    sequencerFile: "jb2a.grease.dark_green.loop",
  };
  setProperty(document, "flags.ddbimporter.effect", aaMacroFlags);
  setProperty(effect, "flags.ddbimporter.effect", aaMacroFlags);

  document.effects.push(effect);

  return document;
}
