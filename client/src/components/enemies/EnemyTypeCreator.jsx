import { useState, useEffect } from 'react';
import enemyService from '../../services/enemyService';
import EnemyGeneratorModal from './EnemyGeneratorModal';

export default function EnemyTypeCreator({ initialData, onCancel, onSuccess }) {
    const defaultState = {
        name: '',
        category: 'creature_basique',
        creatureType: 'Humanoïde',
        subType: '',
        size: 'M',
        alignment: 'Neutre',
        stats: {
            ca: 10,
            pv_formule: '2d8',
            pv_moyenne: 9,
            vitesse: { marche: '9m' },
            caracteristiques: { force: 10, dexterite: 10, constitution: 10, intelligence: 10, sagesse: 10, charisme: 10 },
            sens: { vision_dans_noir: '18m', perception_passive: 10 }
        },
        actions: [],
        reactions: [],
        legendaryActions: [],
        specialAbilities: [],
        encyclopedia: { courte: '', longue: '', habitat: '', comportement: '', tactiques: '', butin: '' },
        source: 'Homebrew',
        tags: []
    };

    const [formData, setFormData] = useState(defaultState);
    const [activeTab, setActiveTab] = useState('base');
    const [loading, setLoading] = useState(false);
    const [showAIGenerator, setShowAIGenerator] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...defaultState,
                ...initialData,
                stats: { ...defaultState.stats, ...(initialData.stats || {}) },
                encyclopedia: { ...defaultState.encyclopedia, ...(initialData.encyclopedia || {}) }
            });
        } else {
            setFormData(defaultState);
        }
    }, [initialData]);

    const handleChange = (path, value) => {
        const keys = path.split('.');
        setFormData(prev => {
            let next = { ...prev };
            let current = next;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await enemyService.updateEnemyType(initialData.id, formData);
            } else {
                await enemyService.createEnemyType(formData);
            }
            onSuccess();
            setFormData(defaultState);
        } catch (error) {
            alert("Erreur lors de la sauvegarde");
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
                        <p className="text-stone-400 text-xs">Laisse l'IA créer un ennemi équilibré pour toi</p>
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
                    <label className="block text-sm font-bold text-stone-400 mb-1">Nom de la créature</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Catégorie</label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    >
                        <option value="creature_basique">Créature Basique (Gobelin, Loup...)</option>
                        <option value="archetype_classe">Archétype de Classe (Paladin, Bandit...)</option>
                        <option value="creature_custom">Créature Custom / Unique</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Type</label>
                    <select
                        value={formData.creatureType}
                        onChange={(e) => handleChange('creatureType', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    >
                        {['Aberration', 'Bête', 'Céleste', 'Construction', 'Dragon', 'Élémentaire', 'Fée', 'Fiélon', 'Géant', 'Humanoïde', 'Monstruosité', 'Mort-vivant', 'Plante', 'Vase'].map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Taille</label>
                    <select
                        value={formData.size}
                        onChange={(e) => handleChange('size', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    >
                        <option value="TP">Très Petite (TP)</option>
                        <option value="P">Petite (P)</option>
                        <option value="M">Moyenne (M)</option>
                        <option value="G">Grande (G)</option>
                        <option value="TG">Très Grande (TG)</option>
                        <option value="Gig">Gigantesque (Gig)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Alignement</label>
                    <input
                        type="text"
                        value={formData.alignment}
                        onChange={(e) => handleChange('alignment', e.target.value)}
                        placeholder="ex: Neutre Mauvais"
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Source</label>
                <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => handleChange('source', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
            </div>
        </div>
    );

    const renderStatsTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-stone-700 pb-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">CA</label>
                    <input
                        type="number"
                        value={formData.stats.ca}
                        onChange={(e) => handleChange('stats.ca', parseInt(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">PV (Formule)</label>
                    <input
                        type="text"
                        value={formData.stats.pv_formule}
                        onChange={(e) => handleChange('stats.pv_formule', e.target.value)}
                        placeholder="ex: 2d8 + 4"
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">PV (Moyenne)</label>
                    <input
                        type="number"
                        value={formData.stats.pv_moyenne}
                        onChange={(e) => handleChange('stats.pv_moyenne', parseInt(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <h4 className="text-stone-300 font-bold mb-3 uppercase tracking-wider text-xs">Caractéristiques</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {['force', 'dexterite', 'constitution', 'intelligence', 'sagesse', 'charisme'].map(stat => (
                        <div key={stat}>
                            <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase text-center">{stat.substring(0, 3)}</label>
                            <input
                                type="number"
                                value={formData.stats.caracteristiques[stat]}
                                onChange={(e) => handleChange(`stats.caracteristiques.${stat}`, parseInt(e.target.value))}
                                className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-2 text-white text-center focus:border-amber-500 outline-none"
                            />
                            <div className="text-[10px] text-stone-400 text-center mt-1">
                                {Math.floor((formData.stats.caracteristiques[stat] - 10) / 2) >= 0 ? '+' : ''}
                                {Math.floor((formData.stats.caracteristiques[stat] - 10) / 2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-stone-300 font-bold mb-3 uppercase tracking-wider text-xs">Vitesses</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Marche (9m)"
                            value={formData.stats.vitesse.marche}
                            onChange={(e) => handleChange('stats.vitesse.marche', e.target.value)}
                            className="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white outline-none focus:border-amber-500"
                        />
                        <input
                            type="text"
                            placeholder="Vol"
                            value={formData.stats.vitesse.vol || ''}
                            onChange={(e) => handleChange('stats.vitesse.vol', e.target.value)}
                            className="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white outline-none focus:border-amber-500"
                        />
                    </div>
                </div>
                <div>
                    <h4 className="text-stone-300 font-bold mb-3 uppercase tracking-wider text-xs">Sens</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Vision Noir (18m)"
                            value={formData.stats.sens.vision_dans_noir || ''}
                            onChange={(e) => handleChange('stats.sens.vision_dans_noir', e.target.value)}
                            className="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white outline-none focus:border-amber-500"
                        />
                        <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-stone-500 uppercase font-bold">Perc Pass:</span>
                            <input
                                type="number"
                                value={formData.stats.sens.perception_passive}
                                onChange={(e) => handleChange('stats.sens.perception_passive', parseInt(e.target.value))}
                                className="w-12 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-white outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderActionsTab = () => {
        const addAction = (type) => {
            const list = [...formData[type]];
            list.push({ nom: 'Nouvelle Action', type: 'attaque_corps_a_corps', description: '', bonus_attaque: '+4', degats: '1d6+2' });
            handleChange(type, list);
        };

        const removeAction = (type, index) => {
            const list = [...formData[type]];
            list.splice(index, 1);
            handleChange(type, list);
        };

        const updateAction = (type, index, field, value) => {
            const list = [...formData[type]];
            list[index] = { ...list[index], [field]: value };
            handleChange(type, list);
        };

        const ActionList = ({ type, title }) => (
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-amber-500 font-bold uppercase tracking-wider text-xs">{title}</h4>
                    <button onClick={() => addAction(type)} className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 hover:bg-amber-500/20">
                        + Ajouter
                    </button>
                </div>
                <div className="space-y-3">
                    {formData[type].map((action, idx) => (
                        <div key={idx} className="bg-stone-900 p-3 rounded border border-stone-700 relative">
                            <button onClick={() => removeAction(type, idx)} className="absolute top-2 right-2 text-stone-500 hover:text-red-500">✕</button>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <input
                                    type="text"
                                    value={action.nom}
                                    onChange={(e) => updateAction(type, idx, 'nom', e.target.value)}
                                    placeholder="Nom"
                                    className="bg-transparent text-amber-400 font-bold outline-none border-b border-stone-700 focus:border-amber-500"
                                />
                                <select
                                    value={action.type}
                                    onChange={(e) => updateAction(type, idx, 'type', e.target.value)}
                                    className="bg-transparent text-stone-400 text-xs outline-none"
                                >
                                    <option value="attaque_corps_a_corps">Au contact</option>
                                    <option value="attaque_distance">À distance</option>
                                    <option value="action_speciale">Spéciale</option>
                                </select>
                            </div>
                            <textarea
                                value={action.description}
                                onChange={(e) => updateAction(type, idx, 'description', e.target.value)}
                                placeholder="Description / Effets"
                                className="w-full bg-stone-900/50 p-2 text-stone-300 text-xs rounded outline-none h-16 resize-none mb-2"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={action.bonus_attaque || ''}
                                    onChange={(e) => updateAction(type, idx, 'bonus_attaque', e.target.value)}
                                    placeholder="Atk: +4"
                                    className="bg-stone-950 px-2 py-1 rounded text-[10px] text-stone-400"
                                />
                                <input
                                    type="text"
                                    value={action.degats || ''}
                                    onChange={(e) => updateAction(type, idx, 'degats', e.target.value)}
                                    placeholder="Dégâts: 1d6+2"
                                    className="bg-stone-950 px-2 py-1 rounded text-[10px] text-stone-400"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        return (
            <div className="animate-fadeIn max-h-[400px] overflow-y-auto pr-2">
                <ActionList type="specialAbilities" title="Capacités Spéciales" />
                <ActionList type="actions" title="Actions" />
                <ActionList type="reactions" title="Réactions" />
                <ActionList type="legendaryActions" title="Actions Légendaires" />
            </div>
        );
    };

    const renderLoreTab = () => (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Introduction / Description courte</label>
                <textarea
                    value={formData.encyclopedia.courte}
                    onChange={(e) => handleChange('encyclopedia.courte', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none h-20"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Description complète / Lore</label>
                <textarea
                    value={formData.encyclopedia.longue}
                    onChange={(e) => handleChange('encyclopedia.longue', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none h-40"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Habitat</label>
                    <input
                        type="text"
                        value={formData.encyclopedia.habitat}
                        onChange={(e) => handleChange('encyclopedia.habitat', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Tactiques</label>
                    <input
                        type="text"
                        value={formData.encyclopedia.tactiques}
                        onChange={(e) => handleChange('encyclopedia.tactiques', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Image URL</label>
                <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
            </div>
        </div>
    );

    return (
        <div className="bg-stone-800 p-6 rounded-lg border border-stone-600 shadow-xl">
            <h2 className="text-2xl font-bold text-amber-500 mb-6 flex items-center justify-between">
                <span>{initialData ? 'Modifier l\'Ennemi' : 'Créer un Nouveau Type d\'Ennemi'}</span>
                {initialData && (
                    <button onClick={onCancel} className="text-sm font-normal text-stone-500 hover:text-stone-300">
                        Annuler
                    </button>
                )}
            </h2>

            {/* Sub-tabs */}
            <div className="flex gap-1 mb-6 border-b border-stone-700 overflow-x-auto">
                {['base', 'stats', 'actions', 'lore'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-all ${activeTab === tab ? 'text-amber-500 border-b-2 border-amber-500 bg-stone-900/30' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        {tab === 'base' && 'Infos Base'}
                        {tab === 'stats' && 'Stats'}
                        {tab === 'actions' && 'Capacités'}
                        {tab === 'lore' && 'Encyclopédie'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {activeTab === 'base' && renderBaseTab()}
                {activeTab === 'stats' && renderStatsTab()}
                {activeTab === 'actions' && renderActionsTab()}
                {activeTab === 'lore' && renderLoreTab()}

                <div className="pt-6 border-t border-stone-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        {loading ? 'Sauvegarde...' : initialData ? 'Mettre à jour' : 'Créer le Template'}
                    </button>
                </div>
            </form>

            {/* AI Generator Modal */}
            {showAIGenerator && (
                <EnemyGeneratorModal
                    onClose={() => setShowAIGenerator(false)}
                    onGenerate={(generatedEnemy) => {
                        // Mapper le statblock généré vers le format du formulaire
                        // Fusionner intelligemment les stats pour éviter les undefined
                        const mergedStats = {
                            ...formData.stats,
                            ...(generatedEnemy.stats || {}),
                            caracteristiques: {
                                force: generatedEnemy.stats?.force || formData.stats.caracteristiques.force,
                                dexterite: generatedEnemy.stats?.dexterite || formData.stats.caracteristiques.dexterite,
                                constitution: generatedEnemy.stats?.constitution || formData.stats.caracteristiques.constitution,
                                intelligence: generatedEnemy.stats?.intelligence || formData.stats.caracteristiques.intelligence,
                                sagesse: generatedEnemy.stats?.sagesse || formData.stats.caracteristiques.sagesse,
                                charisme: generatedEnemy.stats?.charisme || formData.stats.caracteristiques.charisme
                            },
                            vitesse: generatedEnemy.stats?.vitesse_marche ? {
                                marche: generatedEnemy.stats.vitesse_marche,
                                vol: generatedEnemy.stats.vitesse_vol || ''
                            } : formData.stats.vitesse,
                            sens: generatedEnemy.stats?.sens ? {
                                vision_dans_noir: generatedEnemy.stats.sens.split(',')[0] || '',
                                perception_passive: formData.stats.sens.perception_passive
                            } : formData.stats.sens
                        };

                        setFormData({
                            ...formData,
                            name: generatedEnemy.name || formData.name,
                            creatureType: generatedEnemy.creatureType || formData.creatureType,
                            subType: generatedEnemy.subType || formData.subType,
                            size: generatedEnemy.size || formData.size,
                            alignment: generatedEnemy.alignment || formData.alignment,
                            stats: mergedStats,
                            actions: generatedEnemy.actions || formData.actions,
                            reactions: generatedEnemy.reactions || formData.reactions,
                            legendaryActions: generatedEnemy.legendaryActions || formData.legendaryActions,
                            specialAbilities: generatedEnemy.capacites_speciales || formData.specialAbilities,
                            encyclopedia: generatedEnemy.lore ? {
                                courte: generatedEnemy.lore.description_courte || '',
                                longue: generatedEnemy.lore.description_longue || '',
                                habitat: generatedEnemy.lore.habitat || '',
                                comportement: generatedEnemy.lore.comportement || '',
                                tactiques: generatedEnemy.lore.tactiques || '',
                                butin: ''
                            } : formData.encyclopedia,
                            source: 'Généré par IA'
                        });
                        setShowAIGenerator(false);
                    }}
                />
            )}
        </div>
    );
}
