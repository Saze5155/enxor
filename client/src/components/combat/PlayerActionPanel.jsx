import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function PlayerActionPanel({ combat, activeCharacter, isGM, onAction, selectedTargetId }) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('attacks'); // attacks, spells, actions, bonus, features
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Store the last attack to trigger damage if it hits
    const [pendingAttack, setPendingAttack] = useState(null);

    if (!combat || !activeCharacter) return null;

    // Verify it's my turn
    const currentParticipant = combat.participants ? combat.participants[combat.tourActuelIndex || 0] : null;
    const isMyTurn = currentParticipant && (
        (currentParticipant.characterId === activeCharacter.id)
    );

    // Filter Items for Attacks
    const weapons = activeCharacter.inventory?.filter(item =>
        (item.type === 'arme' || (item.damage && item.damage.length > 0)) &&
        item.isEquipped // Only show equipped items
    ) || [];

    // Helper to get Target AC
    const getTargetData = () => {
        if (!selectedTargetId) return null;
        const participant = combat.participants?.find(p => p.id === selectedTargetId);
        if (!participant) return null;

        let ac = 10;
        let name = participant.nom;

        if (participant.character) {
            ac = participant.character.ac || 10;
        } else if (participant.enemyInstance) {
            const instance = participant.enemyInstance;
            const type = instance.enemyType;

            // Try to find AC in overrides
            const overrides = typeof instance.statsOverrides === 'string' ? JSON.parse(instance.statsOverrides) : instance.statsOverrides || {};
            if (overrides.ac) {
                ac = overrides.ac;
            } else if (type && type.stats) {
                const stats = typeof type.stats === 'string' ? JSON.parse(type.stats) : type.stats || {};
                ac = stats.ac || stats.CA || 10;
            }
        }

        return { ac, name, id: participant.id };
    };

    const targetData = getTargetData();

    // Listen for dice rolls to resolve pending attacks
    useEffect(() => {
        if (!socket || !pendingAttack) return;

        const handleRoll = (data) => {
            // Check if this roll matches our pending attack
            // We check rollerName and label to be sure it's the attack we just launched
            if (data.userId === user.id && data.characterId === activeCharacter.id && data.label?.startsWith('Attaque')) {

                const target = getTargetData();
                if (!target) {
                    setPendingAttack(null);
                    return;
                }

                console.log(`[Combat] Resolving attack: ${data.result} vs AC ${target.ac}`);

                if (data.result >= target.ac) {
                    console.log("[Combat] HIT!");
                    // Auto-roll damage
                    setTimeout(() => {
                        handleDamageRoll(pendingAttack.weapon, target.name);
                    }, 1500); // Small delay for dramatic effect after the attack die settles
                } else {
                    console.log("[Combat] MISS!");
                }

                setPendingAttack(null);
            }
        };

        socket.on('dice_roll', handleRoll);
        return () => socket.off('dice_roll', handleRoll);
    }, [socket, pendingAttack, activeCharacter.id, user.id]);

    // ... (Stats parsing) ...
    const stats = typeof activeCharacter.stats === 'string' ? JSON.parse(activeCharacter.stats) : activeCharacter.stats || {};
    const str = Number(stats.strength || 10);
    const dex = Number(stats.dexterity || 10);
    const strMod = Math.floor((str - 10) / 2);
    const dexMod = Math.floor((dex - 10) / 2);
    const level = activeCharacter.level || 1;
    const proficiencyBonus = 2 + Math.floor((level - 1) / 4);

    // ... (Spells parsing) ...
    const spells = activeCharacter.spells || [];
    const spellsByLevel = spells.reduce((acc, spell) => {
        const lvl = spell.level || 0;
        if (!acc[lvl]) acc[lvl] = [];
        acc[lvl].push(spell);
        return acc;
    }, {});

    const standardActions = [
        { name: "Attaquer", desc: "Effectuer une attaque au corps à corps ou à distance." },
        { name: "Lancer un sort", desc: "Lancer un sort avec un temps d'incantation d'une action." },
        { name: "Foncer", desc: "Doubler votre vitesse de déplacement pour ce tour." },
        { name: "Se désengager", desc: "Vos déplacements ne provoquent pas d'attaques d'opportunité." },
        { name: "Esquiver", desc: "Les attaques contre vous ont un désavantage. Vos jets de DEX ont un avantage." },
        { name: "Aider", desc: "Donner un avantage à un allié pour sa prochaine action." },
        { name: "Se cacher", desc: "Effectuer un jet de Discrétion pour se cacher." },
        { name: "Chercher", desc: "Consacrer son attention à trouver quelque chose (Perception/Investigation)." },
    ];

    const emitRoll = (diceType, modifier, label) => {
        if (!socket) return;

        let count = 1;
        let faces = 20;

        if (diceType.includes('d')) {
            const parts = diceType.toLowerCase().split('d');
            count = parseInt(parts[0]) || 1;
            faces = parseInt(parts[1]) || 20;
        }

        let total = 0;
        let rawResults = [];
        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * faces) + 1;
            rawResults.push(r);
            total += r;
        }

        total += modifier;

        socket.emit('dice_roll', {
            campaignId: combat.campaignId,
            rollerName: activeCharacter.name,
            userId: user.id,
            characterId: activeCharacter.id,
            targetParticipantId: selectedTargetId,
            diceType: diceType,
            result: total,
            rawResult: rawResults.length === 1 ? rawResults[0] : rawResults,
            modifier: modifier,
            label: label,
            timestamp: new Date().toISOString()
        });
    };

    const handleAttackClick = (weapon) => {
        if (!selectedTargetId) {
            alert("Veuillez d'abord sélectionner une cible dans la liste d'initiative.");
            return;
        }

        const isFinesse = weapon.properties?.toLowerCase().includes('finesse') || weapon.name.toLowerCase().includes('dague') || weapon.name.toLowerCase().includes('arc');
        const isRanged = weapon.properties?.toLowerCase().includes('portée') || weapon.name.toLowerCase().includes('arc');
        const useDex = isRanged || (isFinesse && dexMod > strMod);
        const mod = useDex ? dexMod : strMod;
        const hitBonus = mod + proficiencyBonus;

        setPendingAttack({ weapon, targetId: selectedTargetId });
        emitRoll('d20', hitBonus, `Attaque (${weapon.name}) vs ${targetData?.name || 'Cible'}`);
    };

    const handleDamageRoll = (weapon, targetName) => {
        const isFinesse = weapon.properties?.toLowerCase().includes('finesse') || weapon.name.toLowerCase().includes('dague') || weapon.name.toLowerCase().includes('arc');
        const isRanged = weapon.properties?.toLowerCase().includes('portée') || weapon.name.toLowerCase().includes('arc');
        const useDex = isRanged || (isFinesse && dexMod > strMod);
        const mod = useDex ? dexMod : strMod;

        const dmgDice = weapon.damage || "1d4";
        emitRoll(dmgDice, mod, `Dégâts (${weapon.name}) sur ${targetName}`);
    };

    const handleDamageClick = (e, weapon) => {
        e.stopPropagation();
        handleDamageRoll(weapon, targetData?.name || 'Cible');
    };

    const handleSpellClick = (spell) => {
        console.log("Spell clicked:", spell);
        if (onAction) onAction({ type: 'spell', spell });
    };

    return (
        <div className={`fixed bottom-28 right-4 z-40 flex flex-col items-end transition-all duration-300 ${isCollapsed ? 'translate-x-full' : 'translate-x-0'}`}>

            {/* Main Panel */}
            <div className="bg-stone-900 border-2 border-yellow-600 rounded-lg shadow-2xl w-80 overflow-hidden flex flex-col max-h-[50vh]">

                {/* Target Indicator */}
                <div className="bg-stone-800 border-b border-stone-700 px-3 py-1.5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-stone-400 text-sm">target</span>
                        <span className="text-xs font-bold text-stone-300 uppercase truncate max-w-[150px]">
                            {targetData ? targetData.name : "Aucune cible"}
                        </span>
                    </div>
                    {targetData && (
                        <span className="text-[10px] bg-stone-950 px-1.5 py-0.5 rounded text-stone-500 font-mono">
                            CA {targetData.ac}
                        </span>
                    )}
                </div>

                {/* Header / Tabs */}
                <div className="flex bg-stone-950 border-b border-stone-700">
                    <button
                        onClick={() => setActiveTab('attacks')}
                        className={`flex-1 py-2 text-xs font-bold uppercase hover:bg-stone-800 transition ${activeTab === 'attacks' ? 'bg-yellow-900 text-yellow-200 border-b-2 border-yellow-500' : 'text-stone-500'}`}
                    >
                        ⚔️ Atq
                    </button>
                    <button
                        onClick={() => setActiveTab('spells')}
                        className={`flex-1 py-2 text-xs font-bold uppercase hover:bg-stone-800 transition ${activeTab === 'spells' ? 'bg-purple-900/50 text-purple-200 border-b-2 border-purple-500' : 'text-stone-500'}`}
                    >
                        ✨ Sorts
                    </button>
                    <button
                        onClick={() => setActiveTab('actions')}
                        className={`flex-1 py-2 text-xs font-bold uppercase hover:bg-stone-800 transition ${activeTab === 'actions' ? 'bg-blue-900/50 text-blue-200 border-b-2 border-blue-500' : 'text-stone-500'}`}
                    >
                        ⚡ Act
                    </button>
                    <button
                        onClick={() => setActiveTab('features')} // Traits/Dons
                        className={`flex-1 py-2 text-xs font-bold uppercase hover:bg-stone-800 transition ${activeTab === 'features' ? 'bg-green-900/50 text-green-200 border-b-2 border-green-500' : 'text-stone-500'}`}
                    >
                        💪 Cap
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-2 bg-stone-900/95">

                    {/* ATTACKS TAB */}
                    {activeTab === 'attacks' && (
                        <div className="space-y-2">
                            {weapons.length === 0 && <p className="text-stone-500 text-xs italic text-center">Aucune arme équipée.</p>}
                            {weapons.map(weapon => {
                                // Simple guess for hit bonus logic (Finesse = Dex, else Str)
                                const isFinesse = weapon.properties?.toLowerCase().includes('finesse') || weapon.name.toLowerCase().includes('dague') || weapon.name.toLowerCase().includes('arc');
                                const isRanged = weapon.properties?.toLowerCase().includes('portée') || weapon.name.toLowerCase().includes('arc') || weapon.name.toLowerCase().includes('arbalète');

                                // Simple logic: use DEX if Finesse/Ranged & DEX > STR, else STR
                                // Actually 5e rules: Ranged = Dex, Finesse = Choice.
                                const useDex = isRanged || (isFinesse && dexMod > strMod);
                                const mod = useDex ? dexMod : strMod;
                                const hitBonus = mod + proficiencyBonus;
                                const dmgBonus = mod;

                                return (
                                    <div key={weapon.id} onClick={() => handleAttackClick(weapon)} className="bg-stone-800 p-2 rounded border border-stone-700 hover:border-yellow-500 hover:bg-stone-700 cursor-pointer transition group">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-stone-200 text-sm">{weapon.name}</span>
                                            <span className="text-yellow-500 text-xs font-mono">+{hitBonus}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-stone-400 text-xs italic">{weapon.properties}</span>
                                            <span
                                                onClick={(e) => handleDamageClick(e, weapon)}
                                                className="text-stone-300 text-xs bg-stone-900 px-1 rounded hover:bg-red-900 hover:text-white cursor-pointer transition border border-stone-700 hover:border-red-500"
                                                title="Lancer les dégâts"
                                            >
                                                {weapon.damage} {dmgBonus > 0 ? `+ ${dmgBonus}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* SPELLS TAB */}
                    {activeTab === 'spells' && (
                        <div className="space-y-3">
                            {Object.entries(spellsByLevel).sort(([a], [b]) => Number(a) - Number(b)).map(([level, levelSpells]) => (
                                <div key={level}>
                                    <h4 className="text-xs font-bold text-purple-400 uppercase border-b border-purple-900/50 mb-1">
                                        {level === '0' ? 'Tours de Magie' : `Niveau ${level}`}
                                    </h4>
                                    <div className="space-y-1">
                                        {levelSpells.map(spell => (
                                            <div key={spell.id} onClick={() => handleSpellClick(spell)} className="bg-stone-800/50 p-1.5 rounded flex justify-between items-center hover:bg-purple-900/20 cursor-pointer">
                                                <span className="text-stone-300 text-sm">{spell.name}</span>
                                                {spell.isPrepared && <span className="text-[10px] text-green-400">Préparé</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {spells.length === 0 && <p className="text-stone-500 text-xs italic text-center">Aucun sort connu.</p>}
                        </div>
                    )}

                    {/* ACTIONS TAB */}
                    {activeTab === 'actions' && (
                        <div className="space-y-1">
                            {standardActions.map(action => (
                                <div key={action.name} className="bg-stone-800 p-2 rounded border border-stone-700 hover:bg-stone-700 cursor-pointer group">
                                    <div className="font-bold text-blue-200 text-sm">{action.name}</div>
                                    <div className="text-xs text-stone-500 group-hover:text-stone-400">{action.desc}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FEATURES TAB */}
                    {activeTab === 'features' && (
                        <div className="space-y-2">
                            {activeCharacter.features?.map(feat => (
                                <div key={feat.id} className="bg-stone-800 p-2 rounded border border-stone-700 hover:bg-stone-700">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-green-200 text-sm">{feat.name}</span>
                                        {feat.usesMax > 0 && (
                                            <span className="text-xs text-stone-400">{feat.usesCurrent}/{feat.usesMax}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-1 line-clamp-2">{feat.description}</div>
                                </div>
                            ))}
                            {(!activeCharacter.features || activeCharacter.features.length === 0) && (
                                <p className="text-stone-500 text-xs italic text-center">Aucune capacité.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
