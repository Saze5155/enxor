import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import characterService from '../../services/characterService';
import CharacterSheetComponent from '../../components/character/CharacterSheet';

const CLASS_HIT_DIE = {
    'Sorcier': 6, 'Mage': 6,
    'Artificier': 8, 'Barde': 8, 'Clerc': 8, 'Druide': 8, 'Moine': 8, 'Roublard': 8, 'Occultiste': 8, 'Voleur': 8, 'Prêtre': 8,
    'Guerrier': 10, 'Paladin': 10, 'Rôdeur': 10,
    'Barbare': 12
};

import LevelUpModal from '../../components/character/LevelUpModal';

// ... imports

export default function CharacterSheetPage({ character: propCharacter = null, isGM = false }) {
    const { id } = useParams();
    const [char, setChar] = useState(propCharacter);
    const [loading, setLoading] = useState(!propCharacter);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);

    useEffect(() => {
        // If propCharacter has features (full details), use it.
        // Otherwise, if we have an ID, fetch the full character.
        if (propCharacter && propCharacter.features) {
            setChar(propCharacter);
            setLoading(false);
            return;
        }

        if (id) {
            loadCharacter();
        }
    }, [id, propCharacter]);

    const loadCharacter = async () => {
        try {
            const data = await characterService.getOne(id);
            setChar(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleInventoryUpdate = async ({ inventory }) => {
        const updatedChar = { ...char, inventory: inventory };
        setChar(updatedChar);

        try {
            await characterService.update(char.id, { inventory });
        } catch (error) {
            console.error("Failed to save inventory", error);
        }
    };

    const handleLevelUpClick = () => {
        // Only players might need confirmation, but with modal it's safer.
        // GM can also use modal to guide the process.
        setShowLevelUpModal(true);
    };

    const handleLevelUpConfirm = async ({ newLevel, hpGain, newFeatures, subclass }) => {
        const newHpMax = char.hpMax + hpGain;
        const newHpCurrent = char.hpCurrent + hpGain;

        // Construct update payload
        const payload = {
            level: newLevel,
            hpMax: newHpMax,
            hpCurrent: newHpCurrent,
            // If subclass selected, update it
            ...(subclass ? { subClass: subclass } : {})
        };

        // TODO: Handle adding new features to character.features list
        // For now we just alert or log, as features are complex objects.
        // real implementation would push to character.features

        // Optimistic Update
        setChar(prev => ({
            ...prev,
            ...payload,
            subClass: subclass || prev.subClass
        }));

        try {
            await characterService.update(char.id, payload);
            setShowLevelUpModal(false);
            if (!isGM) alert(`Niveau ${newLevel} atteint ! PV Max +${hpGain}`);
        } catch (error) {
            console.error("Level up failed", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Chargement du grimoire...</div>;
    if (!char) return <div className="p-8 text-center text-red-400">Personnage introuvable.</div>;

    return (
        <>
            <CharacterSheetComponent
                character={char}
                onLevelUp={handleLevelUpClick}
                onInventoryUpdate={handleInventoryUpdate}
            />

            {showLevelUpModal && (
                <LevelUpModal
                    character={char}
                    onClose={() => setShowLevelUpModal(false)}
                    onConfirm={handleLevelUpConfirm}
                />
            )}
        </>
    );
}
