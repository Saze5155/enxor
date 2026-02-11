import { useState } from 'react';

export default function ItemCreator() {
    const [item, setItem] = useState({
        name: '',
        type: 'objet',
        weight: 0,
        value: 0,
        damage: '',
        properties: '',
        visible: true // Default visible
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('http://localhost:3000/api/data/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Objet créé avec succès !' });
                setItem({
                    name: '',
                    type: 'objet',
                    weight: 0,
                    value: 0,
                    damage: '',
                    properties: ''
                });
            } else {
                setMessage({ type: 'error', text: 'Erreur lors de la création.' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur réseau.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-stone-200 border-b border-stone-600 pb-2 flex-grow">Nouvel Objet</h2>
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
                    <input
                        type="text"
                        value={item.damage}
                        onChange={e => setItem({ ...item, damage: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                        placeholder="Ex: 1d8 / +2"
                    />
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
                    {loading ? 'Création...' : 'Créer l\'Objet'}
                </button>
            </div>
        </form>
    );
}
