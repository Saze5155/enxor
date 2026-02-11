import React from 'react';

const TABS = [
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'equipment', label: 'Équipement', icon: '🛡️' }, // New Equipment Tab
    { id: 'spells', label: 'Grimoire', icon: '✨' },
    { id: 'inventory', label: 'Inventaire', icon: '🎒' },
    { id: 'features', label: 'Capacités', icon: '🧩' },
    { id: 'bio', label: 'Biographie', icon: '📜' },
];

export default function CharacterTabs({ activeTab, onTabChange }) {
    return (
        <div className="flex overflow-x-auto bg-stone-800/90 text-stone-300 border-b border-stone-600 sticky top-0 z-20 shadow-md">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors
                        flex items-center justify-center gap-2 whitespace-nowrap
                        ${activeTab === tab.id
                            ? 'bg-[#fdf6e3] text-stone-900 border-b-4 border-amber-600'
                            : 'hover:bg-stone-700 hover:text-white border-b-4 border-transparent'}
                    `}
                >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden md:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
