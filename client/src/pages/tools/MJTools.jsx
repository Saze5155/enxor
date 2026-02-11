import { useState, useEffect } from 'react';
import RaceCreator from '../../components/tools/RaceCreator';
import ItemCreator from '../../components/tools/ItemCreator';
import JsonImporter from '../../components/tools/JsonImporter';
import FeatCreator from '../../components/tools/FeatCreator';
import SpellCreator from '../../components/tools/SpellCreator';
import ClassCreator from '../../components/tools/ClassCreator';
import DataManager from '../../components/tools/DataManager';
import dataService from '../../services/dataService';

export default function MJTools() {
    const [activeTab, setActiveTab] = useState('races');
    const [data, setData] = useState({ races: [], classes: [], items: [], spells: [], feats: [] });
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [races, classes, items, spells, feats] = await Promise.all([
                dataService.getRaces(),
                dataService.getClasses(),
                dataService.getItems(),
                dataService.getSpells(),
                dataService.getFeats()
            ]);
            setData({
                races: Array.isArray(races) ? races : [],
                classes: Array.isArray(classes) ? classes : (classes.classes || []),
                items: Array.isArray(items) ? items : [],
                spells: Array.isArray(spells) ? spells : [],
                feats: Array.isArray(feats) ? feats : []
            });
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]); // Reload when tab changes to refresh list

    const handleUpdate = async (type, item, visible) => {
        try {
            let updatedItem;
            if (type === 'races') updatedItem = await dataService.updateRace({ ...item, visible });
            if (type === 'classes') updatedItem = await dataService.updateClass({ ...item, visible });
            if (type === 'items') updatedItem = await dataService.updateItem({ ...item, visible });
            if (type === 'spells') updatedItem = await dataService.updateSpell({ ...item, visible });
            if (type === 'feats') updatedItem = await dataService.updateFeat({ ...item, visible });

            // Optimistic update
            setData(prev => ({
                ...prev,
                [type]: prev[type].map(i => (i.nom === item.nom && i.name === item.name) ? { ...i, visible } : i)
            }));
            loadData(); // Refresh to be sure
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'races':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-amber-500 mb-4 border-b border-stone-700 pb-2">Liste des Races Existantes</h2>
                            <DataManager title="Races" data={data.races} type="races" onUpdate={(item, val) => handleUpdate('races', item, val)} />
                        </div>
                        <div className="border-t lg:border-t-0 lg:border-l border-stone-700 pt-8 lg:pt-0 lg:pl-8">
                            <RaceCreator />
                        </div>
                    </div>
                );
            case 'items':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-amber-500 mb-4 border-b border-stone-700 pb-2">Liste des Objets Existants</h2>
                            <DataManager title="Objets" data={data.items} type="items" onUpdate={(item, val) => handleUpdate('items', item, val)} />
                        </div>
                        <div className="border-t lg:border-t-0 lg:border-l border-stone-700 pt-8 lg:pt-0 lg:pl-8">
                            <ItemCreator />
                        </div>
                    </div>
                );
            case 'classes':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-amber-500 mb-4 border-b border-stone-700 pb-2">Liste des Classes Existantes</h2>
                            <DataManager title="Classes" data={data.classes} type="classes" onUpdate={(item, val) => handleUpdate('classes', item, val)} />
                        </div>
                        <div className="border-t lg:border-t-0 lg:border-l border-stone-700 pt-8 lg:pt-0 lg:pl-8">
                            <ClassCreator />
                        </div>
                    </div>
                );
            case 'spells':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-amber-500 mb-4 border-b border-stone-700 pb-2">Liste des Sorts Existants</h2>
                            <DataManager title="Sorts" data={data.spells} type="spells" onUpdate={(item, val) => handleUpdate('spells', item, val)} />
                        </div>
                        <div className="border-t lg:border-t-0 lg:border-l border-stone-700 pt-8 lg:pt-0 lg:pl-8">
                            <SpellCreator />
                        </div>
                    </div>
                );
            case 'feats':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-amber-500 mb-4 border-b border-stone-700 pb-2">Liste des Dons Existants</h2>
                            <DataManager title="Dons" data={data.feats} type="feats" onUpdate={(item, val) => handleUpdate('feats', item, val)} />
                        </div>
                        <div className="border-t lg:border-t-0 lg:border-l border-stone-700 pt-8 lg:pt-0 lg:pl-8">
                            <FeatCreator />
                        </div>
                    </div>
                );
            case 'import': return <JsonImporter />;
            default: return <RaceCreator />;
        }
    };

    return (
        <div className="min-h-screen bg-stone-900 p-2 md:p-6 font-sans text-stone-200">
            <div className="max-w-7xl mx-auto bg-stone-800 shadow-2xl rounded-lg overflow-hidden border border-stone-700">
                <div className="p-4 border-b border-stone-700 flex justify-between items-center bg-stone-900">
                    <h1 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                        🎲 Outils du Maître de Jeu
                    </h1>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto border-b border-stone-700 bg-stone-900/50">
                    <TabButton active={activeTab === 'races'} onClick={() => setActiveTab('races')} label="Races" icon="🧬" />
                    <TabButton active={activeTab === 'items'} onClick={() => setActiveTab('items')} label="Objets" icon="🗡️" />
                    <TabButton active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} label="Classes" icon="🛡️" />
                    <TabButton active={activeTab === 'spells'} onClick={() => setActiveTab('spells')} label="Sorts" icon="✨" />
                    <TabButton active={activeTab === 'feats'} onClick={() => setActiveTab('feats')} label="Dons" icon="🏅" />
                    <TabButton active={activeTab === 'import'} onClick={() => setActiveTab('import')} label="Import JSON" icon="📥" />
                </div>

                {/* Content Area */}
                <div className="p-6 bg-stone-800 min-h-[600px]">
                    {loading ? <div className="text-center p-8 text-stone-400">Chargement des données...</div> : renderTabContent()}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 ${active
                ? 'text-amber-500 border-amber-500 bg-stone-800'
                : 'text-stone-400 border-transparent hover:text-stone-200 hover:bg-stone-800/50'
                }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    );
}
