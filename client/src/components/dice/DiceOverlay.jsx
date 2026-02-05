import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DiceBoxContainer from './DiceBoxContainer';

export default function DiceOverlay({ socket, isGM }) {
    const { user } = useAuth();
    const diceBoxRef = useRef(null);
    const [critAnim, setCritAnim] = useState(null); // 'success' or 'fail'
    const [modAnim, setModAnim] = useState(null); // { value: number, total: number, raw: number }

    useEffect(() => {
        if (!socket) return;

        const handleRoll = async (data) => {
            console.log("Overlay Received Roll:", data);

            // Secret roll filtering: hide from non-GM
            if (data.isSecret && !isGM) return;

            if (diceBoxRef.current) {
                // Determine options
                const isD20 = data.diceType === 'd20';
                const rawResult = data.rawResult;
                const modifier = parseInt(data.modifier || 0); // Ensure number

                let rollOptions = {};

                // Color Logic
                if (isD20 && rawResult === 20) {
                    rollOptions = { color: '#FFD700', material: 'metal' };
                } else if (isD20 && rawResult === 1) {
                    rollOptions = { color: '#880000', material: 'wood' };
                }

                // ROLL (Await completion)
                await diceBoxRef.current.roll(`1${data.diceType}`, data.rawResult, rollOptions);

                // --- POST ROLL ANIMATIONS ---

                // 1. Critical Animations (Priority)
                if (isD20 && (rawResult === 20 || rawResult === 1)) {
                    if (rawResult === 20) {
                        setCritAnim('success');
                        setTimeout(() => setCritAnim(null), 4000);
                    } else {
                        setCritAnim('fail');
                        setTimeout(() => setCritAnim(null), 4000);
                    }
                    return; // Don't show Modifier anim if it's a Crit (too busy)
                }

                // 2. Modifier Animation (Collision with 3D die)
                if (modifier !== 0) {
                    console.log("Triggering Modifier Animation:", modifier);
                    // Wait for dice to fully settle
                    setTimeout(() => {
                        // Phase 1: Modifier charges toward the die
                        setModAnim({ modifier, total: data.result, raw: rawResult, phase: 'charge' });

                        // Phase 2: Impact — clear 3D die + flash
                        setTimeout(() => {
                            if (diceBoxRef.current) diceBoxRef.current.clear();
                            setModAnim(prev => prev ? { ...prev, phase: 'impact' } : null);
                        }, 700);

                        // Phase 3: Reveal total
                        setTimeout(() => {
                            setModAnim(prev => prev ? { ...prev, phase: 'reveal' } : null);
                        }, 1000);

                        // Cleanup
                        setTimeout(() => setModAnim(null), 3800);
                    }, 400);
                }
            }
        };

        socket.on('dice_roll', handleRoll);
        return () => socket.off('dice_roll', handleRoll);
    }, [socket, isGM]);

    return (
        <>
            <DiceBoxContainer ref={diceBoxRef} />

            {/* MODIFIER → DICE COLLISION ANIMATION */}
            {modAnim && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center pointer-events-none">

                    {/* Phase: CHARGE — Modifier flies toward the 3D die */}
                    {modAnim.phase === 'charge' && (
                        <div
                            className="mod-charge"
                            style={{
                                color: modAnim.modifier > 0 ? '#4ade80' : '#f87171',
                                textShadow: `
                                    0 0 20px ${modAnim.modifier > 0 ? '#4ade80' : '#f87171'},
                                    0 0 60px ${modAnim.modifier > 0 ? '#22c55e' : '#ef4444'},
                                    ${modAnim.modifier > 0 ? '40px' : '-40px'} 0 30px ${modAnim.modifier > 0 ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'},
                                    ${modAnim.modifier > 0 ? '80px' : '-80px'} 0 40px ${modAnim.modifier > 0 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}
                                `,
                            }}
                        >
                            {modAnim.modifier >= 0 ? `+${modAnim.modifier}` : modAnim.modifier}
                        </div>
                    )}

                    {/* Phase: IMPACT — Flash + shockwave ring */}
                    {modAnim.phase === 'impact' && (
                        <>
                            <div className="impact-flash" />
                            <div className="impact-ring" />
                            <div className="impact-ring" style={{ animationDelay: '0.1s' }} />
                        </>
                    )}

                    {/* Phase: REVEAL — Total number explodes out */}
                    {modAnim.phase === 'reveal' && (
                        <div className="total-reveal">
                            {modAnim.total}
                        </div>
                    )}
                </div>
            )}

            {/* CRITICAL ANIMATION OVERLAY */}
            {critAnim && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center pointer-events-none overflow-hidden">
                    {/* CRIT SUCCESS */}
                    {critAnim === 'success' && (
                        <>
                            <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay animate-pulse"></div>
                            <div className="absolute w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,#FFD700_40deg,transparent_60deg,transparent_100deg,#FFD700_120deg,transparent_140deg,transparent_200deg,#FFD700_220deg,transparent_240deg)] opacity-40 animate-spin-slow origin-center"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-full animate-ping opacity-30 bg-yellow-200 rounded-full scale-150 duration-[2s]"></div>
                            </div>
                            <div className="relative z-10 flex flex-col items-center animate-bounce-in">
                                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-600 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] stroke-black tracking-tighter scale-150">
                                    CRITIQUE !
                                </h1>
                                <span className="text-4xl font-bold text-white drop-shadow-md mt-4 animate-pulse">
                                    RÉUSSITE LÉGENDAIRE
                                </span>
                            </div>
                        </>
                    )}

                    {/* CRIT FAIL */}
                    {critAnim === 'fail' && (
                        <>
                            <div className="absolute inset-0 bg-red-900/40 mix-blend-multiply animate-pulse-fast"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000000_100%)]"></div>
                            <div className="relative z-10 flex flex-col items-center animate-shake">
                                <h1 className="text-9xl font-black text-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] glitch-text tracking-widest scale-125">
                                    ECHEC
                                </h1>
                                <span className="text-4xl font-bold text-gray-300 bg-black/50 px-4 py-2 mt-2 rounded border border-red-800">
                                    CATASTROPHE
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
                @keyframes bounce-in {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.5); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                .animate-pulse-fast {
                    animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .glitch-text { position: relative; }
                .glitch-text::before, .glitch-text::after {
                    content: 'ECHEC'; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: black;
                }
                .glitch-text::before {
                    left: 2px; text-shadow: -1px 0 red; clip: rect(24px, 550px, 90px, 0);
                    animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
                } 
                .glitch-text::after {
                    left: -2px; text-shadow: -1px 0 blue; clip: rect(85px, 550px, 140px, 0);
                    animation: glitch-anim-2 3s infinite linear alternate-reverse;
                }
                @keyframes glitch-anim-1 {
                    0% { clip: rect(20px, 9999px, 10px, 0); }
                    100% { clip: rect(55px, 9999px, 80px, 0); }
                }
                @keyframes glitch-anim-2 {
                    0% { clip: rect(60px, 9999px, 40px, 0); }
                    100% { clip: rect(10px, 9999px, 95px, 0); }
                }

                /* ===== MODIFIER → DICE COLLISION ===== */

                /* Phase 1: Modifier charges from right toward center */
                .mod-charge {
                    position: absolute;
                    font-size: 5rem;
                    font-weight: 900;
                    letter-spacing: -2px;
                    animation: mod-charge 0.7s cubic-bezier(0.12, 0, 0.39, 0) forwards;
                    z-index: 20;
                }
                @keyframes mod-charge {
                    0% {
                        transform: translateX(55vw) scale(0.4) rotate(-8deg);
                        opacity: 0;
                        filter: blur(6px);
                    }
                    15% {
                        opacity: 1;
                        filter: blur(3px);
                    }
                    60% {
                        transform: translateX(5px) scale(1.3) rotate(2deg);
                        opacity: 1;
                        filter: blur(0);
                    }
                    85% {
                        transform: translateX(0) scale(1.6) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(0) scale(0) rotate(0deg);
                        opacity: 0;
                    }
                }

                /* Phase 2: Impact flash */
                .impact-flash {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 30%, transparent 65%);
                    animation: impact-flash 0.35s ease-out forwards;
                    z-index: 25;
                }
                @keyframes impact-flash {
                    0% { opacity: 1; transform: scale(0.8); }
                    100% { opacity: 0; transform: scale(1.5); }
                }

                /* Phase 2: Shockwave ring */
                .impact-ring {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid rgba(255,255,255,0.8);
                    box-shadow: 0 0 15px rgba(255,255,255,0.4), inset 0 0 15px rgba(255,255,255,0.1);
                    animation: impact-ring 0.6s ease-out forwards;
                    z-index: 24;
                }
                @keyframes impact-ring {
                    0% {
                        width: 20px; height: 20px;
                        opacity: 1;
                        border-width: 4px;
                    }
                    100% {
                        width: 50vw; height: 50vw;
                        opacity: 0;
                        border-width: 1px;
                    }
                }

                /* Phase 3: Total number reveal */
                .total-reveal {
                    position: absolute;
                    font-size: 7rem;
                    font-weight: 900;
                    color: white;
                    text-shadow:
                        0 0 30px rgba(255,255,255,0.8),
                        0 0 60px rgba(255,255,255,0.4),
                        0 0 100px rgba(255,255,255,0.2);
                    animation: total-reveal 2.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    z-index: 30;
                }
                @keyframes total-reveal {
                    0%   { transform: scale(0); opacity: 0; }
                    15%  { transform: scale(1.6); opacity: 1; }
                    25%  { transform: scale(0.9); opacity: 1; }
                    35%  { transform: scale(1.08); opacity: 1; }
                    45%  { transform: scale(1); opacity: 1; }
                    75%  { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.15); opacity: 0; }
                }
            `}</style>
        </>
    );
}
