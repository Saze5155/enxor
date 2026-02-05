import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import campaignService from '../services/campaignService';
import characterService from '../services/characterService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext'; // Import socket

export default function CampaignDashboard() {
    const { user } = useAuth();
    const { socket } = useSocket(); // Get socket
    const [campaigns, setCampaigns] = useState([]);
    const [publicCampaigns, setPublicCampaigns] = useState([]);
    const [newCampaignName, setNewCampaignName] = useState("");

    // Character Selection State
    const [myCharacters, setMyCharacters] = useState([]);
    const [showCharModal, setShowCharModal] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadCampaigns();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (!socket) return;

        socket.on('campaign_created', (newCampaign) => {
            console.log("New campaign created:", newCampaign);
            // If I am the creator, it's already in my list via API response usually, 
            // but here we might receive it before/after.
            // Simplified: Add to public list if I'm not the GM.
            if (newCampaign.gmId !== user.id) {
                // Fetch public again to be sure or append?
                // Parsing newCampaign might be enough if structure matches
                // publicCampaigns structure: needs _count and players array with username
                // newCampaign from API only has basic fields usually.
                // Safest: reload campaigns.
                loadCampaigns();
            }
        });

        socket.on('session_status_changed', ({ campaignId, isSessionOpen }) => {
            console.log("Session status changed:", campaignId, isSessionOpen);
            // Update Joined List
            setCampaigns(prev => prev.map(c =>
                c.id === campaignId ? { ...c, isSessionOpen } : c
            ));
            // Update Public List
            setPublicCampaigns(prev => prev.map(c =>
                c.id === campaignId ? { ...c, isSessionOpen } : c
            ));
        });

        return () => {
            socket.off('campaign_created');
            socket.off('session_status_changed');
        };
    }, [socket, user.id]);

    const loadCampaigns = async () => {
        try {
            const myData = await campaignService.getMyCampaigns();
            setCampaigns(myData);

            const publicData = await campaignService.getPublicCampaigns();
            setPublicCampaigns(publicData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        console.log("Submitting new campaign:", newCampaignName);
        if (!newCampaignName.trim()) return alert("Le nom est vide !");

        try {
            await campaignService.create({ name: newCampaignName });
            setNewCampaignName("");
            loadCampaigns();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur lors de la création");
        }
    };

    const toggleSession = async (campaign) => {
        try {
            const updated = await campaignService.toggleSession(campaign.id);
            // Optimistic update or reload
            setCampaigns(prev => prev.map(c =>
                c.id === campaign.id ? { ...c, isSessionOpen: updated.isSessionOpen } : c
            ));
        } catch (error) {
            alert("Erreur changement statut session.");
        }
    };

    const confirmJoinCampaign = async (id) => {
        if (!confirm("Rejoindre cette campagne ?")) return;
        try {
            await campaignService.join(id);
            loadCampaigns(); // Reload lists
            alert("Campagne rejointe !");
        } catch (error) {
            alert("Erreur lors de l'inscription.");
        }
    };

    const handleJoinSession = async (campaignId, gmId) => {
        // If user is GM, join immediately
        if (gmId === user.id) {
            navigate(`/campaign/${campaignId}/session`);
            return;
        }

        // If User is Player, load characters and show modal
        try {
            const chars = await characterService.getAll();
            if (chars.length === 0) {
                if (confirm("Vous n'avez aucun personnage. Voulez-vous en créer un maintenant ?")) {
                    navigate('/characters/new');
                }
                return;
            }
            setMyCharacters(chars);
            setSelectedCampaignId(campaignId);
            setShowCharModal(true);
        } catch (error) {
            console.error(error);
            alert("Impossible de charger vos personnages.");
        }
    };

    const proceedToSession = async (characterId) => {
        // Link character to campaign in DB so GM sees them
        try {
            await characterService.update(characterId, { campaignId: selectedCampaignId });
        } catch (error) {
            console.error("Failed to link character to campaign", error);
            // Optionally alert user, but we might want to let them proceed anyway to not block game
            // alert("Attention: Le MJ ne verra peut-être pas votre fiche immédiatement.");
        }

        navigate(`/campaign/${selectedCampaignId}/session?characterId=${characterId}`);
    };

    return (
        <div className="p-8 relative">
            <h1 className="text-3xl font-bold text-yellow-500 mb-6 font-serif">Mes Campagnes</h1>

            {/* Creation - MJ Only */}
            {user?.role === 'MJ' && (
                <div className="bg-stone-800 p-4 rounded-lg border border-stone-600 mb-8 max-w-xl">
                    <h3 className="font-bold text-stone-300 mb-2">Nouvelle Campagne</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            placeholder="Nom de la campagne..."
                            className="flex-1 bg-stone-900 border border-stone-600 rounded px-3 py-2 text-stone-100"
                        />
                        <button
                            onClick={handleCreate}
                            className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded pointer-events-auto relative z-10"
                        >
                            Créer
                        </button>
                    </div>
                </div>
            )}

            {/* List Joined Campaigns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {campaigns.map(camp => {
                    const isGM = camp.gmId === user.id;
                    return (
                        <div key={camp.id} className={`bg-stone-800 border-2 rounded-lg overflow-hidden shadow-lg transition ${camp.isSessionOpen ? 'border-green-600 shadow-green-900/20' : 'border-stone-700'}`}>
                            <div className="p-4 bg-stone-900 border-b border-stone-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                                    {camp.name}
                                    {camp.isSessionOpen && <span className="animate-pulse w-3 h-3 bg-green-500 rounded-full inline-block" title="Session En Cours"></span>}
                                </h2>
                                <span className="text-xs text-stone-500">{new Date(camp.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="p-4">
                                <p className="text-stone-400 text-sm mb-4">
                                    Joueurs: {camp._count?.players || 1} • Persos: {camp._count?.characters || 0}
                                </p>

                                <div className="mb-4 flex items-center gap-2 text-sm">
                                    <span className="text-stone-500">Statut :</span>
                                    {camp.isSessionOpen ? (
                                        <span className="text-green-400 font-bold border border-green-800 bg-green-900/30 px-2 py-0.5 rounded">EN LIGNE</span>
                                    ) : (
                                        <span className="text-red-400 font-bold border border-red-800 bg-red-900/30 px-2 py-0.5 rounded">HORS LIGNE</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    {isGM ? (
                                        <>
                                            <button
                                                onClick={() => toggleSession(camp)}
                                                className={`w-full py-2 rounded font-bold transition ${camp.isSessionOpen ? 'bg-red-900/50 text-red-300 hover:bg-red-900' : 'bg-green-700 hover:bg-green-600 text-white'}`}
                                            >
                                                {camp.isSessionOpen ? 'Fermer la Session 🛑' : 'Ouvrir la Session 🟢'}
                                            </button>
                                            <Link
                                                to={`/campaign/${camp.id}/session`}
                                                className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded"
                                            >
                                                Rejoindre (MJ) 🎲
                                            </Link>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinSession(camp.id, camp.gmId)}
                                            disabled={!camp.isSessionOpen}
                                            className={`block w-full text-center font-bold py-2 rounded transition ${camp.isSessionOpen ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}`}
                                        >
                                            {camp.isSessionOpen ? 'Rejoindre la Partie 🎲' : 'En attente du MJ...'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {campaigns.length === 0 && (
                <div className="text-center text-stone-500 italic mb-12">
                    Vous ne participez à aucune campagne pour le moment.
                </div>
            )}

            {/* Public Campaigns */}
            <h2 className="text-2xl font-bold text-stone-400 mb-6 font-serif border-t border-stone-700 pt-8">Rejoindre une Campagne</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicCampaigns.map(camp => (
                    <div key={camp.id} className="bg-stone-900 border border-stone-700 rounded-lg overflow-hidden opacity-75 hover:opacity-100 transition">
                        <div className="p-4 border-b border-stone-800 flex justify-between items-center">
                            <h3 className="font-bold text-stone-300">{camp.name}</h3>
                            <span className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded">MJ: {camp.players[0]?.username || '?'}</span>
                        </div>
                        <div className="p-4">
                            <p className="text-stone-500 text-xs mb-4">
                                {camp._count?.players} Joueurs inscrits
                            </p>
                            <button
                                onClick={() => confirmJoinCampaign(camp.id)}
                                className="w-full bg-stone-700 hover:bg-stone-600 text-stone-200 py-2 rounded text-sm font-bold"
                            >
                                Rejoindre cette campagne ➕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {publicCampaigns.length === 0 && (
                <div className="text-center text-stone-600 italic mt-8">
                    Aucune autre campagne disponible.
                </div>
            )}

            {/* Character Selection Modal */}
            {showCharModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-stone-800 border-2 border-yellow-700 rounded-lg p-6 max-w-2xl w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-yellow-500 font-serif mb-4 text-center">Choisissez votre Héros</h2>
                        <p className="text-stone-400 text-center mb-6">Quel personnage incarnera-t-il cette aventure ?</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                            {myCharacters.map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => proceedToSession(char.id)}
                                    className="bg-stone-900 border border-stone-700 hover:border-indigo-500 hover:bg-stone-800 rounded-lg p-4 transition group text-left flex gap-4 items-center"
                                >
                                    <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center text-2xl border border-indigo-700 group-hover:scale-110 transition">
                                        👤
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-stone-200 group-hover:text-indigo-400">{char.name}</div>
                                        <div className="text-xs text-stone-500">{char.race} {char.class} (Lv.{char.level})</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowCharModal(false)}
                                className="text-stone-500 hover:text-white underline"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
