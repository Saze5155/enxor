import { useState } from 'react';

export default function DataManager({ title, data, type, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const filteredData = data.filter(item => {
        const name = item.nom || item.name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleToggle = (item) => {
        // Optimistic UI update or wait for callback? For simplicity, callback.
        onUpdate(item, !item.visible);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-300">{title} ({data.length})</h3>
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-stone-800 border border-stone-600 rounded px-3 py-1 text-sm text-white focus:border-amber-500 outline-none w-64"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredData.map((item, idx) => {
                    const name = item.nom || item.name;
                    const isVisible = item.visible !== false; // Default true if undefined

                    return (
                        <div key={idx} className={`p-4 rounded border flex justify-between items-center transition-colors ${isVisible ? 'bg-stone-800 border-stone-600' : 'bg-stone-900 border-stone-700 opacity-75'}`}>
                            <div>
                                <div className="font-bold text-amber-500">{name}</div>
                                <div className="text-xs text-stone-500 italic">
                                    {type === 'races' && `Vitesse: ${item.vitesse}m`}
                                    {type === 'classes' && `DV: ${item.de_vie}`}
                                    {type === 'items' && `${item.type} - ${item.value}po`}
                                    {type === 'spells' && `Niveau ${item.niveau}`}
                                    {type === 'feats' && `${item.prerequis || 'Aucun prérequis'}`}
                                </div>
                            </div>

                            <label className="flex items-center cursor-pointer">
                                <span className={`mr-2 text-xs font-bold uppercase ${isVisible ? 'text-green-500' : 'text-stone-500'}`}>
                                    {isVisible ? 'Utilisable' : 'Caché'}
                                </span>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={isVisible} onChange={() => handleToggle(item)} />
                                    <div className={`block w-10 h-6 rounded-full transition ${isVisible ? 'bg-green-600' : 'bg-stone-600'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isVisible ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    );
                })}
                {filteredData.length === 0 && <p className="text-stone-500 text-center italic py-4">Aucun élément trouvé.</p>}
            </div>
        </div>
    );
}
