import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import DiceBox from '@3d-dice/dice-box';

const DiceBoxContainer = forwardRef((props, ref) => {
    const diceBoxRef = useRef(null);
    const containerId = "dice-box-canvas";
    const [isReady, setIsReady] = useState(false);

    useImperativeHandle(ref, () => ({
        roll: (notation, targetResult) => {
            if (diceBoxRef.current && isReady) {
                console.log("🎲 DiceBox Rolling:", notation, "Target:", targetResult);
                diceBoxRef.current.clear();

                // Attempt to force result using object notation
                // Syntax: box.roll([{ type: 'd20', theme: 'default', value: 20 }])
                if (targetResult) {
                    // Syntax from docs: "1d20@15"
                    // We construct the string: notation + "@" + targetResult
                    // notation is usually '1d20', '1d6', etc.
                    // Ensure notation is simple (single die) for now as typical usage

                    // Handle potential multi-die in future, but for now:
                    const forceString = `${notation}@${targetResult}`;
                    console.log("🎲 DiceBox Forcing:", forceString);
                    return diceBoxRef.current.roll(forceString);
                } else {
                    return diceBoxRef.current.roll(notation);
                }
            } else {
                console.warn("DiceBox not ready or ref missing");
            }
        },
        clear: () => {
            if (diceBoxRef.current) diceBoxRef.current.clear();
        }
    }));

    useEffect(() => {
        // Initialize DiceBox
        console.log("Initializing DiceBox...");

        // NEW API: Single config object
        const box = new DiceBox({
            container: "#" + containerId,
            assetPath: '/assets/dice-box/',
            theme: 'default',
            scale: 6, // Safe scale
            gravity: 1, // Low gravity
            mass: 1, // Light dice
            friction: 0.8
        });

        box.init().then(() => {
            console.log("DiceBox Ready!");
            diceBoxRef.current = box;
            setIsReady(true);
        }).catch(err => {
            console.error("DiceBox Init Failed:", err);
        });

        return () => {
            // Cleanup if necessary
        };
    }, []);

    return (
        <div
            id={containerId}
            className="fixed inset-0 pointer-events-none z-[1000]" // MAX Z-INDEX
            style={{ width: '100vw', height: '100vh' }}
        >
            <style>{`
                #${containerId} canvas {
                    width: 100vw !important;
                    height: 100vh !important;
                    display: block !important;
                }
            `}</style>
        </div>
    );
});

export default DiceBoxContainer;
