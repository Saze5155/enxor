/**
 * Combat Socket Events
 * Gère tous les événements temps réel liés au système de combat
 */

module.exports = (io, socket) => {
    console.log(`Combat socket initialized for user: ${socket.id}`);

    // Rejoindre une salle de combat
    socket.on('combat:join', (combatId) => {
        socket.join(`combat_${combatId}`);
        console.log(`Socket ${socket.id} joined combat ${combatId}`);
    });

    // Quitter une salle de combat
    socket.on('combat:leave', (combatId) => {
        socket.leave(`combat_${combatId}`);
        console.log(`Socket ${socket.id} left combat ${combatId}`);
    });

    // ===== ÉVÉNEMENTS ÉMIS PAR LE SERVEUR =====
    // Ces fonctions sont appelées depuis le contrôleur

    /**
     * Combat lancé
     * Notifie tous les joueurs qu'un combat a commencé
     */
    const emitCombatStarted = (combatId, data) => {
        io.to(`combat_${combatId}`).emit('combat:started', {
            combatId,
            participants: data.participants,
            ordreInitiative: data.ordreInitiative || []
        });
    };

    /**
     * Initiative lancée par un participant
     */
    const emitInitiativeRolled = (combatId, data) => {
        io.to(`combat_${combatId}`).emit('combat:initiative_rolled', {
            participantId: data.participantId,
            nom: data.nom,
            initiative: data.initiative
        });
    };

    /**
     * Toutes les initiatives sont complètes
     */
    const emitInitiativeComplete = (combatId, ordreInitiative) => {
        io.to(`combat_${combatId}`).emit('combat:initiative_complete', {
            ordreInitiative
        });
    };

    /**
     * Tour changé
     */
    const emitTurnChanged = (combatId, data) => {
        io.to(`combat_${combatId}`).emit('combat:turn_changed', {
            currentParticipant: data.currentParticipant,
            tourActuelIndex: data.tourActuelIndex,
            roundActuel: data.roundActuel
        });
    };

    /**
     * Round changé
     */
    const emitRoundChanged = (combatId, roundActuel) => {
        io.to(`combat_${combatId}`).emit('combat:round_changed', {
            roundActuel
        });
    };

    /**
     * Action exécutée
     */
    const emitActionExecuted = (combatId, action) => {
        io.to(`combat_${combatId}`).emit('combat:action_executed', {
            action
        });
    };

    /**
     * HP mis à jour
     */
    const emitHPUpdated = (combatId, data) => {
        io.to(`combat_${combatId}`).emit('combat:hp_updated', {
            participantId: data.participantId,
            pvActuels: data.pvActuels,
            pvMax: data.pvMax,
            pvTemporaires: data.pvTemporaires
        });
    };

    /**
     * Condition ajoutée
     */
    const emitConditionAdded = (combatId, data) => {
        io.to(`combat_${combatId}`).emit('combat:condition_added', {
            participantId: data.participantId,
            condition: data.condition
        });
    };

    /**
     * Condition retirée
     */
    const emitConditionRemoved = (combatId, data) => {
        io.to(`combat_${combatId}`).emit('combat:condition_removed', {
            participantId: data.participantId,
            conditionId: data.conditionId
        });
    };

    /**
     * Participant KO
     */
    const emitParticipantKO = (combatId, participantId) => {
        io.to(`combat_${combatId}`).emit('combat:participant_ko', {
            participantId
        });
    };

    /**
     * Participant mort
     */
    const emitParticipantDied = (combatId, participantId) => {
        io.to(`combat_${combatId}`).emit('combat:participant_died', {
            participantId
        });
    };

    /**
     * Participant ressuscité
     */
    const emitParticipantRevived = (combatId, participantId) => {
        io.to(`combat_${combatId}`).emit('combat:participant_revived', {
            participantId
        });
    };

    /**
     * Combat terminé
     */
    const emitCombatEnded = (combatId, statistiques) => {
        io.to(`combat_${combatId}`).emit('combat:ended', {
            combatId,
            statistiques
        });
    };

    // Exposer les fonctions pour utilisation dans le contrôleur
    socket.combatEmitters = {
        emitCombatStarted,
        emitInitiativeRolled,
        emitInitiativeComplete,
        emitTurnChanged,
        emitRoundChanged,
        emitActionExecuted,
        emitHPUpdated,
        emitConditionAdded,
        emitConditionRemoved,
        emitParticipantKO,
        emitParticipantDied,
        emitParticipantRevived,
        emitCombatEnded
    };
};
