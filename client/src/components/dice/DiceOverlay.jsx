import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DiceBoxContainer from './DiceBoxContainer';

export default function DiceOverlay({ socket, isGM }) {
    const { user } = useAuth();
    const [roll, setRoll] = useState(null);
    const [visible, setVisible] = useState(false);
    const diceBoxRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleRoll = (data) => {
            console.log("Overlay Received Roll:", data);

            // Trigger 3D Roll
            if (diceBoxRef.current) {
                // Determine notation from data (e.g. '1d20')
                // We pass the rawResult to attempt forcing the 3D dice to match.
                diceBoxRef.current.roll(`1${data.diceType}`, data.rawResult);
            }
        };

        socket.on('dice_roll', handleRoll);
        return () => socket.off('dice_roll', handleRoll);
    }, [socket]);

    return (
        <>
            <DiceBoxContainer ref={diceBoxRef} />
        </>
    );
}
