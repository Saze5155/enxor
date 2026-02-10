import React from 'react';

export default function SpellsTab({ character }) {
    const spells = character.spells || [];

    // Group by level
    const spellsByLevel = spells.reduce((acc, spell) => {
        const lvl = spell.level || 0;
        if (!acc[lvl]) acc[lvl] = [];
        acc[lvl].push(spell);
        return acc;
    }, {});

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center bg-stone-200 p-2 rounded border border-stone-300">
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500">Mod. Incantation</span>
                    <div className="text-xl font-bold text-stone-800">+3</div> {/* Mock */}
                </div>
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500">DD Sauvegarde</span>
                    <div className="text-xl font-bold text-stone-800">13</div> {/* Mock */}
                </div>
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500">Bonus Attaque</span>
                    <div className="text-xl font-bold text-stone-800">+5</div> {/* Mock */}
                </div>
            </div>

            {/* Cantrips (Level 0) */}
            <SpellLevelSection level={0} spells={spellsByLevel[0]} />

            {/* Level 1+ */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                <SpellLevelSection key={lvl} level={lvl} spells={spellsByLevel[lvl]} />
            ))}
        </div>
    );
}

function SpellLevelSection({ level, spells = [] }) {
    if (!spells.length && level > 0) return null; // Hide empty levels except cantrips?

    return (
        <div className="bg-white border border-stone-300 rounded overflow-hidden shadow-sm">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex justify-between items-center">
                <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider">
                    {level === 0 ? 'Tours de Magie (Niveau 0)' : `Niveau ${level}`}
                </h3>
                {level > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-stone-400">Emplacements</span>
                        <div className="flex gap-1">
                            <input type="checkbox" className="w-3 h-3 accent-indigo-600" />
                            <input type="checkbox" className="w-3 h-3 accent-indigo-600" />
                        </div>
                    </div>
                )}
            </div>
            <div className="divide-y divide-stone-100">
                {spells.length > 0 ? spells.map((spell, i) => (
                    <div key={i} className="px-4 py-2 hover:bg-stone-50 flex justify-between items-center">
                        <div>
                            <span className="font-bold text-sm text-stone-800">{spell.name}</span>
                            {spell.isPrepared && <span className="text-[10px] text-green-600 ml-2 font-bold uppercase">Préparé</span>}
                        </div>
                        <button className="text-[10px] bg-stone-200 hover:bg-white border border-stone-300 px-2 py-0.5 rounded text-stone-600">
                            Détails
                        </button>
                    </div>
                )) : (
                    <div className="px-4 py-3 text-center text-stone-400 text-xs italic">
                        Aucun sort connu.
                    </div>
                )}
            </div>
        </div>
    );
}
