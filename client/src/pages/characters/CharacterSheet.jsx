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

export default function CharacterSheet() {
    const { id } = useParams();
    const [char, setChar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCharacter();
    }, [id]);

    const loadCharacter = async () => {
        try {
            const data = await characterService.getOne(id);
            setChar(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInventoryUpdate = async (updatedData) => {
        // Optimistic update
        setChar(prev => ({ ...prev, ...updatedData }));

        try {
            // Save to backend
            // Structure: { items: [...], money: { gp: 0, sp: 0, cp: 0 } }

            // Adjust payload for backend
            const payload = {
                inventory: {
                    items: updatedData.inventory,
                    money: updatedData.money
                }
            };

            await characterService.update(id, payload);
        } catch (error) {
            console.error("Failed to save inventory", error);
        }
    };

    const handleLevelUp = async () => {
        if (!window.confirm(`Félicitations ! Voulez-vous passer au niveau ${char.level + 1} ?`)) return;

        const hitDie = CLASS_HIT_DIE[char.class] || 8;
        const conMod = Math.floor((char.stats.con - 10) / 2);
        const hpGain = Math.max(1, (hitDie / 2) + 1 + conMod); // Standard fixed HP rule

        const newLevel = char.level + 1;
        const newHpMax = char.hpMax + hpGain;
        const newHpCurrent = char.hpCurrent + hpGain; // Optional: heal the gain amount? usually yes

        const payload = {
            level: newLevel,
            hpMax: newHpMax,
            hpCurrent: newHpCurrent
        };

        // Optimistic
        setChar(prev => ({ ...prev, ...payload }));

        try {
            await characterService.update(id, payload);
            alert(`Niveau ${newLevel} atteint ! PV Max +${hpGain}`);
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
        <div className="p-4 md:p-8 min-h-screen bg-stone-900">
            {/* Parchemin Container */}
            <div className="max-w-5xl mx-auto bg-[#fdf6e3] text-stone-900 rounded-lg shadow-2xl overflow-hidden font-serif relative">

                {/* Texture Overlay (Optional, simple CSS for now) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

                {/* Header Section */}
                <div className="p-8 border-b-2 border-stone-400 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-stone-300 rounded-full border-4 border-stone-500 flex items-center justify-center text-4xl shadow-inner">
                            {char.avatarUrl ? <img src={char.avatarUrl} className="w-full h-full object-cover rounded-full" /> : '👤'}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold uppercase tracking-wider text-stone-800">{char.name}</h1>
                            <div className="flex items-center gap-3 text-stone-600 font-bold italic">
                                <span>{char.race}</span>
                                <span>•</span>
                                <span>{char.class} Niv. {char.level}</span>
                                <button
                                    onClick={handleLevelUp}
                                    className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded-full shadow border border-yellow-700 animate-pulse"
                                    title="Monter de niveau"
                                >
                                    🆙
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 text-center">
                        <div>
                            <span className="block text-xs uppercase text-stone-500 font-bold">Inspiration</span>
                            <div className="w-12 h-12 border-2 border-stone-400 rounded-full flex items-center justify-center mx-auto mt-1">
                                <input type="checkbox" className="w-6 h-6 accent-red-700 cursor-pointer" />
                            </div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-stone-500 font-bold">Maîtrise</span>
                            <div className="text-2xl font-bold mt-2">+{2 + Math.floor((char.level - 1) / 4)}</div>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-stone-500 font-bold">Vitesse</span>
                            <div className="text-2xl font-bold mt-2">{char.speed}m</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10">

                    {/* LEFT COLUMN: Stats (2 cols) */}
                    <div className="md:col-span-3 bg-stone-200 p-6 border-r border-stone-400 flex flex-col gap-6">
                        {Object.keys(char.stats).map(stat => (
                            <div key={stat} className="bg-white rounded-xl border border-stone-400 p-2 text-center shadow-sm relative group">
                                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">{STAT_LABELS[stat]}</span>
                                <div className="text-3xl font-bold text-stone-800 my-1">{formatMod(char.stats[stat])}</div>
                                <div className="w-10 h-8 bg-stone-100 border border-stone-300 rounded-full flex items-center justify-center mx-auto text-sm font-bold text-stone-600 -mb-5 relative z-10">
                                    {char.stats[stat]}
                                </div>
                                {/* Hover Roll Simulation (Visual only for now) */}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center cursor-pointer">
                                    🎲
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CENTER COLUMN: Combat & Activity (6 cols) */}
                    <div className="md:col-span-6 p-6">

                        {/* Vital Stats */}
                        <div className="flex justify-between items-center mb-8 gap-4">
                            <div className="bg-white border-2 border-stone-400 rounded-lg p-2 text-center w-1/3 shadow">
                                <span className="text-xs uppercase font-bold text-stone-500">Classe d'Armure</span>
                                <div className="text-4xl font-bold text-stone-800">🛡️ {char.ac}</div>
                            </div>
                            <div className="bg-white border-2 border-stone-400 rounded-lg p-2 text-center w-1/3 shadow">
                                <span className="text-xs uppercase font-bold text-stone-500">Initiative</span>
                                <div className="text-4xl font-bold text-stone-800">⚡ {formatMod(char.stats.dex)}</div>
                            </div>
                            <div className="bg-white border-2 border-stone-400 rounded-lg p-2 text-center w-1/3 shadow">
                                <span className="text-xs uppercase font-bold text-stone-500">PV Actuels / Max</span>
                                <div className="text-3xl font-bold text-red-700 mt-1">
                                    {char.hpCurrent} <span className="text-lg text-stone-400">/ {char.hpMax}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs/Sections Placeholder */}
                        <div className="space-y-6">
                            {/* Attaques / Actions */}
                            <div className="border border-stone-300 rounded p-4 bg-white/50">
                                <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-2 mb-2 uppercase text-sm">⚔️ Attaques & Sorts</h3>
                                <div className="text-sm text-stone-500 italic text-center py-4">Aucune arme équipée.</div>
                            </div>

                            {/* Features */}
                            <div className="border border-stone-300 rounded p-4 bg-white/50">
                                <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-2 mb-2 uppercase text-sm">🧩 Traits & Capacités</h3>
                                <div className="text-sm text-stone-800">
                                    <p><strong>Vision dans le noir:</strong> Vous voyez dans le noir total comme dans la pénombre.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Skills & Inventory (3 cols) */}
                    <div className="md:col-span-3 bg-stone-100 p-6 border-l border-stone-400 text-sm">

                        <div className="mb-8">
                            <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-1 mb-3 uppercase text-xs">Compétences</h3>
                            <ul className="space-y-1 text-stone-600">
                                <li className="flex justify-between"><span>Acrobaties <span className="text-xs text-stone-400">(Dex)</span></span> <span>{formatMod(char.stats.dex)}</span></li>
                                <li className="flex justify-between font-bold text-stone-800"><span>Athlétisme <span className="text-xs text-stone-400">(Str)</span></span> <span>{formatMod(char.stats.str + 2)}</span> ●</li>
                                <li className="flex justify-between"><span>Discrétion <span className="text-xs text-stone-400">(Dex)</span></span> <span>{formatMod(char.stats.dex)}</span></li>
                                <li className="flex justify-between"><span>Perception <span className="text-xs text-stone-400">(Wis)</span></span> <span>{formatMod(char.stats.wis)}</span></li>
                            </ul>
                        </div>

                        <div className="flex-1 flex flex-col">
                            {/* Inventory Manager Component */}
                            <InventoryManager
                                inventory={char.inventory?.items || (Array.isArray(char.inventory) ? char.inventory : [])} // Handle legacy array vs new object structure
                                money={char.inventory?.money || { gp: 0, sp: 0, cp: 0 }}
                                onUpdate={handleInventoryUpdate}
                            />
                        </div>

                    </div>
                </div>

                {/* Footer Notes */}
                <div className="p-4 bg-stone-200 text-xs text-stone-500 text-center border-t border-stone-400 relative z-10">
                    Background: {char.background || 'Inconnu'} • Alignement: {char.alignment || 'Neutre'}
                </div>
            </div>
        </div>
    );
}
