// Calculate Armor Class based on equipped items and stats
export const calculateAC = (character) => {
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};
    const dexMod = Math.floor(((stats.dex || 10) - 10) / 2);
    
    const inventory = character.inventory || [];
    const equippedArmor = inventory.find(i => i.isEquipped && (i.type === 'armure' || i.type === 'armor') && i.equippedSlot === 'armor');
    const equippedShield = inventory.find(i => i.isEquipped && (i.type === 'bouclier' || i.type === 'shield'));
    
    let baseAC = 10 + dexMod; // Unarmored
    let shieldBonus = 0;
    
    // Shield bonus
    if (equippedShield) {
        shieldBonus = 2; // Standard shield bonus
    }
    
    // Armor calculation
    if (equippedArmor) {
        const props = (equippedArmor.properties || '').toLowerCase();
        
        // Light Armor: 11-12 + full DEX
        if (props.includes('légère')) {
            if (props.includes('ca 11')) baseAC = 11 + dexMod;
            else if (props.includes('ca 12')) baseAC = 12 + dexMod;
        }
        // Medium Armor: 13-15 + DEX (max +2)
        else if (props.includes('intermédiaire')) {
            const maxDex = Math.min(dexMod, 2);
            if (props.includes('ca 13')) baseAC = 13 + maxDex;
            else if (props.includes('ca 14')) baseAC = 14 + maxDex;
            else if (props.includes('ca 15')) baseAC = 15 + maxDex;
        }
        // Heavy Armor: 14-18 (no DEX)
        else if (props.includes('lourde')) {
            if (props.includes('ca 14')) baseAC = 14;
            else if (props.includes('ca 16')) baseAC = 16;
            else if (props.includes('ca 17')) baseAC = 17;
            else if (props.includes('ca 18')) baseAC = 18;
        }
    }
    
    return baseAC + shieldBonus;
};

// Calculate Initiative
export const calculateInitiative = (character) => {
    const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};
    return Math.floor(((stats.dex || 10) - 10) / 2);
};
