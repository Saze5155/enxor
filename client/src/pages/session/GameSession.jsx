import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatSystem from '../../components/chat/ChatSystem';
import DiceDock from '../../components/dice/DiceDock';
import DiceOverlay from '../../components/dice/DiceOverlay'; // New Overlay
import campaignService from '../../services/campaignService';

export default function GameSession() {
    const { id } = useParams(); // Campaign ID
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);

    useEffect(() => {
        // Explicitly join campaign room for socket events (Dice, etc.)
        if (socket && id) {
            socket.emit('join_campaign', id);
        }

        // Load campaign details
        campaignService.getOne(id).then(data => {
            console.log("Campaign Data:", data);
            setCampaign(data);

            // Access Control (Check if user is Player or GM)
            // If user is neither, reject? For now public join allowed so assume player if not GM
            const isGM = data.gmId === user.id;

            if (!isGM && !data.isSessionOpen) {
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
            {/* Overlay for Dice Animations */}
            <DiceOverlay socket={socket} isGM={user.id === campaign.gmId} />

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
                                <span className="absolute top-10 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                                    {p.username} ({p.role})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Game Area */}
            <main className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-serif text-2xl opacity-20 select-none pointer-events-none">
                    Plateau de Jeu (Phase Suivante)
                </div>
            </main>

            {/* Dice Dock (Fixed Bottom) */}
            <DiceDock campaignId={id} players={campaign.players} />

            {/* Chat System */}
            <ChatSystem
                campaignId={id}
                currentUser={{
                    name: user.username,
                    role: user.id === campaign.gmId ? 'MJ' : 'PLAYER'
                }}
            />
        </div>
    );
}
