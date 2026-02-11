import { useState, useEffect } from 'react';
import wikiService from '../services/wikiService';
import userService from '../services/userService';

const VISIBILITIES = [
    { id: 'DRAFT', icon: 'lock', label: 'Brouillon', color: 'bg-stone-600' },
    { id: 'PUBLIC', icon: 'public', label: 'Public', color: 'bg-green-600' },
    { id: 'PARTIAL', icon: 'visibility', label: 'Partiel', color: 'bg-amber-600' },
    { id: 'TARGETED', icon: 'gps_fixed', label: 'Ciblé', color: 'bg-indigo-600' },
];

export default function VisibilityControl({ article, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [players, setPlayers] = useState([]);
    const [selectedTargets, setSelectedTargets] = useState([]);

    // Initialize selected targets from article
    useEffect(() => {
        if (article.targets) {
            setSelectedTargets(article.targets.map(u => u.id));
        }
    }, [article]);

    const handleStatusClick = async (e, visibilityId) => {
        e.preventDefault();
        e.stopPropagation();

        if (visibilityId === 'TARGETED') {
            openTargetModal();
        } else {
            updateStatus(visibilityId);
        }
    };

    const updateStatus = async (visibility, targets = null) => {
        setLoading(true);
        try {
            const payload = { visibility };
            if (targets) payload.targets = targets;

            const updated = await wikiService.updateArticle(article.id, payload);
            if (onUpdate) onUpdate(updated);
            // Close modal if open (though handleTargetSave does it too)
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            setLoading(false);
        }
    };

    const openTargetModal = async () => {
        setShowModal(true);
        if (players.length === 0) {
            try {
                const data = await userService.getPlayers();
                setPlayers(data);
            } catch (error) {
                console.error("Failed to load players");
            }
        }
    };

    const handleTargetSave = async () => {
        updateStatus('TARGETED', selectedTargets);
        setShowModal(false);
    };

    const toggleTarget = (userId) => {
        setSelectedTargets(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex bg-stone-900 rounded p-1 gap-1 border border-stone-700">
                {VISIBILITIES.map((viz) => {
                    const isActive = article.visibility === viz.id;
                    return (
                        <button
                            key={viz.id}
                            onClick={(e) => handleStatusClick(e, viz.id)}
                            className={`p-1.5 rounded transition-all flex items-center justify-center ${isActive ? viz.color + ' text-white shadow-lg ring-1 ring-white/50' : 'text-stone-500 hover:bg-stone-800 hover:text-stone-300'}`}
                            title={viz.label}
                            disabled={loading}
                        >
                            <span className="material-symbols-outlined text-[18px] leading-none">{viz.icon}</span>
                        </button>
                    );
                })}
            </div>

            {/* Target Selection Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowModal(false);
                    }}
                >
                    <div
                        className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-600 w-80"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-white mb-4">Choisir les cibles</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                            {players.map(player => (
                                <label key={player.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTargets.includes(player.id)}
                                        onChange={() => toggleTarget(player.id)}
                                        className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-200">{player.username}</span>
                                    <span className="text-xs text-gray-500 ml-auto">{player.role}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowModal(false);
                                }}
                                className="px-3 py-1 text-gray-400 hover:text-white"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTargetSave();
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded"
                            >
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
