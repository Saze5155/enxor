import { useState, useEffect } from 'react';

// Format item to ensure data consistency
// Format item to ensure data consistency
const createItem = (name, quantity = 1, weight = 0, value = 0, type = 'objet', damage = '', properties = '') => ({
    id: Date.now().toString(),
    name,
    quantity: parseInt(quantity) || 1,
    weight: parseFloat(weight) || 0,
    value: parseFloat(value) || 0,
    type,
    damage,
    properties
});

import { STANDARD_ITEMS } from '../data/items';

export default function InventoryManager({ inventory = [], money = { gp: 0, sp: 0, cp: 0 }, onUpdate }) {
    const [items, setItems] = useState(inventory || []);
    // Ensure money object has all properties even if prop is missing some
    const [currency, setCurrency] = useState({
        gp: money?.gp || 0,
        sp: money?.sp || 0,
        cp: money?.cp || 0
    });

    // Sync with props when they change (e.g. from Socket update)
    useEffect(() => {
        if (inventory) setItems(inventory);
    }, [inventory]);

    useEffect(() => {
        if (money) {
            setCurrency({
                gp: money.gp || 0,
                sp: money.sp || 0,
                cp: money.cp || 0
            });
        }
    }, [money]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('create'); // 'create' or 'choose'
    const [searchTerm, setSearchTerm] = useState('');

    // New Item Form State
    const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight: 0, value: 0, type: 'objet', damage: '', properties: '' });

    const handleAddItem = () => {
        if (!newItem.name) return;
        const updatedItems = [...items, createItem(newItem.name, newItem.quantity, newItem.weight, newItem.value, newItem.type, newItem.damage, newItem.properties)];
        setItems(updatedItems);
        onUpdate({ inventory: updatedItems, money: currency }); // Propagate updates
        setNewItem({ name: '', quantity: 1, weight: 0, value: 0, type: 'objet', damage: '', properties: '' });
        setIsModalOpen(false);
    };

    const handleSelectStandardItem = (item) => {
        setNewItem({
            name: item.name,
            quantity: 1,
            weight: item.weight,
            value: item.value,
            type: item.type,
            damage: item.damage || '',
            properties: item.properties || ''
        });
        setModalTab('create'); // Switch to create tab to let user adjust quantity/details
    };

    const handleRemoveItem = (id) => {
        const updatedItems = items.filter(i => i.id !== id);
        setItems(updatedItems);
        onUpdate({ inventory: updatedItems, money: currency });
    };

    const handleQuantityChange = (id, delta) => {
        const updatedItems = items.map(i => {
            if (i.id === id) {
                const newQty = Math.max(0, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }).filter(i => i.quantity > 0);

        setItems(updatedItems);
        onUpdate({ inventory: updatedItems, money: currency });
    };

    const handleCurrencyChange = (type, value) => {
        const val = parseInt(value) || 0;
        const newCurrency = { ...currency, [type]: val };
        setCurrency(newCurrency);
        onUpdate({ inventory: items, money: newCurrency });
    };

    const adjustCurrency = (type, delta) => {
        const newValue = Math.max(0, (currency[type] || 0) + delta);
        handleCurrencyChange(type, newValue);
    };

    // Convert currency (e.g., 10 SP -> 1 GP, with remainder)
    const convertCurrency = (from, to) => {
        // D&D 5e rates: 1 GP = 10 SP = 100 CP
        const rates = { cp: 1, sp: 10, gp: 100 }; // Value in CP
        const fromValue = currency[from] || 0;

        if (fromValue === 0) return; // Nothing to convert

        const fromInCP = fromValue * rates[from];
        const toValue = Math.floor(fromInCP / rates[to]);
        const remainderInCP = fromInCP % rates[to];
        const remainderInFrom = remainderInCP / rates[from];

        if (toValue > 0) {
            const newCurrency = {
                ...currency,
                [from]: remainderInFrom, // Keep the remainder
                [to]: (currency[to] || 0) + toValue
            };
            setCurrency(newCurrency);
            onUpdate({ inventory: items, money: newCurrency });
        }
    };

    // Calculate total in GP
    const totalInGP = ((currency.gp || 0) + (currency.sp || 0) / 10 + (currency.cp || 0) / 100).toFixed(2);

    const totalWeight = items.reduce((acc, i) => acc + (i.weight * i.quantity), 0).toFixed(1);

    const filteredStandardItems = STANDARD_ITEMS.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-stone-100 p-4 rounded border border-stone-300 shadow-inner h-full flex flex-col">
            <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-2 mb-3 uppercase text-xs flex justify-between items-center">
                <span>🎒 Inventaire</span>
                <span className="text-[10px] text-stone-500 font-normal">Poids: {totalWeight} kg</span>
            </h3>

            {/* Money Pouch - Enhanced */}
            <div className="mb-4 bg-gradient-to-br from-yellow-50 to-amber-50 p-3 rounded-lg border-2 border-amber-300 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs uppercase font-bold text-amber-800 flex items-center gap-1">
                        💰 Bourse
                    </h4>
                    <div className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                        Total: {totalInGP} PO
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {/* Gold */}
                    <div className="bg-white rounded border border-amber-400 p-2">
                        <span className="block text-[10px] uppercase font-bold text-amber-600 mb-1 text-center">🥇 Or (PO)</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => adjustCurrency('gp', -1)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-1.5 py-0.5 rounded font-bold"
                            >−</button>
                            <input
                                type="number"
                                value={currency.gp}
                                onChange={(e) => handleCurrencyChange('gp', e.target.value)}
                                className="flex-1 bg-amber-50 border border-amber-300 rounded px-1 py-1 text-center font-bold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                            />
                            <button
                                onClick={() => adjustCurrency('gp', 1)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1.5 py-0.5 rounded font-bold"
                            >+</button>
                        </div>
                        <div className="grid grid-cols-2 gap-0.5 mt-1">
                            <button
                                onClick={() => convertCurrency('sp', 'gp')}
                                className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-700 py-0.5 rounded"
                                title="Convertir 10 PA → 1 PO"
                            >
                                ⬆️ PA
                            </button>
                            <button
                                onClick={() => convertCurrency('gp', 'sp')}
                                className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-700 py-0.5 rounded"
                                title="Convertir 1 PO → 10 PA"
                            >
                                ⬇️ PA
                            </button>
                        </div>
                    </div>

                    {/* Silver */}
                    <div className="bg-white rounded border border-gray-400 p-2">
                        <span className="block text-[10px] uppercase font-bold text-gray-600 mb-1 text-center">🥈 Argent (PA)</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => adjustCurrency('sp', -1)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-1.5 py-0.5 rounded font-bold"
                            >−</button>
                            <input
                                type="number"
                                value={currency.sp}
                                onChange={(e) => handleCurrencyChange('sp', e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-300 rounded px-1 py-1 text-center font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                            />
                            <button
                                onClick={() => adjustCurrency('sp', 1)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1.5 py-0.5 rounded font-bold"
                            >+</button>
                        </div>
                        <div className="grid grid-cols-2 gap-0.5 mt-1">
                            <button
                                onClick={() => convertCurrency('cp', 'sp')}
                                className="text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-700 py-0.5 rounded"
                                title="Convertir 10 PC → 1 PA"
                            >
                                ⬆️ PC
                            </button>
                            <button
                                onClick={() => convertCurrency('sp', 'cp')}
                                className="text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-700 py-0.5 rounded"
                                title="Convertir 1 PA → 10 PC"
                            >
                                ⬇️ PC
                            </button>
                        </div>
                    </div>

                    {/* Copper */}
                    <div className="bg-white rounded border border-orange-400 p-2">
                        <span className="block text-[10px] uppercase font-bold text-orange-600 mb-1 text-center">🥉 Cuivre (PC)</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => adjustCurrency('cp', -1)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-1.5 py-0.5 rounded font-bold"
                            >−</button>
                            <input
                                type="number"
                                value={currency.cp}
                                onChange={(e) => handleCurrencyChange('cp', e.target.value)}
                                className="flex-1 bg-orange-50 border border-orange-300 rounded px-1 py-1 text-center font-bold text-orange-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                            />
                            <button
                                onClick={() => adjustCurrency('cp', 1)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1.5 py-0.5 rounded font-bold"
                            >+</button>
                        </div>
                        <button
                            onClick={() => convertCurrency('sp', 'cp')}
                            className="w-full mt-1 text-[9px] bg-orange-100 hover:bg-orange-200 text-orange-700 py-0.5 rounded"
                            title="Convertir 1 PA → 10 PC"
                        >
                            ⬇️ PA→PC
                        </button>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <ul className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {items.length === 0 && <li className="text-xs text-stone-400 italic text-center py-4">Sac vide...</li>}

                {items.map(item => (
                    <li key={item.id} className="flex justify-between items-center group text-sm border-b border-stone-200 pb-1 last:border-0 hover:bg-stone-200/50 rounded px-1 transition">
                        <div className="flex-1">
                            <span className="font-semibold text-stone-800">{item.name}</span>
                            {(item.weight > 0 || item.value > 0) && (
                                <div className="text-[10px] text-stone-500">
                                    {item.weight > 0 && `${item.weight}kg`}
                                    {item.weight > 0 && item.value > 0 && ' • '}
                                    {item.value > 0 && `${item.value}po`}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center text-xs bg-white border border-stone-300 rounded overflow-hidden">
                                <button
                                    onClick={() => handleQuantityChange(item.id, -1)}
                                    className="px-1.5 py-0.5 hover:bg-stone-100 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                >-</button>
                                <span className="px-1.5 font-bold min-w-[20px] text-center">{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                    className="px-1.5 py-0.5 hover:bg-stone-100"
                                >+</button>
                            </div>
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition px-1"
                                title="Jeter"
                            >
                                🗑️
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Add Item Button */}
            <button
                onClick={() => { setIsModalOpen(true); setModalTab('create'); }}
                className="mt-4 w-full py-1.5 border-2 border-dashed border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 rounded text-sm font-bold transition flex items-center justify-center gap-2"
            >
                + Ajouter un objet
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[#fdf6e3] rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col border border-stone-400 font-serif" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-stone-300 flex justify-between items-center bg-stone-100 rounded-t-lg">
                            <h4 className="text-xl font-bold text-stone-800 uppercase tracking-wide">Ajouter un objet</h4>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 font-bold text-xl">&times;</button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-stone-300 bg-white">
                            <button
                                onClick={() => setModalTab('create')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${modalTab === 'create' ? 'bg-[#fdf6e3] text-indigo-600 border-b-2 border-indigo-600' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
                            >
                                Créer un objet
                            </button>
                            <button
                                onClick={() => setModalTab('choose')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${modalTab === 'choose' ? 'bg-[#fdf6e3] text-indigo-600 border-b-2 border-indigo-600' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
                            >
                                Choisir dans la liste
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden p-6 flex flex-col">
                            {modalTab === 'choose' ? (
                                <ItemSelectortab
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    onSelect={handleSelectStandardItem}
                                />
                            ) : (
                                <CreateItemTab
                                    newItem={newItem}
                                    setNewItem={setNewItem}
                                    onCancel={() => setIsModalOpen(false)}
                                    onAdd={handleAddItem}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component for the "Choose" tab to keep main component clean
function ItemSelectortab({ searchTerm, onSearchChange, onSelect }) {
    const [filterCategory, setFilterCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'Tout' },
        { id: 'arme', label: 'Armes' },
        { id: 'armure', label: 'Armures/Boucliers', types: ['armure', 'bouclier'] },
        { id: 'consommable', label: 'Consommables' },
        { id: 'outil', label: 'Outils' },
        { id: 'objet', label: 'Divers' }
    ];

    const filteredItems = STANDARD_ITEMS.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesCategory = true;
        if (filterCategory !== 'all') {
            const cat = categories.find(c => c.id === filterCategory);
            if (cat.types) {
                matchesCategory = cat.types.includes(item.type);
            } else {
                matchesCategory = item.type === filterCategory;
            }
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-stone-400">🔍</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher un objet..."
                        className="w-full bg-white border border-stone-300 rounded-full py-2 pl-10 pr-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        autoFocus
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filterCategory === cat.id
                                ? 'bg-stone-800 text-white border-stone-800'
                                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white border border-stone-200 rounded-lg shadow-inner p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(item)}
                            className="text-left p-3 rounded border border-stone-200 hover:border-indigo-400 hover:bg-indigo-50 transition group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-stone-800 group-hover:text-indigo-700">{item.name}</span>
                                <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-1.5 rounded">{item.type}</span>
                            </div>
                            <div className="text-xs text-stone-500 space-y-0.5">
                                {item.damage && <div>⚔️ {item.damage}</div>}
                                {(item.weight > 0 || item.value > 0) && (
                                    <div className="flex gap-2">
                                        {item.weight > 0 && <span>⚖️ {item.weight}kg</span>}
                                        {item.value > 0 && <span>💰 {item.value}po</span>}
                                    </div>
                                )}
                            </div>
                            {item.properties && (
                                <div className="mt-1 text-[10px] text-stone-400 italic truncate" title={item.properties}>
                                    {item.properties}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors pointer-events-none" />
                        </button>
                    ))}
                </div>
                {filteredItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50">
                        <span className="text-4xl mb-2">📦</span>
                        <p className="text-sm italic">Aucun objet trouvé.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for "Create" tab
function CreateItemTab({ newItem, setNewItem, onCancel, onAdd }) {
    return (
        <div className="flex flex-col h-full">
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div>
                    <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Nom</label>
                    <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded p-3 text-stone-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
                        placeholder="Ex: Épée longue"

                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Type</label>
                        <select
                            value={newItem.type}
                            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                            className="w-full bg-white border border-stone-300 rounded p-3 text-stone-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                        >
                            <option value="objet">Objet</option>
                            <option value="arme">Arme</option>
                            <option value="armure">Armure</option>
                            <option value="bouclier">Bouclier</option>
                            <option value="consommable">Consommable</option>
                            <option value="outil">Outil</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Dégâts / CA (Optionnel)</label>
                        <input
                            type="text"
                            value={newItem.damage}
                            onChange={(e) => setNewItem({ ...newItem, damage: e.target.value })}
                            className="w-full bg-white border border-stone-300 rounded p-3 text-stone-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                            placeholder="Ex: 1d8 / +2"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Propriétés (Optionnel)</label>
                    <input
                        type="text"
                        value={newItem.properties}
                        onChange={(e) => setNewItem({ ...newItem, properties: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded p-3 text-stone-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                        placeholder="Ex: Versatile, Légère..."
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Qté</label>
                        <input
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                            className="w-full bg-white border border-stone-300 rounded p-3 text-stone-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Poids (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={newItem.weight}
                            onChange={(e) => setNewItem({ ...newItem, weight: e.target.value })}
                            className="w-full bg-white border border-stone-300 rounded p-3 text-stone-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Val (PO)</label>
                        <input
                            type="number"
                            value={newItem.value}
                            onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                            className="w-full bg-white border border-stone-300 rounded p-3 text-stone-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-200">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 text-stone-500 hover:text-stone-800 font-bold transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={onAdd}
                    disabled={!newItem.name}
                    className="bg-stone-800 hover:bg-stone-700 text-[#fdf6e3] px-6 py-2 rounded font-bold disabled:opacity-50 shadow-md transition-all hover:shadow-lg"
                >
                    Ajouter l'objet
                </button>
            </div>
        </div>
    );
}
