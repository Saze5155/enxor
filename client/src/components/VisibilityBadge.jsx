import { useState } from 'react';
import wikiService from '../services/wikiService';

const VISIBILITY_CONFIG = {
    DRAFT: { icon: '🔒', label: 'Brouillon', color: 'bg-gray-600 text-gray-200', next: 'PUBLIC' },
    PUBLIC: { icon: '✅', label: 'Public', color: 'bg-green-600 text-white', next: 'PARTIAL' },
    PARTIAL: { icon: '👁️', label: 'Partiel', color: 'bg-yellow-600 text-white', next: 'TARGETED' },
    TARGETED: { icon: '🎯', label: 'Ciblé', color: 'bg-indigo-600 text-white', next: 'DRAFT' },
    SECRET: { icon: '🕵️', label: 'Secret', color: 'bg-red-600 text-white', next: 'DRAFT' }
};

export default function VisibilityBadge({ article, onUpdate, readOnly = false }) {
    const [loading, setLoading] = useState(false);
    const config = VISIBILITY_CONFIG[article.visibility] || VISIBILITY_CONFIG.DRAFT;

    const handleClick = async (e) => {
        if (readOnly || loading) return;
        e.preventDefault(); // Prevent navigation if used inside a Link
        e.stopPropagation();

        setLoading(true);
        try {
            const nextStatus = config.next;
            // Optimistic update could go here, but let's wait for server
            const updated = await wikiService.updateArticle(article.id, {
                ...article,
                visibility: nextStatus
            });
            if (onUpdate) onUpdate(updated);
        } catch (error) {
            console.error("Failed to update visibility", error);
        } finally {
            setLoading(false);
        }
    };

    if (readOnly) {
        return (
            <span className={`text-xs px-2 py-1 rounded border border-gray-500/50 flex items-center gap-1 ${config.color} bg-opacity-20`}>
                {config.icon} {config.label}
            </span>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1 transition-all hover:scale-105 active:scale-95 ${config.color} ${loading ? 'opacity-50 cursor-wait' : ''}`}
            title="Cliquez pour changer la visibilité"
        >
            {config.icon} {config.label}
        </button>
    );
}
