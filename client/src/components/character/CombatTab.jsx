import React from 'react';

export default function CombatTab({ character }) {
    // Mock parsing inventory for weapons
    const inventory = character.inventory || []; // Assuming relation is populated now
    const weapons = inventory.filter(item => item.type === 'weapon' && item.isEquipped);

    // If inventory is plain JSON array from old code
    // we need to handle both relation object array AND old json string/object if migration incomplete
    // But assuming new controller returns relation array.

    return (
        <div className="p-4 space-y-6">

            {/* Vitals Row (Mobile Only mostly, or redundant emphasis) */}
            <div className="grid grid-cols-3 gap-4 md:hidden">
                <div className="bg-white border-2 border-stone-400 rounded-lg p-2 text-center shadow">
                    <span className="text-[10px] uppercase font-bold text-stone-500">CA</span>
                    <div className="text-2xl font-bold text-stone-800">🛡️ {character.ac}</div>
                </div>
                <div className="bg-white border-2 border-stone-400 rounded-lg p-2 text-center shadow">
                    <span className="text-[10px] uppercase font-bold text-stone-500">PV</span>
                    <div className="text-xl font-bold text-red-700">
                        {character.hpCurrent} <span className="text-xs text-stone-400">/ {character.hpMax}</span>
                    </div>
                </div>
                <div className="bg-white border-2 border-stone-400 rounded-lg p-2 text-center shadow">
                    <span className="text-[10px] uppercase font-bold text-stone-500">Hit Dice</span>
                    <div className="text-xl font-bold text-stone-800">1d?</div>
                </div>
            </div>

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
                        {weapons.length > 0 ? weapons.map((wpn, i) => (
                            <tr key={i} className="hover:bg-stone-50/50">
                                <td className="px-4 py-3 font-bold text-stone-800">{wpn.name}</td>
                                <td className="px-4 py-3 text-center font-mono text-stone-600">+?</td>
                                <td className="px-4 py-3 text-stone-600">
                                    <span className="font-mono text-stone-800 font-bold">{wpn.properties}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="bg-red-800 hover:bg-red-700 text-white text-xs px-2 py-1 rounded shadow-sm">
                                        🎲 Attaquer
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-4 text-center text-stone-400 italic">
                                    Aucune arme équipée. Allez dans l'inventaire.
                                </td>
                            </tr>
                        )}
                        {/* Placeholder for Unarmed Strike */}
                        <tr className="hover:bg-stone-50/50">
                            <td className="px-4 py-3 font-bold text-stone-800">Mains nues</td>
                            <td className="px-4 py-3 text-center font-mono text-stone-600">+{Math.floor((character.stats.str - 10) / 2) + 2}</td>
                            <td className="px-4 py-3 text-stone-600">
                                <span className="font-mono text-stone-800 font-bold">1 + {Math.floor((character.stats.str - 10) / 2)}</span>
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
