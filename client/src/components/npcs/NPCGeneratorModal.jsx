import { useState } from 'react';
import npcService from '../../services/npcService';

export default function NPCGeneratorModal({ onClose, onGenerate }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatedNPC, setGeneratedNPC] = useState(null);

    const [formData, setFormData] = useState({
        concept: '',
        role: 'Marchand',
        race: 'Humain',
        isImportant: false,
        context: '',
        location: '',
        traits: '',
        faction: '',
        generateStats: false,
        level: 1,
        classType: ''
    });

    const roles = [
        'Marchand', 'Noble', 'Garde', 'Artisan', 'Prêtre', 'Mage',
        'Aubergiste', 'Forgeron', 'Alchimiste', 'Bibliothécaire',
        'Criminel', 'Espion', 'Mercenaire', 'Érudit', 'Artiste'
    ];

    const races = [
        'Humain', 'Elfe', 'Nain', 'Halfelin', 'Demi-Elfe', 'Demi-Orc',
        'Gnome', 'Tieffelin', 'Drakéide', 'Demi-Orque'
    ];

    const classes = [
        'Guerrier', 'Mage', 'Roublard', 'Clerc', 'Paladin', 'Rôdeur',
        'Barbare', 'Barde', 'Druide', 'Moine', 'Sorcier', 'Occultiste'
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await npcService.generateWithAI(formData);
            setGeneratedNPC(result.npc);
            setStep(5); // Passer à l'étape de prévisualisation
        } catch (error) {
            console.error('Erreur génération:', error);
            alert(error.response?.data?.message || 'Erreur lors de la génération');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 mb-4">1. Informations de Base</h3>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Nom / Concept *</label>
                <input
                    type="text"
                    value={formData.concept}
                    onChange={(e) => handleChange('concept', e.target.value)}
                    placeholder="ex: Elara la Sage, Marchand louche, Noble arrogant..."
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Rôle *</label>
                    <select
                        value={formData.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Race *</label>
                    <select
                        value={formData.race}
                        onChange={(e) => handleChange('race', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    >
                        {races.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 mb-4">2. Importance & Contexte</h3>

            <div className="flex items-center gap-2 p-3 bg-stone-800/50 rounded">
                <input
                    type="checkbox"
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => handleChange('isImportant', e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="isImportant" className="text-stone-300 cursor-pointer">
                    ⭐ <strong>PNJ Important/Récurrent</strong> (plus de détails, catégorie spéciale)
                </label>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Contexte / Situation</label>
                <textarea
                    value={formData.context}
                    onChange={(e) => handleChange('context', e.target.value)}
                    placeholder="Décris la situation, le rôle du PNJ dans l'histoire..."
                    rows={3}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Lieu de résidence</label>
                <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="ex: Taverne du Dragon Doré, Palais Royal..."
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 mb-4">3. Personnalité (Optionnel)</h3>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Traits de personnalité souhaités</label>
                <textarea
                    value={formData.traits}
                    onChange={(e) => handleChange('traits', e.target.value)}
                    placeholder="ex: Méfiant, généreux, colérique, mystérieux..."
                    rows={2}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Faction / Organisation</label>
                <input
                    type="text"
                    value={formData.faction}
                    onChange={(e) => handleChange('faction', e.target.value)}
                    placeholder="ex: Guilde des Marchands, Ordre des Paladins..."
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 mb-4">4. Options Avancées</h3>

            <div className="flex items-center gap-2 p-3 bg-stone-800/50 rounded">
                <input
                    type="checkbox"
                    id="generateStats"
                    checked={formData.generateStats}
                    onChange={(e) => handleChange('generateStats', e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="generateStats" className="text-stone-300 cursor-pointer">
                    ⚔️ <strong>Générer des stats de combat</strong> (pour PNJ combattants)
                </label>
            </div>

            {formData.generateStats && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                        <label className="block text-sm font-bold text-stone-400 mb-1">Classe</label>
                        <select
                            value={formData.classType}
                            onChange={(e) => handleChange('classType', e.target.value)}
                            className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                        >
                            <option value="">Aucune</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-stone-400 mb-1">Niveau</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={formData.level}
                            onChange={(e) => handleChange('level', parseInt(e.target.value))}
                            className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-amber-400 mb-4">✨ PNJ Généré</h3>

            <div className="bg-stone-800/50 rounded p-4 space-y-3">
                <h4 className="text-xl font-bold text-white">{generatedNPC.name}</h4>
                <p className="text-stone-400 text-sm">
                    {generatedNPC.role} - {generatedNPC.race}
                    {generatedNPC.class && ` (${generatedNPC.class} niveau ${generatedNPC.level})`}
                </p>

                {generatedNPC.appearance && (
                    <div>
                        <strong className="text-amber-400">Apparence :</strong>
                        <p className="text-stone-300 text-sm mt-1">{generatedNPC.appearance}</p>
                    </div>
                )}

                {generatedNPC.personality && (
                    <div>
                        <strong className="text-amber-400">Personnalité :</strong>
                        <p className="text-stone-300 text-sm mt-1">{generatedNPC.personality}</p>
                    </div>
                )}

                {generatedNPC.background && (
                    <div>
                        <strong className="text-amber-400">Histoire :</strong>
                        <p className="text-stone-300 text-sm mt-1 whitespace-pre-line">{generatedNPC.background}</p>
                    </div>
                )}

                {generatedNPC.quirks && (
                    <div>
                        <strong className="text-amber-400">Particularités :</strong>
                        <p className="text-stone-300 text-sm mt-1">{generatedNPC.quirks}</p>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => onGenerate(generatedNPC)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded shadow-lg transition-all"
                >
                    💾 Utiliser ce PNJ
                </button>
                <button
                    onClick={() => { setGeneratedNPC(null); setStep(1); }}
                    className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-all"
                >
                    🔄 Régénérer
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-stone-900 border-2 border-amber-700/50 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-900/50 to-purple-900/50 p-4 border-b border-amber-700/30">
                    <h2 className="text-2xl font-bold text-amber-400">✨ Générateur de PNJ IA</h2>
                    <p className="text-stone-400 text-sm mt-1">Créez un personnage unique avec l'aide de l'IA</p>
                </div>

                {/* Progress */}
                {step < 5 && (
                    <div className="px-4 py-3 bg-stone-800/50 border-b border-stone-700">
                        <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                            <span>Étape {step}/4</span>
                            <span>{Math.round((step / 4) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderPreview()}
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-800/50 border-t border-stone-700 flex gap-3">
                    {step < 5 && (
                        <>
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-all"
                                >
                                    ← Précédent
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded transition-all"
                            >
                                Annuler
                            </button>

                            <div className="flex-1" />

                            {step < 4 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && (!formData.concept || !formData.role || !formData.race)}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg transition-all"
                                >
                                    Suivant →
                                </button>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !formData.concept}
                                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg transition-all"
                                >
                                    {loading ? '⏳ Génération...' : '🤖 Générer le PNJ'}
                                </button>
                            )}
                        </>
                    )}

                    {step === 5 && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded transition-all"
                        >
                            Fermer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
