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
    const { id: paramId } = useParams();
    const effectiveId = propCharacter?.id || paramId;

    const [char, setChar] = useState(propCharacter);
    const [loading, setLoading] = useState(!propCharacter);
    const [error, setError] = useState(null);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);

    useEffect(() => {
        if (propCharacter && propCharacter.features) {
            setChar(propCharacter);
            setLoading(false);
            return;
        }

        if (effectiveId) {
            // Load using the correct ID (character ID, not campaign ID from URL)
            loadCharacter(effectiveId);
        }
    }, [effectiveId, propCharacter]);

    const loadCharacter = async (targetId) => {
        try {
            console.log(`[DEBUG UI] Loading character ${targetId}...`);
            const data = await characterService.getOne(targetId);
            console.log("[DEBUG UI] Character data received:", data);

            if (data) {
                setChar(data);
                if (data.inventory) {
                    console.log(`[DEBUG UI] Inventory size: ${data.inventory.length}`);
                } else {
                    console.warn("[DEBUG UI] Inventory is MISSING in response!");
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("[DEBUG UI] Error loading character:", error);
            setError("Erreur lors du chargement des données complètes du personnage.");
            setLoading(false);
        }
    };

    const handleInventoryUpdate = async (updates) => {
        // Update local state immediately for responsiveness
        const updatedChar = { ...char, ...updates };
        setChar(updatedChar);

        try {
            await characterService.update(char.id, updates);
        } catch (error) {
            console.error("Failed to save updates", error);
        }
    };

    const handleLevelUpClick = () => {
        // Only players might need confirmation, but with modal it's safer.
        // GM can also use modal to guide the process.
        setShowLevelUpModal(true);
    };

    const handleLevelUpConfirm = async ({ newLevel, hpGain, newFeatures, subclass }) => {
        // Construct payload for levelUp endpoint
        const payload = {
            newLevel,
            hpGain,
            subclass,
            newFeatures // Include the resolved features with choices
        };

        try {
            // Use dedicated levelUp endpoint which adds features automatically
            const updatedChar = await characterService.levelUp(char.id, payload);

            // Update local state with the full response (including new features)
            setChar(updatedChar);
            setShowLevelUpModal(false);
            if (!isGM) alert(`Niveau ${newLevel} atteint ! PV Max +${hpGain}, nouvelles capacités débloquées !`);
        } catch (error) {
            console.error("Level up failed", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Chargement du grimoire...</div>;
    if (!char) return <div className="p-8 text-center text-red-400">Personnage introuvable.</div>;

    return (
        <>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 z-50">
                    <strong className="font-bold">Erreur :</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {isGM && char && (!char.inventory || char.inventory.length === 0) && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded relative text-xs mx-4 text-center z-50">
                    <span className="font-bold">Note MJ :</span> L'inventaire est vide ou n'a pas pu être chargé completement.
                </div>
            )}
            <CharacterSheetComponent
                character={char}
                isGM={isGM}
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
