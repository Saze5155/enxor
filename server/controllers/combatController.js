const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== COMBAT MANAGEMENT =====

/**
 * Lancer un nouveau combat
 * POST /api/combats/start
 */
exports.startCombat = async (req, res) => {
    try {
        const { campaignId, joueurs, ennemis, pnj, parametres } = req.body;

        // Créer le combat
        const combat = await prisma.combat.create({
            data: {
                campaignId,
                statut: 'attente_initiative',
                parametres: JSON.stringify(parametres || {}),
            }
        });

        // Créer les participants (joueurs)
        const participantsData = [];

        // Ajouter les joueurs
        for (const joueurId of joueurs || []) {
            const character = await prisma.character.findUnique({
                where: { id: joueurId }
            });

            if (character) {
                const stats = JSON.parse(character.stats || '{}');
                participantsData.push({
                    combatId: combat.id,
                    type: 'joueur',
                    nom: character.name,
                    characterId: character.id,
                    initiative: null, // Will be rolled manually
                    pvActuels: character.hpCurrent,
                    pvMax: character.hpMax,
                    ca: character.ac,
                });
            }
        }

        // Ajouter les ennemis
        for (const ennemiData of ennemis || []) {
            if (ennemiData.instanceId) {
                // Ennemi unique existant
                const instance = await prisma.enemyInstance.findUnique({
                    where: { id: ennemiData.instanceId },
                    include: { enemyType: true }
                });

                if (instance) {
                    const stats = JSON.parse(instance.enemyType.stats || '{}');
                    participantsData.push({
                        combatId: combat.id,
                        type: 'ennemi',
                        nom: instance.name,
                        enemyInstanceId: instance.id,
                        initiative: null, // Will be rolled manually by GM
                        pvActuels: instance.hpCurrent,
                        pvMax: instance.hpMax,
                        ca: stats.ac || 10,
                    });
                }
            } else if (ennemiData.typeId && ennemiData.quantite) {
                // Créer plusieurs instances d'un type
                const enemyType = await prisma.enemyType.findUnique({
                    where: { id: ennemiData.typeId }
                });

                if (enemyType) {
                    const stats = JSON.parse(enemyType.stats || '{}');
                    const hpFormula = stats.hp || '10';
                    
                    for (let i = 1; i <= ennemiData.quantite; i++) {
                        // Créer une instance
                        const instance = await prisma.enemyInstance.create({
                            data: {
                                enemyTypeId: enemyType.id,
                                name: `${enemyType.name} #${i}`,
                                campaignId,
                                hpCurrent: stats.hpMax || 10,
                                hpMax: stats.hpMax || 10,
                            }
                        });

                        participantsData.push({
                            combatId: combat.id,
                            type: 'ennemi',
                            nom: instance.name,
                            enemyInstanceId: instance.id,
                            initiative: null, // Will be rolled manually by GM
                            pvActuels: instance.hpCurrent,
                            pvMax: instance.hpMax,
                            ca: stats.ac || 10,
                        });
                    }
                }
            }
        }

        // Créer tous les participants
        await prisma.combatParticipant.createMany({
            data: participantsData
        });

        // Récupérer le combat complet
        const combatComplet = await prisma.combat.findUnique({
            where: { id: combat.id },
            include: {
                participants: {
                    include: {
                        character: true,
                        enemyInstance: {
                            include: {
                                enemyType: true
                            }
                        }
                    }
                }
            }
        });

        const responseData = {
            combat_id: combat.id,
            statut: 'attente_initiative',
            participants: combatComplet.participants
        };

        // Émettre un événement Socket.IO pour notifier tous les joueurs
        if (req.io) {
            req.io.emit('combat_started', {
                campaignId,
                combat: responseData
            });
        }

        res.json(responseData);
    } catch (error) {
        console.error('Error starting combat:', error);
        res.status(500).json({ message: 'Erreur lors du lancement du combat', error: error.message });
    }
};

/**
 * Récupérer l'état d'un combat
 * GET /api/combats/:id
 */
exports.getCombat = async (req, res) => {
    try {
        const { id } = req.params;

        const combat = await prisma.combat.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        character: true,
                        enemyInstance: {
                            include: {
                                enemyType: true
                            }
                        }
                    },
                    orderBy: {
                        initiative: 'desc'
                    }
                }
            }
        });

        if (!combat) {
            return res.status(404).json({ message: 'Combat non trouvé' });
        }

        // Parser les champs JSON
        const combatData = {
            ...combat,
            ordreInitiative: JSON.parse(combat.ordreInitiative),
            parametres: JSON.parse(combat.parametres),
            historiqueActions: JSON.parse(combat.historiqueActions),
            statistiques: JSON.parse(combat.statistiques),
            participants: combat.participants.map(p => ({
                ...p,
                conditions: JSON.parse(p.conditions),
                effetsTemporaires: JSON.parse(p.effetsTemporaires),
                position: p.position ? JSON.parse(p.position) : null
            }))
        };

        res.json(combatData);
    } catch (error) {
        console.error('Error getting combat:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du combat', error: error.message });
    }
};

