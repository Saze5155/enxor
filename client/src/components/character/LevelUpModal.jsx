import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService';

export default function LevelUpModal({ character, onClose, onConfirm }) {
    const [step, setStep] = useState(1);
    const [classesData, setClassesData] = useState([]);
    const [featsData, setFeatsData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Level Up State
    const nextLevel = character.level + 1;
    const charClass = character.class;
    const [hpMode, setHpMode] = useState('average'); // 'average' or 'roll'
    const [rolledHp, setRolledHp] = useState(null);
    const [selectedSubclass, setSelectedSubclass] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({}); // { "Feature Name": "Option Name" }

    // ASI State
    const isASILevel = [4, 8, 12, 16, 19].includes(nextLevel);
    const [asiChoice, setAsiChoice] = useState('stats'); // 'stats' or 'feat'
    const [asiMode, setAsiMode] = useState('single'); // 'single' (+2 to one) or 'double' (+1 to two)
    const [asiStat1, setAsiStat1] = useState('');
    const [asiStat2, setAsiStat2] = useState('');
    const [selectedFeat, setSelectedFeat] = useState('');

    const statNames = {
        str: 'Force',
        dex: 'Dextérité',
        con: 'Constitution',
        int: 'Intelligence',
        wis: 'Sagesse',
        cha: 'Charisme'
    };

    const handleOptionChange = (featureName, value) => {
        setSelectedOptions(prev => ({ ...prev, [featureName]: value }));
    };

    // Fetch data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [classesResponse, featsResponse] = await Promise.all([
                    dataService.getClasses(),
                    dataService.getFeats()
                ]);
                setClassesData(classesResponse.classes || []);
                setFeatsData(featsResponse || []);
                setLoading(false);
            } catch (e) {
                console.error("Failed to load data", e);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-white z-50">Chargement...</div>;

    const classInfo = classesData.find(c => c.nom === charClass || c.id === charClass.toLowerCase()) || {};
    const features = classInfo.capacites_par_niveau ? classInfo.capacites_par_niveau[nextLevel] : [];

    // Hit Die Logic
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};
    const hitDieVal = classInfo.de_vie ? parseInt(classInfo.de_vie.replace('d', '')) : 8;
    const conMod = Math.floor(((stats.con || 10) - 10) / 2);
    const avgHp = Math.max(1, (hitDieVal / 2) + 1 + conMod);

    const handleRoll = () => {
        const roll = Math.floor(Math.random() * hitDieVal) + 1;
        setRolledHp(roll);
    };

    const finalHpGain = hpMode === 'average' ? avgHp : Math.max(1, (rolledHp || 0) + conMod);

    const handleConfirm = () => {
        // Validate ASI if applicable
        if (isASILevel) {
            if (asiChoice === 'stats') {
                if (asiMode === 'single' && !asiStat1) {
                    alert('Veuillez sélectionner une caractéristique à améliorer.');
                    return;
                }
                if (asiMode === 'double' && (!asiStat1 || !asiStat2)) {
                    alert('Veuillez sélectionner deux caractéristiques à améliorer.');
                    return;
                }
                if (asiMode === 'double' && asiStat1 === asiStat2) {
                    alert('Vous devez choisir deux caractéristiques différentes.');
                    return;
                }
            } else if (asiChoice === 'feat') {
                if (!selectedFeat) {
                    alert('Veuillez sélectionner un don.');
                    return;
                }
            }
        }

        // Merge choices into features
        const finalFeatures = (features || []).map(f => {
            if (selectedOptions[f.nom]) {
                const choice = f.options.find(o => o.nom === selectedOptions[f.nom]);
                return {
                    ...f,
                    nom: `${f.nom}: ${choice.nom}`,
                    description: choice.description || f.description,
                    effect: choice.effect // if any
                };
            }
            return f;
        });

        // Build ASI choice if applicable
        let asiChoiceData = null;
        if (isASILevel) {
            if (asiChoice === 'stats') {
                asiChoiceData = {
                    type: 'stat_increase',
                    increases: asiMode === 'single'
                        ? { [asiStat1]: 2 }
                        : { [asiStat1]: 1, [asiStat2]: 1 }
                };
            } else if (asiChoice === 'feat') {
                const featData = featsData.find(f => f.nom === selectedFeat);
                asiChoiceData = {
                    type: 'feat',
                    featName: selectedFeat,
                    featData: featData
                };
            }
        }

        onConfirm({
            newLevel: nextLevel,
            hpGain: finalHpGain,
            newFeatures: finalFeatures || [],
            subclass: selectedSubclass,
            asiChoice: asiChoiceData
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
                                        {/* Handle Choices (Subclass, ASI, Fighting Style, etc.) */}
                                        {feat.options && feat.options.length > 0 && (
                                            <div className="mt-2 bg-stone-50 p-2 border border-stone-300 rounded">
                                                <p className="text-xs font-bold text-stone-700 mb-1">⭐ Faire un choix :</p>
                                                <select
                                                    className="w-full text-sm p-1 border rounded bg-white"
                                                    value={selectedOptions[feat.nom] || ''}
                                                    onChange={e => handleOptionChange(feat.nom, e.target.value)}
                                                >
                                                    <option value="">-- Sélectionner --</option>
                                                    {feat.options.map((opt, idx) => (
                                                        <option key={idx} value={opt.nom}>{opt.nom}</option>
                                                    ))}
                                                </select>
                                                {selectedOptions[feat.nom] && (
                                                    <p className="text-[10px] italic mt-1 text-stone-500">
                                                        {feat.options.find(o => o.nom === selectedOptions[feat.nom])?.description}
                                                    </p>
                                                )}
                                            </div>
                                        )}

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
                                        {isASILevel && feat.type === 'asi' && (
                                            <div className="mt-2 bg-blue-50 p-2 border border-blue-200 rounded">
                                                <p className="text-xs font-bold text-blue-700 mb-1">⭐ Amélioration de Caractéristique (ASI)</p>

                                                {/* Choice: Stats or Feat */}
                                                <div className="flex space-x-4 mb-3">
                                                    <label className="flex items-center text-sm font-semibold">
                                                        <input
                                                            type="radio"
                                                            name="asiChoice"
                                                            value="stats"
                                                            checked={asiChoice === 'stats'}
                                                            onChange={() => setAsiChoice('stats')}
                                                            className="mr-1"
                                                        />
                                                        📊 Améliorer les stats
                                                    </label>
                                                    <label className="flex items-center text-sm font-semibold">
                                                        <input
                                                            type="radio"
                                                            name="asiChoice"
                                                            value="feat"
                                                            checked={asiChoice === 'feat'}
                                                            onChange={() => setAsiChoice('feat')}
                                                            className="mr-1"
                                                        />
                                                        ⭐ Prendre un don
                                                    </label>
                                                </div>

                                                {asiChoice === 'stats' && (
                                                    <>
                                                        <div className="flex space-x-4 mb-2">
                                                            <label className="flex items-center text-sm">
                                                                <input
                                                                    type="radio"
                                                                    name="asiMode"
                                                                    value="single"
                                                                    checked={asiMode === 'single'}
                                                                    onChange={() => { setAsiMode('single'); setAsiStat2(''); }}
                                                                    className="mr-1"
                                                                />
                                                                +2 à une caractéristique
                                                            </label>
                                                            <label className="flex items-center text-sm">
                                                                <input
                                                                    type="radio"
                                                                    name="asiMode"
                                                                    value="double"
                                                                    checked={asiMode === 'double'}
                                                                    onChange={() => setAsiMode('double')}
                                                                    className="mr-1"
                                                                />
                                                                +1 à deux caractéristiques
                                                            </label>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <select
                                                                className="w-1/2 text-sm p-1 border rounded bg-white"
                                                                value={asiStat1}
                                                                onChange={e => setAsiStat1(e.target.value)}
                                                            >
                                                                <option value="">-- Caractéristique 1 --</option>
                                                                {Object.entries(statNames).map(([key, name]) => (
                                                                    <option key={key} value={key}>{name}</option>
                                                                ))}
                                                            </select>
                                                            {asiMode === 'double' && (
                                                                <select
                                                                    className="w-1/2 text-sm p-1 border rounded bg-white"
                                                                    value={asiStat2}
                                                                    onChange={e => setAsiStat2(e.target.value)}
                                                                >
                                                                    <option value="">-- Caractéristique 2 --</option>
                                                                    {Object.entries(statNames).map(([key, name]) => (
                                                                        <option key={key} value={key}>{name}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                        {asiStat1 && (
                                                            <p className="text-[10px] italic mt-1 text-stone-500">
                                                                {asiMode === 'single'
                                                                    ? `Augmente la ${statNames[asiStat1]} de 2.`
                                                                    : `Augmente la ${statNames[asiStat1]} de 1${asiStat2 ? ` et la ${statNames[asiStat2]} de 1.` : '.'}`
                                                                }
                                                            </p>
                                                        )}
                                                    </>
                                                )}

                                                {asiChoice === 'feat' && (
                                                    <div>
                                                        <select
                                                            className="w-full text-sm p-2 border rounded bg-white mb-2"
                                                            value={selectedFeat}
                                                            onChange={e => setSelectedFeat(e.target.value)}
                                                        >
                                                            <option value="">-- Choisir un don --</option>
                                                            {featsData.map((feat, idx) => (
                                                                <option key={idx} value={feat.nom}>
                                                                    {feat.nom}
                                                                    {feat.prerequis ? ` (Prérequis: ${feat.prerequis})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {selectedFeat && (() => {
                                                            const feat = featsData.find(f => f.nom === selectedFeat);
                                                            return feat ? (
                                                                <div className="bg-white p-2 border rounded text-xs">
                                                                    <p className="font-bold text-blue-800 mb-1">{feat.nom}</p>
                                                                    <p className="text-stone-600 mb-1">{feat.description}</p>
                                                                    {feat.prerequis && (
                                                                        <p className="text-orange-600 italic mb-1">Prérequis: {feat.prerequis}</p>
                                                                    )}
                                                                    <p className="font-semibold text-stone-700 mt-2">Effets:</p>
                                                                    <ul className="list-disc list-inside text-stone-600">
                                                                        {feat.effets?.map((effet, i) => (
                                                                            <li key={i}>{effet}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                )}
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
