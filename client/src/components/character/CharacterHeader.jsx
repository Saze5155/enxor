import React, { useState } from 'react';
import { calculateAC, calculateInitiative, getEffectiveStats } from '../../utils/characterCalculations';
import characterService from '../../services/characterService';

export default function CharacterHeader({ character, onLevelUp, isGM, onUpdate }) {
    if (!character) return null;

    // Safety parse
    const stats = getEffectiveStats(character);
    const proficiencyBonus = 2 + Math.floor((character.level - 1) / 4);

    // Initial check for overrides to show visual feedback (optional)
    let overrides = {};
    try {
        overrides = typeof character.statsOverrides === 'string' ? JSON.parse(character.statsOverrides) : character.statsOverrides || {};
    } catch { }

    // Dynamic calculations
    const ac = calculateAC(character);
    const initiative = calculateInitiative(character);

    // Handle updates
    const handleValueUpdate = async (field, isOverride, currentVal, label) => {
        // Only allow edit if GM or Owner (Owner check implicitly done by not being readonly? Actually currently Header allows edits by anyone who sees it)
        // Let's keep it open for now or check isGM inside if we wanted restrict.
        const newVal = window.prompt(`Modifier ${label} (actuel: ${currentVal})\n${isOverride ? 'Laissez vide pour réinitialiser.' : 'Entrez une nouvelle valeur.'}`, currentVal);
        if (newVal === null) return;

        let updateData = {};

        if (isOverride) {
            // Update statsOverrides
            const newOverrides = { ...overrides };
            if (newVal.trim() === '') {
                delete newOverrides[field];
            } else {
                const num = parseInt(newVal);
                if (!isNaN(num)) newOverrides[field] = num;
            }
            updateData = { statsOverrides: JSON.stringify(newOverrides) };
        } else {
            // Update direct field
            const num = parseInt(newVal);
            if (!isNaN(num)) {
                updateData[field] = num;
            }
        }

        try {
            await characterService.update(character.id, updateData);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error updating header stats", error);
            alert("Erreur lors de la mise à jour");
        }
    };



    return (
        <div className="p-4 border-b-2 border-stone-400 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 bg-[#fdf6e3]/90">
            <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-20 h-20 bg-stone-300 rounded-full border-4 border-stone-600 flex items-center justify-center text-3xl shadow-lg overflow-hidden">
                        {character.avatarUrl ? (
                            <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-stone-500">👤</span>
                        )}
                    </div>
                    {/* Level Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-stone-800 text-stone-100 text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-amber-600 shadow-md">
                        {character.level}
                    </div>
                </div>

                {/* Identity */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold uppercase tracking-wider text-stone-900 leading-none font-cinzel">
                        {character.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-stone-700 font-bold italic text-sm mt-1 font-serif">
                        <span>{character.race}</span>
                        <span className="text-amber-700">•</span>
                        <span>{character.class} {character.subClass ? `(${character.subClass})` : ''}</span>


                        <button
                            onClick={onLevelUp}
                            className="ml-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-2 py-0.5 rounded-full shadow border border-amber-800 transition-colors uppercase tracking-wide"
                            title="Monter de niveau"
                        >
                            Level Up
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex gap-4 text-center font-serif text-stone-800">

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Inspiration</span>
                    <div className="w-10 h-10 border-2 border-stone-400 rounded-lg flex items-center justify-center bg-white shadow-inner mt-1">
                        <input type="checkbox" className="w-5 h-5 accent-red-800 cursor-pointer" />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Maîtrise</span>
                    <div className="w-10 h-10 border-2 border-stone-400 rounded-lg flex items-center justify-center bg-white shadow-inner mt-1 font-bold text-lg">
                        +{proficiencyBonus}
                    </div>
                </div>

                <div
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
                    onClick={() => handleValueUpdate('speed', false, character.speed, 'Vitesse')}
                    title="Modifier la Vitesse"
                >
                    <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Vitesse</span>
                    <div className="w-10 h-10 border-2 border-stone-400 rounded-lg flex items-center justify-center bg-white shadow-inner mt-1 font-bold text-lg">
                        {character.speed}
                    </div>
                </div>

                <div
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
                    onClick={() => handleValueUpdate('init_override', true, initiative, 'Initiative')}
                    title="Modifier l'Initiative (Override)"
                >
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${overrides.init_override !== undefined ? 'text-amber-700' : 'text-stone-500'}`}>Initiative</span>
                    <div className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center shadow-inner mt-1 font-bold text-lg ${overrides.init_override !== undefined ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-stone-400'}`}>
                        {initiative >= 0 ? '+' : ''}{initiative}
                    </div>
                </div>

                <div className="flex flex-col items-center relative group">
                    <span className="text-[10px] uppercase text-green-700/70 font-bold tracking-widest">PV</span>
                    <div className="flex flex-col items-center justify-center bg-stone-100 border-2 border-green-700/50 rounded-lg h-12 min-w-[3rem] px-2 shadow-sm">
                        <span
                            className="text-lg font-bold text-green-800 leading-none cursor-pointer hover:underline"
                            onClick={() => handleValueUpdate('hpCurrent', false, character.hpCurrent, 'PV Actuels')}
                            title="Modifier PV Actuels"
                        >
                            {character.hpCurrent}
                        </span>
                        <span
                            className="text-[10px] text-stone-500 font-bold border-t border-stone-300 w-full text-center mt-0.5 cursor-pointer hover:text-stone-700"
                            onClick={() => handleValueUpdate('hpMax', false, character.hpMax, 'PV Max')}
                            title="Modifier PV Max"
                        >
                            / {character.hpMax}
                        </span>
                    </div>
                </div>

                <div
                    className="flex flex-col items-center relative group cursor-pointer hover:scale-105 transition transform"
                    onClick={() => handleValueUpdate('ac_override', true, ac, 'Classe d\'Armure')}
                    title="Modifier la CA (Override)"
                >
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${overrides.ac_override !== undefined ? 'text-amber-700' : 'text-red-800/70'}`}>CA</span>
                    <div className={`w-12 h-12 border-2 rounded-shield flex items-center justify-center font-bold text-xl shadow-md mt-0 transform rotate-45 overflow-hidden ${overrides.ac_override !== undefined ? 'bg-amber-800 border-amber-600 text-white' : 'bg-stone-800 border-stone-600 text-white'}`}>
                        <div className="transform -rotate-45">{ac}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
