import React, { useState } from 'react';
import dataService from '../../services/dataService';

export default function SpellsTab({ character, onUpdate }) {
    const spells = character.spells || [];
    const [showAddSpell, setShowAddSpell] = useState(false);
    const [showSpellDetails, setShowSpellDetails] = useState(false);
    const [selectedSpell, setSelectedSpell] = useState(null);
    const [availableSpells, setAvailableSpells] = useState([]);
    const [loadingSpells, setLoadingSpells] = useState(false);

    // Parse spell slots
    const spellSlots = typeof character.spellSlots === 'string'
        ? JSON.parse(character.spellSlots)
        : character.spellSlots || {};

    // Calculate spell stats
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};
    const spellcastingMod = getSpellcastingModifier(character.class, stats);
    const profBonus = Math.floor((character.level - 1) / 4) + 2;
    const spellSaveDC = 8 + profBonus + spellcastingMod;
    const spellAttackBonus = profBonus + spellcastingMod;

    // Group spells by level
    const spellsByLevel = spells.reduce((acc, spell) => {
        const lvl = spell.level || 0;
        if (!acc[lvl]) acc[lvl] = [];
        acc[lvl].push(spell);
        return acc;
    }, {});

    const handleLoadSpells = async () => {
        setLoadingSpells(true);
        try {
            const data = await dataService.getSpells();
            setAvailableSpells(data || []);
            setShowAddSpell(true);
        } catch (error) {
            console.error('Failed to load spells', error);
        }
        setLoadingSpells(false);
    };

    const handleAddSpell = (spell) => {
        const newSpells = [...spells, {
            spellId: null,
            name: spell.nom,
            level: spell.niveau,
            isPrepared: false,
            properties: JSON.stringify(spell)
        }];
        onUpdate({ spells: newSpells });
        setShowAddSpell(false);
    };

    const handleViewSpell = (spell) => {
        setSelectedSpell(spell);
        setShowSpellDetails(true);
    };

    const handleTogglePrepared = (index) => {
        const newSpells = [...spells];
        newSpells[index] = { ...newSpells[index], isPrepared: !newSpells[index].isPrepared };
        onUpdate({ spells: newSpells });
    };

    const handleUseSlot = (level) => {
        const slots = { ...spellSlots };
        if (slots[level] && slots[level].used < slots[level].max) {
            slots[level].used += 1;
            onUpdate({ spellSlots: slots });
        }
    };

    const handleRestoreSlot = (level) => {
        const slots = { ...spellSlots };
        if (slots[level] && slots[level].used > 0) {
            slots[level].used -= 1;
            onUpdate({ spellSlots: slots });
        }
    };

    const handleLongRest = () => {
        const slots = { ...spellSlots };
        Object.keys(slots).forEach(level => {
            if (slots[level]) slots[level].used = 0;
        });
        onUpdate({ spellSlots: slots });
    };

    return (
        <div className="p-4 space-y-6">
            {/* Spell Stats */}
            <div className="flex justify-between items-center bg-stone-200 p-2 rounded border border-stone-300">
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500">Mod. Incantation</span>
                    <div className="text-xl font-bold text-stone-800">
                        {spellcastingMod >= 0 ? '+' : ''}{spellcastingMod}
                    </div>
                </div>
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500">DD Sauvegarde</span>
                    <div className="text-xl font-bold text-stone-800">{spellSaveDC}</div>
                </div>
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-stone-500">Bonus Attaque</span>
                    <div className="text-xl font-bold text-stone-800">
                        {spellAttackBonus >= 0 ? '+' : ''}{spellAttackBonus}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleLoadSpells}
                    disabled={loadingSpells}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold"
                >
                    {loadingSpells ? 'Chargement...' : '+ Apprendre un sort'}
                </button>
                <button
                    onClick={handleLongRest}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-semibold"
                >
                    🛌 Repos Long
                </button>
            </div>

            {/* Add Spell Modal */}
            {showAddSpell && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Apprendre un sort</h3>
                            <button onClick={() => setShowAddSpell(false)} className="text-2xl">&times;</button>
                        </div>
                        <div className="space-y-2">
                            {availableSpells.map((spell, i) => (
                                <div key={i} className="border p-2 rounded hover:bg-stone-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold">{spell.nom}</h4>
                                            <p className="text-xs text-stone-600">
                                                Niveau {spell.niveau} • {spell.ecole} • {spell.temps_incantation}
                                            </p>
                                            <p className="text-xs text-stone-700 mt-1">{spell.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddSpell(spell)}
                                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                                        >
                                            Apprendre
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Spell Details Modal */}
            {showSpellDetails && selectedSpell && (
                <SpellDetailsModal
                    spell={selectedSpell}
                    onClose={() => setShowSpellDetails(false)}
                />
            )}

            {/* Cantrips (Level 0) */}
            <SpellLevelSection
                level={0}
                spells={spellsByLevel[0]}
                slots={null}
                onTogglePrepared={handleTogglePrepared}
                onViewSpell={handleViewSpell}
                allSpells={spells}
            />

            {/* Level 1+ */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                <SpellLevelSection
                    key={lvl}
                    level={lvl}
                    spells={spellsByLevel[lvl]}
                    slots={spellSlots[lvl]}
                    onUseSlot={() => handleUseSlot(lvl)}
                    onRestoreSlot={() => handleRestoreSlot(lvl)}
                    onTogglePrepared={handleTogglePrepared}
                    onViewSpell={handleViewSpell}
                    allSpells={spells}
                />
            ))}
        </div>
    );
}

