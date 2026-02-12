import { useState, useEffect } from 'react';
import enemyService from '../../services/enemyService';

const CREATURE_TYPES = [
    'Aberration', 'Bête', 'Céleste', 'Construction', 'Dragon', 'Élémentaire',
    'Fée', 'Fiélon', 'Géant', 'Humanoïde', 'Monstruosité', 'Mort-vivant', 'Plante', 'Vase'
];

const SIZES = [
    { value: 'TP', label: 'Très Petit' },
    { value: 'P', label: 'Petit' },
    { value: 'M', label: 'Moyen' },
    { value: 'G', label: 'Grand' },
    { value: 'TG', label: 'Très Grand' },
    { value: 'Gig', label: 'Gigantesque' }
];

const ROLES = [
    { value: 'Tank', label: 'Tank (haute CA/PV, peu de dégâts)' },
    { value: 'Bruiser', label: 'Bruiser (dégâts élevés, mobilité)' },
    { value: 'Striker', label: 'Striker (gros dégâts burst)' },
    { value: 'Controller', label: 'Controller (effets de contrôle, debuffs)' },
    { value: 'Support', label: 'Support (buffs alliés, soins)' },
    { value: 'Skirmisher', label: 'Skirmisher (hit & run, mobilité)' }
];

const PORTEES = [
    { value: 'Corps à corps uniquement', label: 'Corps à corps uniquement' },
    { value: 'Corps à corps + Distance', label: 'Corps à corps + Distance' },
    { value: 'Distance uniquement', label: 'Distance uniquement' },
    { value: 'Lanceur de sorts', label: 'Lanceur de sorts' }
];

const CAPACITES_PREDEFINIES = [
    'Résistance à un élément',
    'Attaque avec effet (poison, feu, etc.)',
    'Vol',
    'Régénération',
    'Sorts innés',
    'Actions légendaires (Boss uniquement)'
];

