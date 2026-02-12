import { useState, useEffect } from 'react';
import dataService from '../../services/dataService';

const HIT_DICE = ["d6", "d8", "d10", "d12"];

export default function ClassCreator({ initialData, onCancel, onSuccess }) {
    const [classData, setClassData] = useState({
        nom: '',
        de_vie: 'd8',
        maitrises: JSON.stringify({
            armures: [],
            armes: [],
            outils: [],
            jets_de_sauvegarde: [],
            nombre_competences: 2,
            liste_competences: []
        }, null, 4),
        equipement_depart: JSON.stringify({ choix: [] }, null, 4),
        capacites_par_niveau: JSON.stringify({}, null, 4),
        visible: true
    });

    useEffect(() => {
        if (initialData) {
            setClassData({
                nom: initialData.nom,
                de_vie: initialData.de_vie,
                maitrises: typeof initialData.maitrises === 'string' ? initialData.maitrises : JSON.stringify(initialData.maitrises, null, 4),
                equipement_depart: typeof initialData.equipement_depart === 'string' ? initialData.equipement_depart : JSON.stringify(initialData.equipement_depart, null, 4),
                capacites_par_niveau: typeof initialData.capacites_par_niveau === 'string' ? initialData.capacites_par_niveau : JSON.stringify(initialData.capacites_par_niveau, null, 4),
                visible: initialData.visible !== false
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setClassData({
                nom: '',
                de_vie: 'd8',
                maitrises: JSON.stringify({
                    armures: [],
                    armes: [],
                    outils: [],
                    jets_de_sauvegarde: [],
                    nombre_competences: 2,
                    liste_competences: []
                }, null, 4),
                equipement_depart: JSON.stringify({ choix: [] }, null, 4),
                capacites_par_niveau: JSON.stringify({}, null, 4),
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
            // Parse JSON fields
            let maitrises, equipement_depart, capacites_par_niveau;
            try {
                maitrises = JSON.parse(classData.maitrises);
                equipement_depart = JSON.parse(classData.equipement_depart);
                capacites_par_niveau = JSON.parse(classData.capacites_par_niveau);
            } catch (err) {
                setMessage({ type: 'error', text: 'Erreur de syntaxe JSON dans l\'un des champs complexes.' });
                setLoading(false);
                return;
            }

            const newClass = {
                id: classData.nom.toLowerCase().replace(/\s+/g, '_'),
                nom: classData.nom,
                de_vie: classData.de_vie,
                maitrises,
                equipement_depart,
                capacites_par_niveau
            };

            if (initialData) {
                // Update
                await dataService.updateClass({ ...newClass, visible: classData.visible });
                setMessage({ type: 'success', text: 'Classe mise à jour avec succès !' });
            } else {
                // Create
                const response = await fetch('http://localhost:3000/api/data/classes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...newClass, visible: classData.visible })
                });

                if (!response.ok) throw new Error('Erreur création');
                setMessage({ type: 'success', text: 'Classe créée avec succès !' });
            }

            if (onSuccess) onSuccess();
            if (!initialData) {
                // Reset (keep JSON templates)
                setClassData({
                    ...classData,
                    nom: ''
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
        <form onSubmit={handleSubmit} className={`space-y-6 max-w-4xl mx-auto p-4 rounded-lg border ${initialData ? 'bg-stone-800 border-amber-500/50' : ''}`}>
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-stone-200 border-b border-stone-600 pb-2 flex-grow">
                    {initialData ? `Modifier: ${initialData.nom}` : 'Nouvelle Classe'}
                </h2>
                <label className="flex items-center cursor-pointer ml-4">
                    <span className="mr-2 text-sm text-stone-400 font-bold">{classData.visible ? 'Visible Joueurs' : 'Caché (MJ)'}</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={classData.visible} onChange={e => setClassData({ ...classData, visible: e.target.checked })} />
                        <div className={`block w-10 h-6 rounded-full transition ${classData.visible ? 'bg-green-600' : 'bg-stone-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${classData.visible ? 'translate-x-4' : ''}`}></div>
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
                    <label className="block text-sm font-bold text-stone-400 mb-1">Nom de la Classe</label>
                    <input
                        type="text"
                        required
                        value={classData.nom}
                        onChange={e => setClassData({ ...classData, nom: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                        placeholder="Ex: Chevalier"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Dé de Vie</label>
                    <select
                        value={classData.de_vie}
                        onChange={e => setClassData({ ...classData, de_vie: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                        {HIT_DICE.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Maîtrises (JSON)</label>
                    <p className="text-xs text-stone-500 mb-1">Armures, Armes, Outils, JdS, Compétences</p>
                    <textarea
                        value={classData.maitrises}
                        onChange={e => setClassData({ ...classData, maitrises: e.target.value })}
                        className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-stone-300 font-mono text-xs focus:outline-none focus:border-amber-500 h-64"
                    />
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-stone-400 mb-1">Équipement de Départ (JSON)</label>
                        <textarea
                            value={classData.equipement_depart}
                            onChange={e => setClassData({ ...classData, equipement_depart: e.target.value })}
                            className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-stone-300 font-mono text-xs focus:outline-none focus:border-amber-500 h-32"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-stone-400 mb-1">Capacités par Niveau (JSON)</label>
                        <textarea
                            value={classData.capacites_par_niveau}
                            onChange={e => setClassData({ ...classData, capacites_par_niveau: e.target.value })}
                            className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-stone-300 font-mono text-xs focus:outline-none focus:border-amber-500 h-32"
                            placeholder='{ "1": [ { "nom": "...", "description": "..." } ] }'
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded shadow-lg transform transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? (initialData ? 'Modification...' : 'Création...') : (initialData ? 'Enregistrer les modifications' : 'Créer la Classe')}
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
