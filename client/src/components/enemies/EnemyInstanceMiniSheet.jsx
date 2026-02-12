import { useState } from 'react';
import enemyService from '../../services/enemyService';

export default function EnemyInstanceMiniSheet({ instance, onUpdate, onDelete }) {
    const [loading, setLoading] = useState(false);

    const handleHpChange = async (amount) => {
        setLoading(true);
        try {
            const newHp = Math.max(0, Math.min(instance.hpMax, instance.hpCurrent + amount));
            const status = newHp === 0 ? 'mort' : (newHp < instance.hpMax * 0.2 ? 'critique' : 'vivant');

            await enemyService.updateEnemyInstance(instance.id, {
                hpCurrent: newHp,
                status: status
            });
            onUpdate();
        } catch (error) {
            console.error("HP update error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Supprimer ${instance.name} ?`)) return;
        try {
            await enemyService.deleteEnemyInstance(instance.id);
            onDelete();
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const statusColors = {
        vivant: 'bg-green-700/20 text-green-400 border-green-700/50',
        mort: 'bg-red-900/40 text-red-500 border-red-900',
        critique: 'bg-orange-700/20 text-orange-400 border-orange-700/50',
        inconscient: 'bg-indigo-900/20 text-indigo-400 border-indigo-900/50'
    };

    const hpPercent = (instance.hpCurrent / instance.hpMax) * 100;
    const hpColor = hpPercent > 50 ? 'bg-green-600' : (hpPercent > 20 ? 'bg-orange-500' : 'bg-red-600');

    return (
        <div className={`p-3 rounded border transition-all ${instance.isBoss ? 'border-red-500 bg-red-900/10' : 'border-stone-700 bg-stone-800'}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className={`font-bold flex items-center gap-2 ${instance.isBoss ? 'text-red-500' : 'text-stone-100'}`}>
                        {instance.isBoss && '👑'} {instance.name}
                        {instance.isUnique && <span className="text-[10px] bg-stone-700 px-1 rounded uppercase">Unique</span>}
                    </h3>
                    <div className="text-[10px] text-stone-500 uppercase tracking-tighter">
                        {instance.enemyType.name} ({instance.enemyType.creatureType})
                    </div>
                </div>
                <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusColors[instance.status] || 'bg-stone-700'}`}>
                    {instance.status}
                </div>
            </div>

            {/* HP Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-1">
                    <span>POINTS DE VIE</span>
                    <span>{instance.hpCurrent} / {instance.hpMax}</span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-700">
                    <div
                        className={`h-full transition-all duration-500 ${hpColor}`}
                        style={{ width: `${hpPercent}%` }}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between items-center gap-2">
                <div className="flex gap-1">
                    <button
                        disabled={loading || instance.hpCurrent === 0}
                        onClick={() => handleHpChange(-1)}
                        className="w-7 h-7 bg-stone-700 hover:bg-red-700 text-white rounded flex items-center justify-center font-bold text-sm transition-colors"
                    >
                        -1
                    </button>
                    <button
                        disabled={loading || instance.hpCurrent === 0}
                        onClick={() => handleHpChange(-5)}
                        className="w-8 h-7 bg-stone-900 border border-stone-700 hover:bg-red-900 text-white rounded flex items-center justify-center font-bold text-xs transition-colors"
                    >
                        -5
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => handleHpChange(1)}
                        className="w-7 h-7 bg-stone-700 hover:bg-green-700 text-white rounded flex items-center justify-center font-bold text-sm transition-colors ml-2"
                    >
                        +
                    </button>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleDelete} className="text-stone-500 hover:text-red-500 transition-colors p-1" title="Retirer">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}
