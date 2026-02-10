import React, { useState } from 'react';
import CharacterHeader from './CharacterHeader';
import CharacterTabs from './CharacterTabs';
import CharacterSidebar from './CharacterSidebar';
import CombatTab from './CombatTab';
import InventoryTab from './InventoryTab';
import SpellsTab from './SpellsTab';
import FeaturesTab from './FeaturesTab';
import BioTab from './BioTab';

export default function CharacterSheet({ character, onLevelUp, onInventoryUpdate }) {
    const [activeTab, setActiveTab] = useState('combat');

    if (!character) return <div className="p-8 text-center text-stone-500">Chargement du grimoire...</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'combat': return <CombatTab character={character} />;
            case 'spells': return <SpellsTab character={character} />;
            case 'inventory': return <InventoryTab character={character} onUpdate={onInventoryUpdate} />;
            case 'features': return <FeaturesTab character={character} />;
            case 'bio': return <BioTab character={character} />;
            default: return <CombatTab character={character} />;
        }
    };

    return (
        <div className="min-h-screen bg-stone-900 p-2 md:p-6 font-sans">
            <div className="max-w-6xl mx-auto bg-[#fdf6e3] shadow-2xl rounded-lg overflow-hidden border border-stone-500 relative">

                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] z-0"></div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <CharacterHeader
                        character={character}
                        onLevelUp={onLevelUp}
                    />

                    {/* Main Layout: Sidebar + Content */}
                    <div className="flex flex-col md:flex-row flex-1">

                        {/* Sidebar (Mobile: Stacked on top or hidden? Let's stack for now) */}
                        <div className="md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-stone-400">
                            <CharacterSidebar character={character} />
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col min-h-[500px] bg-white/50">
                            <CharacterTabs activeTab={activeTab} onTabChange={setActiveTab} />

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {renderTabContent()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
