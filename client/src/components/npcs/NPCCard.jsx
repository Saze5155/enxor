export default function NPCCard({ npc, onEdit, onDelete }) {
    return (
        <div className="bg-stone-800 border border-stone-700 rounded-lg p-4 hover:border-amber-700/50 transition-all">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {npc.name}
                        {npc.isImportant && <span className="text-amber-400">⭐</span>}
                        {!npc.isAlive && <span className="text-red-400">💀</span>}
                    </h3>
                    <p className="text-sm text-stone-400">
                        {npc.role} - {npc.race}
                        {npc.class && ` (${npc.class} ${npc.level})`}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(npc)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded transition-all"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => {
                            if (confirm(`Supprimer ${npc.name} ?`)) {
                                onDelete(npc.id);
                            }
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-all"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {npc.appearance && (
                <p className="text-sm text-stone-300 mb-2 line-clamp-2">{npc.appearance}</p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
                {npc.occupation && (
                    <span className="px-2 py-1 bg-stone-700 rounded text-stone-300">
                        💼 {npc.occupation}
                    </span>
                )}
                {npc.location && (
                    <span className="px-2 py-1 bg-stone-700 rounded text-stone-300">
                        📍 {npc.location}
                    </span>
                )}
                {npc.faction && (
                    <span className="px-2 py-1 bg-stone-700 rounded text-stone-300">
                        🛡️ {npc.faction}
                    </span>
                )}
            </div>
        </div>
    );
}
