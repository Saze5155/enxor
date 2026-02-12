import { useState, useEffect } from 'react';
import enemyService from '../../services/enemyService';

export default function EnemyInstanceCreator({ campaignId, enemyTypes, onCancel, onSuccess }) {
    const [selectedTypeId, setSelectedTypeId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [nameOverride, setNameOverride] = useState('');
    const [isUnique, setIsUnique] = useState(false);
    const [isBoss, setIsBoss] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (enemyTypes && enemyTypes.length > 0 && !selectedTypeId) {
            setSelectedTypeId(enemyTypes[0].id);
        }
    }, [enemyTypes, selectedTypeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const selectedType = enemyTypes.find(t => t.id === selectedTypeId);
            await enemyService.createEnemyInstances({
                enemyTypeId: selectedTypeId,
                campaignId,
                quantity: isUnique ? 1 : quantity,
                name: nameOverride || (selectedType ? selectedType.name : ""),
                isUnique,
                isBoss
            });
            onSuccess();
        } catch (error) {
            alert("Erreur lors de la création de l'instance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-stone-800 p-6 rounded-lg border border-stone-600 shadow-2xl max-w-md w-full animate-fadeIn">
            <h2 className="text-xl font-bold text-amber-500 mb-4 flex justify-between items-center">
                <span>Invoquer des Créatures</span>
                <button onClick={onCancel} className="text-stone-500 hover:text-stone-300 text-sm font-normal">Annuler</button>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Type de créature</label>
                    <select
                        value={selectedTypeId}
                        onChange={(e) => setSelectedTypeId(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white outline-none focus:border-amber-500"
                    >
                        {enemyTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.creatureType})</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Nom (Optionnel)</label>
                        <input
                            type="text"
                            value={nameOverride}
                            onChange={(e) => setNameOverride(e.target.value)}
                            placeholder="Nom personnalisé..."
                            className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white outline-none focus:border-amber-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isUnique}
                                onChange={(e) => setIsUnique(e.target.checked)}
                                className="accent-amber-500"
                            />
                            <span className="text-sm text-stone-300 font-bold group-hover:text-amber-500">Ennemi Unique</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isBoss}
                                onChange={(e) => setIsBoss(e.target.checked)}
                                className="accent-red-500"
                            />
                            <span className="text-sm text-red-400 font-bold group-hover:text-red-300">Boss de Zone</span>
                        </label>
                    </div>
                    {!isUnique && (
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Quantité</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white outline-none focus:border-amber-500 font-bold"
                            />
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-stone-400 hover:text-white font-bold transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        {loading ? 'Invocation...' : 'Ajouter à la Session'}
                    </button>
                </div>
            </form>
        </div>
    );
}
