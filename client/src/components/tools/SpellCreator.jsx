import { useState } from 'react';

const CLASSES = [
    "Barbare", "Barde", "Clerc", "Druide", "Ensorceleur",
    "Guerrier", "Magicien", "Moine", "Occultiste", "Paladin", "Rôdeur", "Roublard"
];

const SCHOOLS = [
    "Abjuration", "Divination", "Enchantement", "Évocation",
    "Illusion", "Invocation", "Nécromancie", "Transmutation"
];

export default function SpellCreator() {
    const [spell, setSpell] = useState({
        nom: '',
        niveau: 0,
        ecole: 'Évocation',
        temps_incantation: '1 action',
        portee: '18 mètres',
        composantes: 'V, S',
        duree: 'Instantanée',
        description: '',
        aux_niveaux_superieurs: '',
        classes: [],
        visible: true
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleClassToggle = (className) => {
        const currentClasses = [...spell.classes];
        if (currentClasses.includes(className)) {
            setSpell({ ...spell, classes: currentClasses.filter(c => c !== className) });
        } else {
            setSpell({ ...spell, classes: [...currentClasses, className] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const cleanedSpell = {
            ...spell,
            aux_niveaux_superieurs: spell.aux_niveaux_superieurs.trim() === '' ? null : spell.aux_niveaux_superieurs
        };

        try {
            const response = await fetch('http://localhost:3000/api/data/spells', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanedSpell)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Sort créé avec succès !' });
                setSpell({
                    nom: '',
                    niveau: 0,
                    ecole: 'Évocation',
                    temps_incantation: '1 action',
                    portee: '18 mètres',
                    composantes: 'V, S',
                    duree: 'Instantanée',
                    description: '',
                    aux_niveaux_superieurs: '',
                    classes: []
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-stone-200 border-b border-stone-600 pb-2 flex-grow">Nouveau Sort</h2>
                <label className="flex items-center cursor-pointer ml-4">
                    <span className="mr-2 text-sm text-stone-400 font-bold">{spell.visible ? 'Visible Joueurs' : 'Caché (MJ)'}</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={spell.visible} onChange={e => setSpell({ ...spell, visible: e.target.checked })} />
                        <div className={`block w-10 h-6 rounded-full transition ${spell.visible ? 'bg-green-600' : 'bg-stone-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${spell.visible ? 'translate-x-4' : ''}`}></div>
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
                    <label className="block text-sm font-bold text-stone-400 mb-1">Nom du Sort</label>
                    <input
                        type="text"
                        required
                        value={spell.nom}
                        onChange={e => setSpell({ ...spell, nom: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">École</label>
                    <select
                        value={spell.ecole}
                        onChange={e => setSpell({ ...spell, ecole: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                        {SCHOOLS.map(school => <option key={school} value={school}>{school}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Niveau (0 = Tour de magie)</label>
                    <input
                        type="number"
                        min="0"
                        max="9"
                        value={spell.niveau}
                        onChange={e => setSpell({ ...spell, niveau: parseInt(e.target.value) })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Temps d'incantation</label>
                    <input
                        type="text"
                        value={spell.temps_incantation}
                        onChange={e => setSpell({ ...spell, temps_incantation: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Durée</label>
                    <input
                        type="text"
                        value={spell.duree}
                        onChange={e => setSpell({ ...spell, duree: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Portée</label>
                    <input
                        type="text"
                        value={spell.portee}
                        onChange={e => setSpell({ ...spell, portee: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Composantes (V, S, M)</label>
                    <input
                        type="text"
                        value={spell.composantes}
                        onChange={e => setSpell({ ...spell, composantes: e.target.value })}
                        className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Description</label>
                <textarea
                    required
                    value={spell.description}
                    onChange={e => setSpell({ ...spell, description: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500 h-32"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Aux niveaux supérieurs (Optionnel)</label>
                <textarea
                    value={spell.aux_niveaux_superieurs}
                    onChange={e => setSpell({ ...spell, aux_niveaux_superieurs: e.target.value })}
                    className="w-full bg-stone-700 border border-stone-600 rounded p-2 text-stone-200 focus:outline-none focus:border-amber-500 h-20"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-2">Classes Disponibles</label>
                <div className="flex flex-wrap gap-2">
                    {CLASSES.map(cls => (
                        <button
                            key={cls}
                            type="button"
                            onClick={() => handleClassToggle(cls)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${spell.classes.includes(cls)
                                ? 'bg-amber-600 text-white font-bold shadow'
                                : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                }`}
                        >
                            {cls}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded shadow-lg transform transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Création...' : 'Créer le Sort'}
                </button>
            </div>
        </form>
    );
}
