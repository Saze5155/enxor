import { useState, useEffect } from 'react';
import combatService from '../../services/combatService';

export default function InitiativeTracker({
    combat,
    isGM,
    currentUserId,
    socket,
    campaignId,
    initiativeTarget,
    setInitiativeTarget,
    onInitiativeComplete
}) {
    const [participants, setParticipants] = useState([]);
    const [pendingRolls, setPendingRolls] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (combat?.participants) {
            setParticipants(combat.participants);

            // Identify participants who haven't rolled yet
            const pending = combat.participants.filter(p => p.initiative === null || p.initiative === undefined);
            setPendingRolls(pending);
        }
    }, [combat]);

    const handleRollInitiative = async (participantId, value) => {
        try {
            const initiativeValue = parseInt(value);
            if (isNaN(initiativeValue) || initiativeValue < 1 || initiativeValue > 30) {
                alert('Initiative doit être entre 1 et 30');
                return;
            }

            await combatService.rollInitiative(combat.id, {
                participantId,
                initiative: initiativeValue
            });

            // Update local state
            setParticipants(prev => prev.map(p =>
                p.id === participantId ? { ...p, initiative: initiativeValue } : p
            ));
            setPendingRolls(prev => prev.filter(p => p.id !== participantId));

            // Check if all initiatives are rolled
            const remaining = pendingRolls.filter(p => p.id !== participantId);
            if (remaining.length === 0 && onInitiativeComplete) {
                onInitiativeComplete();
            }
        } catch (error) {
            console.error('Failed to roll initiative:', error);
            alert('Erreur lors de l\'enregistrement de l\'initiative');
        }
    };

    const canRollFor = (participant) => {
        if (isGM) return true; // GM can roll for anyone
        if (participant.type === 'joueur' && participant.characterId) {
            // Check if this character belongs to current user
            return participant.character?.userId === currentUserId;
        }
        return false;
    };

    const sortedParticipants = [...participants].sort((a, b) => {
        if (a.initiative === null || a.initiative === undefined) return 1;
        if (b.initiative === null || b.initiative === undefined) return -1;
        return b.initiative - a.initiative; // Descending order
    });

    const currentTurnIndex = combat?.tourActuelIndex || 0;
    const currentParticipant = sortedParticipants[currentTurnIndex];

    if (!combat) return null;

    return (
        <div className={`fixed top-20 right-4 z-30 bg-stone-900 border-2 border-yellow-600 rounded-lg shadow-2xl transition-all ${isCollapsed ? 'w-16' : 'w-80'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 flex justify-between items-center border-b-2 border-yellow-600">
                {!isCollapsed && (
                    <div>
                        <h3 className="font-bold text-white text-sm">⚔️ Initiative</h3>
                        <p className="text-yellow-200 text-xs">Round {combat.roundActuel || 1}</p>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-white hover:text-yellow-200 transition"
                >
                    {isCollapsed ? '▶' : '◀'}
                </button>
            </div>

            {!isCollapsed && (
                <div className="max-h-[60vh] overflow-y-auto">
                    {/* Pending Rolls Section */}
                    {pendingRolls.length > 0 && (
                        <div className="p-3 bg-red-900/20 border-b border-stone-700">
                            <h4 className="text-xs font-bold text-red-400 mb-2 uppercase">
                                🎲 En attente ({pendingRolls.length})
                            </h4>
                            <div className="space-y-2">
                                {pendingRolls.map(participant => {
                                    const canRoll = canRollFor(participant);

                                    // Calculate initiative bonus (DEX modifier)
                                    let initiativeBonus = 0;
                                    if (participant.character) {
                                        // Stats are stored as JSON string in the stats field
                                        const charStats = typeof participant.character.stats === 'string'
                                            ? JSON.parse(participant.character.stats)
                                            : participant.character.stats || {};
                                        const dex = Number(charStats.dexterity || charStats.dex || charStats.DEX) || 10;
                                        initiativeBonus = Math.floor((dex - 10) / 2);
                                    } else if (participant.enemyInstance?.enemyType) {
                                        // Parse enemy stats to get DEX
                                        const stats = typeof participant.enemyInstance.enemyType.stats === 'string'
                                            ? JSON.parse(participant.enemyInstance.enemyType.stats)
                                            : participant.enemyInstance.enemyType.stats || {};
                                        const dex = stats.dex || stats.DEX || 10;
                                        initiativeBonus = Math.floor((dex - 10) / 2);
                                    }

                                    const isTargeted = initiativeTarget === participant.id;

                                    return (
                                        <div
                                            key={participant.id}
                                            className={`rounded p-3 transition border ${isTargeted
                                                ? 'bg-yellow-900/30 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-[1.02]'
                                                : 'bg-stone-800 border-transparent hover:bg-stone-750'
                                                } cursor-pointer`}
                                            onClick={() => setInitiativeTarget(participant.id)}
                                        >
                                            <div className="text-xs font-medium text-stone-200 mb-2 flex items-center justify-between pointer-events-none">
                                                <span className={isTargeted ? 'text-yellow-400 font-bold' : ''}>
                                                    {participant.nom}
                                                    {participant.type === 'ennemi' && ' 👹'}
                                                </span>
                                                <span className="text-stone-500 text-[10px]">
                                                    Bonus: {initiativeBonus >= 0 ? '+' : ''}{initiativeBonus}
                                                </span>
                                            </div>
                                            {canRoll ? (
                                                <div className={`rounded p-2 text-center transition-all pointer-events-none ${isTargeted
                                                    ? 'bg-yellow-500 text-stone-900 font-bold shadow-lg'
                                                    : 'bg-stone-900/50 border border-stone-700 text-stone-500'
                                                    }`}>
                                                    {isTargeted ? (
                                                        <div className="text-xs flex items-center justify-center gap-2 animate-pulse">
                                                            <span>🎲</span> LANCEZ LE D20 !
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="text-xs mb-1 flex items-center justify-center gap-1">
                                                                {isGM ? "Cliquez pour sélectionner" : "À vous ! Lancez un D20"}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-stone-500 italic text-center py-1">
                                                    En attente...
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Initiative Order */}
                    <div className="p-3">
                        <h4 className="text-xs font-bold text-yellow-400 mb-2 uppercase">
                            📜 Ordre d'Initiative
                        </h4>
                        <div className="space-y-1">
                            {sortedParticipants.map((participant, index) => {
                                const isCurrentTurn = index === currentTurnIndex && pendingRolls.length === 0;
                                const hasRolled = participant.initiative !== null && participant.initiative !== undefined;

                                return (
                                    <div
                                        key={participant.id}
                                        onClick={() => setInitiativeTarget(participant.id)}
                                        className={`p-2 rounded flex items-center justify-between transition cursor-pointer ${participant.id === initiativeTarget
                                                ? 'bg-yellow-900/30 border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-[1.02] z-10'
                                                : isCurrentTurn
                                                    ? 'bg-yellow-900/50 border-2 border-yellow-500 shadow-lg'
                                                    : hasRolled
                                                        ? 'bg-stone-800 border border-stone-700 hover:bg-stone-700'
                                                        : 'bg-stone-800/50 border border-stone-700 opacity-50 hover:bg-stone-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrentTurn ? 'bg-yellow-600 text-white' : 'bg-stone-700 text-stone-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-medium ${isCurrentTurn ? 'text-yellow-200' : 'text-stone-200'
                                                    }`}>
                                                    {participant.nom}
                                                    {participant.type === 'ennemi' && ' 👹'}
                                                </div>
                                                <div className="text-xs text-stone-500">
                                                    HP: {participant.pvActuels}/{participant.pvMax}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-lg font-bold ${isCurrentTurn ? 'text-yellow-300' : 'text-stone-400'
                                            }`}>
                                            {hasRolled ? participant.initiative : '?'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* GM Controls */}
                    {isGM && (
                        <div className="p-3 border-t border-stone-700 bg-stone-950 space-y-2">
                            {pendingRolls.length === 0 && (
                                <button
                                    className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-2 rounded shadow-lg transition"
                                >
                                    ▶ Tour Suivant
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    if (window.confirm('Arrêter le combat ? (Debug)')) {
                                        try {
                                            await combatService.endCombat(combat.id);
                                        } catch (e) {
                                            console.error(e);
                                            alert('Erreur stop combat');
                                        }
                                    }
                                }}
                                className="w-full bg-red-950/50 hover:bg-red-900 border border-red-900/50 text-red-500 hover:text-red-300 text-[10px] uppercase font-bold py-1 rounded transition"
                            >
                                🛑 Stopper Combat (Debug)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
