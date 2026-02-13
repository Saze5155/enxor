import { useState, useEffect } from 'react';
import dataService from '../../services/dataService';

const ATTRIBUTES = [
    { id: 'str', label: 'Force', icon: '💪' },
    { id: 'dex', label: 'Dextérité', icon: '🏃' },
    { id: 'con', label: 'Constitution', icon: '🛡️' },
    { id: 'int', label: 'Intelligence', icon: '🧠' },
    { id: 'wis', label: 'Sagesse', icon: '🦉' },
    { id: 'cha', label: 'Charisme', icon: '🎭' }
];

export default function RaceCreator({ initialData, onCancel, onSuccess }) {
    const [race, setRace] = useState({
        nom: '',
        description: '',
        bonus_caracteristiques: {},
        vitesse: 9,
        bras: 2,
        traits: [''],
        visible: true
    });

    useEffect(() => {
        if (initialData) {
            setRace(initialData);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setRace({
                nom: '',
                description: '',
                bonus_caracteristiques: {},
                vitesse: 9,
                bras: 2,
                traits: [''],
                visible: true
            });
        }
    }, [initialData]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleBonusChange = (attrId, value) => {
        const val = parseInt(value);
        const newBonuses = { ...race.bonus_caracteristiques };
        if (val === 0 || isNaN(val)) {
            delete newBonuses[attrId];
        } else {
            newBonuses[attrId] = val;
        }
        setRace({ ...race, bonus_caracteristiques: newBonuses });
    };

    const handleTraitChange = (index, value) => {
        const newTraits = [...race.traits];
        newTraits[index] = value;
        setRace({ ...race, traits: newTraits });
    };

    const addTrait = () => {
        setRace({ ...race, traits: [...race.traits, ''] });
    };

    const removeTrait = (index) => {
        const newTraits = race.traits.filter((_, i) => i !== index);
        setRace({ ...race, traits: newTraits });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Filter empty traits
        const cleanedRace = {
            ...race,
            traits: race.traits.filter(t => t.trim() !== '')
        };

        try {
            if (initialData) {
                // Update
                await dataService.updateRace(initialData.nom, cleanedRace);
                setMessage({ type: 'success', text: 'Race mise à jour avec succès !' });
            } else {
                // Create
                const response = await fetch('http://localhost:3000/api/data/races', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanedRace)
                });
                if (!response.ok) throw new Error('Erreur création');
                setMessage({ type: 'success', text: 'Race créée avec succès !' });
            }

            if (onSuccess) onSuccess();
            if (!initialData) {
                // Reset form only if creating
                setRace({
                    nom: '',
                    description: '',
                    bonus_caracteristiques: {},
                    vitesse: 9,
                    bras: 2,
                    traits: [''],
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
                    {initialData ? `Modifier: ${initialData.nom}` : 'Nouvelle Race'}
                </h2>
                <label className="flex items-center cursor-pointer ml-4">
                    <span className="mr-2 text-sm text-stone-400 font-bold">{race.visible ? 'Visible Joueurs' : 'Caché (MJ)'}</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={race.visible} onChange={e => setRace({ ...race, visible: e.target.checked })} />
                        <div className={`block w-10 h-6 rounded-full transition ${race.visible ? 'bg-green-600' : 'bg-stone-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${race.visible ? 'translate-x-4' : ''}`}></div>
                    </div>
                </label>
            </div>

            {message && (
                <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Nom</label>
                    <input
                        type="text"
                        required
                        value={race.nom}
                        onChange={e => setRace({ ...race, nom: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                        placeholder="Ex: Elfe Sylvain"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Vitesse (m)</label>
                    <input
                        type="number"
                        step="0.5"
                        value={race.vitesse}
                        onChange={e => setRace({ ...race, vitesse: parseFloat(e.target.value) })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Nombre de Bras</label>
                    <input
                        type="number"
                        min="0"
                        value={race.bras}
                        onChange={e => setRace({ ...race, bras: parseInt(e.target.value) })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Description</label>
                <textarea
                    required
                    value={race.description}
                    onChange={e => setRace({ ...race, description: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500 h-24"
                    placeholder="Description de la race..."
                />
            </div>

            <div className="bg-stone-900/50 p-4 rounded border border-stone-700">
                <label className="block text-sm font-bold text-amber-500 mb-3 uppercase tracking-wider">Bonus de Caractéristiques</label>
                <div className="grid grid-cols-3 gap-4">
                    {ATTRIBUTES.map(attr => (
                        <div key={attr.id} className="flex items-center gap-2">
                            <span className="text-xl" title={attr.label}>{attr.icon}</span>
                            <div className="flex-1">
                                <label className="block text-xs text-stone-500 font-bold uppercase">{attr.id}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={race.bonus_caracteristiques[attr.id] || ''}
                                    onChange={e => handleBonusChange(attr.id, e.target.value)}
                                    className="w-full bg-stone-700 border border-stone-600 rounded p-1 text-center text-stone-200 text-sm focus:outline-none focus:border-amber-500"
                                    placeholder="+"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-stone-900/50 p-4 rounded border border-stone-700">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider">Traits Raciaux</label>
                    <button type="button" onClick={addTrait} className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded text-stone-300">
                        + Ajouter un trait
                    </button>
                </div>
                <div className="space-y-2">
                    {race.traits.map((trait, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={trait}
                                onChange={e => handleTraitChange(index, e.target.value)}
                                className="flex-1 bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 text-sm focus:outline-none focus:border-amber-500"
                                placeholder={`Ex: Vision dans le noir`}
                            />
                            <button
                                type="button"
                                onClick={() => removeTrait(index)}
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
                    {loading ? (initialData ? 'Modification...' : 'Création...') : (initialData ? 'Enregistrer les modifications' : 'Créer la Race')}
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
