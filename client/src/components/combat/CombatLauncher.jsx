import { useState, useEffect } from 'react';
import combatService from '../../services/combatService';

export default function CombatLauncher({
    campaignId,
    availableCharacters = [],
    availableEnemies = [],
    onCombatStarted,
    onCancel
}) {
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [selectedEnemies, setSelectedEnemies] = useState([]);
    const [combatOptions, setCombatOptions] = useState({
        surprise: false,
        autoInitiative: false,
        difficulte: 'normale'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auto-select all available characters by default
    useEffect(() => {
        if (availableCharacters.length > 0) {
            setSelectedCharacters(availableCharacters.map(c => c.id));
        }
    }, [availableCharacters]);

    const toggleCharacter = (charId) => {
        setSelectedCharacters(prev =>
            prev.includes(charId)
                ? prev.filter(id => id !== charId)
                : [...prev, charId]
        );
    };

    const toggleEnemy = (enemyId) => {
        setSelectedEnemies(prev =>
            prev.includes(enemyId)
                ? prev.filter(id => id !== enemyId)
                : [...prev, enemyId]
        );
    };

    const calculateDifficulty = () => {
        const playerCount = selectedCharacters.length;
        const enemyCount = selectedEnemies.length;

        if (playerCount === 0 || enemyCount === 0) return 'N/A';

        const ratio = enemyCount / playerCount;
        if (ratio < 0.5) return 'Facile';
        if (ratio < 1) return 'Moyenne';
        if (ratio < 1.5) return 'Difficile';
        return 'Mortelle';
    };

    const handleStartCombat = async () => {
        if (selectedCharacters.length === 0 && selectedEnemies.length === 0) {
            setError('Vous devez sélectionner au moins un participant.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const combatData = {
                campaignId,
                joueurs: selectedCharacters, // Array of character IDs
                ennemis: selectedEnemies.map(id => ({ instanceId: id })), // Array of objects with instanceId
                parametres: combatOptions
            };

            const combat = await combatService.startCombat(combatData);
            onCombatStarted(combat);
        } catch (err) {
            console.error('Failed to start combat:', err);
            setError(err.response?.data?.message || 'Erreur lors du lancement du combat.');
        } finally {
            setLoading(false);
        }
    };

    const difficulty = calculateDifficulty();

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-stone-900 border-2 border-red-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-900 to-red-800 p-4 border-b-2 border-red-700">
                    <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
                        ⚔️ Lancer un Combat
                    </h2>
                    <p className="text-red-200 text-sm mt-1">Sélectionnez les participants et configurez les options</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded">
                            <strong className="font-bold">Erreur : </strong>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Player Characters Section */}
                    <div>
                        <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
                            <span className="text-2xl">🛡️</span>
                            Personnages Joueurs ({selectedCharacters.length}/{availableCharacters.length})
                        </h3>

                        {availableCharacters.length === 0 ? (
                            <div className="text-center py-8 text-stone-500 italic border-2 border-dashed border-stone-700 rounded">
                                Aucun personnage disponible dans cette campagne.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {availableCharacters.map(char => (
                                    <button
                                        key={char.id}
                                        onClick={() => toggleCharacter(char.id)}
                                        className={`p-3 rounded-lg border-2 transition text-left ${selectedCharacters.includes(char.id)
                                            ? 'bg-indigo-900/50 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                            : 'bg-stone-800 border-stone-700 hover:border-stone-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${selectedCharacters.includes(char.id) ? 'bg-indigo-700' : 'bg-stone-700'
                                                }`}>
                                                {selectedCharacters.includes(char.id) ? '✓' : '👤'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-stone-100">{char.name}</div>
                                                <div className="text-xs text-stone-400">
                                                    {char.race} {char.class} • Niv. {char.level} • HP: {char.hpCurrent}/{char.hpMax}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Enemy Instances Section */}
                    <div>
                        <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                            <span className="text-2xl">👹</span>
                            Ennemis ({selectedEnemies.length}/{availableEnemies.length})
                        </h3>

                        {availableEnemies.length === 0 ? (
                            <div className="text-center py-8 text-stone-500 italic border-2 border-dashed border-stone-700 rounded">
                                Aucun ennemi invoqué. Utilisez le panneau "Ennemis" pour en créer.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {availableEnemies.map(enemy => (
                                    <button
                                        key={enemy.id}
                                        onClick={() => toggleEnemy(enemy.id)}
                                        className={`p-3 rounded-lg border-2 transition text-left ${selectedEnemies.includes(enemy.id)
                                            ? 'bg-red-900/50 border-red-500 shadow-lg shadow-red-500/20'
                                            : 'bg-stone-800 border-stone-700 hover:border-stone-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${selectedEnemies.includes(enemy.id) ? 'bg-red-700' : 'bg-stone-700'
                                                }`}>
                                                {selectedEnemies.includes(enemy.id) ? '✓' : '💀'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-stone-100">{enemy.name}</div>
                                                <div className="text-xs text-stone-400">
                                                    HP: {enemy.hpCurrent}/{enemy.hpMax} • CA: {enemy.enemyType?.stats ? JSON.parse(enemy.enemyType.stats).ca || '?' : '?'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Combat Options */}
                    <div className="bg-stone-800 border border-stone-700 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-yellow-400 mb-3">⚙️ Options de Combat</h3>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={combatOptions.surprise}
                                    onChange={(e) => setCombatOptions(prev => ({ ...prev, surprise: e.target.checked }))}
                                    className="w-5 h-5 rounded border-stone-600 bg-stone-700 text-yellow-600 focus:ring-yellow-500"
                                />
                                <div>
                                    <span className="text-stone-200 font-medium group-hover:text-white transition">Round de Surprise</span>
                                    <p className="text-xs text-stone-500">Les ennemis ont l'avantage au premier tour</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={combatOptions.autoInitiative}
                                    onChange={(e) => setCombatOptions(prev => ({ ...prev, autoInitiative: e.target.checked }))}
                                    className="w-5 h-5 rounded border-stone-600 bg-stone-700 text-yellow-600 focus:ring-yellow-500"
                                />
                                <div>
                                    <span className="text-stone-200 font-medium group-hover:text-white transition">Initiative Automatique</span>
                                    <p className="text-xs text-stone-500">Lancer automatiquement l'initiative pour tous</p>
                                </div>
                            </label>
                        </div>

                        {/* Difficulty Indicator */}
                        <div className="mt-4 pt-4 border-t border-stone-700">
                            <div className="flex items-center justify-between">
                                <span className="text-stone-400 text-sm">Difficulté estimée :</span>
                                <span className={`font-bold px-3 py-1 rounded text-sm ${difficulty === 'Facile' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                                    difficulty === 'Moyenne' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' :
                                        difficulty === 'Difficile' ? 'bg-orange-900/50 text-orange-400 border border-orange-700' :
                                            difficulty === 'Mortelle' ? 'bg-red-900/50 text-red-400 border border-red-700' :
                                                'bg-stone-700 text-stone-400 border border-stone-600'
                                    }`}>
                                    {difficulty}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-stone-950 border-t-2 border-stone-700 p-4 flex justify-between items-center">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded font-medium transition disabled:opacity-50"
                    >
                        Annuler
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-stone-400">
                            {selectedCharacters.length + selectedEnemies.length} participant(s) sélectionné(s)
                        </div>
                        <button
                            onClick={handleStartCombat}
                            disabled={loading || (selectedCharacters.length === 0 && selectedEnemies.length === 0)}
                            className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin">⚙️</span>
                                    Lancement...
                                </>
                            ) : (
                                <>
                                    ⚔️ Lancer le Combat
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
