import React from 'react';
import { calculateAC, calculateInitiative } from '../../utils/characterCalculations';

export default function CharacterHeader({ character, onLevelUp, isGM }) {
    if (!character) return null;

    // Safety parse
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};
    const proficiencyBonus = 2 + Math.floor((character.level - 1) / 4);

    // Dynamic calculations
    const ac = calculateAC(character);
    const initiative = calculateInitiative(character);

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

                        {(isGM || true) && ( // Allow level up for everyone for now or check perms
                            <button
                                onClick={onLevelUp}
                                className="ml-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-2 py-0.5 rounded-full shadow border border-amber-800 transition-colors uppercase tracking-wide"
                                title="Monter de niveau"
                            >
                                Level Up
                            </button>
                        )}
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

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Vitesse</span>
                    <div className="w-10 h-10 border-2 border-stone-400 rounded-lg flex items-center justify-center bg-white shadow-inner mt-1 font-bold text-lg">
                        {character.speed}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Initiative</span>
                    <div className="w-10 h-10 border-2 border-stone-400 rounded-lg flex items-center justify-center bg-white shadow-inner mt-1 font-bold text-lg">
                        {initiative >= 0 ? '+' : ''}{initiative}
                    </div>
                </div>

                <div className="flex flex-col items-center relative group">
                    <span className="text-[10px] uppercase text-green-700/70 font-bold tracking-widest">PV</span>
                    <div className="flex flex-col items-center justify-center bg-stone-100 border-2 border-green-700/50 rounded-lg h-12 min-w-[3rem] px-2 shadow-sm">
                        <span className="text-lg font-bold text-green-800 leading-none">{character.hpCurrent}</span>
                        <span className="text-[10px] text-stone-500 font-bold border-t border-stone-300 w-full text-center mt-0.5">/ {character.hpMax}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center relative group">
                    <span className="text-[10px] uppercase text-red-800/70 font-bold tracking-widest">CA</span>
                    <div className="w-12 h-12 bg-stone-800 border-2 border-stone-600 rounded-shield flex items-center justify-center text-white font-bold text-xl shadow-md mt-0 transform rotate-45 overflow-hidden">
                        <div className="transform -rotate-45">{ac}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
