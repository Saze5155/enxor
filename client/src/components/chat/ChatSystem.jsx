import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import ChatBox from './ChatBox';
import DiceRoller from '../game/DiceRoller';
import userService from '../../services/userService';

export default function ChatSystem({ campaignId = '1', currentUser = { name: 'Moi', role: 'PLAYER' } }) {
    const { socket, joinCampaign, sendMessage } = useSocket();
    const [activeTab, setActiveTab] = useState('public');
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showDice, setShowDice] = useState(false);

    // User lists for "Instagram" style messaging
    const [players, setPlayers] = useState([]);
    const [selectedPrivateChat, setSelectedPrivateChat] = useState(null);

    useEffect(() => {
        if (socket) {
            joinCampaign(campaignId);

            const handleMessage = (msg) => {
                setMessages(prev => [...prev, { ...msg, isMe: msg.sender === currentUser.name }]);
            };

            const handleDiceRoll = (roll) => {
                // Hide secret rolls from non-GM players
                if (roll.isSecret && currentUser.role !== 'MJ') return;

                // Map DiceDock format to ChatBox expected format
                const formula = roll.modifier ? `${roll.diceType} (${roll.modifier >= 0 ? '+' : ''}${roll.modifier})` : roll.diceType;

                setMessages(prev => [...prev, {
                    ...roll,
                    type: 'diceroll',
                    isMe: roll.sender === currentUser.name,
                    rollResult: roll.result, // Map result -> rollResult
                    formula: formula
                }]);
            };

            socket.on('chat_message', handleMessage);
            socket.on('dice_roll', handleDiceRoll);

            return () => {
                socket.off('chat_message', handleMessage);
                socket.off('dice_roll', handleDiceRoll);
            };
        }
    }, [socket, campaignId, currentUser.name]);

    useEffect(() => {
        // Load players list
        userService.getAllPlayers().then(data => {
            // If I am Player, I want to see MJ in my list (mocked for now as we don't have distinct MJ user usually, assuming 'admin' or role check)
            // If I am MJ, I want to see all Players.

            // For this logic, let's just assume everyone is in the list for now, filtering self.
            setPlayers(data);
        }).catch(console.error);
    }, []);

    const handleSend = (text) => {
        let type = activeTab === 'messagerie' ? 'private' : activeTab;

        let target = null;
        if (activeTab === 'messagerie' && selectedPrivateChat) {
            target = selectedPrivateChat.username;
        }

        // Mapping visual tabs to socket types
        // public -> type: public
        // groupe -> type: secret (Players only)
        // messagerie -> type: private (with target)

        let socketType = 'public';
        if (activeTab === 'groupe') socketType = 'secret';
        if (activeTab === 'messagerie') socketType = 'mj_dm'; // Distinct type for MJ DMs

        sendMessage({
            campaignId,
            sender: currentUser.name,
            text,
            type: socketType,
            target: target
        });
    };

    // Filter Logic
    const filteredMessages = messages.filter(msg => {
        // 1. Public Chat
        if (activeTab === 'public') {
            return msg.type === 'public' || msg.type === 'diceroll';
        }

        // 2. Groupe (Players Only)
        if (activeTab === 'groupe') {
            return msg.type === 'secret';
        }

        // 3. Messagerie (Instagram Style) matches 'mj_dm'
        if (activeTab === 'messagerie') {
            if (!selectedPrivateChat) return false;

            // Must be type 'mj_dm' AND involve both parties
            return (msg.type === 'mj_dm' && (
                (msg.sender === currentUser.name && msg.target === selectedPrivateChat.username) ||
                (msg.sender === selectedPrivateChat.username && msg.target === currentUser.name)
            ));
        }

        return false;
    });

    // Helper to get contact list based on Role
    const getContacts = () => {
        if (currentUser.role === 'MJ') {
            // MJ sees all Players
            return players.filter(p => p.role !== 'MJ');
        } else {
            // Player sees only MJ (assuming MJ is a user with role MJ)
            // If no explicit MJ user exists, we might need to mock or ensure one exists.
            // For now, let's show anyone with Role MJ, or fallback.
            const mjs = players.filter(p => p.role === 'MJ');
            return mjs.length > 0 ? mjs : [{ id: 999, username: 'MJ', role: 'MJ' }]; // Mock MJ if none found
        }
    };

    const contacts = getContacts();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">

            <div className={`flex flex-col transition-all duration-300 ${isOpen ? 'w-80 h-96' : 'w-64 h-12'}`}>
                {/* Header */}
                <div
                    className="bg-stone-800 text-stone-100 p-3 rounded-t-lg shadow-lg flex justify-between items-center border border-stone-600 border-b-0"
                >
                    <div
                        className="font-bold flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span>💬 Chat</span>
                        <span className="bg-red-600 text-white text-[10px] px-1.5 rounded-full">{messages.length > 99 ? '99+' : messages.length}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="cursor-pointer px-2" onClick={() => setIsOpen(!isOpen)}>{isOpen ? '▼' : '▲'}</span>
                    </div>
                </div>

                {/* Content */}
                {isOpen && (
                    <div className="flex-1 flex flex-col bg-stone-900 rounded-b-lg shadow-xl border border-stone-600 border-t-0 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex bg-stone-800 border-b border-stone-700">
                            <button
                                onClick={() => setActiveTab('public')}
                                className={`flex-1 py-2 text-xs uppercase font-bold transition ${activeTab === 'public' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-stone-700/50' : 'text-stone-400 hover:text-stone-200'}`}
                            >
                                Public
                            </button>

                            <button
                                onClick={() => { setActiveTab('messagerie'); setSelectedPrivateChat(null); }}
                                className={`flex-1 py-2 text-xs uppercase font-bold transition ${activeTab === 'messagerie' ? 'text-blue-400 border-b-2 border-blue-500 bg-stone-700/50' : 'text-stone-400 hover:text-stone-200'}`}
                                title="MJ <-> Joueur"
                            >
                                Messagerie
                            </button>

                            {/* Groupe: ONLY for Players */}
                            {currentUser.role !== 'MJ' && (
                                <button
                                    onClick={() => setActiveTab('groupe')}
                                    className={`flex-1 py-2 text-xs uppercase font-bold transition ${activeTab === 'groupe' ? 'text-purple-400 border-b-2 border-purple-500 bg-stone-700/50' : 'text-stone-400 hover:text-stone-200'}`}
                                    title="Entre joueurs (Caché du MJ)"
                                >
                                    Groupe
                                </button>
                            )}
                        </div>

                        {/* Views */}
                        <div className="flex-1 overflow-hidden flex flex-col">

                            {/* MESSAGERIE INSTAGRAM STYLE */}
                            {activeTab === 'messagerie' && !selectedPrivateChat ? (
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    <div className="text-xs text-stone-500 uppercase font-bold mb-2">
                                        {currentUser.role === 'MJ' ? 'Vos Joueurs' : 'Votre MJ'}
                                    </div>
                                    {contacts.map(contact => (
                                        <div
                                            key={contact.id || contact.username}
                                            onClick={() => setSelectedPrivateChat(contact)}
                                            className="flex items-center gap-3 p-2 hover:bg-stone-800 rounded cursor-pointer transition border border-stone-800 hover:border-stone-600"
                                        >
                                            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-200 border border-blue-700">
                                                {contact.username[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-stone-300">{contact.username}</div>
                                                <div className="text-[10px] text-stone-500">
                                                    {currentUser.role === 'MJ' ? 'Ouvrir discussion' : 'Contacter le MJ'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {contacts.length === 0 && <div className="text-stone-500 text-xs text-center italic mt-4">Aucun contact disponible.</div>}
                                </div>
                            ) : (
                                /* CHAT BOX (For Public, Groupe, or Selected Messenger) */
                                <div className="flex-1 flex flex-col h-full">
                                    {activeTab === 'messagerie' && selectedPrivateChat && (
                                        <div className="bg-stone-800 px-3 py-1 flex items-center justify-between border-b border-stone-700">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setSelectedPrivateChat(null)} className="text-stone-400 hover:text-white mr-1">←</button>
                                                <span className="text-xs font-bold text-blue-400">{selectedPrivateChat.username}</span>
                                            </div>
                                        </div>
                                    )}
                                    <ChatBox
                                        messages={filteredMessages}
                                        onSend={handleSend}
                                        placeholder={activeTab === 'messagerie' ? `Message à ${selectedPrivateChat?.username}...` : `Message ${activeTab}...`}
                                        className="border-0 bg-transparent flex-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
