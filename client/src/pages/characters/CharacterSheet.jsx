import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import characterService from '../../services/characterService';
import InventoryManager from '../../components/InventoryManager';

const STAT_LABELS = {
    str: 'Force', dex: 'Dextérité', con: 'Constitution',
    int: 'Intelligence', wis: 'Sagesse', cha: 'Charisme'
};

const CLASS_HIT_DIE = {
    'Sorcier': 6, 'Mage': 6,
    'Artificier': 8, 'Barde': 8, 'Clerc': 8, 'Druide': 8, 'Moine': 8, 'Roublard': 8, 'Occultiste': 8, 'Voleur': 8, 'Prêtre': 8, // Mapping FR/EN mix coverage
    'Guerrier': 10, 'Paladin': 10, 'Rôdeur': 10,
    'Barbare': 12
};

export default function CharacterSheet({ character: propCharacter = null, isGM = false }) {
    const { id } = useParams();
    const [char, setChar] = useState(propCharacter);
    const [loading, setLoading] = useState(!propCharacter);

    useEffect(() => {
        if (propCharacter) {
            setChar(propCharacter);
            setLoading(false);
            return;
        }

        if (id) {
            loadCharacter();
        }
    }, [id, propCharacter]);

    const loadCharacter = async () => {
        try {
            const data = await characterService.getOne(id);
            setChar(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleInventoryUpdate = async ({ inventory, money }) => {
        // Optimistic UI update
        const payload = { inventory, money };
        setChar(prev => ({ ...prev, inventory: { items: inventory, money } }));

        try {
            await characterService.update(char.id, payload);
        } catch (error) {
            console.error("Failed to save inventory", error);
        }
    };

    const handleLevelUp = async () => {
        // Retrieve class info for hit die
        const hitDie = CLASS_HIT_DIE[char.class] || 8;
        const conMod = Math.floor((char.stats.con - 10) / 2);
        const hpGain = Math.max(1, (hitDie / 2) + 1 + conMod);

        // GM Bypass: No confirm, no success alert (silent)
        if (!isGM) {
            if (!window.confirm(`Félicitations ! Voulez-vous passer au niveau ${char.level + 1} ?`)) return;
        }

        const newLevel = char.level + 1;
        const newHpMax = char.hpMax + hpGain;
        const newHpCurrent = char.hpCurrent + hpGain;

        const payload = {
            level: newLevel,
            hpMax: newHpMax,
            hpCurrent: newHpCurrent
        };

        // Optimistic
        setChar(prev => ({ ...prev, ...payload }));

        try {
            await characterService.update(char.id, payload);
            if (!isGM) alert(`Niveau ${newLevel} atteint ! PV Max +${hpGain}`);
        } catch (error) {
            console.error("Level up failed", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Chargement du grimoire...</div>;
    if (!char) return <div className="p-8 text-center text-red-400">Personnage introuvable.</div>;

    const getMod = (val) => Math.floor((val - 10) / 2);
    const formatMod = (val) => {
        const mod = getMod(val);
        return mod > 0 ? `+${mod}` : mod;
    };

    return (
        <div className="p-2 md:p-4 min-h-screen bg-stone-900">
            {/* Parchemin Container - COMPACT (max-w-3xl) */}
            <div className="max-w-3xl mx-auto bg-[#fdf6e3] text-stone-900 rounded-lg shadow-2xl overflow-hidden font-serif relative">

                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

                {/* Header Section - COMPACT */}
                <div className="p-4 border-b-2 border-stone-400 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        {/* Smaller Avatar */}
                        <div className="w-16 h-16 bg-stone-300 rounded-full border-4 border-stone-500 flex items-center justify-center text-2xl shadow-inner">
                            {char.avatarUrl ? <img src={char.avatarUrl} className="w-full h-full object-cover rounded-full" /> : '👤'}
                        </div>
                        <div>
                            {/* Smaller Title */}
                            <h1 className="text-2xl font-bold uppercase tracking-wider text-stone-800 leading-none">{char.name}</h1>
                            <div className="flex items-center gap-2 text-stone-600 font-bold italic text-sm mt-1">
                                <span>{char.race}</span>
                                <span>•</span>
                                <span>{char.class} Niv. {char.level}</span>
                                <button
                                    onClick={handleLevelUp}
                                    className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow border border-yellow-700 animate-pulse"
                                    title="Monter de niveau"
                                >
                                    🆙
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 text-center">
                        <div>
                            <span className="block text-[10px] uppercase text-stone-500 font-bold">Inspiration</span>
                            <div className="w-8 h-8 border-2 border-stone-400 rounded-full flex items-center justify-center mx-auto mt-1">
                                <input type="checkbox" className="w-4 h-4 accent-red-700 cursor-pointer" />
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-stone-500 font-bold">Maîtrise</span>
                            <div className="text-xl font-bold mt-1">+{2 + Math.floor((char.level - 1) / 4)}</div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-stone-500 font-bold">Vitesse</span>
                            <div className="text-xl font-bold mt-1">{char.speed}m</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">

                    {/* LEFT COLUMN: Stats (2 cols) - COMPACT */}
                    <div className="md:col-span-2 bg-stone-200 p-2 border-r border-stone-400 flex flex-col gap-2">
                        {Object.keys(char.stats).map(stat => (
                            <div key={stat} className="bg-white rounded-lg border border-stone-400 p-1 text-center shadow-sm relative group">
                                <span className="text-[8px] uppercase font-bold text-stone-500 tracking-widest">{STAT_LABELS[stat].substring(0, 3)}</span>
                                <div className="text-xl font-bold text-stone-800 my-0.5">{formatMod(char.stats[stat])}</div>
                                <div className="w-6 h-5 bg-stone-100 border border-stone-300 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold text-stone-600 -mb-3 relative z-10">
                                    {char.stats[stat]}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CENTER COLUMN: Combat & Activity (7 cols) - COMPACT */}
                    <div className="md:col-span-7 p-4">

                        {/* Vital Stats */}
                        <div className="flex justify-between items-center mb-4 gap-2">
                            <div className="bg-white border-2 border-stone-400 rounded-lg p-1 text-center w-1/3 shadow">
                                <span className="text-[10px] uppercase font-bold text-stone-500">CA</span>
                                <div className="text-2xl font-bold text-stone-800">🛡️ {char.ac}</div>
                            </div>
                            <div className="bg-white border-2 border-stone-400 rounded-lg p-1 text-center w-1/3 shadow">
                                <span className="text-[10px] uppercase font-bold text-stone-500">Init</span>
                                <div className="text-2xl font-bold text-stone-800">⚡ {formatMod(char.stats.dex)}</div>
                            </div>
                            <div className="bg-white border-2 border-stone-400 rounded-lg p-1 text-center w-1/3 shadow">
                                <span className="text-[10px] uppercase font-bold text-stone-500">PV</span>
                                <div className="text-2xl font-bold text-red-700 mt-0.5">
                                    {char.hpCurrent} <span className="text-sm text-stone-400">/ {char.hpMax}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs/Sections */}
                        <div className="space-y-4">
                            {/* Attaques / Actions */}
                            <div className="border border-stone-300 rounded p-3 bg-white/50">
                                <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-1 mb-2 uppercase text-xs">⚔️ Attaques & Sorts</h3>
                                <div className="text-xs text-stone-500 italic text-center py-2">Aucune arme équipée.</div>
                            </div>

                            {/* Features */}
                            <div className="border border-stone-300 rounded p-3 bg-white/50">
                                <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-1 mb-2 uppercase text-xs">🧩 Traits & Capacités</h3>
                                <div className="text-xs text-stone-800">
                                    <p><strong>Vision dans le noir:</strong> Portée 18m.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Skills & Inventory (3 cols) - COMPACT */}
                    <div className="md:col-span-3 bg-stone-100 p-3 border-l border-stone-400 text-xs">

                        <div className="mb-4">
                            <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-1 mb-2 uppercase text-[10px]">Compétences</h3>
                            <ul className="space-y-0.5 text-stone-600">
                                <li className="flex justify-between"><span>Acrobaties</span> <span>{formatMod(char.stats.dex)}</span></li>
                                <li className="flex justify-between font-bold text-stone-800"><span>Athlétisme</span> <span>{formatMod(char.stats.str + 2)}</span> ●</li>
                                <li className="flex justify-between"><span>Discrétion</span> <span>{formatMod(char.stats.dex)}</span></li>
                                <li className="flex justify-between"><span>Perception</span> <span>{formatMod(char.stats.wis)}</span></li>
                            </ul>
                        </div>

                        <div className="flex-1 flex flex-col">
                            {/* Inventory Manager Component */}
                            <InventoryManager
                                inventory={char.inventory?.items || (Array.isArray(char.inventory) ? char.inventory : [])}
                                money={char.inventory?.money || { gp: 0, sp: 0, cp: 0 }}
                                onUpdate={handleInventoryUpdate}
                            />
                        </div>

                    </div>
                </div>

                {/* Footer Notes */}
                <div className="p-2 bg-stone-200 text-[10px] text-stone-500 text-center border-t border-stone-400 relative z-10">
                    {char.background} • {char.alignment}
                </div>
            </div>
        </div>
    );
}
