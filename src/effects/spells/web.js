import { baseSpellEffect, generateStatusEffectChange } from "../specialSpells.js";
import DDBMacros from "../macros.js";
import { effectModules } from "../effects.js";

export async function webEffect(document) {

  if (!effectModules().activeAurasInstalled) {
    let effectWebRestrained = baseSpellEffect(document, document.name);
    effectWebRestrained.changes.push(generateStatusEffectChange("Restrained"));
    document.effects.push(effectWebRestrained);
    return document;
  }

  // if we have active auras use a more advanced macro
  const itemMacroText = await DDBMacros.loadMacroFile("generic", DDBMacros.MACROS.ACTIVE_AURAS.AA_CONDITION_ON_ENTRY.file);
  document = DDBMacros.generateItemMacroFlag(document, itemMacroText);

  let effect = baseSpellEffect(document, document.name);
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
  setProperty(effect, "duration.seconds", 3600);
  setProperty(effect, "flags.dae.macroRepeat", "startEveryTurn");
  DDBMacros.setMidiOnUseMacroFlag(document, "generic", DDBMacros.MACROS.ACTIVE_AURAS.AA_CONDITION_ON_ENTRY.file, ["preActiveEffects"]);

  setProperty(document, "flags.ddbimporter.effect", {
    applyStart: true,
    applyEntry: true,
    applyImmediate: false,
    everyEntry: false,
    allowVsRemoveCondition: true,
    removalCheck: "str",
    removalSave: null,
    saveRemoves: false,
    condition: "Restrained",
    save: document.system.save.ability,
    // sequencerFile: "jb2a.web.02",
  });

  document.effects.push(effect);
  document.system.actionType = "other";
  document.system.save.ability = "";

  return document;
}
