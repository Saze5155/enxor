import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService';

export default function LevelUpModal({ character, onClose, onConfirm }) {
    const [step, setStep] = useState(1);
    const [classesData, setClassesData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Level Up State
    const nextLevel = character.level + 1;
    const charClass = character.class;
    const [hpMode, setHpMode] = useState('average'); // 'average' or 'roll'
    const [rolledHp, setRolledHp] = useState(null);
    const [selectedSubclass, setSelectedSubclass] = useState('');

    // Fetch data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await dataService.getClasses();
                // data is { classes: [...] } based on the JSON structure I saw
                setClassesData(data.classes || []);
                setLoading(false);
            } catch (e) {
                console.error("Failed to load class data", e);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-white z-50">Chargement...</div>;

    const classInfo = classesData.find(c => c.nom === charClass || c.id === charClass.toLowerCase()) || {};
    const features = classInfo.capacites_par_niveau ? classInfo.capacites_par_niveau[nextLevel] : [];

    // Hit Die Logic
    const hitDieVal = classInfo.de_vie ? parseInt(classInfo.de_vie.replace('d', '')) : 8;
    const conMod = Math.floor((character.stats.con - 10) / 2);
    const avgHp = Math.max(1, (hitDieVal / 2) + 1 + conMod);

    const handleRoll = () => {
        const roll = Math.floor(Math.random() * hitDieVal) + 1;
        setRolledHp(roll);
    };

    const finalHpGain = hpMode === 'average' ? avgHp : Math.max(1, (rolledHp || 0) + conMod);

    const handleConfirm = () => {
        onConfirm({
            newLevel: nextLevel,
            hpGain: finalHpGain,
            newFeatures: features || [], // We might want to save these to the character
            subclass: selectedSubclass // return this if selected
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-[#fdf6e3] w-full max-w-2xl rounded-lg shadow-2xl border-2 border-stone-500 overflow-hidden font-serif text-stone-900 relative">

                {/* Header */}
                <div className="bg-stone-800 text-amber-500 p-4 border-b border-amber-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold uppercase tracking-widest font-cinzel">Niveau Supérieur !</h2>
                    <div className="text-3xl font-bold text-white">{nextLevel}</div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    <p className="text-center italic text-stone-600">
                        Félicitations, {character.name}. Vous devenez plus puissant.
                    </p>

                    {/* 1. HP Increase */}
                    <div className="bg-stone-200 p-4 rounded border border-stone-400">
                        <h3 className="font-bold uppercase text-sm mb-2 border-b border-stone-400 pb-1">Points de Vie</h3>
                        <div className="flex justify-around items-center">

                            <label className={`cursor-pointer p-4 rounded border-2 ${hpMode === 'average' ? 'border-amber-600 bg-amber-100' : 'border-stone-300 bg-white'}`}>
                                <input type="radio" className="hidden" name="hp" checked={hpMode === 'average'} onChange={() => setHpMode('average')} />
                                <div className="text-center">
                                    <span className="block text-xs uppercase font-bold text-stone-500">Moyenne</span>
                                    <span className="text-xl font-bold text-stone-800">+{avgHp} PV</span>
                                </div>
                            </label>

                            <span className="font-bold text-stone-400">OU</span>

                            <label className={`cursor-pointer p-4 rounded border-2 ${hpMode === 'roll' ? 'border-amber-600 bg-amber-100' : 'border-stone-300 bg-white'}`}>
                                <input type="radio" className="hidden" name="hp" checked={hpMode === 'roll'} onChange={() => setHpMode('roll')} />
                                <div className="text-center">
                                    <span className="block text-xs uppercase font-bold text-stone-500">Lancer (1d{hitDieVal})</span>
                                    {rolledHp ? (
                                        <span className="text-xl font-bold text-stone-800">+{Math.max(1, rolledHp + conMod)} PV</span>
                                    ) : (
                                        <button onClick={(e) => { e.stopPropagation(); setHpMode('roll'); handleRoll(); }} className="bg-stone-700 text-white text-xs px-2 py-1 rounded mt-1">
                                            Lancer le dé
                                        </button>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* 2. New Features */}
                    {features && features.length > 0 && (
                        <div className="bg-stone-100 p-4 rounded border border-stone-300">
                            <h3 className="font-bold uppercase text-sm mb-2 border-b border-stone-300 pb-1">Nouvelles Capacités</h3>
                            <ul className="space-y-3">
                                {features.map((feat, i) => (
                                    <li key={i}>
                                        <strong className="text-amber-800">{feat.nom}</strong>
                                        <p className="text-xs text-stone-700 mt-1">{feat.description}</p>
                                        {/* Handle Choices (Subclass, ASI, Fighting Style) */}
                                        {feat.type === 'sous_classe' && (
                                            <div className="mt-2 bg-yellow-50 p-2 border border-yellow-200 rounded">
                                                <p className="text-xs font-bold text-amber-700 mb-1">⭐ Choix de Sous-Classe Requis</p>
                                                <select
                                                    className="w-full text-sm p-1 border rounded"
                                                    value={selectedSubclass}
                                                    onChange={e => setSelectedSubclass(e.target.value)}
                                                >
                                                    <option value="">Choisir une voie...</option>
                                                    {classInfo.sous_classes && classInfo.sous_classes.map(sc => (
                                                        <option key={sc.id} value={sc.nom}>{sc.nom}</option>
                                                    ))}
                                                </select>
                                                {selectedSubclass && (
                                                    <p className="text-[10px] italic mt-1 text-stone-500">
                                                        {classInfo.sous_classes?.find(sc => sc.nom === selectedSubclass)?.description}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {feat.type === 'asi' && (
                                            <div className="mt-2 text-xs italic text-stone-500">
                                                (Note: La gestion automatique des améliorations de caractéristiques n'est pas encore implémentée. Ajoutez-les manuellement après le niveau.)
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-stone-200 border-t border-stone-400 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-stone-600 hover:bg-stone-300 font-bold text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        Valider le Niveau {nextLevel}
                    </button>
                </div>

            </div>
        </div>
    );
}
