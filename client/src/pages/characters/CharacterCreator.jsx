import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import characterService from '../../services/characterService';

const RACES = ['Humain', 'Elfe', 'Nain', 'Halfelin', 'Orc', 'Tieffelin', 'Draconéide', 'Gnome'];
const CLASSES = ['Guerrier', 'Mage', 'Voleur', 'Prêtre', 'Paladin', 'Rôdeur', 'Barbare', 'Barde', 'Druide', 'Moine', 'Sorcier', 'Occultiste'];

const RACE_BONUSES = {
    'Humain': { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    'Elfe': { dex: 2 },
    'Nain': { con: 2 },
    'Halfelin': { dex: 2 },
    'Orc': { str: 2, con: 1 },
    'Tieffelin': { cha: 2, int: 1 },
    'Draconéide': { str: 2, cha: 1 },
    'Gnome': { int: 2 }
};

const STAT_LABELS = {
    str: 'Force', dex: 'Dextérité', con: 'Constitution',
    int: 'Intelligence', wis: 'Sagesse', cha: 'Charisme'
};

export default function CharacterCreator() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        race: '',
        class: '',
        background: '',
        alignment: '',
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatChange = (stat, value) => {
        setFormData(prev => ({
            ...prev,
            stats: { ...prev.stats, [stat]: parseInt(value) || 10 }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Calculate final stats with racial bonuses
            const finalStats = { ...formData.stats };
            const bonus = RACE_BONUSES[formData.race] || {};

            Object.keys(finalStats).forEach(stat => {
                if (bonus[stat]) {
                    finalStats[stat] += bonus[stat];
                }
            });

            const payload = { ...formData, stats: finalStats };

            await characterService.create(payload);
            navigate('/characters');
        } catch (error) {
            console.error("Failed to create", error);
            alert("Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-indigo-400 mb-8 text-center">Nouveau Personnage</h1>

            {/* Stepper */}
            <div className="flex justify-center mb-8 gap-4">
                <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-indigo-500' : 'bg-gray-700'}`}></div>
                <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-indigo-500' : 'bg-gray-700'}`}></div>
                <div className={`h-2 w-16 rounded ${step >= 3 ? 'bg-indigo-500' : 'bg-gray-700'}`}></div>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-lg">

                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">Identité</h2>

                        <div>
                            <label className="block text-gray-400 mb-2">Nom du héros</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                placeholder="Ex: Gandalf le Gris"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2">Race</label>
                                <select
                                    name="race"
                                    value={formData.race}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                >
                                    <option value="">Choisir...</option>
                                    {RACES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">Classe</label>
                                <select
                                    name="class"
                                    value={formData.class}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                >
                                    <option value="">Choisir...</option>
                                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.name || !formData.race || !formData.class}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: STATS */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">Caractéristiques</h2>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-400">
                                Lancez un d20 pour chaque caractéristique. Des bonus raciaux sont appliqués.
                            </p>
                            <button
                                onClick={() => {
                                    const newStats = {};
                                    Object.keys(formData.stats).forEach(k => newStats[k] = Math.floor(Math.random() * 20) + 1);
                                    setFormData(prev => ({ ...prev, stats: newStats }));
                                }}
                                className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded flex items-center gap-2"
                            >
                                🎲 Tout Lancer (d20)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.keys(formData.stats).map(stat => {
                                const baseVal = formData.stats[stat];
                                const raceBonus = (RACE_BONUSES[formData.race] && RACE_BONUSES[formData.race][stat]) || 0;
                                const total = baseVal + raceBonus;
                                const mod = Math.floor((total - 10) / 2);

                                return (
                                    <div key={stat} className="bg-gray-900 p-4 rounded text-center border border-gray-700 relative group">
                                        <label className="block text-indigo-300 font-bold uppercase mb-2">{STAT_LABELS[stat]}</label>

                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <input
                                                type="number"
                                                value={formData.stats[stat]}
                                                onChange={(e) => handleStatChange(stat, e.target.value)}
                                                className="w-16 bg-gray-800 border border-gray-600 rounded p-1 text-center text-white font-bold"
                                            />
                                            {raceBonus > 0 && <span className="text-green-400 text-sm">+{raceBonus}</span>}
                                        </div>

                                        <div className="text-2xl font-bold text-white mb-1">
                                            {total}
                                        </div>
                                        <div className={`text-sm font-bold ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {mod >= 0 ? '+' : ''}{mod}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white">Retour</button>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: DETAILS & CONFIRM */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">Détails finaux</h2>

                        <div>
                            <label className="block text-gray-400 mb-2">Historique (Background)</label>
                            <textarea
                                name="background"
                                value={formData.background}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white h-24"
                                placeholder="Ancien soldat, noble, ermite..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2">Alignement</label>
                            <input
                                type="text"
                                name="alignment"
                                value={formData.alignment}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                placeholder="Neutre Bon, Chaotique Neutre..."
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white">Retour</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded font-bold"
                            >
                                {loading ? 'Création...' : 'Créer le Personnage'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
