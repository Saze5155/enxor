import React from 'react';

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

export default function CharacterSidebar({ character }) {
    const getMod = (val) => Math.floor((val - 10) / 2);
    const formatMod = (val) => {
        const mod = getMod(val);
        return mod > 0 ? `+${mod}` : mod;
    };

    const proficiencyBonus = 2 + Math.floor((character.level - 1) / 4);

    // Safety parse
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};
    const characterSkills = typeof character.skills === 'string' ? JSON.parse(character.skills) : character.skills;
    const skillsList = Array.isArray(characterSkills) ? characterSkills : [];

    return (
        <div className="bg-stone-200 p-2 md:p-4 border-r border-stone-400 flex flex-col gap-4 font-serif text-stone-900 overflow-y-auto h-full">

            {/* Attributes */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                {Object.entries(STATS).map(([key, label]) => {
                    const score = stats[key] || 10;
                    const mod = getMod(score);

                    return (
                        <div key={key} className="bg-white rounded-lg border border-stone-400 p-2 text-center shadow-sm relative group">
                            <span className="text-[10px] md:text-xs uppercase font-bold text-stone-500 tracking-widest block mb-1">
                                {label}
                            </span>
                            <div className="text-xl md:text-2xl font-bold text-stone-800 leading-none">
                                {mod > 0 ? '+' : ''}{mod}
                            </div>
                            <div className="w-8 h-6 bg-stone-100 border border-stone-300 rounded-full flex items-center justify-center mx-auto text-xs font-bold text-stone-600 -mb-4 mt-1 relative z-10">
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
                        // Check proficiency (mock logic: class based or stored in data)
                        // For now, simple display
                        const isProficient = false; // TODO: Check actual proficiencies
                        const mod = getMod(stats[key] || 10) + (isProficient ? proficiencyBonus : 0);
                        return (
                            <div key={key} className="flex justify-between items-center">
                                <span className={isProficient ? "font-bold" : ""}>{label}</span>
                                <span className="font-mono">{mod > 0 ? '+' : ''}{mod}</span>
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
                        const mod = getMod(stats[statKey] || 10) + (isProficient ? proficiencyBonus : 0);

                        return (
                            <div key={skillName} className={`flex justify-between items-center ${isProficient ? 'text-stone-900 font-bold bg-stone-300/50 rounded px-1' : 'text-stone-600'}`}>
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
            <div className="bg-stone-300 rounded p-2 text-center mt-2">
                <span className="text-[10px] uppercase font-bold text-stone-600">Perception Passive</span>
                <div className="font-bold text-lg text-stone-800">
                    {10 + getMod(stats.wis || 10) + (skillsList.includes('Perception') ? proficiencyBonus : 0)}
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
