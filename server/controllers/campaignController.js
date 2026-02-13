const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Campaign
exports.createCampaign = async (req, res) => {
    console.log("createCampaign called with body:", req.body, "and user:", req.user);
    try {
        const { name } = req.body;
        const gmId = req.user.userId;

        const newCampaign = await prisma.campaign.create({
            data: {
                name,
                gmId,
                players: {
                    connect: { id: gmId } // GM is also a "player" in terms of connection, or handle separately? 
                                          // Schema says players User[]. Let's ADD GM to players for simplifying queries?
                                          // OR keep them separate? User requires players relation. 
                                          // Let's connect GM to players for now for easier "My Campaigns" query.
                }
            }
        });
        
        // Emit event so other clients can refresh public list
        req.io.emit('campaign_created', newCampaign);

        res.status(201).json(newCampaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la campagne." });
    }
};

// Get All Campaigns (for user)
exports.getMyCampaigns = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Find campaigns where user is player OR GM
        const campaigns = await prisma.campaign.findMany({
            where: {
                players: {
                    some: { id: userId }
                }
            },
            include: {
                _count: {
                    select: { players: true, characters: true }
                }
            }
        });
        
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur récupération campagnes." });
    }
};

// Get Public Campaigns (Not joined yet)
exports.getPublicCampaigns = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const campaigns = await prisma.campaign.findMany({
            where: {
                players: {
                    none: { id: userId } // User is NOT in these campaigns
                }
            },
            include: {
                _count: {
                    select: { players: true }
                },
                players: {
                    where: {
                        role: 'MJ' // Get GM info
                    },
                    select: { username: true } // Only username
                }
            }
        });
        
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur récupération campagnes publiques." });
    }
};

// Get Campaign Details
exports.getCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                players: {
                    select: { id: true, username: true, role: true }
                },
                characters: true,
                combats: {
                    where: {
                        statut: { not: 'terminé' }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
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
                }
            }
        });
        
        if (!campaign) return res.status(404).json({ message: "Campagne introuvable." });
        
        res.json(campaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// Join Campaign (by Code? or ID for now)
exports.joinCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if exists
        const campaign = await prisma.campaign.findUnique({ where: { id } });
        if (!campaign) return res.status(404).json({ message: "Campagne introuvable." });

        await prisma.campaign.update({
            where: { id },
            data: {
                players: {
                    connect: { id: userId }
                }
            }
        });

        res.json({ message: "Campagne rejointe !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'ajout à la campagne." });
    }
};

// Toggle Session Status (MJ Only)
exports.toggleSession = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify user is GM of this campaign
        const campaign = await prisma.campaign.findUnique({ where: { id } });
        if (!campaign) return res.status(404).json({ message: "Campagne introuvable." });
        
        if (campaign.gmId !== req.user.userId) {
             return res.status(403).json({ message: "Seul le MJ peut ouvrir/fermer la session." });
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data: { isSessionOpen: !campaign.isSessionOpen }
        });

        // Emit socket event for real-time updates
        req.io.emit('session_status_changed', { campaignId: id, isSessionOpen: updated.isSessionOpen });

        res.json({ message: `Session ${updated.isSessionOpen ? 'ouverte' : 'fermée'}`, isSessionOpen: updated.isSessionOpen });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur changement statut." });
    }
};
