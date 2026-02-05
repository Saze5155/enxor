import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

// Text-based Dice (No Icons as requested)
const DICE_TYPES = [
    { type: 'd4', max: 4, label: 'D4' },
    { type: 'd6', max: 6, label: 'D6' },
    { type: 'd8', max: 8, label: 'D8' },
    { type: 'd10', max: 10, label: 'D10' },
    { type: 'd12', max: 12, label: 'D12' },
    { type: 'd20', max: 20, label: 'D20' },
    { type: 'd100', max: 100, label: 'D100' },
];

export default function DiceDock({ campaignId, players = [], activeCharacter = null, senderName = null }) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [rolling, setRolling] = useState(false);

    // Modes
    const [isMySecret, setIsMySecret] = useState(false); // MJ Self Toggle
    const [blindMode, setBlindMode] = useState(false); // Global Blind Mode

    // Modifiers & Target
    const [modifier, setModifier] = useState(0);
    const [targetPlayerId, setTargetPlayerId] = useState(""); // "" = Me (GM)

    console.log("DiceDock PROPS - Players:", players);

    const handleModifierChange = (e) => {
        console.log("Modifier Changed to:", e.target.value);
        setModifier(e.target.value);
    };

    const handleTargetChange = (e) => {
        console.log("Target Changed to:", e.target.value);
        setTargetPlayerId(e.target.value);
    };

    useEffect(() => {
        if (!socket) return;

        const handleBlindMode = (enabled) => {
            console.log("Blind Mode Update Received:", enabled);
            setBlindMode(enabled);
        };

        const handleModifierUpdate = ({ targetId, modifier: newMod }) => {
            console.log("Modifier Update Received for:", targetId, "Value:", newMod);
            // If I am the target, update my modifier
            if (user.id === targetId) {
                setModifier(newMod);
            }
        };

        socket.on('blind_mode_update', handleBlindMode);
        socket.on('modifier_updated', handleModifierUpdate);

        return () => {
            socket.off('blind_mode_update', handleBlindMode);
            socket.off('modifier_updated', handleModifierUpdate);
        };
    }, [socket, user.id]);

    const isGM = user?.role === 'MJ';

    // Sync Modifier to Player (MJ Only)
    useEffect(() => {
        if (isGM && targetPlayerId && socket) {
            console.log("MJ Syncing Modifier to:", targetPlayerId, "Value:", modifier);
            socket.emit('force_modifier', {
                campaignId,
                targetId: targetPlayerId,
                modifier
            });
        }
    }, [modifier, targetPlayerId, isGM, socket, campaignId]);

    const rollDice = (diceType, max) => {
        if (rolling) return;
        setRolling(true);

        const rawResult = Math.floor(Math.random() * max) + 1;
        const total = rawResult + parseInt(modifier || 0);

        // Determine Secret Status
        const isSecretRoll = isGM ? isMySecret : blindMode;

        // Determine Roller Name
        // Default to senderName (Character Name) if provided, else User Username
        let rollerName = senderName || user.username;

        // If GM rolling for someone else
        if (isGM && targetPlayerId) {
            const target = players.find(p => p.id === targetPlayerId);
            if (target) {
                rollerName = `MJ (pour ${target.username})`;
            }
        }

        console.log("Rolling Clicked. State:", { modifier, targetPlayerId, rollerName, isGM, playersCount: players.length });

        if (socket) {
            console.log(`[DiceRoll] Emitting roll: ${diceType} Result: ${total} (Raw: ${rawResult}, Mod: ${modifier})`);
            socket.emit('dice_roll', {
                campaignId,
                rollerName: rollerName,
                diceType,
                result: total,
                rawResult, // Original die roll
                modifier: parseInt(modifier || 0),
                isSecret: isSecretRoll,
                timestamp: new Date().toISOString()
            });
        }

        setTimeout(() => setRolling(false), 1000);
    };

    const toggleBlindMode = () => {
        const newState = !blindMode;
        // Optimistic update
        setBlindMode(newState);
        socket.emit('toggle_blind_mode', { campaignId, enabled: newState });
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-end gap-2 z-50">

            <div className="flex flex-col gap-2 items-end mb-2 mr-2">
                {/* MJ Target Selector */}
                {isGM && (
                    <div className="flex items-center bg-stone-800 rounded px-2 border border-stone-600">
                        <span className="material-symbols-outlined text-stone-400 text-sm mr-1">person</span>
                        <select
                            value={targetPlayerId}
                            onChange={handleTargetChange}
                            className="bg-transparent text-stone-300 text-xs py-1 outline-none w-24 cursor-pointer"
                        >
                            <option value="">Moi-même</option>
                            {players.filter(p => p.role !== 'MJ').map(p => (
                                <option key={p.id} value={p.id}>{p.username}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Modifier Input */}
                <div className="bg-stone-800 border border-stone-600 rounded-lg flex items-center px-2 py-1 shadow-lg">
                    <span className="text-stone-500 text-xs font-bold mr-1">MODIF</span>
                    <input
                        type="number"
                        value={modifier}
                        onChange={handleModifierChange}
                        className="bg-transparent text-white text-center font-bold w-12 outline-none appearance-none"
                        placeholder="+0"
                    />
                </div>
            </div>

            {/* MJ Controls */}
            {isGM && (
                <div className="flex flex-col gap-2 mb-2">
                    {/* Self Secret Toggle */}
                    <button
                        onClick={() => setIsMySecret(!isMySecret)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition shadow-lg ${isMySecret ? 'bg-indigo-900 border-indigo-500 text-indigo-300' : 'bg-stone-800 border-stone-600 text-stone-500'}`}
                        title="Mon Jet Secret (Moi uniquement)"
                    >
                        <span className="material-symbols-outlined">
                            {isMySecret ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                    {/* Global Blind Mode Toggle */}
                    <button
                        onClick={toggleBlindMode}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition shadow-lg ${blindMode ? 'bg-red-900 border-red-500 text-white animate-pulse' : 'bg-stone-800 border-stone-600 text-stone-500'}`}
                        title={blindMode ? "Mode Confidentiel ACTIVÉ (Joueurs cachés)" : "Activer Mode Confidentiel"}
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {blindMode ? "lock" : "lock_open"}
                        </span>
                    </button>
                </div>
            )}

            {/* Player Indicator (if Blind Mode is Active) */}
            {!isGM && blindMode && (
                <div className="bg-red-900/80 text-white text-xs px-3 py-1 rounded border border-red-500 mb-4 animate-pulse flex items-center shadow-lg backdrop-blur">
                    <span className="material-symbols-outlined text-sm mr-2">lock</span>
                    Jets confidentiels (MJ seul)
                </div>
            )}

            {/* Docks */}
            <div className={`bg-stone-900/90 border ${blindMode && !isGM ? 'border-red-900 shadow-red-900/20' : 'border-stone-600'} rounded-2xl px-6 py-3 flex gap-4 shadow-2xl backdrop-blur-md transition-colors duration-500`}>
                {DICE_TYPES.map((die) => (
                    <button
                        key={die.type}
                        onClick={() => rollDice(die.type, die.max)}
                        className="flex flex-col items-center justify-center group relative transition transform hover:-translate-y-2 hover:scale-110 active:scale-95"
                        disabled={rolling}
                    >
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-stone-800 border border-stone-600 group-hover:border-yellow-500 group-hover:bg-stone-700/80 transition-all shadow-lg">
                            <span className="text-xl font-black text-stone-300 group-hover:text-yellow-400 font-serif tracking-wider">
                                {die.label}
                            </span>
                        </div>

                        {/* Tooltip or Glow */}
                        <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 rounded-full transition blur-md"></div>
                    </button>
                ))}
            </div>
        </div>
    );
}
