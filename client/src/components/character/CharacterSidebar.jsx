import React from 'react';
import { getEffectiveStats } from '../../utils/characterCalculations';
import characterService from '../../services/characterService';

const STATS = {
    str: 'Force',
    dex: 'Dextérité',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Sagesse',
    cha: 'Charisme'
};

const SKILLS = {
    'Acrobaties': 'dex',
    'Arcanes': 'int',
    'Athlétisme': 'str',
    'Discrétion': 'dex',
    'Dressage': 'wis',
    'Escamotage': 'dex',
    'Histoire': 'int',
    'Intimidation': 'cha',
    'Intuition': 'wis',
    'Investigation': 'int',
    'Médecine': 'wis',
    'Nature': 'int',
    'Perception': 'wis',
    'Persuasion': 'cha',
    'Religion': 'int',
    'Représentation': 'cha',
    'Supercherie': 'cha',
    'Survie': 'wis'
};

export default function CharacterSidebar({ character, onUpdate }) {
    const getMod = (val) => Math.floor((val - 10) / 2);

    const proficiencyBonus = 2 + Math.floor((character.level - 1) / 4);

    // Calculate effective stats (base + overrides)
    const stats = getEffectiveStats(character);

    // Parse overrides just for checking if a value is modified (for UI feedback)
    let overrides = {};
    try {
        overrides = typeof character.statsOverrides === 'string' ? JSON.parse(character.statsOverrides) : character.statsOverrides || {};
    } catch (e) { }

    const characterSkills = typeof character.skills === 'string' ? JSON.parse(character.skills) : character.skills;
    const skillsList = Array.isArray(characterSkills) ? characterSkills : [];

    const handleStatClick = async (key, currentVal, label) => {
        const newVal = window.prompt(`Modifier ${label} (actuel: ${currentVal})\nLaissez vide pour réinitialiser à la valeur calculée.`, currentVal);
        if (newVal === null) return;

        const newOverrides = { ...overrides };
        if (newVal.trim() === '') {
            delete newOverrides[key];
        } else {
            const num = parseInt(newVal);
            if (!isNaN(num)) {
                newOverrides[key] = num;
            }
        }

        try {
            await characterService.update(character.id, { statsOverrides: JSON.stringify(newOverrides) });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleSkillClick = async (skillName, currentMod) => {
        const key = `skill_${skillName}`;
        const existingOverride = overrides[key];
        const displayVal = existingOverride !== undefined ? existingOverride : currentMod;

        const newVal = window.prompt(`Modifier bonus ${skillName} (actuel: ${displayVal > 0 ? '+' : ''}${displayVal})\nLaissez vide pour réinitialiser.`, displayVal);
        if (newVal === null) return;

        const newOverrides = { ...overrides };
        if (newVal.trim() === '') {
            delete newOverrides[key];
        } else {
            const num = parseInt(newVal);
            if (!isNaN(num)) {
                newOverrides[key] = num;
            }
        }

        try {
            await characterService.update(character.id, { statsOverrides: JSON.stringify(newOverrides) });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour");
        }
    };

    return (
        <div className="bg-stone-200 p-2 md:p-4 border-r border-stone-400 flex flex-col gap-4 font-serif text-stone-900 overflow-y-auto h-full">

            {/* Attributes */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                {Object.entries(STATS).map(([key, label]) => {
                    const score = stats[key] || 10;
                    const mod = getMod(score);
                    const isOverridden = overrides[key] !== undefined;

                    return (
                        <div
                            key={key}
                            onClick={() => handleStatClick(key, score, label)}
                            className={`bg-white rounded-lg border p-2 text-center shadow-sm relative group cursor-pointer hover:bg-stone-50 transition ${isOverridden ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-400'}`}
                            title="Cliquez pour modifier manuellement"
                        >
                            <span className="text-[10px] md:text-xs uppercase font-bold text-stone-500 tracking-widest block mb-1">
                                {label}
                            </span>
                            <div className={`text-xl md:text-2xl font-bold leading-none ${isOverridden ? 'text-amber-700' : 'text-stone-800'}`}>
                                {mod > 0 ? '+' : ''}{mod}
                            </div>
                            <div className={`w-8 h-6 border rounded-full flex items-center justify-center mx-auto text-xs font-bold -mb-4 mt-1 relative z-10 ${isOverridden ? 'bg-amber-100 border-amber-500 text-amber-800' : 'bg-stone-100 border-stone-300 text-stone-600'}`}>
                                {score}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Saving Throws */}
            <div className="mt-4">
                <h3 className="font-bold text-stone-700 border-b border-stone-400 pb-1 mb-2 uppercase text-xs">Sauvegardes</h3>
                <div className="space-y-1 text-xs">
                    {Object.entries(STATS).map(([key, label]) => {
                        // Check override for save?
                        const saveKey = `save_${key}`;
                        const isProficient = false; // TODO: Check actual proficiencies
                        let mod = getMod(stats[key] || 10) + (isProficient ? proficiencyBonus : 0);

                        // Check override
                        if (overrides[saveKey] !== undefined) {
                            mod = overrides[saveKey];
                        }
                        const isOverridden = overrides[saveKey] !== undefined;

                        return (
                            <div
                                key={key}
                                onClick={() => handleStatClick(saveKey, mod, `Sauvegarde ${label}`)}
                                className={`flex justify-between items-center cursor-pointer hover:bg-stone-300/50 rounded px-1 -mx-1 ${isOverridden ? 'text-amber-700' : ''}`}
                                title="Cliquez pour modifier"
                            >
                                <span className={isProficient ? "font-bold" : ""}>{label}</span>
                                <span className={`font-mono ${isOverridden ? 'font-bold' : ''}`}>{mod > 0 ? '+' : ''}{mod}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Skills */}
            <div className="mt-4">
                <h3 className="font-bold text-stone-700 border-b border-stone-400 pb-1 mb-2 uppercase text-xs">Compétences</h3>
                <div className="space-y-1 text-xs">
                    {Object.entries(SKILLS).map(([skillName, statKey]) => {
                        const isProficient = skillsList.includes(skillName);
                        // Base calculation
                        let mod = getMod(stats[statKey] || 10) + (isProficient ? proficiencyBonus : 0);

                        // Override check
                        const overrideKey = `skill_${skillName}`;
                        const isOverridden = overrides[overrideKey] !== undefined;
                        if (isOverridden) {
                            mod = overrides[overrideKey];
                        }

                        return (
                            <div
                                key={skillName}
                                onClick={() => handleSkillClick(skillName, mod)}
                                className={`flex justify-between items-center cursor-pointer hover:bg-stone-300/50 rounded px-1 -mx-1 ${isOverridden ? 'text-amber-700 font-bold' : isProficient ? 'text-stone-900 font-bold bg-stone-300/50' : 'text-stone-600'}`}
                                title="Cliquez pour modifier"
                            >
                                <span className="flex items-center gap-1">
                                    {isProficient && <span className="text-[8px] text-amber-700">●</span>}
                                    {skillName} <span className="text-[8px] text-stone-400 uppercase ml-0.5">({statKey.substring(0, 3)})</span>
                                </span>
                                <span className="font-mono">{mod > 0 ? '+' : ''}{mod}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Passive Perception */}
            <div
                className={`rounded p-2 text-center mt-2 cursor-pointer hover:opacity-80 transition ${overrides.passive_perception !== undefined ? 'bg-amber-100 border border-amber-400' : 'bg-stone-300'}`}
                onClick={() => handleStatClick('passive_perception', 10 + getMod(stats.wis || 10) + (skillsList.includes('Perception') ? proficiencyBonus : 0), 'Perception Passive')}
            >
                <span className={`text-[10px] uppercase font-bold ${overrides.passive_perception !== undefined ? 'text-amber-800' : 'text-stone-600'}`}>Perception Passive</span>
                <div className={`font-bold text-lg ${overrides.passive_perception !== undefined ? 'text-amber-900' : 'text-stone-800'}`}>
                    {overrides.passive_perception !== undefined
                        ? overrides.passive_perception
                        : 10 + getMod(stats.wis || 10) + (skillsList.includes('Perception') ? proficiencyBonus : 0)
                    }
                </div>
            </div>

            {/* Proficiencies */}
            <div className="mt-4 pb-4">
                <h3 className="font-bold text-stone-700 border-b border-stone-400 pb-1 mb-2 uppercase text-xs">Maîtrises</h3>
                <div className="space-y-3 text-xs text-stone-600">
                    {(() => {
                        const profs = typeof character.proficiencies === 'string' ? JSON.parse(character.proficiencies) : character.proficiencies || {};
                        return (
                            <>
                                <div>
                                    <span className="font-bold text-stone-800 block mb-0.5">Armures</span>
                                    {profs.armor?.length > 0 ? profs.armor.join(', ') : <span className="italic text-stone-400">Aucune</span>}
                                </div>
                                <div>
                                    <span className="font-bold text-stone-800 block mb-0.5">Armes</span>
                                    {profs.weapons?.length > 0 ? profs.weapons.join(', ') : <span className="italic text-stone-400">Aucune</span>}
                                </div>
                                <div>
                                    <span className="font-bold text-stone-800 block mb-0.5">Outils</span>
                                    {profs.tools?.length > 0 ? profs.tools.join(', ') : <span className="italic text-stone-400">Aucune</span>}
                                </div>
                                <div>
                                    <span className="font-bold text-stone-800 block mb-0.5">Langues</span>
                                    {profs.languages?.length > 0 ? profs.languages.join(', ') : <span className="italic text-stone-400">Commun</span>}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

        </div>
    );
}
