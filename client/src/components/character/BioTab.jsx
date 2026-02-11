import React from 'react';

export default function BioTab({ character, onUpdate }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        traits: character.traits || '',
        ideals: character.ideals || '',
        bonds: character.bonds || '',
        flaws: character.flaws || '',
        backstory: character.backstory || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            traits: character.traits || '',
            ideals: character.ideals || '',
            bonds: character.bonds || '',
            flaws: character.flaws || '',
            backstory: character.backstory || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="p-4 space-y-4 font-serif text-stone-800 relative">
            {/* Edit Controls */}
            <div className="flex justify-end mb-2">
                {isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="text-xs font-bold text-stone-500 hover:text-stone-800 px-3 py-1"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-stone-800 hover:bg-stone-700 text-[#fdf6e3] text-xs px-3 py-1 rounded font-bold shadow"
                        >
                            💾 Sauvegarder
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-stone-500 hover:text-stone-800 text-xs font-bold flex items-center gap-1"
                    >
                        ✏️ Modifier
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Traits de Personnalité</label>
                        {isEditing ? (
                            <textarea
                                name="traits"
                                value={formData.traits}
                                onChange={handleChange}
                                className="w-full text-xs italic bg-stone-50 border border-stone-200 rounded p-1 h-20 resize-none focus:ring-1 focus:ring-stone-400 focus:outline-none"
                            />
                        ) : (
                            <p className="text-xs italic whitespace-pre-wrap">{character.traits || "Non défini..."}</p>
                        )}
                    </div>
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm -rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Idéaux</label>
                        {isEditing ? (
                            <textarea
                                name="ideals"
                                value={formData.ideals}
                                onChange={handleChange}
                                className="w-full text-xs italic bg-stone-50 border border-stone-200 rounded p-1 h-20 resize-none focus:ring-1 focus:ring-stone-400 focus:outline-none"
                            />
                        ) : (
                            <p className="text-xs italic whitespace-pre-wrap">{character.ideals || "Non défini..."}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Liens</label>
                        {isEditing ? (
                            <textarea
                                name="bonds"
                                value={formData.bonds}
                                onChange={handleChange}
                                className="w-full text-xs italic bg-stone-50 border border-stone-200 rounded p-1 h-20 resize-none focus:ring-1 focus:ring-stone-400 focus:outline-none"
                            />
                        ) : (
                            <p className="text-xs italic whitespace-pre-wrap">{character.bonds || "Non défini..."}</p>
                        )}
                    </div>
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm -rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Défauts</label>
                        {isEditing ? (
                            <textarea
                                name="flaws"
                                value={formData.flaws}
                                onChange={handleChange}
                                className="w-full text-xs italic bg-stone-50 border border-stone-200 rounded p-1 h-20 resize-none focus:ring-1 focus:ring-stone-400 focus:outline-none"
                            />
                        ) : (
                            <p className="text-xs italic whitespace-pre-wrap">{character.flaws || "Non défini..."}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-stone-300 rounded p-4 shadow-sm relative mt-6">
                <div className="absolute -top-3 left-4 bg-stone-100 px-2 text-xs font-bold text-stone-600 uppercase tracking-widest border border-stone-300 rounded shadow-sm">
                    Histoire
                </div>
                {isEditing ? (
                    <textarea
                        name="backstory"
                        value={formData.backstory}
                        onChange={handleChange}
                        className="w-full text-sm leading-relaxed text-justify bg-stone-50 border border-stone-200 rounded p-2 h-64 resize-none focus:ring-1 focus:ring-stone-400 focus:outline-none"
                        placeholder="Il était une fois..."
                    />
                ) : (
                    <p className="text-sm leading-relaxed text-justify whitespace-pre-wrap">
                        {character.backstory || "Aucune histoire connue..."}
                    </p>
                )}
            </div>
        </div>
    );
}
