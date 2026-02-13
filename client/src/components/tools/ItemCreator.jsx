import { useState, useEffect } from 'react';
import dataService from '../../services/dataService'; // Ensure this is imported

export default function ItemCreator({ initialData, onCancel, onSuccess }) {
    const [item, setItem] = useState({
        name: '',
        type: 'objet',
        weight: 0,
        value: 0,
        damage: '',
        damage2: '',
        properties: '',
        visible: true
    });

    useEffect(() => {
        if (initialData) {
            setItem(initialData);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setItem({
                name: '',
                type: 'objet',
                weight: 0,
                value: 0,
                damage: '',
                damage2: '',
                properties: '',
                visible: true
            });
        }
    }, [initialData]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            let response;
            if (initialData) {
                // Update
                await dataService.updateItem(initialData.name, item);
                setMessage({ type: 'success', text: 'Objet mis à jour avec succès !' });
            } else {
                // Create
                const res = await fetch('http://localhost:3000/api/data/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
                if (!res.ok) throw new Error('Erreur création');
                setMessage({ type: 'success', text: 'Objet créé avec succès !' });
            }

            if (onSuccess) onSuccess();
            if (!initialData) {
                // Reset form only if creating
                setItem({
                    name: '',
                    type: 'objet',
                    weight: 0,
                    value: 0,
                    damage: '',
                    damage2: '',
                    properties: '',
                    visible: true
                });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors de l\'opération.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 max-w-2xl mx-auto p-4 rounded-lg border ${initialData ? 'bg-stone-800 border-amber-500/50' : ''}`}>
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-stone-200 border-b border-stone-600 pb-2 flex-grow">
                    {initialData ? `Modifier: ${initialData.name}` : 'Nouvel Objet'}
                </h2>
                <label className="flex items-center cursor-pointer ml-4">
                    <span className="mr-2 text-sm text-stone-400 font-bold">{item.visible ? 'Visible Joueurs' : 'Caché (MJ)'}</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={item.visible} onChange={e => setItem({ ...item, visible: e.target.checked })} />
                        <div className={`block w-10 h-6 rounded-full transition ${item.visible ? 'bg-green-600' : 'bg-stone-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${item.visible ? 'translate-x-4' : ''}`}></div>
                    </div>
                </label>
            </div>

            {message && (
                <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Nom de l'objet</label>
                <input
                    type="text"
                    required
                    value={item.name}
                    onChange={e => setItem({ ...item, name: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Épée longue enchantée"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Type</label>
                    <select
                        value={item.type}
                        onChange={e => setItem({ ...item, type: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                        <option value="objet">Objet</option>
                        <option value="arme">Arme</option>
                        <option value="armure">Armure</option>
                        <option value="bouclier">Bouclier</option>
                        <option value="consommable">Consommable</option>
                        <option value="outil">Outil</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Dégâts / CA (Optionnel)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={item.damage}
                            onChange={e => setItem({ ...item, damage: e.target.value })}
                            className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                            placeholder="Dommages (1d8)"
                        />
                        <input
                            type="text"
                            value={item.damage2}
                            onChange={e => setItem({ ...item, damage2: e.target.value })}
                            className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                            placeholder="Dommages 2 (1d4)"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Poids (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={item.weight}
                        onChange={e => setItem({ ...item, weight: parseFloat(e.target.value) })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Valeur (PO)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={item.value}
                        onChange={e => setItem({ ...item, value: parseFloat(e.target.value) })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Propriétés</label>
                <input
                    type="text"
                    value={item.properties}
                    onChange={e => setItem({ ...item, properties: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Versatile (1d10), Légère"
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded shadow-lg transform transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? (initialData ? 'Modification...' : 'Création...') : (initialData ? 'Enregistrer les modifications' : 'Créer l\'Objet')}
                </button>
                {initialData && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-stone-600 hover:bg-stone-500 text-white font-bold py-2 px-6 rounded shadow-lg ml-4 transition"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
}
