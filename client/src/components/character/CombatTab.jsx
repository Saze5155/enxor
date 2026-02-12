import React, { useState, useEffect } from 'react';
import characterService from '../../services/characterService';

export default function CombatTab({ character, onUpdate }) {
    // Safety parse
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};

    // Local state for MJ Notes to avoid spamming updates
    const [customLabel, setCustomLabel] = useState(character.customCombatLabel || "Notes Combat");
    const [customValue, setCustomValue] = useState(character.customCombatValue || "");

    useEffect(() => {
        setCustomLabel(character.customCombatLabel || "Notes Combat");
        setCustomValue(character.customCombatValue || "");
    }, [character.customCombatLabel, character.customCombatValue]);

    // Combat calculations
    const getMod = (val) => Math.floor(((val || 10) - 10) / 2); // Safety fallback
    const strMod = getMod(stats.str);
    const dexMod = getMod(stats.dex);
    const proficiencyBonus = 2 + Math.floor(((character.level || 1) - 1) / 4);

    const inventory = character.inventory || []; // Restored
    // Filter weapons
    const weapons = inventory.filter(item => (item.type === 'weapon' || item.type === 'arme') && item.isEquipped);

    const handleUpdate = async (data) => {
        try {
            await characterService.update(character.id, data);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error updating combat data", error);
        }
    };

    const handleDeathSave = (type, currentVal, targetVal) => {
        // Toggle logic: clicking the current value again reduces it by 1 (or sets to targetVal if simpler)
        // D&D usually: fill from left.
        // If current is 1, targeting 1 -> toggle to 0 ?
        // If current is 1, targeting 2 -> set to 2.
        // If current is 2, targeting 1 -> set to 1.

        // Let's implement simpler: clicking index (1,2,3) sets value to that index.
        // Unless it's already that index, then set to index-1.

        let newVal = targetVal;
        if (currentVal === targetVal) {
            newVal = targetVal - 1;
        }

        handleUpdate({ [type]: newVal });
    };

    const handleLabelEdit = () => {
        const newLabel = window.prompt("Modifier le titre du bloc personnalisé :", customLabel);
        if (newLabel !== null && newLabel.trim() !== "") {
            setCustomLabel(newLabel); // Optimistic
            handleUpdate({ customCombatLabel: newLabel });
        }
    };

    const handleValueBlur = () => {
        if (customValue !== character.customCombatValue) {
            handleUpdate({ customCombatValue: customValue });
        }
    };

    const renderDeathSaveCircles = (type, count, color) => {
        return (
            <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        onClick={() => handleDeathSave(type, count, i)}
                        className={`w-4 h-4 rounded-full border-2 cursor-pointer transition ${i <= count ? `bg-${color}-600 border-${color}-800` : `bg-stone-100 border-stone-300 hover:bg-stone-200`}`}
                        title={type === 'deathSavesSuccess' ? 'Succès' : 'Échec'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6">

            {/* Top Row: Death Saves & MJ Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Death Saves */}
                <div className="bg-white border-2 border-stone-300 rounded-lg overflow-hidden shadow-sm p-3 flex flex-col justify-center gap-2">
                    <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider border-b border-stone-200 pb-1 mb-1">Jets de Mort (Death Saves)</h3>
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-green-700 uppercase w-12 text-right">Succès</span>
                            {renderDeathSaveCircles('deathSavesSuccess', character.deathSavesSuccess, 'green')}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-red-700 uppercase w-12 text-right">Échecs</span>
                            {renderDeathSaveCircles('deathSavesFailures', character.deathSavesFailures, 'red')}
                        </div>
                    </div>
                </div>

                {/* MJ Custom Notes */}
                <div className="bg-white border-2 border-stone-300 rounded-lg overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-stone-200 px-3 py-1 border-b border-stone-300 flex justify-between items-center">
                        <h3
                            className="font-bold text-stone-700 uppercase text-xs tracking-wider cursor-pointer hover:text-amber-700 hover:underline decoration-dashed"
                            onClick={handleLabelEdit}
                            title="Cliquez pour renommer ce bloc"
                        >
                            {customLabel} ✎
                        </h3>
                    </div>
                    <textarea
                        className="flex-1 p-2 text-xs bg-transparent resize-none focus:outline-none focus:bg-stone-50 transition font-serif min-h-[80px]"
                        placeholder="Notes, conditions, effets..."
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onBlur={handleValueBlur}
                    />
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
                        {weapons.length > 0 ? weapons.map((wpn, i) => {
                            const isFinesse = wpn.properties && wpn.properties.toLowerCase().includes('finesse');
                            const isRanged = wpn.properties && (wpn.properties.toLowerCase().includes('distance') || wpn.properties.toLowerCase().includes('portée'));
                            const useDex = isFinesse || isRanged || (wpn.name.toLowerCase().includes('arc')) || (wpn.name.toLowerCase().includes('arbalète')) || (wpn.name.toLowerCase().includes('dague')); // Dagger acts as finesse often

                            const statMod = useDex ? dexMod : strMod;
                            const isProficient = true; // Todo: check vs proficiencies
                            const attackBonus = statMod + (isProficient ? proficiencyBonus : 0);
                            const damageMod = statMod;

                            let displayDamage = wpn.damage ? `${wpn.damage}` : `1d?`;
                            if (wpn.damage2) {
                                displayDamage += `/${wpn.damage2}`;
                            }
                            displayDamage += ` ${damageMod >= 0 ? '+' : ''}${damageMod}`;

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