function SpellLevelSection({ level, spells = [], slots, onUseSlot, onRestoreSlot, onTogglePrepared, onViewSpell, allSpells }) {
    if (!spells.length && level > 0 && (!slots || slots.max === 0)) return null;

    return (
        <div className="bg-white border border-stone-300 rounded overflow-hidden shadow-sm">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex justify-between items-center">
                <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider">
                    {level === 0 ? 'Tours de Magie (Niveau 0)' : `Niveau ${level}`}
                </h3>
                {level > 0 && slots && slots.max > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                            Emplacements: {slots.max - slots.used}/{slots.max}
                        </span>
                        <div className="flex gap-1">
                            {Array.from({ length: slots.max }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => i < slots.used ? onRestoreSlot() : onUseSlot()}
                                    className={`w-4 h-4 rounded border-2 ${i < slots.used
                                        ? 'bg-gray-400 border-gray-500'
                                        : 'bg-indigo-600 border-indigo-700'
                                        }`}
                                    title={i < slots.used ? 'Restaurer' : 'Utiliser'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="divide-y divide-stone-100">
                {spells.length > 0 ? spells.map((spell, i) => {
                    const spellIndex = allSpells.indexOf(spell);
                    return (
                        <div key={i} className="px-4 py-2 hover:bg-stone-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {level > 0 && (
                                    <input
                                        type="checkbox"
                                        checked={spell.isPrepared}
                                        onChange={() => onTogglePrepared(spellIndex)}
                                        className="w-4 h-4 accent-green-600"
                                        title="Préparé"
                                    />
                                )}
                                <div>
                                    <span className="font-bold text-sm text-stone-800">{spell.name}</span>
                                    {spell.isPrepared && <span className="text-[10px] text-green-600 ml-2 font-bold uppercase">✓ Préparé</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onViewSpell(spell)}
                                    className="text-[10px] bg-stone-200 hover:bg-stone-300 border border-stone-400 px-2 py-1 rounded text-stone-700 font-semibold"
                                >
                                    👁️ Voir
                                </button>
                                {level > 0 && slots && slots.max > 0 && (
                                    <button
                                        onClick={onUseSlot}
                                        disabled={slots.used >= slots.max}
                                        className="text-[10px] bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-2 py-1 rounded font-bold"
                                    >
                                        Lancer
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="px-4 py-3 text-center text-stone-400 text-xs italic">
                        Aucun sort connu.
                    </div>
                )}
            </div>
        </div>
    );
}

function getSpellcastingModifier(className, stats) {
    const modifiers = {
        'Magicien': Math.floor((stats.int - 10) / 2),
        'Ensorceleur': Math.floor((stats.cha - 10) / 2),
        'Occultiste': Math.floor((stats.cha - 10) / 2),
        'Barde': Math.floor((stats.cha - 10) / 2),
        'Clerc': Math.floor((stats.wis - 10) / 2),
        'Druide': Math.floor((stats.wis - 10) / 2),
        'Rôdeur': Math.floor((stats.wis - 10) / 2),
        'Paladin': Math.floor((stats.cha - 10) / 2),
    };
    return modifiers[className] || 0;
}

function SpellDetailsModal({ spell, onClose }) {
    const data = typeof spell.properties === 'string'
        ? JSON.parse(spell.properties)
        : spell.properties || spell;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#fdf6e3] rounded-lg max-w-2xl w-full border border-stone-400 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="bg-stone-800 text-stone-100 p-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold uppercase tracking-wide">{spell.name || data.nom}</h3>
                        <p className="text-xs text-stone-400">
                            Niveau {data.niveau || spell.level} • {data.ecole}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white text-3xl transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-stone-900">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-stone-100 p-3 rounded border border-stone-200">
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-500">Temps</span>
                            <span className="text-sm font-semibold">{data.temps_incantation || 'Action'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-500">Portée</span>
                            <span className="text-sm font-semibold">{data.portee || 'Contact'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-500">Durée</span>
                            <span className="text-sm font-semibold">{data.duree || 'Instantanée'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-500">Composantes</span>
                            <span className="text-sm font-semibold">{data.composantes || 'V, S'}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs uppercase font-bold text-stone-500 border-b border-stone-200 mb-2">Description</h4>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {data.description || 'Aucune description disponible.'}
                            </div>
                        </div>

                        {data.a_haut_niveau && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-100 italic text-sm">
                                <span className="font-bold not-italic">À haut niveau : </span>
                                {data.a_haut_niveau}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-stone-100 p-4 border-t border-stone-300 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-stone-800 text-white rounded font-bold hover:bg-stone-700 transition-colors shadow-md"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
