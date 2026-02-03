import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChatSystem from '../../components/chat/ChatSystem';
import campaignService from '../../services/campaignService';

export default function GameSession() {
    const { id } = useParams(); // Campaign ID
    const { user } = useAuth();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null); // Added missing state for campaign

    useEffect(() => {
        // Load campaign details
        campaignService.getOne(id).then(data => {
            console.log("Campaign Data:", data);
            console.log("User:", user);
            setCampaign(data);

            // Access Control
            const isGM = data.gmId === user.id;
            console.log("Is GM?", isGM, "Is Session Open?", data.isSessionOpen);
            if (!isGM && !data.isSessionOpen) {
                console.log("Redirecting player...");
                alert("La session n'est pas ouverte par le MJ.");
                navigate('/dashboard');
            }
        }).catch(err => {
            console.error("Failed to load campaign", err);
            navigate('/dashboard');
        });
    }, [id, user.id, navigate]);

    if (!campaign) return <div className="p-8 text-center text-gray-500">Chargement de la session...</div>;

    return (
        <div className="relative h-screen bg-stone-900 overflow-hidden flex flex-col">
            {/* Top Bar */}
            <header className="bg-stone-800 border-b border-stone-700 p-2 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-yellow-500 font-serif tracking-wider">{campaign.name}</h1>
                    <span className="text-xs text-stone-500 uppercase font-bold border border-stone-600 px-2 py-0.5 rounded">
                        Session en cours
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {campaign.players?.map(p => (
                            <div key={p.id} className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-stone-800 flex items-center justify-center text-xs font-bold text-white relative group cursor-help">
                                {p.username[0].toUpperCase()}
                                <span className="absolute top-10 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                                    {p.username} ({p.role})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Game Area (Map, Handouts, etc.) */}
            <main className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-serif text-2xl opacity-20 select-none pointer-events-none">
                    Plateau de Jeu (Phase Suivante)
                </div>

                {/* Dice Roller Overlay, Character Sheet Quick View could go here */}
            </main>

            {/* Chat System (Integrated specifically for this session) */}
            {/* Verify we pass correct role logic */}
            <ChatSystem
                campaignId={id}
                currentUser={{
                    name: user.username,
                    role: user.id === campaign.gmId ? 'MJ' : 'PLAYER' // Dynamic Role based on Campaign GM
                }}
            />
        </div>
    );
}
