import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatSystem from '../../components/chat/ChatSystem';
import DiceDock from '../../components/dice/DiceDock';
import DiceOverlay from '../../components/dice/DiceOverlay'; // New Overlay
import CharacterSheet from '../characters/CharacterSheet'; // Import CharacterSheet
import campaignService from '../../services/campaignService';
import characterService from '../../services/characterService';
import enemyService from '../../services/enemyService';
import EnemyInstanceCreator from '../../components/enemies/EnemyInstanceCreator';
import EnemyInstanceMiniSheet from '../../components/enemies/EnemyInstanceMiniSheet';

export default function GameSession() {
    const { id } = useParams(); // Campaign ID
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const characterId = searchParams.get("characterId");

    const [campaign, setCampaign] = useState(null);
    const [activeCharacter, setActiveCharacter] = useState(null);

    // Enemy State
    const [enemyInstances, setEnemyInstances] = useState([]);
    const [enemyTypes, setEnemyTypes] = useState([]);
    const [showEnemyCreator, setShowEnemyCreator] = useState(false);
    const [isEnemyPanelOpen, setIsEnemyPanelOpen] = useState(false);

    // Slide-out Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedSheetId, setSelectedSheetId] = useState(null);
    const [campaignCharacters, setCampaignCharacters] = useState([]);

    useEffect(() => {
        // Explicitly join campaign room for socket events (Dice, etc.)
        if (socket && id) {
            socket.emit('join_campaign', id);
        }

        // Helper to safe parse
        const tryParse = (str) => {
            try { return typeof str === 'string' ? JSON.parse(str) : str; } catch (e) { return {}; }
        };

        // Socket Event Listeners
        const handleCharUpdate = (updatedChar) => {
            console.log("Character Update Received:", updatedChar);

            // Parse fields
            const parsedChar = {
                ...updatedChar,
                stats: tryParse(updatedChar.stats),
                skills: tryParse(updatedChar.skills),
                inventory: tryParse(updatedChar.inventory),
                spells: tryParse(updatedChar.spells),
                features: tryParse(updatedChar.features)
            };

            // Update GM List
            setCampaignCharacters(prev => {
                const index = prev.findIndex(c => c.id === parsedChar.id);
                if (index > -1) {
                    const newList = [...prev];
                    newList[index] = parsedChar;
                    return newList;
                } else {
                    // New character joined?
                    return [...prev, parsedChar];
                }
            });

            // Update Active Character (if it's me)
            setActiveCharacter(prev => (prev && prev.id === parsedChar.id ? parsedChar : prev));
        };

        // Socket Event Listeners
        const handleEnemyUpdate = () => {
            console.log("Enemy update detected, reloading list...");
            loadEnemyData();
        };

        if (socket) {
            socket.on('character_updated', handleCharUpdate);
            socket.on('enemy_updated', handleEnemyUpdate);
        }

        const loadEnemyData = async () => {
            try {
                const instances = await enemyService.getEnemyInstances(id);
                setEnemyInstances(instances);
            } catch (err) {
                console.error("Failed to load enemies", err);
            }
        };

        const loadCampaign = async () => {
            try {
                const data = await campaignService.getOne(id);
                setCampaign(data);

                const isGM = data.gmId === user.id;
                if (!isGM && !data.isSessionOpen) {
                    alert("La session n'est pas ouverte par le MJ.");
                    navigate('/dashboard');
                }

                if (isGM) {
                    if (data.characters) {
                        const parsedChars = data.characters.map(c => ({
                            ...c,
                            stats: tryParse(c.stats),
                            skills: tryParse(c.skills),
                            inventory: tryParse(c.inventory),
                            spells: tryParse(c.spells),
                            features: tryParse(c.features)
                        }));
                        setCampaignCharacters(parsedChars);
                    }
                    // Load enemy templates
                    const types = await enemyService.getEnemyTypes();
                    setEnemyTypes(types);
                    loadEnemyData();
                }
            } catch (err) {
                console.error("Failed to load campaign", err);
                navigate('/dashboard');
            }
        };

        loadCampaign();

        if (characterId) {
            // ... (keep character loading)
            characterService.getOne(characterId).then(data => {
                setActiveCharacter(data);
                setSelectedSheetId(data.id);
            }).catch(err => {
                console.error("Failed to load character", err);
            });
        }

        return () => {
            if (socket) {
                socket.off('character_updated', handleCharUpdate);
                socket.off('enemy_updated', handleEnemyUpdate);
            }
        };

    }, [id, user.id, navigate, characterId, socket]);

    if (!campaign) return <div className="p-8 text-center text-gray-500">Chargement de la session...</div>;

    // Determine current Identity (GM or Character or User)
    const isGM = user.id === campaign.gmId;
    const identityName = isGM ? "MJ" : (activeCharacter ? activeCharacter.name : user.username);
    const identityRole = isGM ? "MJ" : "PLAYER";

    // Helper for distinct colors based on index or ID
    const getTabColor = (index) => {
        const colors = ['bg-red-700', 'bg-blue-700', 'bg-green-700', 'bg-yellow-700', 'bg-purple-700', 'bg-pink-700', 'bg-teal-700', 'bg-orange-700'];
        return colors[index % colors.length];
    };

    // Sheet Toggle Handler
    const handleSheetToggle = (charId) => {
        if (isSheetOpen && selectedSheetId === charId) {
            // Clicked same tab while open -> Close
            setIsSheetOpen(false);
        } else {
            // Open with new char
            setSelectedSheetId(charId);
            setIsSheetOpen(true);
        }
    };

    // Determine which character object to show in the sheet
    // If GM: find in campaignCharacters. If Player: use activeCharacter (or find in campaignCharacters if populated)
    const sheetCharacter = isGM
        ? campaignCharacters.find(c => c.id === selectedSheetId)
        : activeCharacter;

    return (
        <div className="relative h-screen bg-stone-900 overflow-hidden flex flex-col">

            {/* SLIDE-OUT CHARACTER SHEET(S) */}
            <div
                className={`fixed top-0 left-0 h-full z-40 flex transition-transform duration-500 ease-in-out ${isSheetOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ width: '90%', maxWidth: '1000px' }} // Occupy most of screen on mobile, limited on desktop
            >
                {/* Sheet Content Container */}
                <div className="flex-1 h-full bg-stone-900 border-r-4 border-yellow-600 shadow-2xl overflow-y-auto relative">
                    {/* Close Button Inside */}
                    <button
                        onClick={() => setIsSheetOpen(false)}
                        className="absolute top-4 right-4 z-50 bg-red-900 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition"
                    >
                        ✕
                    </button>

                    {sheetCharacter ? (
                        <div className="pt-2"> {/* Padding for close button */}
                            {/* Embed Character Sheet */}
                            {/* Import CharacterSheet at top first! handled automatically by tool? I need to check import */}
                            <CharacterSheet character={sheetCharacter} isGM={isGM} />
                        </div>
                    ) : (
                        <div className="p-8 text-white text-center">Aucun personnage sélectionné.</div>
                    )}
                </div>

                {/* TABS / ARROWS - Visible even when closed (sticking out) */}
                {/* We place them ABSOLUE relative to the container, sticking out to the right */}

                <div className="absolute top-20 right-0 transform translate-x-full flex flex-col gap-2">
                    {/* GM View: List all characters */}
                    {isGM && campaignCharacters.map((char, index) => (
                        <button
                            key={char.id}
                            onClick={() => handleSheetToggle(char.id)}
                            className={`${getTabColor(index)} text-white py-2 px-4 rounded-r-lg shadow-lg font-bold text-sm tracking-widest uppercase border-l-0 border border-white/20 hover:scale-110 transition flex items-center gap-2`}
                            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', height: '120px' }}
                        >
                            <span className="rotate-180 block">{char.name}</span>
                        </button>
                    ))}

                    {/* Player View: Single Tab for their own character */}
                    {!isGM && activeCharacter && (
                        <button
                            onClick={() => handleSheetToggle(activeCharacter.id)}
                            className="bg-indigo-700 text-white py-4 px-2 rounded-r-lg shadow-lg font-bold border-l-0 border border-white/20 hover:scale-110 transition"
                        >
                            <span className="material-symbols-outlined text-3xl">contact_page</span>
                        </button>
                    )}
                </div>
            </div>


            {/* Overlay for Dice Animations */}
            <DiceOverlay socket={socket} isGM={isGM} />

            {/* Top Bar */}
            <header className="bg-stone-800 border-b border-stone-700 p-2 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-yellow-500 font-serif tracking-wider">{campaign.name}</h1>
                    <span className="text-xs text-stone-500 uppercase font-bold border border-stone-600 px-2 py-0.5 rounded">
                        Session en cours
                    </span>
                    {isGM && (
                        <button
                            onClick={() => setIsEnemyPanelOpen(!isEnemyPanelOpen)}
                            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors ${isEnemyPanelOpen ? 'bg-red-600 text-white' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'}`}
                        >
                            👹 Ennemis ({enemyInstances.length})
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* User Identity Display */}
                    <div className="flex items-center gap-2 border-r border-stone-600 pr-4 mr-2">
                        <span className="text-stone-400 text-xs uppercase">Vous jouez :</span>
                        <span className={`font-bold ${isGM ? 'text-red-400' : 'text-indigo-400'}`}>
                            {identityName}
                        </span>
                        {!isGM && activeCharacter && <span className="text-xs text-stone-500">({activeCharacter.class})</span>}
                    </div>

                    <div className="flex -space-x-2">
                        {campaign.players?.map(p => (
                            <div key={p.id} className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-stone-800 flex items-center justify-center text-xs font-bold text-white relative group cursor-help">
                                {p.username[0].toUpperCase()}
                                <span className="absolute top-10 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                                    {p.username} ({p.role})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Game Area & Sidebar */}
            <main className="flex-1 flex overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

                {/* ENEMY PANEL (Right Side MJ) */}
                {isGM && isEnemyPanelOpen && (
                    <div className="w-80 bg-stone-900 border-r border-stone-700 flex flex-col z-20 shadow-2xl animate-slideInRight">
                        <div className="p-4 border-b border-stone-700 flex justify-between items-center bg-stone-950">
                            <h3 className="font-bold text-amber-500 uppercase text-xs tracking-widest">Ennemis en Jeu</h3>
                            <button
                                onClick={() => setShowEnemyCreator(true)}
                                className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                            >
                                + Invoquer
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {enemyInstances.length === 0 ? (
                                <div className="text-center text-stone-600 italic text-sm py-10">
                                    Aucun ennemi sur le terrain.
                                </div>
                            ) : (
                                enemyInstances.map(instance => (
                                    <EnemyInstanceMiniSheet
                                        key={instance.id}
                                        instance={instance}
                                        onUpdate={() => {/* Handled by socket ideally, but refresh for safety */ }}
                                        onDelete={() => {/* Handled by socket */ }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-serif text-2xl opacity-20 select-none pointer-events-none z-0">
                    Plateau de Jeu (Phase Suivante)
                </div>

                {/* MODAL ENEMY CREATOR */}
                {showEnemyCreator && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <EnemyInstanceCreator
                            campaignId={id}
                            enemyTypes={enemyTypes}
                            onCancel={() => setShowEnemyCreator(false)}
                            onSuccess={() => {
                                setShowEnemyCreator(false);
                                // reload handled by socket? ideally yes.
                            }}
                        />
                    </div>
                )}
            </main>

            {/* Dice Dock (Fixed Bottom) */}
            <DiceDock
                campaignId={id}
                players={campaign.players}
                activeCharacter={activeCharacter} // Pass character for bonuses (future)
                senderName={identityName} // Send dice as Character Name
            />

            {/* Chat System */}
            <ChatSystem
                campaignId={id}
                currentUser={{
                    name: identityName,
                    role: identityRole,
                    originalUsername: user.username // Keep track of real user if needed
                }}
            />
        </div>
    );
}
