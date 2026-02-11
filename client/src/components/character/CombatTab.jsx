import React from 'react';

export default function CombatTab({ character }) {
    // Safety parse
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};

    // Combat calculations
    const getMod = (val) => Math.floor(((val || 10) - 10) / 2); // Safety fallback
    const strMod = getMod(stats.str);
    const dexMod = getMod(stats.dex);
    const proficiencyBonus = 2 + Math.floor(((character.level || 1) - 1) / 4);

    const inventory = character.inventory || []; // Restored
    // Filter weapons
    const weapons = inventory.filter(item => (item.type === 'weapon' || item.type === 'arme') && item.isEquipped);

    // ...

    return (
        <div className="p-4 space-y-6">
            {/* ... Vitals ... */}

            {/* Attacks Section */}
            <div className="bg-white border-2 border-stone-300 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-stone-200 px-4 py-2 border-b border-stone-300 flex justify-between items-center">
                    <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider">Attaques & Incantations</h3>
                    <button className="text-[10px] bg-stone-300 hover:bg-stone-400 px-2 py-1 rounded text-stone-700 uppercase font-bold">
                        + Ajouter
                    </button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-stone-100 text-[10px] text-stone-500 uppercase tracking-wider border-b border-stone-200">
                            <th className="px-4 py-2 font-medium">Nom</th>
                            <th className="px-4 py-2 font-medium text-center">Bonus</th>
                            <th className="px-4 py-2 font-medium">Dégâts / Type</th>
                            <th className="px-4 py-2 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {weapons.length > 0 ? weapons.map((wpn, i) => {
                            const isFinesse = wpn.properties && wpn.properties.toLowerCase().includes('finesse');
                            const isRanged = wpn.properties && (wpn.properties.toLowerCase().includes('distance') || wpn.properties.toLowerCase().includes('portée'));
                            const useDex = isFinesse || isRanged || (wpn.name.toLowerCase().includes('arc')) || (wpn.name.toLowerCase().includes('arbalète')) || (wpn.name.toLowerCase().includes('dague')); // Dagger acts as finesse often

                            const statMod = useDex ? dexMod : strMod;
                            const isProficient = true; // Todo: check vs proficiencies
                            const attackBonus = statMod + (isProficient ? proficiencyBonus : 0);
                            const damageMod = statMod;

                            const displayDamage = wpn.damage ? `${wpn.damage} ${damageMod >= 0 ? '+' : ''}${damageMod}` : `1d? ${damageMod >= 0 ? '+' : ''}${damageMod}`;

                            return (
                                <tr key={i} className="hover:bg-stone-50/50">
                                    <td className="px-4 py-3 font-bold text-stone-800">
                                        {wpn.name}
                                        {wpn.properties && <div className="text-[10px] text-stone-500 font-normal">{wpn.properties}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-center font-mono text-stone-600 font-bold">
                                        {attackBonus >= 0 ? '+' : ''}{attackBonus}
                                    </td>
                                    <td className="px-4 py-3 text-stone-600">
                                        <span className="font-mono text-stone-800 font-bold">{displayDamage}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-red-800 hover:bg-red-700 text-white text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1 ml-auto">
                                            <span>🎲</span> <span className="hidden md:inline">Attaquer</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-4 text-center text-stone-400 italic">
                                    Aucune arme équipée. Allez dans l'inventaire.
                                </td>
                            </tr>
                        )}
                        {/* Placeholder for Unarmed Strike */}
                        <tr className="hover:bg-stone-50/50">
                            <td className="px-4 py-3 font-bold text-stone-800">Mains nues</td>
                            <td className="px-4 py-3 text-center font-mono text-stone-600">+{Math.floor(((stats.str || 10) - 10) / 2) + 2}</td>
                            <td className="px-4 py-3 text-stone-600">
                                <span className="font-mono text-stone-800 font-bold">1 + {Math.floor(((stats.str || 10) - 10) / 2)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button className="bg-stone-500 hover:bg-stone-600 text-white text-xs px-2 py-1 rounded shadow-sm">
                                    🎲
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Actions / Traits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Actions */}
                <div className="bg-white border border-stone-300 rounded p-3 shadow-sm">
                    <h4 className="font-bold text-stone-600 border-b border-stone-200 pb-1 mb-2 text-xs uppercase">Actions</h4>
                    <ul className="space-y-1 text-xs text-stone-700">
                        <li><strong>Attaquer:</strong> Faire une attaque avec une arme.</li>
                        <li><strong>Foncer:</strong> Doubler votre vitesse.</li>
                        <li><strong>Se désengager:</strong> Vos mouvements ne provoquent pas d'attaque d'opportunité.</li>
                        <li><strong>Esquiver:</strong> Désavantage aux attaques contre vous.</li>
                    </ul>
                </div>

                {/* Bonus Actions */}
                <div className="bg-white border border-stone-300 rounded p-3 shadow-sm">
                    <h4 className="font-bold text-stone-600 border-b border-stone-200 pb-1 mb-2 text-xs uppercase">Actions Bonus</h4>
                    <p className="text-xs text-stone-400 italic">Aucune action bonus disponible.</p>
                </div>

            </div>

        </div>
    );
}
