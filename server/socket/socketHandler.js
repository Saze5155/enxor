module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        // Join Campaign Room (Global for now)
        socket.on('join_campaign', (campaignId) => {
            const room = `campaign_${campaignId}`;
            socket.join(room);
            socket.join(`${room}_secret`); // Everyone joins secret for now, logic below handles distribution
            console.log(`[Socket] ${socket.id} joined ${room} and secret channel`);
        });

        // Chat Message
        socket.on('chat_message', (data) => {
            // data: { campaignId, sender, text, type (public/secret/mj), role (senderRole) }
            const { campaignId, text, sender, type, role } = data;
            
            let room;
            if (type === 'public') room = `campaign_${campaignId}`;
            else if (type === 'secret') room = `campaign_${campaignId}_players`; // Only players join this
            else if (type === 'mj') room = `campaign_${campaignId}_mj`; // MJ + sender logic needed, simplified for first pass to broadcast to MJ room

            // Basic room logic for prototyping:
            // Public -> Everyone
            // Secret -> Players only (MJ should not verify/join this room in client unless logic changes)
            // MJ -> Logic is complex (Point to Point). For now let's use global broadcast but client filter or distinct room.
            
            // let's stick to room names:
            // Public: campaign_{id}
            // Secret (Groupe): campaign_{id}_secret
            // MJ DM: campaign_{id}_mjchannel (or simple broadcast filtered by client)
            
            const targetRoom = type === 'public' ? `campaign_${campaignId}` 
                             : type === 'secret' ? `campaign_${campaignId}_secret`
                             : `campaign_${campaignId}`; // mj_dm falls back to global broadcast for now (filtered by client)

            io.to(targetRoom).emit('chat_message', {
                id: Date.now(),
                sender,
                text,
                type,
                target: data.target, // Pass target for DM filtering
                timestamp: new Date().toISOString()
            });
        });

        // Dice Roll
        socket.on('dice_roll', async (data) => {
            // data: { campaignId, rollerName, diceType, result, rawResult, modifier, isSecret, timestamp, userId, characterId }
            const { campaignId, diceType, rawResult, rollerName, userId, characterId, targetParticipantId } = data;
            const room = `campaign_${campaignId}`;

            // Broadcast the dice roll to all players
            io.to(room).emit('dice_roll', {
                ...data,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });

            // Check if this is a d20 roll during initiative phase
            if (diceType === 'd20') {
                console.log(`[Initiative] Debug: Received d20 roll from ${rollerName} (User: ${userId}, Char: ${characterId})`);
                try {
                    const { PrismaClient } = require('@prisma/client');
                    const prisma = new PrismaClient();

                    // Find active combat in initiative phase for this campaign
                    const activeCombat = await prisma.combat.findFirst({
                        where: {
                            campaignId,
                            statut: 'attente_initiative'
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
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

                    if (activeCombat) {
                        console.log(`[Initiative] Debug: Found active combat ${activeCombat.id}. Participants: ${activeCombat.participants.length}`);
                        
                        // Find participant matching the roller
                        // Order of precedence:
                        // 1. Participant linked to rolling Character ID
                        // 2. Participant linked to Character owned by rolling User ID
                        // 3. Name matching (fallback)
                        const participant = activeCombat.participants.find(p => {
                            // 0. Check Target Participant ID
                            if (targetParticipantId && p.id === targetParticipantId) {
                                console.log(`[Initiative] Debug: Match found by Target ID for ${p.nom}`);
                                return true;
                            }

                            // 1. Check Character ID match
                            if (characterId && p.characterId === characterId) {
                                console.log(`[Initiative] Debug: Match found by Character ID for ${p.nom}`);
                                return true;
                            }

                            // 2. Check User ID Ownership match
                            if (userId && p.character?.userId === userId) {
                                console.log(`[Initiative] Debug: Match found by User ID Ownership for ${p.nom}`);
                                return true;
                            }

                            // 3. Fallback: Name matching
                            if (p.character && rollerName.includes(p.character.name)) return true;
                            if (p.enemyInstance && rollerName.includes(p.enemyInstance.name)) return true;
                            const nameMatch = p.nom === rollerName || rollerName.includes(p.nom);
                            if (nameMatch) console.log(`[Initiative] Debug: Match found by Name for ${p.nom}`);
                            return nameMatch;
                        });

                        if (!participant) {
                            console.log(`[Initiative] Debug: No matching participant found for roller ${rollerName}`);
                        } else {
                            console.log(`[Initiative] Debug: Participant found: ${participant.nom} (ID: ${participant.id}). Current Init: ${participant.initiative}`);
                        }

                        if (participant && participant.initiative === null) {
                            console.log(`[Initiative] Processing roll for ${participant.nom}`, { rawResult, participantId: participant.id });

                            // Calculate initiative bonus (DEX modifier)
                            let initiativeBonus = 0;
                            try {
                                if (participant.character) {
                                    // Stats are stored as JSON string in the stats field
                                    const charStats = typeof participant.character.stats === 'string'
                                        ? JSON.parse(participant.character.stats)
                                        : participant.character.stats || {};
                                    const dex = Number(charStats.dexterity || charStats.dex || charStats.DEX) || 10;
                                    initiativeBonus = Math.floor((dex - 10) / 2);
                                } else if (participant.enemyInstance?.enemyType) {
                                    const stats = typeof participant.enemyInstance.enemyType.stats === 'string'
                                        ? JSON.parse(participant.enemyInstance.enemyType.stats)
                                        : participant.enemyInstance.enemyType.stats || {};
                                    const dex = Number(stats.dex || stats.DEX) || 10;
                                    initiativeBonus = Math.floor((dex - 10) / 2);
                                }
                            } catch (e) {
                                console.error("[Initiative] Error calculating bonus:", e);
                                initiativeBonus = 0;
                            }

                            const cleanRawResult = Number(rawResult) || 0;
                            const initiativeTotal = cleanRawResult + initiativeBonus;
                            
                            console.log(`[Initiative] Calculation: ${cleanRawResult} (raw) + ${initiativeBonus} (bonus) = ${initiativeTotal}`);

                            // Update participant initiative
                            await prisma.combatParticipant.update({
                                where: { id: participant.id },
                                data: { initiative: initiativeTotal }
                            });

                            // Check if all participants have rolled
                            const allParticipants = await prisma.combatParticipant.findMany({
                                where: { combatId: activeCombat.id }
                            });

                            const allRolled = allParticipants.every(p => p.initiative !== null);

                            if (allRolled) {
                                // Sort by initiative and update combat status
                                const ordre = allParticipants
                                    .sort((a, b) => b.initiative - a.initiative)
                                    .map(p => p.id);

                                await prisma.combat.update({
                                    where: { id: activeCombat.id },
                                    data: {
                                        ordreInitiative: JSON.stringify(ordre),
                                        statut: 'en_cours'
                                    }
                                });
                            }

                            // Broadcast initiative update
                            const updatedCombat = await prisma.combat.findUnique({
                                where: { id: activeCombat.id },
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

                            io.to(room).emit('initiative_updated', {
                                combat_id: activeCombat.id,
                                statut: updatedCombat.statut,
                                participants: updatedCombat.participants
                            });
                        }
                    }

                    await prisma.$disconnect();
                } catch (error) {
                    console.error('Error processing initiative roll:', error);
                }
            }
        });



        // Blind Mode Toggle
        socket.on('toggle_blind_mode', (data) => {
            const { campaignId, enabled } = data;
            io.to(`campaign_${campaignId}`).emit('blind_mode_update', enabled);
        });

        // Modifier Sync (MJ sets modifier for player)
        socket.on('force_modifier', (data) => {
            const { campaignId, targetId, modifier } = data;
            io.to(`campaign_${campaignId}`).emit('modifier_updated', { targetId, modifier });
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
};
