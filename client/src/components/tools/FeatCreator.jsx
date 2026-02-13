import { useState, useEffect } from 'react';
import dataService from '../../services/dataService';

export default function FeatCreator({ initialData, onCancel, onSuccess }) {
    const [feat, setFeat] = useState({
        nom: '',
        description: '',
        prerequis: '',
        effets: [''],
        visible: true
    });

    useEffect(() => {
        if (initialData) {
            setFeat({
                ...initialData,
                prerequis: initialData.prerequis || '',
                effets: initialData.effets && initialData.effets.length > 0 ? initialData.effets : [''],
                visible: initialData.visible !== false
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setFeat({
                nom: '',
                description: '',
                prerequis: '',
                effets: [''],
                visible: true
            });
        }
    }, [initialData]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleEffectChange = (index, value) => {
        const newEffects = [...feat.effets];
        newEffects[index] = value;
        setFeat({ ...feat, effets: newEffects });
    };

    const addEffect = () => {
        setFeat({ ...feat, effets: [...feat.effets, ''] });
    };

    const removeEffect = (index) => {
        const newEffects = feat.effets.filter((_, i) => i !== index);
        setFeat({ ...feat, effets: newEffects });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Filter empty effects
        const cleanedFeat = {
            ...feat,
            effets: feat.effets.filter(e => e.trim() !== ''),
            prerequis: feat.prerequis.trim() === '' ? null : feat.prerequis
        };

        try {
            if (initialData) {
                // Update
                await dataService.updateFeat(initialData.nom, cleanedFeat);
                setMessage({ type: 'success', text: 'Don mis à jour avec succès !' });
            } else {
                // Create
                const response = await fetch('http://localhost:3000/api/data/feats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanedFeat)
                });

                if (!response.ok) throw new Error('Erreur création');
                setMessage({ type: 'success', text: 'Don créé avec succès !' });
            }

            if (onSuccess) onSuccess();
            if (!initialData) {
                setFeat({
                    nom: '',
                    description: '',
                    prerequis: '',
                    effets: ['']
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
                    {initialData ? `Modifier: ${initialData.nom}` : 'Nouveau Don (Capacité)'}
                </h2>
                <label className="flex items-center cursor-pointer ml-4">
                    <span className="mr-2 text-sm text-stone-400 font-bold">{feat.visible ? 'Visible Joueurs' : 'Caché (MJ)'}</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={feat.visible} onChange={e => setFeat({ ...feat, visible: e.target.checked })} />
                        <div className={`block w-10 h-6 rounded-full transition ${feat.visible ? 'bg-green-600' : 'bg-stone-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${feat.visible ? 'translate-x-4' : ''}`}></div>
                    </div>
                </label>
            </div>

            {message && (
                <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Nom du Don</label>
                <input
                    type="text"
                    required
                    value={feat.nom}
                    onChange={e => setFeat({ ...feat, nom: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Maître des Armes d'Hast"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Prérequis (Optionnel)</label>
                <input
                    type="text"
                    value={feat.prerequis}
                    onChange={e => setFeat({ ...feat, prerequis: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Force 13 ou supérieure"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Description Globale</label>
                <textarea
                    required
                    value={feat.description}
                    onChange={e => setFeat({ ...feat, description: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500 h-24"
                    placeholder="Description générale du don..."
                />
            </div>

            <div className="bg-stone-900/50 p-4 rounded border border-stone-700">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider">Effets / Bénéfices</label>
                    <button type="button" onClick={addEffect} className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded text-stone-300">
                        + Ajouter un effet
                    </button>
                </div>
                <div className="space-y-2">
                    {feat.effets.map((eff, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={eff}
                                onChange={e => handleEffectChange(index, e.target.value)}
                                className="flex-1 bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 text-sm focus:outline-none focus:border-amber-500"
                                placeholder={`Détail de l'effet...`}
                            />
                            <button
                                type="button"
                                onClick={() => removeEffect(index)}
                                className="text-red-400 hover:text-red-300 px-2"
                                title="Supprimer"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded shadow-lg transform transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? (initialData ? 'Modification...' : 'Création...') : (initialData ? 'Enregistrer les modifications' : 'Créer le Don')}
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