export default function EnemyGeneratorModal({ onClose, onGenerate }) {
    const [step, setStep] = useState('form'); // 'form', 'generating', 'result'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedEnemy, setGeneratedEnemy] = useState(null);
    const [fpSuggere, setFpSuggere] = useState(0);

    const [formData, setFormData] = useState({
        concept: '',
        type: 'Dragon',
        taille: 'M',
        niveauGroupe: 5,
        nombreJoueurs: 4,
        difficulte: 'moyenne',
        role: 'Bruiser',
        portee: 'Corps à corps + Distance',
        capacitesTexte: '',
        capacitesPredefinies: [],
        habitat: '',
        comportement: '',
        genererLore: true,
        estBoss: false
    });

    // Calcul du FP suggéré en temps réel (côté client, approximatif)
    useEffect(() => {
        const xpBudget = {
            1: { facile: 25, moyenne: 50, difficile: 75, mortelle: 100 },
            2: { facile: 50, moyenne: 100, difficile: 150, mortelle: 200 },
            3: { facile: 75, moyenne: 150, difficile: 225, mortelle: 400 },
            4: { facile: 125, moyenne: 250, difficile: 375, mortelle: 500 },
            5: { facile: 250, moyenne: 500, difficile: 750, mortelle: 1100 },
            6: { facile: 300, moyenne: 600, difficile: 900, mortelle: 1400 },
            7: { facile: 350, moyenne: 750, difficile: 1100, mortelle: 1700 },
            8: { facile: 450, moyenne: 900, difficile: 1400, mortelle: 2100 },
            9: { facile: 550, moyenne: 1100, difficile: 1600, mortelle: 2400 },
            10: { facile: 600, moyenne: 1200, difficile: 1900, mortelle: 2800 }
        };

        const xpTotal = (xpBudget[formData.niveauGroupe]?.[formData.difficulte] || 50) * formData.nombreJoueurs;

        // Conversion approximative XP → FP
        let fp = 0;
        if (xpTotal >= 5900) fp = 10;
        else if (xpTotal >= 5000) fp = 9;
        else if (xpTotal >= 3900) fp = 8;
        else if (xpTotal >= 2900) fp = 7;
        else if (xpTotal >= 2300) fp = 6;
        else if (xpTotal >= 1800) fp = 5;
        else if (xpTotal >= 1100) fp = 4;
        else if (xpTotal >= 700) fp = 3;
        else if (xpTotal >= 450) fp = 2;
        else if (xpTotal >= 200) fp = 1;
        else if (xpTotal >= 100) fp = 0.5;
        else if (xpTotal >= 50) fp = 0.25;
        else fp = 0.125;

        setFpSuggere(fp);
    }, [formData.niveauGroupe, formData.nombreJoueurs, formData.difficulte]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleCapacite = (capacite) => {
        setFormData(prev => ({
            ...prev,
            capacitesPredefinies: prev.capacitesPredefinies.includes(capacite)
                ? prev.capacitesPredefinies.filter(c => c !== capacite)
                : [...prev.capacitesPredefinies, capacite]
        }));
    };

    const handleGenerate = async () => {
        if (!formData.concept.trim()) {
            setError('Veuillez entrer un nom ou concept pour la créature');
            return;
        }

        setLoading(true);
        setError(null);
        setStep('generating');

        try {
            const result = await enemyService.generateWithAI(formData);
            setGeneratedEnemy(result.statblock);
            setFpSuggere(result.fpSuggere);
            setStep('result');
        } catch (err) {
            console.error('Erreur génération:', err);
            setError(err.response?.data?.message || 'Erreur lors de la génération. Vérifiez votre clé API Groq.');
            setStep('form');
        } finally {
            setLoading(false);
        }
    };

    const handleUseGenerated = () => {
        onGenerate(generatedEnemy);
        onClose();
    };

    if (step === 'generating') {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-stone-800 p-8 rounded-lg border border-stone-600 shadow-2xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-amber-500 mb-6">🤖 Génération en cours...</h2>
                    <div className="w-full bg-stone-900 rounded-full h-3 mb-4 overflow-hidden">
                        <div className="bg-amber-500 h-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                    <div className="text-stone-400 space-y-2 text-sm">
                        <p>✓ Calcul du FP optimal</p>
                        <p>✓ Équilibrage des stats</p>
                        <p className="text-amber-400">→ Génération des attaques...</p>
                    </div>
                    <p className="text-stone-500 text-xs mt-4">Temps estimé : 5-10 secondes</p>
                </div>
            </div>
        );
    }

    if (step === 'result' && generatedEnemy) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-stone-800 p-6 rounded-lg border border-stone-600 shadow-2xl max-w-3xl w-full my-8">
                    <h2 className="text-2xl font-bold text-green-500 mb-4">✅ {generatedEnemy.name} créé !</h2>

                    <div className="bg-stone-900 p-4 rounded border border-stone-700 mb-4 max-h-96 overflow-y-auto">
                        <h3 className="font-bold text-amber-500 mb-2">{generatedEnemy.name}</h3>
                        <p className="text-stone-400 text-sm mb-2">
                            {generatedEnemy.creatureType} de taille {generatedEnemy.size}, {generatedEnemy.alignment}
                        </p>
                        <div className="border-t border-stone-700 pt-2 text-sm text-stone-300 space-y-1">
                            <p><strong>CA :</strong> {generatedEnemy.stats?.ca}</p>
                            <p><strong>PV :</strong> {generatedEnemy.stats?.pv_moyenne} ({generatedEnemy.stats?.pv_formule})</p>
                            <p><strong>FP :</strong> {generatedEnemy.stats?.facteur_puissance} ({generatedEnemy.stats?.xp} XP)</p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setStep('form')}
                            className="px-4 py-2 text-stone-400 hover:text-white transition"
                        >
                            🔄 Régénérer
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded transition"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUseGenerated}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg transition"
                        >
                            💾 Utiliser cet Ennemi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-stone-800 p-6 rounded-lg border border-stone-600 shadow-2xl max-w-2xl w-full my-8">
                <h2 className="text-2xl font-bold text-amber-500 mb-4">🤖 Générateur d'Ennemi Intelligent</h2>
                <p className="text-stone-400 text-sm mb-6">
                    Remplis les informations ci-dessous, l'IA générera un ennemi équilibré avec statblock complet !
                </p>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {/* 1. INFORMATIONS DE BASE */}
                    <section>
                        <h3 className="text-lg font-bold text-stone-200 mb-3 border-b border-stone-700 pb-2">
                            1. Informations de Base
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Nom ou Concept *</label>
                                <input
                                    type="text"
                                    value={formData.concept}
                                    onChange={(e) => handleChange('concept', e.target.value)}
                                    placeholder="Ex: Dragon de glace juvénile, Nécromancien fou..."
                                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1">Type de créature</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm"
                                    >
                                        {CREATURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1">Taille</label>
                                    <div className="flex gap-1">
                                        {SIZES.map(s => (
                                            <button
                                                key={s.value}
                                                onClick={() => handleChange('taille', s.value)}
                                                className={`flex-1 py-2 text-xs font-bold rounded transition ${formData.taille === s.value
                                                        ? 'bg-amber-600 text-white'
                                                        : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                                                    }`}
                                                title={s.label}
                                            >
                                                {s.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. DIFFICULTÉ */}
                    <section>
                        <h3 className="text-lg font-bold text-stone-200 mb-3 border-b border-stone-700 pb-2">
                            2. Difficulté
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">
                                    Niveau du groupe : {formData.niveauGroupe}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={formData.niveauGroupe}
                                    onChange={(e) => handleChange('niveauGroupe', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1">Nombre de joueurs</label>
                                    <select
                                        value={formData.nombreJoueurs}
                                        onChange={(e) => handleChange('nombreJoueurs', parseInt(e.target.value))}
                                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1">Difficulté</label>
                                    <select
                                        value={formData.difficulte}
                                        onChange={(e) => handleChange('difficulte', e.target.value)}
                                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm"
                                    >
                                        <option value="facile">Facile (warm-up)</option>
                                        <option value="moyenne">Moyenne (standard)</option>
                                        <option value="difficile">Difficile (boss mineur)</option>
                                        <option value="mortelle">Mortelle (boss majeur)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-amber-900/30 border border-amber-700/50 rounded p-2 text-center">
                                <span className="text-amber-400 font-bold">→ FP suggéré : {fpSuggere}</span>
                            </div>
                        </div>
                    </section>

                    {/* 3. STYLE DE COMBAT */}
                    <section>
                        <h3 className="text-lg font-bold text-stone-200 mb-3 border-b border-stone-700 pb-2">
                            3. Style de Combat
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Rôle principal</label>
                                <div className="space-y-1">
                                    {ROLES.map(r => (
                                        <label key={r.value} className="flex items-center gap-2 cursor-pointer hover:bg-stone-700/50 p-2 rounded">
                                            <input
                                                type="radio"
                                                name="role"
                                                value={r.value}
                                                checked={formData.role === r.value}
                                                onChange={(e) => handleChange('role', e.target.value)}
                                                className="accent-amber-500"
                                            />
                                            <span className="text-sm text-stone-300">{r.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Portée d'attaque</label>
                                <div className="space-y-1">
                                    {PORTEES.map(p => (
                                        <label key={p.value} className="flex items-center gap-2 cursor-pointer hover:bg-stone-700/50 p-2 rounded">
                                            <input
                                                type="radio"
                                                name="portee"
                                                value={p.value}
                                                checked={formData.portee === p.value}
                                                onChange={(e) => handleChange('portee', e.target.value)}
                                                className="accent-amber-500"
                                            />
                                            <span className="text-sm text-stone-300">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. CAPACITÉS SPÉCIALES */}
                    <section>
                        <h3 className="text-lg font-bold text-stone-200 mb-3 border-b border-stone-700 pb-2">
                            4. Capacités Spéciales (Optionnel)
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Description libre</label>
                                <textarea
                                    value={formData.capacitesTexte}
                                    onChange={(e) => handleChange('capacitesTexte', e.target.value)}
                                    placeholder="Ex: Crache de la glace (souffle). Peut geler le sol autour de lui..."
                                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm h-20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2">Capacités prédéfinies</label>
                                <div className="space-y-1">
                                    {CAPACITES_PREDEFINIES.map(cap => (
                                        <label key={cap} className="flex items-center gap-2 cursor-pointer hover:bg-stone-700/50 p-2 rounded">
                                            <input
                                                type="checkbox"
                                                checked={formData.capacitesPredefinies.includes(cap)}
                                                onChange={() => toggleCapacite(cap)}
                                                className="accent-amber-500"
                                            />
                                            <span className="text-sm text-stone-300">{cap}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. THÈME & AMBIANCE */}
                    <section>
                        <h3 className="text-lg font-bold text-stone-200 mb-3 border-b border-stone-700 pb-2">
                            5. Thème & Ambiance (Optionnel)
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Habitat</label>
                                <input
                                    type="text"
                                    value={formData.habitat}
                                    onChange={(e) => handleChange('habitat', e.target.value)}
                                    placeholder="Ex: Montagnes enneigées, cavernes glacées"
                                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Comportement</label>
                                <textarea
                                    value={formData.comportement}
                                    onChange={(e) => handleChange('comportement', e.target.value)}
                                    placeholder="Ex: Territorial, intelligent, aime accumuler des trésors gelés"
                                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white text-sm h-16"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 6. OPTIONS AVANCÉES */}
                    <section>
                        <h3 className="text-lg font-bold text-stone-200 mb-3 border-b border-stone-700 pb-2">
                            6. Options Avancées
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-stone-700/50 p-2 rounded">
                                <input
                                    type="checkbox"
                                    checked={formData.genererLore}
                                    onChange={(e) => handleChange('genererLore', e.target.checked)}
                                    className="accent-amber-500"
                                />
                                <span className="text-sm text-stone-300">Générer description/lore complète</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-stone-700/50 p-2 rounded">
                                <input
                                    type="checkbox"
                                    checked={formData.estBoss}
                                    onChange={(e) => handleChange('estBoss', e.target.checked)}
                                    className="accent-red-500"
                                />
                                <span className="text-sm text-red-400 font-bold">C'est un Boss (stats renforcées)</span>
                            </label>
                        </div>
                        <div className="mt-3 bg-stone-900 border border-stone-700 rounded p-2 text-xs text-stone-500">
                            ⚠️ Utilise l'API Groq (gratuite) - Limite : ~14,000 générations/jour
                        </div>
                    </section>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-stone-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-stone-400 hover:text-white transition"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !formData.concept.trim()}
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🤖 Générer l'Ennemi
                    </button>
                </div>
            </div>
        </div>
    );
}
