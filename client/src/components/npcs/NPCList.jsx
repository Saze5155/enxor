import { useState, useEffect } from 'react';
import npcService from '../../services/npcService';
import NPCCard from './NPCCard';

export default function NPCList({ onEdit, refreshTrigger }) {
    const [npcs, setNPCs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ role: '', race: '', important: false });

    useEffect(() => {
        loadNPCs();
    }, [refreshTrigger]);

    const loadNPCs = async () => {
        setLoading(true);
        try {
            const data = await npcService.getNPCs();
            setNPCs(data);
        } catch (error) {
            console.error('Error loading NPCs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await npcService.deleteNPC(id);
            loadNPCs();
        } catch (error) {
            console.error('Error deleting NPC:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const filteredNPCs = npcs.filter(npc => {
        if (filter.role && !npc.role.toLowerCase().includes(filter.role.toLowerCase())) return false;
        if (filter.race && !npc.race.toLowerCase().includes(filter.race.toLowerCase())) return false;
        if (filter.important && !npc.isImportant) return false;
        return true;
    });

    if (loading) {
        return <div className="text-center text-stone-400 py-10">Chargement...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 items-center bg-stone-800/50 p-3 rounded-lg">
                <input
                    type="text"
                    placeholder="Filtrer par rôle..."
                    value={filter.role}
                    onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                    className="flex-1 bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Filtrer par race..."
                    value={filter.race}
                    onChange={(e) => setFilter({ ...filter, race: e.target.value })}
                    className="flex-1 bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
                />
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-300">
                    <input
                        type="checkbox"
                        checked={filter.important}
                        onChange={(e) => setFilter({ ...filter, important: e.target.checked })}
                        className="w-4 h-4"
                    />
                    ⭐ Importants uniquement
                </label>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNPCs.length === 0 ? (
                    <div className="col-span-2 text-center text-stone-500 py-10">
                        Aucun PNJ trouvé
                    </div>
                ) : (
                    filteredNPCs.map(npc => (
                        <NPCCard
                            key={npc.id}
                            npc={npc}
                            onEdit={onEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