// ===== INITIATIVE =====

/**
 * Enregistrer l'initiative d'un participant
 * POST /api/combats/:id/initiative
 */
exports.rollInitiative = async (req, res) => {
    try {
        const { id } = req.params;
        const { participantId, resultatDe, modificateur, total } = req.body;

        // Mettre à jour l'initiative du participant
        const participant = await prisma.combatParticipant.update({
            where: { id: participantId },
            data: { initiative: total }
        });

        // Vérifier si tous les participants ont lancé leur initiative
        const combat = await prisma.combat.findUnique({
            where: { id },
            include: { participants: true }
        });

        const tousOntLance = combat.participants.every(p => p.initiative > 0);

        if (tousOntLance) {
            // Trier par initiative (décroissant)
            const ordre = combat.participants
                .sort((a, b) => b.initiative - a.initiative)
                .map(p => p.id);

            // Mettre à jour le combat
            await prisma.combat.update({
                where: { id },
                data: {
                    ordreInitiative: JSON.stringify(ordre),
                    statut: 'en_cours'
                }
            });

            res.json({
                message: 'Initiative enregistrée',
                participant,
                initiativeComplete: true,
                ordre
            });
        } else {
            res.json({
                message: 'Initiative enregistrée',
                participant,
                initiativeComplete: false
            });
        }
    } catch (error) {
        console.error('Error rolling initiative:', error);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'initiative', error: error.message });
    }
};

// ===== TOURS ET ROUNDS =====

/**
 * Passer au tour suivant
 * POST /api/combats/:id/next-turn
 */
exports.nextTurn = async (req, res) => {
    try {
        const { id } = req.params;

        const combat = await prisma.combat.findUnique({
            where: { id },
            include: { participants: true }
        });

        const ordre = JSON.parse(combat.ordreInitiative);
        let nouveauIndex = combat.tourActuelIndex + 1;

        // Si on dépasse le dernier participant, passer au round suivant
        if (nouveauIndex >= ordre.length) {
            nouveauIndex = 0;
            await prisma.combat.update({
                where: { id },
                data: {
                    roundActuel: combat.roundActuel + 1,
                    tourActuelIndex: nouveauIndex
                }
            });

            res.json({
                message: 'Nouveau round',
                roundActuel: combat.roundActuel + 1,
                tourActuelIndex: nouveauIndex,
                participantActuel: ordre[nouveauIndex]
            });
        } else {
            await prisma.combat.update({
                where: { id },
                data: { tourActuelIndex: nouveauIndex }
            });

            res.json({
                message: 'Tour suivant',
                roundActuel: combat.roundActuel,
                tourActuelIndex: nouveauIndex,
                participantActuel: ordre[nouveauIndex]
            });
        }
    } catch (error) {
        console.error('Error next turn:', error);
        res.status(500).json({ message: 'Erreur lors du passage au tour suivant', error: error.message });
    }
};

/**
 * Passer au round suivant
 * POST /api/combats/:id/next-round
 */
exports.nextRound = async (req, res) => {
    try {
        const { id } = req.params;

        const combat = await prisma.combat.update({
            where: { id },
            data: {
                roundActuel: { increment: 1 },
                tourActuelIndex: 0
            }
        });

        res.json({
            message: 'Nouveau round',
            roundActuel: combat.roundActuel
        });
    } catch (error) {
        console.error('Error next round:', error);
        res.status(500).json({ message: 'Erreur lors du passage au round suivant', error: error.message });
    }
};

// ===== ACTIONS =====

/**
 * Exécuter une action
 * POST /api/combats/:id/action
 */
exports.executeAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { participantId, type, description, cibles, resultat } = req.body;

        const combat = await prisma.combat.findUnique({
            where: { id }
        });

        // Ajouter l'action à l'historique
        const historique = JSON.parse(combat.historiqueActions);
        const nouvelleAction = {
            id: Date.now().toString(),
            round: combat.roundActuel,
            participantId,
            type,
            description,
            cibles,
            resultat,
            timestamp: new Date().toISOString()
        };
        historique.push(nouvelleAction);

        await prisma.combat.update({
            where: { id },
            data: {
                historiqueActions: JSON.stringify(historique)
            }
        });

        res.json({
            message: 'Action exécutée',
            action: nouvelleAction
        });
    } catch (error) {
        console.error('Error executing action:', error);
        res.status(500).json({ message: 'Erreur lors de l\'exécution de l\'action', error: error.message });
    }
};

