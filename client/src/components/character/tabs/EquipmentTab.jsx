import React, { useState } from 'react';
import { calculateAC } from '../../../utils/characterCalculations';


const SLOTS = [
    { id: 'head', label: 'Tête', icon: '🪖' },
    { id: 'armor', label: 'Armure', icon: '👕' },
    { id: 'main_hand', label: 'Main Gauche', icon: '⚔️' },
    { id: 'off_hand', label: 'Main Droite', icon: '🛡️' },
    { id: 'feet', label: 'Jambes', icon: '👢' },
    { id: 'cape', label: 'Cape', icon: '🧣' },
    { id: 'accessory_1', label: 'Acc. 1', icon: '💍' },
    { id: 'accessory_2', label: 'Acc. 2', icon: '🧿' },
];

export default function EquipmentTab({ character, onUpdate }) {
    const [draggedItem, setDraggedItem] = useState(null);

    // Filter inventory
    // Filter inventory - Only show equippable items in this view
    const EQUIPPABLE_TYPES = ['arme', 'armure', 'bouclier', 'tête', 'pieds', 'dos', 'accessoire', 'cou', 'mains', 'poignets', 'taille', 'anneau'];

    const equippedItems = character.inventory.filter(i => i.isEquipped && i.equippedSlot);
    const unequippedItems = character.inventory.filter(i =>
        !i.isEquipped &&
        (EQUIPPABLE_TYPES.includes(i.type?.toLowerCase()) ||
            // Also include items that might be detected as equippable by name even if type is generic 'objet'
            // (Re-using a simplified version of isValidSlot logic or just relying on type improvement from backend)
            ['épée', 'hache', 'dague', 'arc', 'armure', 'bouclier', 'casque', 'bottes', 'cape', 'anneau'].some(k => i.name.toLowerCase().includes(k)))
    );

    // Helpers
    const getEquippedItem = (slotId) => equippedItems.find(i => i.equippedSlot === slotId);

    const handleEquip = async (item, slotId) => {
        // 1. Unequip current item in slot if any
        const currentItem = getEquippedItem(slotId);

        // Optimistic update
        let newInventory = character.inventory.map(i => {
            if (i.id === item.id) return { ...i, isEquipped: true, equippedSlot: slotId };
            if (currentItem && i.id === currentItem.id) return { ...i, isEquipped: false, equippedSlot: null };
            return i;
        });

        onUpdate({ inventory: newInventory }); // Notify parent
    };

    const handleUnequip = async (item) => {
        const newInventory = character.inventory.map(i => {
            if (i.id === item.id) return { ...i, isEquipped: false, equippedSlot: null };
            return i;
        });
        onUpdate({ inventory: newInventory });
    };

    // Validation Rules
    const isValidSlot = (item, slotId) => {
        const name = item.name.toLowerCase();
        const type = item.type ? item.type.toLowerCase() : '';

        // Specific mappings based on item name keywords or type
        switch (slotId) {
            case 'head':
                return ['casque', 'coiffe', 'chapeau', 'heaume'].some(k => name.includes(k)) || type === 'tête';
            case 'armor':
                return ['armure', 'cotte', 'robe', 'tunique', 'cuir'].some(k => name.includes(k)) || type === 'armure';
            case 'main_hand':
                // Can equip weapons or anything really, but usually weapons
                return ['épée', 'hache', 'dague', 'arc', 'arbalète', 'marteau', 'glaive', 'bâton', 'masse'].some(k => name.includes(k)) || type === 'arme';
            case 'off_hand':
                // Shield or Light weapon (if dual wield) - simplifying to Shield or Weapon
                return ['bouclier', 'écu'].some(k => name.includes(k)) ||
                    ['épée', 'hache', 'dague', 'marteau', 'glaive', 'bâton', 'masse'].some(k => name.includes(k)) ||
                    type === 'arme' || type === 'bouclier';
            case 'feet':
                return ['bottes', 'chaussures', 'jambières'].some(k => name.includes(k)) || type === 'pieds';
            case 'cape':
                return ['cape', 'manteau'].some(k => name.includes(k)) || type === 'dos';
            case 'accessory_1':
            case 'accessory_2':
                return ['anneau', 'bague', 'amulette', 'collier'].some(k => name.includes(k)) || type === 'accessoire';
            default:
                return true;
        }
    };

    // Proficiency Check
    const checkProficiency = (item) => {
        const profs = typeof character.proficiencies === 'string' ? JSON.parse(character.proficiencies) : character.proficiencies || {};
        const armorProfs = profs.armor || [];
        const weaponProfs = profs.weapons || [];

        const name = item.name.toLowerCase();
        const type = item.type ? item.type.toLowerCase() : '';
        const props = item.properties ? item.properties.toLowerCase() : '';

        // Armor Validation
        if (type === 'armure' || type === 'armor') {
            if (props.includes('lourde') && !armorProfs.some(p => p.toLowerCase().includes('lourde'))) return false;
            if (props.includes('intermédiaire') && !armorProfs.some(p => p.toLowerCase().includes('intermédiaire'))) return false;
            if (props.includes('légère') && !armorProfs.some(p => p.toLowerCase().includes('légère'))) return false;
            // Specific check for shields if type is armor but name suggests shield (though usually type is shield)
        }

        // Shield Validation
        if (type === 'bouclier' || type === 'shield' || name.includes('bouclier')) {
            if (!armorProfs.some(p => p.toLowerCase().includes('bouclier'))) return false;
        }

        // Weapon Validation
        if (type === 'arme' || type === 'weapon') {
            // Simplify: Check if matches generic categories
            // In a real app we need a full DB of which weapon is Simple vs Martial.
            // For now, let's assume if it has "Guerre" in name it's martial? No.
            // Let's use a hardcoded list of Martial Weapons to check against "Armes de guerre"
            const MARTIAL_WEAPONS = ['épée', 'hache à deux mains', 'hache d\'armes', 'marteau de guerre', 'glaive', 'fléau', 'hallebarde', 'lance d\'arçon', 'maul', 'pioche', 'rapière', 'cimeterre', 'trident', 'arbalète lourde', 'arc long', 'filet'];
            const SIMPLE_WEAPONS = ['dague', 'bâton', 'gourdin', 'hachette', 'javeline', 'lance', 'marteau léger', 'masse', 'faucille', 'arbalète légère', 'arc court', 'fronde', 'fléchette'];

            const isMartial = MARTIAL_WEAPONS.some(k => name.includes(k));
            const isSimple = SIMPLE_WEAPONS.some(k => name.includes(k));

            const hasMartialProf = weaponProfs.some(p => p.toLowerCase().includes('guerre') || p.toLowerCase().includes('martial'));
            const hasSimpleProf = weaponProfs.some(p => p.toLowerCase().includes('courante') || p.toLowerCase().includes('simple'));

            if (isMartial && !hasMartialProf) {
                // Check specific proficiency (e.g. Elf -> Longsword)
                if (!weaponProfs.some(p => name.includes(p.toLowerCase()))) return false;
            }
            // If it's simple and we don't have simple prof? (Rare, apart from Wizard/Sorcerer who have limit lists)
            // But usually classes have Simple.
            // Specialized logic: if class is Druid, Rogue, etc. they have specific lists. 
            // If `weaponProfs` contains specific names, we check those.

            // If no generic prof matches, check specific
            if ((isMartial && !hasMartialProf) || (isSimple && !hasSimpleProf)) {
                if (!weaponProfs.some(p => name.includes(p.toLowerCase()))) return false;
            }
        }

        return true;
    };

    // Drag Handlers
    const onDragStart = (e, item) => {
        setDraggedItem(item);
    };

    const onDrop = (e, slotId) => {
        e.preventDefault();
        if (draggedItem) {
            if (isValidSlot(draggedItem, slotId)) {
                if (checkProficiency(draggedItem)) {
                    handleEquip(draggedItem, slotId);
                } else {
                    if (window.confirm(`⚠️ Attention : Vous ne semblez pas maîtriser cet objet ("${draggedItem.name}").\n\nL'équiper pourrait désavantager vos jets. Voulez-vous continuer ?`)) {
                        handleEquip(draggedItem, slotId);
                    }
                }
            } else {
                alert(`Impossible d'équiper "${draggedItem.name}" dans l'emplacement "${SLOTS.find(s => s.id === slotId)?.label || slotId}".`);
            }
            setDraggedItem(null);
        }
    };

    const onDragOver = (e) => e.preventDefault();

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 h-full min-h-[500px]">

            {/* LEFT: Inventory List */}
            <div className="w-full md:w-1/3 bg-stone-100 p-4 rounded border border-stone-300 shadow-inner flex flex-col">
                <h3 className="font-cinzel font-bold text-stone-700 mb-4 border-b border-stone-300 pb-2">Inventaire</h3>
                <div className="overflow-y-auto flex-1 space-y-2">
                    {unequippedItems.length === 0 && <p className="text-stone-400 italic text-sm text-center">Sac vide...</p>}
                    {unequippedItems.map(item => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, item)}
                            className="bg-white p-2 rounded border border-stone-200 shadow-sm cursor-grab hover:bg-amber-50 active:cursor-grabbing flex justify-between items-center group"
                        >
                            <div>
                                <span className="font-bold text-stone-800 text-sm">{item.name}</span>
                                <span className="text-xs text-stone-500 block">{item.type}</span>
                            </div>
                            <span className="text-xs font-mono text-stone-400 opacity-0 group-hover:opacity-100">Glisser</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Paper Doll Stats & Slots */}
            <div className="w-full md:w-2/3 flex flex-col">

                {/* Stats Summary */}
                <div className="flex justify-between bg-stone-800 p-3 rounded text-amber-500 mb-6 font-mono text-sm shadow">
                    <div>CA Totale: <span className="text-white font-bold text-lg">{calculateAC(character)}</span></div>
                    <div>Vitesse: <span className="text-white font-bold">{character.speed}m</span></div>
                </div>

                {/* Silhouette Layout */}
                <div className="relative flex-1 bg-stone-200/50 rounded-lg border-2 border-dashed border-stone-300 p-4 flex items-center justify-center">

                    {/* Placeholder Silhouette Image or CSS shape */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                        <span className="text-9xl text-stone-400">👤</span>
                    </div>

                    <div className="grid grid-cols-3 gap-8 w-full max-w-md relative z-10">
                        {/* Head - Centered Top */}
                        <div className="col-span-3 flex justify-center">
                            <EquipmentSlot id="head" label="Tête" item={getEquippedItem('head')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                        </div>

                        {/* Middle Row: Left Hand, Armor, Right Hand */}
                        <div className="flex justify-center">
                            <EquipmentSlot id="main_hand" label="Main G." item={getEquippedItem('main_hand')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                        </div>
                        <div className="flex justify-center">
                            <EquipmentSlot id="armor" label="Torse" item={getEquippedItem('armor')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                        </div>
                        <div className="flex justify-center">
                            <EquipmentSlot id="off_hand" label="Main D." item={getEquippedItem('off_hand')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                        </div>

                        {/* Cape - floating or row */}
                        <div className="col-span-3 flex justify-center py-2">
                            <EquipmentSlot id="cape" label="Cape" item={getEquippedItem('cape')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                        </div>

                        {/* Bottom Row: Feet */}
                        <div className="col-span-3 flex justify-center">
                            <EquipmentSlot id="feet" label="Jambes" item={getEquippedItem('feet')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                        </div>

                        {/* Accessories */}
                        <div className="col-span-3 flex justify-center gap-4 mt-4 border-t border-stone-300 pt-4">
                            <EquipmentSlot id="accessory_1" label="Anneau 1" item={getEquippedItem('accessory_1')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                            <EquipmentSlot id="accessory_2" label="Anneau 2" item={getEquippedItem('accessory_2')} onDrop={onDrop} onDragOver={onDragOver} onUnequip={handleUnequip} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function EquipmentSlot({ id, label, item, onDrop, onDragOver, onUnequip }) {
    return (
        <div
            onDrop={(e) => onDrop(e, id)}
            onDragOver={onDragOver}
            className={`
                w-24 h-24 border-2 rounded-lg flex flex-col items-center justify-center p-2 transition-all relative
                ${item ? 'bg-amber-100 border-amber-600 shadow-md' : 'bg-stone-100 border-stone-300 border-dashed hover:bg-stone-200'}
            `}
        >
            <span className="text-[10px] uppercase font-bold text-stone-400 absolute top-1">{label}</span>

            {item ? (
                <div className="text-center group w-full">
                    <div className="text-2xl mb-1">🛡️</div>
                    <div className="text-xs font-bold leading-tight truncate px-1 text-stone-800">{item.name}</div>
                    <button
                        onClick={() => onUnequip(item)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 shadow transition-opacity"
                        title="Déséquiper"
                    >
                        ✕
                    </button>
                    {/* Tooltip or Details could go here */}
                </div>
            ) : (
                <div className="text-stone-300 text-2xl">+</div>
            )}
        </div>
    );
}
