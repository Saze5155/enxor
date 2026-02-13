import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import combatService from '../services/combatService';
import { useAuth } from './AuthContext';

const CombatContext = createContext();

export const useCombat = () => {
    return useContext(CombatContext);
};

export const CombatProvider = ({ children }) => {
    const { socket } = useSocket();
    const { user } = useAuth();

    // État du combat
    const [combat, setCombat] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [initiativeOrder, setInitiativeOrder] = useState([]);
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Charger un combat existant
    const loadCombat = useCallback(async (combatId) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await combatService.getCombat(combatId);
            setCombat(data);
            setParticipants(data.participants);
            setInitiativeOrder(data.ordreInitiative);
            setCurrentTurnIndex(data.tourActuelIndex);
            setCurrentRound(data.roundActuel);

            // Rejoindre la room socket
            if (socket) {
                socket.emit('combat:join', combatId);
            }
        } catch (err) {
            console.error("Erreur chargement combat:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [socket]);

    // Lancer un combat
    const startCombat = async (campaignId, participantsData) => {
        setIsLoading(true);
        try {
            const data = await combatService.startCombat({ campaignId, ...participantsData });
            setCombat({ id: data.combat_id, statut: data.statut });
            setParticipants(data.participants);

            if (socket) {
                socket.emit('combat:join', data.combat_id);
            }
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Quitter le combat (nettoyage)
    const leaveCombat = useCallback(() => {
        if (combat && socket) {
            socket.emit('combat:leave', combat.id);
        }
        setCombat(null);
        setParticipants([]);
        setInitiativeOrder([]);
    }, [combat, socket]);

    // Gestion des événements Socket
    useEffect(() => {
        if (!socket) return;

        // Combat Démarré
        const handleCombatStarted = (data) => {
            console.log("Combat Started Socket:", data);
            setCombat({ id: data.combatId, statut: 'attente_initiative' });
            setParticipants(data.participants);
            setInitiativeOrder(data.ordreInitiative);
        };

        // Initiative
        const handleInitiativeRolled = ({ participantId, initiative }) => {
            setParticipants(prev => prev.map(p =>
                p.id === participantId ? { ...p, initiative } : p
            ));
        };

        const handleInitiativeComplete = ({ ordreInitiative }) => {
            setInitiativeOrder(ordreInitiative);
            setCombat(prev => ({ ...prev, statut: 'en_cours' }));
        };

        // Tours
        const handleTurnChanged = ({ tourActuelIndex, roundActuel }) => {
            setCurrentTurnIndex(tourActuelIndex);
            setCurrentRound(roundActuel);
        };

        const handleRoundChanged = ({ roundActuel }) => {
            setCurrentRound(roundActuel);
        };

        // Actions & Updates
        const handleHPUpdated = ({ participantId, pvActuels, pvMax, pvTemporaires }) => {
            setParticipants(prev => prev.map(p =>
                p.id === participantId ? {
                    ...p,
                    pvActuels: pvActuels !== undefined ? pvActuels : p.pvActuels,
                    pvMax: pvMax !== undefined ? pvMax : p.pvMax,
                    pvTemporaires: pvTemporaires !== undefined ? pvTemporaires : p.pvTemporaires
                } : p
            ));
        };

        const handleConditionAdded = ({ participantId, condition }) => {
            setParticipants(prev => prev.map(p => {
                if (p.id !== participantId) return p;
                const currentConditions = Array.isArray(p.conditions) ? p.conditions : JSON.parse(p.conditions || '[]');
                return { ...p, conditions: [...currentConditions, condition] };
            }));
        };

        const handleConditionRemoved = ({ participantId, conditionId }) => {
            setParticipants(prev => prev.map(p => {
                if (p.id !== participantId) return p;
                const currentConditions = Array.isArray(p.conditions) ? p.conditions : JSON.parse(p.conditions || '[]');
                return { ...p, conditions: currentConditions.filter(c => c.id !== conditionId) };
            }));
        };

        const handleCombatEnded = ({ statistics }) => {
            setCombat(prev => ({ ...prev, statut: 'termine', statistiques: statistics }));
        };

        socket.on('combat:started', handleCombatStarted);
        socket.on('combat:initiative_rolled', handleInitiativeRolled);
        socket.on('combat:initiative_complete', handleInitiativeComplete);
        socket.on('combat:turn_changed', handleTurnChanged);
        socket.on('combat:round_changed', handleRoundChanged);
        socket.on('combat:hp_updated', handleHPUpdated);
        socket.on('combat:condition_added', handleConditionAdded);
        socket.on('combat:condition_removed', handleConditionRemoved);
        socket.on('combat:ended', handleCombatEnded);

        return () => {
            socket.off('combat:started', handleCombatStarted);
            socket.off('combat:initiative_rolled', handleInitiativeRolled);
            socket.off('combat:initiative_complete', handleInitiativeComplete);
            socket.off('combat:turn_changed', handleTurnChanged);
            socket.off('combat:round_changed', handleRoundChanged);
            socket.off('combat:hp_updated', handleHPUpdated);
            socket.off('combat:condition_added', handleConditionAdded);
            socket.off('combat:condition_removed', handleConditionRemoved);
            socket.off('combat:ended', handleCombatEnded);
        };
    }, [socket]);

    // Actions exposées
    const rollInitiative = async (combatId, data) => {
        return await combatService.rollInitiative(combatId, data);
    };

    const nextTurn = async () => {
        if (combat) return await combatService.nextTurn(combat.id);
    };

    const executeAction = async (actionData) => {
        if (combat) return await combatService.executeAction(combat.id, actionData);
    };

    const updateHP = async (participantId, data) => {
        if (combat) return await combatService.updateHP(combat.id, participantId, data);
    };

    const addCondition = async (participantId, condition) => {
        if (combat) return await combatService.addCondition(combat.id, participantId, condition);
    };

    const removeCondition = async (participantId, conditionId) => {
        if (combat) return await combatService.removeCondition(combat.id, participantId, conditionId);
    };

    const value = {
        combat,
        participants,
        initiativeOrder,
        currentTurnIndex,
        currentRound,
        isLoading,
        error,
        loadCombat,
        startCombat,
        leaveCombat,
        rollInitiative,
        nextTurn,
        executeAction,
        updateHP,
        addCondition,
        removeCondition
    };

    return (
        <CombatContext.Provider value={value}>
            {children}
        </CombatContext.Provider>
    );
};
