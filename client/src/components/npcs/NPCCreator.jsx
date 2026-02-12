import { useState, useEffect } from 'react';
import npcService from '../../services/npcService';
import NPCGeneratorModal from './NPCGeneratorModal';

export default function NPCCreator({ initialData, onCancel, onSuccess }) {
    const defaultState = {
        name: '',
        role: 'Marchand',
        race: 'Humain',
        class: '',
        level: 1,
        age: '',
        appearance: '',
        personality: '',
        ideals: '',
        bonds: '',
        flaws: '',
        background: '',
        occupation: '',
        location: '',
        stats: null,
        faction: '',
        allies: '',
        enemies: '',
        quirks: '',
        voice: '',
        goals: '',
        isImportant: false,
        isAlive: true,
        notes: '',
        imageUrl: ''
    };

    const [formData, setFormData] = useState(defaultState);
    const [activeTab, setActiveTab] = useState('base');
    const [loading, setLoading] = useState(false);
    const [showAIGenerator, setShowAIGenerator] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...defaultState,
                ...Object.fromEntries(
                    Object.entries(initialData).map(([key, value]) => [
                        key,
                        value === null ? (typeof defaultState[key] === 'string' ? '' : null) : value
                    ])
                )
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await npcService.updateNPC(initialData.id, formData);
            } else {
                await npcService.createNPC(formData);
            }
            onSuccess();
            setFormData(defaultState);
        } catch (error) {
            console.error('Error saving NPC:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const renderBaseTab = () => (
        <div className="space-y-4 animate-fadeIn">
            {/* AI Generator Button */}
            <div className="mb-4 p-4 bg-gradient-to-r from-amber-900/20 to-purple-900/20 border border-amber-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-amber-400 font-bold text-sm mb-1">✨ Générateur IA</h4>
                        <p className="text-stone-400 text-xs">Laisse l'IA créer un PNJ unique pour toi</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAIGenerator(true)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-bold rounded shadow-lg transition-all hover:scale-105 active:scale-95 text-sm"
                    >
                        🤖 Générer avec l'IA
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Nom *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Rôle</label>
                    <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Race</label>
                    <input
                        type="text"
                        value={formData.race}
                        onChange={(e) => handleChange('race', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Âge</label>
                    <input
                        type="text"
                        value={formData.age || ''}
                        onChange={(e) => handleChange('age', e.target.value)}
                        placeholder="ex: Milieu de la trentaine"
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Classe</label>
                    <input
                        type="text"
                        value={formData.class || ''}
                        onChange={(e) => handleChange('class', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
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

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Occupation</label>
                    <input
                        type="text"
                        value={formData.occupation || ''}
                        onChange={(e) => handleChange('occupation', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Lieu</label>
                    <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Apparence</label>
                <textarea
                    value={formData.appearance || ''}
                    onChange={(e) => handleChange('appearance', e.target.value)}
                    rows={3}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                />
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.isImportant}
                        onChange={(e) => handleChange('isImportant', e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-stone-300 text-sm">⭐ PNJ Important</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.isAlive}
                        onChange={(e) => handleChange('isAlive', e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-stone-300 text-sm">💚 Vivant</span>
                </label>
            </div>
        </div>
    );

    const renderPersonalityTab = () => (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Personnalité</label>
                <textarea
                    value={formData.personality || ''}
                    onChange={(e) => handleChange('personality', e.target.value)}
                    rows={2}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Idéaux</label>
                    <textarea
                        value={formData.ideals || ''}
                        onChange={(e) => handleChange('ideals', e.target.value)}
                        rows={2}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Liens</label>
                    <textarea
                        value={formData.bonds || ''}
                        onChange={(e) => handleChange('bonds', e.target.value)}
                        rows={2}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Défauts</label>
                    <textarea
                        value={formData.flaws || ''}
                        onChange={(e) => handleChange('flaws', e.target.value)}
                        rows={2}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Particularités / Tics</label>
                <input
                    type="text"
                    value={formData.quirks || ''}
                    onChange={(e) => handleChange('quirks', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Façon de parler</label>
                <input
                    type="text"
                    value={formData.voice || ''}
                    onChange={(e) => handleChange('voice', e.target.value)}
                    placeholder="ex: Voix grave, parle lentement"
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Objectifs actuels</label>
                <textarea
                    value={formData.goals || ''}
                    onChange={(e) => handleChange('goals', e.target.value)}
                    rows={2}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                />
            </div>
        </div>
    );

    const renderBackgroundTab = () => (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Histoire</label>
                <textarea
                    value={formData.background || ''}
                    onChange={(e) => handleChange('background', e.target.value)}
                    rows={6}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Faction</label>
                    <input
                        type="text"
                        value={formData.faction || ''}
                        onChange={(e) => handleChange('faction', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Alliés</label>
                    <input
                        type="text"
                        value={formData.allies || ''}
                        onChange={(e) => handleChange('allies', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Ennemis</label>
                    <input
                        type="text"
                        value={formData.enemies || ''}
                        onChange={(e) => handleChange('enemies', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Notes MJ</label>
                <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    placeholder="Notes privées..."
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                />
            </div>
        </div>
    );

    return (
        <div className="bg-stone-900 border border-stone-700 rounded-lg shadow-xl">
            <div className="p-4 border-b border-stone-700">
                <h2 className="text-xl font-bold text-amber-400">
                    {initialData ? 'Modifier le PNJ' : 'Créer un PNJ'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Tabs */}
                <div className="flex border-b border-stone-700 bg-stone-800/50">
                    {['base', 'personnalite', 'background'].map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-bold transition-all ${activeTab === tab
                                ? 'bg-stone-900 text-amber-400 border-b-2 border-amber-500'
                                : 'text-stone-400 hover:text-stone-300'
                                }`}
                        >
                            {tab === 'base' && 'Infos Base'}
                            {tab === 'personnalite' && 'Personnalité'}
                            {tab === 'background' && 'Background'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'base' && renderBaseTab()}
                    {activeTab === 'personnalite' && renderPersonalityTab()}
                    {activeTab === 'background' && renderBackgroundTab()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-stone-700 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.name}
                        className="px-6 py-2 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg transition-all"
                    >
                        {loading ? 'Sauvegarde...' : initialData ? 'Mettre à jour' : 'Créer le PNJ'}
                    </button>
                </div>
            </form>

            {/* AI Generator Modal */}
            {showAIGenerator && (
                <NPCGeneratorModal
                    onClose={() => setShowAIGenerator(false)}
                    onGenerate={(generatedNPC) => {
                        setFormData({
                            ...formData,
                            ...generatedNPC,
                            stats: generatedNPC.stats ? JSON.stringify(generatedNPC.stats) : null
                        });
                        setShowAIGenerator(false);
                    }}
                />
            )}
        </div>
    );
}
