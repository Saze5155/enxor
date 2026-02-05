import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import DiceBox from '@3d-dice/dice-box-threejs';

const DiceBoxContainer = forwardRef((props, ref) => {
    const diceBoxRef = useRef(null);
    const containerId = "dice-box-canvas";
    const [isReady, setIsReady] = useState(false);

    useImperativeHandle(ref, () => ({
        roll: (notation, targetResult, options = {}) => {
            if (diceBoxRef.current && isReady) {
                console.log("🎲 DiceBox Rolling:", notation, "Target:", targetResult, "Color:", options.color);
                diceBoxRef.current.clearDice();

                // 1. CONFIGURE THEME
                let themeConfig = {
                    theme_material: 'glass',
                    theme_customColorset: null
                };

                if (options.color) {
                    const isGold = options.color === '#FFD700';
                    const isRed = options.color === '#880000';

                    if (isGold) {
                        themeConfig = {
                            theme_material: 'plastic',
                            theme_customColorset: {
                                background: '#FFD700',
                                foreground: '#000000',
                                texture: 'none'
                            }
                        };
                    } else if (isRed) {
                        themeConfig = {
                            theme_material: 'plastic',
                            theme_customColorset: {
                                background: '#880000',
                                foreground: '#FFFFFF',
                                texture: 'none'
                            }
                        };
                    } else {
                        themeConfig = {
                            theme_material: 'glass',
                            theme_customColorset: {
                                background: options.color,
                                foreground: '#FFFFFF',
                                texture: 'none'
                            }
                        };
                    }
                }

                console.log("🎨 Setting Theme:", themeConfig);
                try {
                    diceBoxRef.current.updateConfig(themeConfig);
                } catch (e) { console.warn("Config update error", e); }

                const rollNotation = targetResult
                    ? `${notation}@${targetResult}`
                    : notation;

                // 2. DELAYED ROLL (Fix for color lag)
                // We wait 100ms to ensure the engine applies the material change
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        console.log("🚀 Executing Roll Now:", rollNotation);
                        diceBoxRef.current.roll(rollNotation)
                            .then(results => resolve(results))
                            .catch(err => {
                                console.error("Roll error:", err);
                                resolve([]); // Resolve empty on error to prevent crash
                            });
                    }, 100);
                });

            } else {
                console.warn("DiceBox not ready or ref missing");
                return Promise.resolve([]);
            }
        },
        clear: () => {
            if (diceBoxRef.current) diceBoxRef.current.clearDice();
        }
    }));

    useEffect(() => {
        let cancelled = false;
        console.log("Initializing DiceBox (threejs)...");

        const container = document.getElementById(containerId);
        if (container) {
            container.querySelectorAll('canvas').forEach(c => c.remove());
        }

        const box = new DiceBox("#" + containerId, {
            theme_colorset: "white",
            theme_material: "glass",
            gravity_multiplier: 400,
            baseScale: 100,
            strength: 1,
            light_intensity: 0.7,
            shadows: true,
            sounds: false,
        });

        box.initialize().then(() => {
            if (cancelled) return;
            console.log("DiceBox (threejs) Ready!");
            diceBoxRef.current = box;
            setIsReady(true);
        }).catch(err => {
            console.error("DiceBox Init Failed:", err);
        });

        return () => {
            cancelled = true;
            diceBoxRef.current = null;
            setIsReady(false);
            if (container) {
                container.querySelectorAll('canvas').forEach(c => c.remove());
            }
        };
    }, []);

    return (
        <div
            id={containerId}
            className="fixed inset-0 z-[1000]"
            style={{ pointerEvents: 'none' }}
        />
    );
});

export default DiceBoxContainer;
