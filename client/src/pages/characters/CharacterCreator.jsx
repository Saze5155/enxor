import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import characterService from '../../services/characterService';
import dataService from '../../services/dataService';

const STAT_LABELS = {
    str: 'Force', dex: 'Dextérité', con: 'Constitution',
    int: 'Intelligence', wis: 'Sagesse', cha: 'Charisme'
};

export default function CharacterCreator() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Dynamic Data
    const [racesList, setRacesList] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        race: '',
        class: '',
        subClass: '',
        background: '',
        alignment: '',
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        startingEquipment: {} // { choiceIndex: optionIndex }
    });

    useEffect(() => {
        const loadGameData = async () => {
            try {
                const [racesRes, classesRes] = await Promise.all([
                    dataService.getRaces(),
                    dataService.getClasses()
                ]);

                const racesData = Array.isArray(racesRes) ? racesRes : (racesRes.races || []);
                const classesData = Array.isArray(classesRes) ? classesRes : (classesRes.classes || []);

                // Filter out hidden items (unless we want to allow MJ to see them, but this is client side for now)
                setRacesList(racesData.filter(r => r.visible !== false));
                setClassesList(classesData.filter(c => c.visible !== false));
            } catch (error) {
                console.error("Failed to load game data", error);
            } finally {
                setFetchingData(false);
            }
        };
        loadGameData();
    }, []);

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

    const getRaceBonus = (raceName) => {
        const race = racesList.find(r => r.nom === raceName);
        return race ? (race.bonus_caracteristiques || {}) : {};
    };

    const handleEquipmentChange = (choiceIndex, optionIndex) => {
        setFormData(prev => ({
            ...prev,
            startingEquipment: {
                ...prev.startingEquipment,
                [choiceIndex]: optionIndex
            }
        }));
    };

    const hasMadeAllChoices = () => {
        if (!selectedClass || !selectedClass.equipement_depart) return true;
        // Check if every choice that has > 1 option is made
        return selectedClass.equipement_depart.choix.every((choice, index) => {
            if (choice.options.length === 1) return true; // Auto-included
            return formData.startingEquipment[index] !== undefined;
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Calculate final stats with racial bonuses
            const finalStats = { ...formData.stats };
            const bonus = getRaceBonus(formData.race);

            Object.keys(finalStats).forEach(stat => {
                if (bonus[stat]) {
                    finalStats[stat] += bonus[stat];
                }
            });

            const payload = {
                ...formData,
                stats: finalStats,
                // startingEquipment is already in formData
            };

            await characterService.create(payload);
            navigate('/characters');
        } catch (error) {
            console.error("Failed to create", error);
            alert("Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    // Find selected class info for subclasses (if needed later)
    const selectedClass = classesList.find(c => c.nom === formData.class);

    if (fetchingData) return <div className="p-8 text-center text-gray-400">Chargement des grimoires...</div>;

    return (
        <div className="p-2 md:p-8 max-w-2xl mx-auto min-h-screen md:min-h-0 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-amber-500 mb-8 text-center font-cinzel tracking-wider">Nouveau Héros</h1>

            {/* Stepper */}
            <div className="flex justify-center mb-8 gap-4">
                <div className={`h-2 w-16 rounded transition-all ${step >= 1 ? 'bg-amber-600' : 'bg-stone-700'}`}></div>
                <div className={`h-2 w-16 rounded transition-all ${step >= 2 ? 'bg-amber-600' : 'bg-stone-700'}`}></div>
                <div className={`h-2 w-16 rounded transition-all ${step >= 3 ? 'bg-amber-600' : 'bg-stone-700'}`}></div>
                <div className={`h-2 w-16 rounded transition-all ${step >= 4 ? 'bg-amber-600' : 'bg-stone-700'}`}></div>
            </div>

            <div className="bg-stone-800 p-6 md:p-8 rounded-lg border border-stone-600 shadow-2xl font-serif text-stone-200">

                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* ... existing Step 1 content (removed for brevity in replacement, but I must keep it!) ... */}
                        {/* RE-INSERTING STEP 1 CODE MANUALLY TO AVOID DELETION */}
                        <h2 className="text-xl font-bold text-stone-100 mb-4 border-b border-stone-600 pb-2">Identité</h2>
                        <div>
                            <label className="block text-stone-400 mb-2 text-sm uppercase font-bold">Nom du héros</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-white focus:border-amber-500 outline-none" placeholder="Ex: Gandalf le Gris" autoFocus />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-stone-400 mb-2 text-sm uppercase font-bold">Race</label>
                                <select name="race" value={formData.race} onChange={handleChange} className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-white focus:border-amber-500 outline-none">
                                    <option value="">Choisir...</option>
                                    {racesList.map(r => <option key={r.nom} value={r.nom}>{r.nom}</option>)}
                                </select>
                                {formData.race && <p className="text-xs text-stone-500 mt-1 italic">{racesList.find(r => r.nom === formData.race)?.description}</p>}
                            </div>
                            <div>
                                <label className="block text-stone-400 mb-2 text-sm uppercase font-bold">Classe</label>
                                <select name="class" value={formData.class} onChange={handleChange} className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-white focus:border-amber-500 outline-none">
                                    <option value="">Choisir...</option>
                                    {classesList.map(c => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
                                </select>
                            </div>
                        </div>
                        {selectedClass && selectedClass.sous_classes && (
                            <div className="mt-2 bg-stone-900/50 p-2 rounded border border-stone-700">
                                <label className="block text-stone-400 mb-2 text-xs uppercase font-bold">Sous-Classe (Optionnel au Niv 1)</label>
                                <select name="subClass" value={formData.subClass} onChange={handleChange} className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-sm text-white">
                                    <option value="">-- Aucune --</option>
                                    {selectedClass.sous_classes.map(sc => <option key={sc.nom} value={sc.nom}>{sc.nom}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setStep(2)} disabled={!formData.name || !formData.race || !formData.class} className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-100 px-6 py-2 rounded font-bold shadow-md transition-colors">Suivant</button>
                        </div>
                    </div>
                )}

                {/* STEP 2: STATS */}
                {step === 2 && (
                    <div className="space-y-6">
                        {/* ... existing Step 2 content ... */}
                        {/* RE-INSERTING STEP 2 CODE */}
                        <h2 className="text-xl font-bold text-stone-100 mb-4 border-b border-stone-600 pb-2">Caractéristiques</h2>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                            <p className="text-xs text-stone-400 italic">Lancez un d20 ou saisissez vos scores. Les bonus raciaux s'afficheront en vert.</p>
                            <button onClick={() => {
                                const newStats = {};
                                Object.keys(formData.stats).forEach(k => newStats[k] = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3);
                                setFormData(prev => ({ ...prev, stats: newStats }));
                            }} className="text-xs bg-stone-700 hover:bg-stone-600 text-amber-500 px-3 py-1.5 rounded flex items-center gap-2 border border-stone-500 font-bold">🎲 Lancer (3d6)</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.keys(formData.stats).map(stat => {
                                const baseVal = formData.stats[stat];
                                const raceBonus = (getRaceBonus(formData.race)[stat]) || 0;
                                const total = baseVal + raceBonus;
                                const mod = Math.floor((total - 10) / 2);
                                const safeMod = isNaN(mod) ? 0 : mod;
                                return (
                                    <div key={stat} className="bg-stone-900 p-3 rounded text-center border border-stone-700 relative group shadow-inner">
                                        <label className="block text-amber-600 font-bold uppercase mb-2 text-xs tracking-widest">{STAT_LABELS[stat]}</label>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <input type="number" value={formData.stats[stat]} onChange={(e) => handleStatChange(stat, e.target.value)} className="w-16 bg-stone-800 border border-stone-600 rounded p-1 text-center text-white font-bold focus:border-amber-500 outline-none" />
                                            {raceBonus > 0 && <span className="text-green-500 text-xs font-bold">+{raceBonus}</span>}
                                        </div>
                                        <div className="text-2xl font-bold text-stone-200 mb-1">{isNaN(total) ? 10 : total}</div>
                                        <div className={`text-sm font-bold ${safeMod >= 0 ? 'text-green-500' : 'text-red-500'}`}>{safeMod >= 0 ? '+' : ''}{safeMod}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(1)} className="text-stone-400 hover:text-white px-4">Retour</button>
                            <button onClick={() => setStep(3)} className="bg-amber-700 hover:bg-amber-600 text-stone-100 px-6 py-2 rounded font-bold shadow-md transition-colors">Suivant</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: EQUIPMENT (NEW) */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-stone-100 mb-4 border-b border-stone-600 pb-2">Équipement de départ</h2>

                        {!selectedClass?.equipement_depart ? (
                            <p className="text-stone-400 italic">Aucun équipement de départ spécifique défini pour cette classe.</p>
                        ) : (
                            <div className="space-y-6">
                                {selectedClass.equipement_depart.choix.map((choix, index) => (
                                    <div key={index} className="bg-stone-900/50 p-4 rounded border border-stone-700">
                                        <p className="text-amber-500 font-bold text-sm mb-3">Choix {index + 1} : {choix.description}</p>

                                        {choix.options.length === 1 ? (
                                            <div className="flex items-center gap-2 text-stone-300 ml-4">
                                                <span className="text-green-500">✔</span> Inclus : {choix.options[0].join(', ')}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 ml-4">
                                                {choix.options.map((option, optIndex) => (
                                                    <label key={optIndex} className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name={`choice_${index}`}
                                                            checked={formData.startingEquipment[index] === optIndex}
                                                            onChange={() => handleEquipmentChange(index, optIndex)}
                                                            className="accent-amber-500 w-4 h-4"
                                                        />
                                                        <span className={`text-stone-300 group-hover:text-white ${formData.startingEquipment[index] === optIndex ? 'text-white font-bold' : ''}`}>
                                                            {option.join(', ')}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(2)} className="text-stone-400 hover:text-white px-4">Retour</button>
                            <button
                                onClick={() => setStep(4)}
                                disabled={!hasMadeAllChoices()}
                                className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-100 px-6 py-2 rounded font-bold shadow-md transition-colors"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: DETAILS & CONFIRM */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-stone-100 mb-4 border-b border-stone-600 pb-2">Détails finaux</h2>

                        <div>
                            <label className="block text-stone-400 mb-2 text-sm uppercase font-bold">Historique</label>
                            <textarea name="background" value={formData.background} onChange={handleChange} className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-white h-24 focus:border-amber-500 outline-none resize-none" placeholder="Ancien soldat, noble, ermite..."></textarea>
                        </div>

                        <div>
                            <label className="block text-stone-400 mb-2 text-sm uppercase font-bold">Alignement</label>
                            <input type="text" name="alignment" value={formData.alignment} onChange={handleChange} className="w-full bg-stone-900 border border-stone-600 rounded p-2 text-white focus:border-amber-500 outline-none" placeholder="Neutre Bon, Chaotique Neutre..." />
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(3)} className="text-stone-400 hover:text-white px-4">Retour</button>
                            <button onClick={handleSubmit} disabled={loading} className="bg-green-700 hover:bg-green-600 text-white px-8 py-2 rounded font-bold shadow-lg transition-transform active:scale-95 border-b-4 border-green-800">
                                {loading ? 'Création...' : 'Créer le Personnage'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