// ===== GESTION DES PARTICIPANTS =====

/**
 * Modifier les HP d'un participant
 * PATCH /api/combats/:id/participant/:participantId/hp
 */
exports.updateHP = async (req, res) => {
    try {
        const { id, participantId } = req.params;
        const { pvActuels, pvTemporaires } = req.body;

        const data = {};
        if (pvActuels !== undefined) {
            data.pvActuels = pvActuels;
            // Gérer KO et mort
            if (pvActuels <= 0) {
                data.estConscient = false;
            } else {
                data.estConscient = true;
                data.mort = false;
            }
        }
        if (pvTemporaires !== undefined) data.pvTemporaires = pvTemporaires;

        const participant = await prisma.combatParticipant.update({
            where: { id: participantId },
            data
        });

        res.json({
            message: 'HP mis à jour',
            participant
        });
    } catch (error) {
        console.error('Error updating HP:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des HP', error: error.message });
    }
};

/**
 * Ajouter une condition à un participant
 * POST /api/combats/:id/participant/:participantId/condition
 */
exports.addCondition = async (req, res) => {
    try {
        const { participantId } = req.params;
        const { nom, description, duree, source } = req.body;

        const participant = await prisma.combatParticipant.findUnique({
            where: { id: participantId }
        });

        const conditions = JSON.parse(participant.conditions);
        const nouvelleCondition = {
            id: Date.now().toString(),
            nom,
            description,
            duree,
            source,
            ajouteeRound: (await prisma.combat.findUnique({
                where: { id: participant.combatId }
            })).roundActuel
        };
        conditions.push(nouvelleCondition);

        await prisma.combatParticipant.update({
            where: { id: participantId },
            data: {
                conditions: JSON.stringify(conditions)
            }
        });

        res.json({
            message: 'Condition ajoutée',
            condition: nouvelleCondition
        });
    } catch (error) {
        console.error('Error adding condition:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la condition', error: error.message });
    }
};

/**
 * Retirer une condition d'un participant
 * DELETE /api/combats/:id/participant/:participantId/condition/:conditionId
 */
exports.removeCondition = async (req, res) => {
    try {
        const { participantId, conditionId } = req.params;

        const participant = await prisma.combatParticipant.findUnique({
            where: { id: participantId }
        });

        const conditions = JSON.parse(participant.conditions);
        const nouvellesConditions = conditions.filter(c => c.id !== conditionId);

        await prisma.combatParticipant.update({
            where: { id: participantId },
            data: {
                conditions: JSON.stringify(nouvellesConditions)
            }
        });

        res.json({
            message: 'Condition retirée'
        });
    } catch (error) {
        console.error('Error removing condition:', error);
        res.status(500).json({ message: 'Erreur lors du retrait de la condition', error: error.message });
    }
};

// ===== FIN DE COMBAT =====

/**
 * Terminer un combat
 * POST /api/combats/:id/end
 */
exports.endCombat = async (req, res) => {
    try {
        const { id } = req.params;

        const combat = await prisma.combat.update({
            where: { id },
            data: {
                statut: 'terminé',
                dateFin: new Date()
            },
            include: {
                participants: true
            }
        });

        // Calculer les statistiques finales
        const stats = {
            duree_totale_secondes: Math.floor((combat.dateFin - combat.dateDebut) / 1000),
            nombre_rounds: combat.roundActuel,
            par_participant: {}
        };

        combat.participants.forEach(p => {
            stats.par_participant[p.id] = {
                degats_infliges: p.degatsInfliges,
                degats_recus: p.degatsRecus,
                soins_prodigues: p.soinsProdigues,
                sorts_lances: p.sortsLances,
                jets_critiques: p.jetsCritiques,
                jets_echecs_critiques: p.jetsEchecsCritiques,
                ko: !p.estConscient,
                mort: p.mort
            };
        });

        await prisma.combat.update({
            where: { id },
            data: {
                statistiques: JSON.stringify(stats)
            }
        });

        res.json({
            message: 'Combat terminé',
            statistiques: stats
        });
    } catch (error) {
        console.error('Error ending combat:', error);
        res.status(500).json({ message: 'Erreur lors de la fin du combat', error: error.message });
    }
};
