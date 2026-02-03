import { useState, useRef, useEffect } from 'react';

export default function ChatBox({ messages = [], onSend, placeholder = "Message...", className = "" }) {
    const [text, setText] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <div className={`flex flex-col h-full bg-stone-900/80 backdrop-blur-sm rounded-lg border border-stone-600 overflow-hidden ${className}`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-stone-500 italic text-sm mt-4">
                        Aucun message.
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id || Math.random()} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className={`font-bold text-xs ${msg.isMe ? 'text-yellow-500' : 'text-stone-400'}`}>
                                {msg.sender || 'Anonyme'}
                            </span>
                            <span className="text-[10px] text-stone-600">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className={`
                            px-3 py-2 rounded-lg text-sm max-w-[85%] break-words
                            ${msg.type === 'diceroll'
                                ? 'bg-indigo-900/50 border border-indigo-500 text-indigo-100 font-mono'
                                : msg.isMe
                                    ? 'bg-stone-700 text-stone-100 rounded-tr-none'
                                    : 'bg-stone-800 text-stone-200 rounded-tl-none'}
                        `}>
                            {msg.type === 'diceroll' ? (
                                <div>
                                    <div className="font-bold border-b border-indigo-500/30 pb-1 mb-1">{msg.sender} lance {msg.formula}</div>
                                    <div className="text-xl font-bold text-center">🎲 {msg.rollResult}</div>
                                </div>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-2 bg-stone-800 border-t border-stone-600 flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-600 rounded px-3 py-1.5 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-yellow-600"
                    placeholder={placeholder}
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="bg-yellow-700 hover:bg-yellow-600 text-stone-100 px-3 py-1.5 rounded font-bold disabled:opacity-50 transition"
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
}
