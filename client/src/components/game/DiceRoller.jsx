import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';

const DICE_TYPES = [
    { label: 'd4', value: 4, icon: '🔺' },
    { label: 'd6', value: 6, icon: '🎲' },
    { label: 'd8', value: 8, icon: '♦️' },
    { label: 'd10', value: 10, icon: '🔻' },
    { label: 'd12', value: 12, icon: '⬢' },
    { label: 'd20', value: 20, icon: '🌟' },
    { label: 'd100', value: 100, icon: '💯' },
];

export default function DiceRoller({ onClose }) {
    const { sendRoll, socket } = useSocket();
    const [selectedDie, setSelectedDie] = useState(20);
    const [count, setCount] = useState(1);
    const [modifier, setModifier] = useState(0);

    const handleRoll = () => {
        let total = 0;
        const rolls = [];

        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * selectedDie) + 1;
            rolls.push(roll);
            total += roll;
        }

        const finalResult = total + modifier;
        const formula = `${count}d${selectedDie}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`;

        // Send to server
        sendRoll({
            campaignId: '1', // Hardcoded for now
            rollerName: 'Joueur', // Should come from auth/context
            rollResult: finalResult,
            rolls: rolls,
            formula: formula,
            type: 'public' // Show to everyone
        });

        if (onClose) onClose();
    };

    return (
        <div className="bg-stone-800 p-4 rounded-lg shadow-xl border-2 border-stone-600 w-64 text-stone-200">
            <h3 className="font-bold border-b border-stone-600 mb-4 pb-2 text-center bg-stone-900 mx-[-16px] mt-[-16px] py-2 rounded-t-lg">
                🎲 Lanceur de Dés
            </h3>

            {/* Die Selection */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {DICE_TYPES.map(die => (
                    <button
                        key={die.label}
                        onClick={() => setSelectedDie(die.value)}
                        className={`p-2 rounded text-xs font-bold transition flex flex-col items-center gap-1
                            ${selectedDie === die.value
                                ? 'bg-indigo-600 text-white shadow-inner ring-2 ring-indigo-400'
                                : 'bg-stone-700 hover:bg-stone-600'}`}
                    >
                        <span className="text-lg">{die.icon}</span>
                        {die.label}
                    </button>
                ))}
            </div>

            {/* Settings */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1">
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Nombre</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-stone-900 border border-stone-600 rounded p-1 text-center font-bold"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Modificateur</label>
                    <input
                        type="number"
                        value={modifier}
                        onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                        className="w-full bg-stone-900 border border-stone-600 rounded p-1 text-center font-bold"
                    />
                </div>
            </div>

            <button
                onClick={handleRoll}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded shadow-lg transition transform active:scale-95"
            >
                LANCER !
            </button>
        </div>
    );
}
