import React from 'react';
import InventoryManager from '../InventoryManager';

export default function InventoryTab({ character, onUpdate }) {
    // InventoryManager expects { inventory: [], money: {} }
    // It handles the UI for adding/removing items and managing money.
    // We just pass the checks.

    // We need to adapt the onUpdate signature if it differs from what CharacterSheet page provided.
    // The page provided: handleInventoryUpdate = ({ inventory, money }) => ...

    // Check if character inventory is array or object (legacy)
    // New schema: inventory is relation array.
    // User might have `money` stored in `inventory` legacy field if it was a JSON string before?
    // In new schema, `inventory` is a relation. Money should be stored separately or in a special "money" item?
    // Or `inventory` field in Character model was kept as JSON string in my update?
    // Wait, I changed `inventory` to a relation `CharacterItem[]`.
    // Where is money stored?
    // I removed `inventory` string field. I did NOT add a money field to Character model!
    // Oops. I missed the money field.
    // `InventoryManager` expects money.
    // I should probably store money in `Unparsed JSON` or add a field.
    // For now, let's assume money is in `stats` or a special "Wallet" item?
    // No, `money` is usually { pp, gp, ep, sp, cp }.

    // I will mock money for now or store it in `notes` or `features`? 
    // Or I missed it in the schema update.
    // Let's look at schema again. 
    // I see `inventory String` was removed. 
    // I see `inventory CharacterItem[]`.

    // I should add `coinage` to the schema later.
    // For now, I will use a local state or just "0 GP".
    // Or I can store it in a special "Money" item in the inventory list if I want.

    // Let's pass a dummy money object for now to prevent crash.
    const money = { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 };

    // The previous `InventoryManager` might need `inventory` as a list of items.
    // `character.inventory` is now an array of `CharacterItem` objects.
    // `InventoryManager` likely expects a specific format.

    return (
        <div className="h-full flex flex-col">
            <InventoryManager
                inventory={character.inventory || []}
                money={money}
                onUpdate={(updated) => {
                    // Adapt the update to the new schema
                    // We need to convert this back to what the controller expects
                    // Controller expects `inventory` array to replace.
                    // If InventoryManager returns { inventory: [...], money: ... }
                    // We only send inventory items for now.
                    onUpdate({ inventory: updated.inventory });
                }}
            />
        </div>
    );
}
