import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000'); // Ensure URL is correct env var in prod
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    const joinCampaign = (campaignId) => {
        if (socket) socket.emit('join_campaign', campaignId);
    };

    const sendMessage = (data) => {
        if (socket) socket.emit('chat_message', data);
    };

    const sendRoll = (data) => {
        if (socket) socket.emit('dice_roll', data);
    };

    return (
        <SocketContext.Provider value={{ socket, joinCampaign, sendMessage, sendRoll }}>
            {children}
        </SocketContext.Provider>
    );
};
