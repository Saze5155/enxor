import React from 'react';
import InventoryManager from '../InventoryManager';

export default function InventoryTab({ character, onUpdate }) {
    // Parse wallet from character (stored as JSON string)
    const wallet = typeof character.wallet === 'string'
        ? JSON.parse(character.wallet)
        : (character.wallet || { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 });

    return (
        <div className="h-full flex flex-col">
            <InventoryManager
                inventory={character.inventory || []}
                money={wallet}
                onUpdate={(updated) => {
                    // Send both inventory and wallet updates
                    onUpdate({
                        inventory: updated.inventory,
                        wallet: updated.money // InventoryManager returns 'money', we save as 'wallet'
                    });
                }}
            />
        </div>
    );
}
