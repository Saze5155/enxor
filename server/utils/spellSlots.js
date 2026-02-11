// Spell slot progression tables for D&D 5e classes
const SPELL_SLOTS = {
    // Full casters: Wizard, Sorcerer, Cleric, Druid, Bard
    fullCaster: {
        1: { 1: 2 },
        2: { 1: 3 },
        3: { 1: 4, 2: 2 },
        4: { 1: 4, 2: 3 },
        5: { 1: 4, 2: 3, 3: 2 },
        6: { 1: 4, 2: 3, 3: 3 },
        7: { 1: 4, 2: 3, 3: 3, 4: 1 },
        8: { 1: 4, 2: 3, 3: 3, 4: 2 },
        9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
        10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
        11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
        12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
        13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
        14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
        15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
        16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
        17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
        18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
        19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
        20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }
    },
    // Half casters: Paladin, Ranger
    halfCaster: {
        1: {},
        2: { 1: 2 },
        3: { 1: 3 },
        4: { 1: 3 },
        5: { 1: 4, 2: 2 },
        6: { 1: 4, 2: 2 },
        7: { 1: 4, 2: 3 },
        8: { 1: 4, 2: 3 },
        9: { 1: 4, 2: 3, 3: 2 },
        10: { 1: 4, 2: 3, 3: 2 },
        11: { 1: 4, 2: 3, 3: 3 },
        12: { 1: 4, 2: 3, 3: 3 },
        13: { 1: 4, 2: 3, 3: 3, 4: 1 },
        14: { 1: 4, 2: 3, 3: 3, 4: 1 },
        15: { 1: 4, 2: 3, 3: 3, 4: 2 },
        16: { 1: 4, 2: 3, 3: 3, 4: 2 },
        17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
        18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
        19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
        20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
    },
    // Third casters: Eldritch Knight, Arcane Trickster
    thirdCaster: {
        1: {}, 2: {}, 3: { 1: 2 },
        4: { 1: 3 }, 5: { 1: 3 }, 6: { 1: 3 },
        7: { 1: 4, 2: 2 }, 8: { 1: 4, 2: 2 }, 9: { 1: 4, 2: 2 },
        10: { 1: 4, 2: 3 }, 11: { 1: 4, 2: 3 }, 12: { 1: 4, 2: 3 },
        13: { 1: 4, 2: 3, 3: 2 }, 14: { 1: 4, 2: 3, 3: 2 }, 15: { 1: 4, 2: 3, 3: 2 },
        16: { 1: 4, 2: 3, 3: 3 }, 17: { 1: 4, 2: 3, 3: 3 }, 18: { 1: 4, 2: 3, 3: 3 },
        19: { 1: 4, 2: 3, 3: 3, 4: 1 }, 20: { 1: 4, 2: 3, 3: 3, 4: 1 }
    }
};

const CLASS_CASTER_TYPE = {
    'Magicien': 'fullCaster',
    'Ensorceleur': 'fullCaster',
    'Clerc': 'fullCaster',
    'Druide': 'fullCaster',
    'Barde': 'fullCaster',
    'Paladin': 'halfCaster',
    'Rôdeur': 'halfCaster',
    // Warlock has unique pact magic - not included here
    // Eldritch Knight & Arcane Trickster are subclasses
};

/**
 * Calculate spell slots for a character based on class and level
 * @param {string} className - Character's class name
 * @param {number} level - Character's level
 * @returns {object} Spell slots object with max and used for each level
 */
function calculateSpellSlots(className, level) {
    const casterType = CLASS_CASTER_TYPE[className];
    
    if (!casterType) {
        // Non-caster class
        return {
            '1': { max: 0, used: 0 },
            '2': { max: 0, used: 0 },
            '3': { max: 0, used: 0 },
            '4': { max: 0, used: 0 },
            '5': { max: 0, used: 0 },
            '6': { max: 0, used: 0 },
            '7': { max: 0, used: 0 },
            '8': { max: 0, used: 0 },
            '9': { max: 0, used: 0 }
        };
    }

    const slotsForLevel = SPELL_SLOTS[casterType][level] || {};
    const result = {};

    for (let i = 1; i <= 9; i++) {
        result[i.toString()] = {
            max: slotsForLevel[i] || 0,
            used: 0
        };
    }

    return result;
}

module.exports = {
    calculateSpellSlots,
    SPELL_SLOTS,
    CLASS_CASTER_TYPE
};
