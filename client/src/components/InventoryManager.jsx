import { useState, useEffect } from 'react';

// Format item to ensure data consistency
const createItem = (name, quantity = 1, weight = 0, value = 0) => ({
    id: Date.now().toString(),
    name,
    quantity: parseInt(quantity) || 1,
    weight: parseFloat(weight) || 0,
    value: parseFloat(value) || 0
});

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

    // New Item Form State
    const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight: 0, value: 0 });

    const handleAddItem = () => {
        if (!newItem.name) return;
        const updatedItems = [...items, createItem(newItem.name, newItem.quantity, newItem.weight, newItem.value)];
        setItems(updatedItems);
        onUpdate({ inventory: updatedItems, money: currency }); // Propagate updates
        setNewItem({ name: '', quantity: 1, weight: 0, value: 0 });
        setIsModalOpen(false);
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

    const totalWeight = items.reduce((acc, i) => acc + (i.weight * i.quantity), 0).toFixed(1);

    return (
        <div className="bg-stone-100 p-4 rounded border border-stone-300 shadow-inner h-full flex flex-col">
            <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-2 mb-3 uppercase text-xs flex justify-between items-center">
                <span>🎒 Inventaire</span>
                <span className="text-[10px] text-stone-500 font-normal">Poids: {totalWeight} kg</span>
            </h3>

            {/* Money Pouch */}
            <div className="mb-4 bg-yellow-100/50 p-2 rounded border border-yellow-200 grid grid-cols-3 gap-2">
                <div>
                    <span className="block text-[10px] uppercase font-bold text-yellow-600 mb-1">Or (PO)</span>
                    <input
                        type="number"
                        value={currency.gp}
                        onChange={(e) => handleCurrencyChange('gp', e.target.value)}
                        className="w-full bg-white border border-yellow-300 rounded px-1 py-1 text-center font-bold text-yellow-800 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-sm"
                    />
                </div>
                <div>
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Argent (PA)</span>
                    <input
                        type="number"
                        value={currency.sp}
                        onChange={(e) => handleCurrencyChange('sp', e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded px-1 py-1 text-center font-bold text-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-400 text-sm"
                    />
                </div>
                <div>
                    <span className="block text-[10px] uppercase font-bold text-orange-700 mb-1">Cuivre (PC)</span>
                    <input
                        type="number"
                        value={currency.cp}
                        onChange={(e) => handleCurrencyChange('cp', e.target.value)}
                        className="w-full bg-white border border-orange-300 rounded px-1 py-1 text-center font-bold text-orange-800 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    />
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
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full py-1.5 border-2 border-dashed border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 rounded text-sm font-bold transition flex items-center justify-center gap-2"
            >
                + Ajouter un objet
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[#fdf6e3] rounded-lg shadow-2xl p-6 w-full max-w-sm border border-stone-400 font-serif" onClick={(e) => e.stopPropagation()}>
                        <h4 className="text-lg font-bold text-stone-800 mb-4 border-b border-stone-300 pb-2">Ajouter un objet</h4>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Nom</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-white border border-stone-300 rounded p-2 text-stone-800"
                                    placeholder="Ex: Épée longue"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Qté</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-white border border-stone-300 rounded p-2 text-stone-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Poids (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={newItem.weight}
                                        onChange={(e) => setNewItem({ ...newItem, weight: e.target.value })}
                                        className="w-full bg-white border border-stone-300 rounded p-2 text-stone-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-stone-500 mb-1">Val (PO)</label>
                                    <input
                                        type="number"
                                        value={newItem.value}
                                        onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                        className="w-full bg-white border border-stone-300 rounded p-2 text-stone-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-stone-500 hover:text-stone-800 font-bold"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddItem}
                                disabled={!newItem.name}
                                className="bg-stone-800 hover:bg-stone-700 text-[#fdf6e3] px-4 py-2 rounded font-bold disabled:opacity-50"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
