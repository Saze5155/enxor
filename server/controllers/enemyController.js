const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to parse JSON fields safely
const parseJSON = (str) => {
    try { return JSON.parse(str); } catch (e) { return {}; }
};

// --- ENEMY TYPES (Templates) ---

exports.getEnemyTypes = async (req, res) => {
    try {
        const types = await prisma.enemyType.findMany({
            orderBy: { name: 'asc' }
        });
        
        const parsedTypes = types.map(t => ({
            ...t,
            stats: parseJSON(t.stats),
            actions: parseJSON(t.actions),
            reactions: parseJSON(t.reactions),
            legendaryActions: parseJSON(t.legendaryActions),
            specialAbilities: parseJSON(t.specialAbilities),
            classInfo: parseJSON(t.classInfo),
            encyclopedia: parseJSON(t.encyclopedia),
            tags: parseJSON(t.tags)
        }));
        
        res.json(parsedTypes);
    } catch (error) {
        console.error("Get Enemy Types Error", error);
        res.status(500).json({ message: "Erreur récupération types d'ennemis" });
    }
};

exports.getEnemyType = async (req, res) => {
    try {
        const { id } = req.params;
        const type = await prisma.enemyType.findUnique({ where: { id } });
        
        if (!type) return res.status(404).json({ message: "Type d'ennemi introuvable" });
        
        const parsedType = {
            ...type,
            stats: parseJSON(type.stats),
            actions: parseJSON(type.actions),
            reactions: parseJSON(type.reactions),
            legendaryActions: parseJSON(type.legendaryActions),
            specialAbilities: parseJSON(type.specialAbilities),
            classInfo: parseJSON(type.classInfo),
            encyclopedia: parseJSON(type.encyclopedia),
            tags: parseJSON(type.tags)
        };
        
        res.json(parsedType);
    } catch (error) {
        console.error("Get Enemy Type Error", error);
        res.status(500).json({ message: "Erreur récupération type d'ennemi" });
    }
};

exports.createEnemyType = async (req, res) => {
    try {
        const data = req.body;
        const authorId = req.user.userId;

        // Stringify JSON fields
        const jsonFields = ['stats', 'actions', 'reactions', 'legendaryActions', 'specialAbilities', 'classInfo', 'encyclopedia', 'tags'];
        const prismaData = { ...data, authorId };
        
        jsonFields.forEach(field => {
            if (prismaData[field] && typeof prismaData[field] === 'object') {
                prismaData[field] = JSON.stringify(prismaData[field]);
            }
        });

        const newType = await prisma.enemyType.create({ data: prismaData });

        // Créer automatiquement un article Wiki si encyclopedia existe
        const encyclopedia = data.encyclopedia;
        if (encyclopedia && (encyclopedia.courte || encyclopedia.longue)) {
            try {
                // Déterminer la catégorie selon le type d'ennemi
                let categoryName = 'Bestiaire';
                
                // Si c'est une créature unique/boss, utiliser une catégorie différente
                if (data.category === 'creature_custom' || data.isUnique) {
                    categoryName = 'Créatures Uniques';
                }

                // Trouver ou créer la catégorie
                let category = await prisma.category.findFirst({
                    where: { name: categoryName }
                });

                if (!category) {
                    category = await prisma.category.create({
                        data: {
                            name: categoryName,
                            icon: categoryName === 'Bestiaire' ? '🐉' : '👑'
                        }
                    });
                }

                // Construire le contenu de l'article
                let articleContent = '';
                
                if (encyclopedia.courte) {
                    articleContent += `**Description**\n\n${encyclopedia.courte}\n\n`;
                }
                
                if (encyclopedia.longue) {
                    articleContent += `${encyclopedia.longue}\n\n`;
                }
                
                if (encyclopedia.habitat) {
                    articleContent += `**Habitat**\n\n${encyclopedia.habitat}\n\n`;
                }
                
                if (encyclopedia.comportement) {
                    articleContent += `**Comportement**\n\n${encyclopedia.comportement}\n\n`;
                }
                
                if (encyclopedia.tactiques) {
                    articleContent += `**Tactiques de Combat**\n\n${encyclopedia.tactiques}\n\n`;
                }

                // Ajouter les stats de base
                const stats = data.stats || {};
                articleContent += `---\n\n**Caractéristiques**\n\n`;
                articleContent += `- **Type** : ${data.creatureType || 'Inconnu'}${data.subType ? ` (${data.subType})` : ''}\n`;
                articleContent += `- **Taille** : ${data.size || 'M'}\n`;
                articleContent += `- **Alignement** : ${data.alignment || 'Neutre'}\n`;
                if (stats.facteur_puissance !== undefined) {
                    articleContent += `- **Facteur de Puissance** : ${stats.facteur_puissance}\n`;
                }

                // Créer l'article
                await prisma.article.create({
                    data: {
                        title: data.name,
                        content: articleContent,
                        visibility: 'PUBLIC', // Par défaut public
                        categoryId: category.id
                    }
                });

                console.log(`[Enemy] Article Wiki créé pour "${data.name}" dans la catégorie "${categoryName}"`);
            } catch (wikiError) {
                console.error('[Enemy] Erreur création article Wiki:', wikiError);
                // Ne pas bloquer la création de l'ennemi si l'article échoue
            }
        }

        res.status(201).json(newType);
    } catch (error) {
        console.error("Create Enemy Type Error", error);
        res.status(500).json({ message: "Erreur création type d'ennemi" });
    }
};

exports.updateEnemyType = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const jsonFields = ['stats', 'actions', 'reactions', 'legendaryActions', 'specialAbilities', 'classInfo', 'encyclopedia', 'tags'];
        const prismaData = { ...data };
        delete prismaData.id;
        delete prismaData.createdAt;
        delete prismaData.updatedAt;

        jsonFields.forEach(field => {
            if (prismaData[field] && typeof prismaData[field] === 'object') {
                prismaData[field] = JSON.stringify(prismaData[field]);
            }
        });

        const updatedType = await prisma.enemyType.update({
            where: { id },
            data: prismaData
        });
        
        res.json(updatedType);
    } catch (error) {
        console.error("Update Enemy Type Error", error);
        res.status(500).json({ message: "Erreur mise à jour type d'ennemi" });
    }
};

exports.deleteEnemyType = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.enemyType.delete({ where: { id } });
        res.json({ message: "Type d'ennemi supprimé" });
    } catch (error) {
        console.error("Delete Enemy Type Error", error);
        res.status(500).json({ message: "Erreur suppression type d'ennemi. Vérifiez s'il a des instances actives." });
    }
};

// --- ENEMY INSTANCES ---

exports.getEnemyInstances = async (req, res) => {
    try {
        const { campaignId } = req.query;
        const where = campaignId ? { campaignId } : {};
        
        const instances = await prisma.enemyInstance.findMany({
            where,
            include: { enemyType: true }
        });
        
        const parsedInstances = instances.map(i => ({
            ...i,
            statsOverrides: parseJSON(i.statsOverrides),
            conditions: parseJSON(i.conditions)
        }));
        
        res.json(parsedInstances);
    } catch (error) {
        console.error("Get Enemy Instances Error", error);
        res.status(500).json({ message: "Erreur récupération instances d'ennemis" });
    }
};

exports.createEnemyInstance = async (req, res) => {
    try {
        const { enemyTypeId, campaignId, quantity, isUnique, name, statsOverrides } = req.body;
        
        const type = await prisma.enemyType.findUnique({ where: { id: enemyTypeId } });
        if (!type) return res.status(404).json({ message: "Type d'ennemi introuvable" });

        const typeStats = parseJSON(type.stats);
        const hpMax = typeStats.pv_moyenne || 10;

        const instancesCreated = [];
        const loopCount = quantity || 1;

        for (let i = 0; i < loopCount; i++) {
            const instanceName = quantity > 1 && !isUnique ? `${name || type.name} #${i + 1}` : (name || type.name);
            
            const newInstance = await prisma.enemyInstance.create({
                data: {
                    enemyTypeId,
                    campaignId,
                    name: instanceName,
                    isUnique: isUnique || false,
                    hpMax: hpMax,
                    hpCurrent: hpMax,
                    statsOverrides: statsOverrides ? JSON.stringify(statsOverrides) : "{}",
                }
            });
            instancesCreated.push(newInstance);
        }

        res.status(201).json(instancesCreated);
    } catch (error) {
        console.error("Create Enemy Instance Error", error);
        res.status(500).json({ message: "Erreur création instance(s) d'ennemi" });
    }
};

exports.updateEnemyInstance = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const prismaData = { ...data };
        delete prismaData.id;
        delete prismaData.enemyTypeId;
        delete prismaData.createdAt;
        delete prismaData.updatedAt;

        if (prismaData.statsOverrides && typeof prismaData.statsOverrides === 'object') {
            prismaData.statsOverrides = JSON.stringify(prismaData.statsOverrides);
        }
        if (prismaData.conditions && typeof prismaData.conditions === 'object') {
            prismaData.conditions = JSON.stringify(prismaData.conditions);
        }

        const updatedInstance = await prisma.enemyInstance.update({
            where: { id },
            data: prismaData,
            include: { enemyType: true }
        });

        // Real-time update if in campaign
        if (updatedInstance.campaignId && req.io) {
            req.io.to(`campaign_${updatedInstance.campaignId}`).emit('enemy_updated', updatedInstance);
        }

        res.json(updatedInstance);
    } catch (error) {
        console.error("Update Enemy Instance Error", error);
        res.status(500).json({ message: "Erreur mise à jour instance" });
    }
};

exports.deleteEnemyInstance = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.enemyInstance.delete({ where: { id } });
        res.json({ message: "Instance supprimée" });
    } catch (error) {
        console.error("Delete Enemy Instance Error", error);
        res.status(500).json({ message: "Erreur suppression instance" });
    }
};

// --- IMPORT LOGIC ---

exports.importFromJSON = async (req, res) => {
    try {
        const { jsonData } = req.body;
        const authorId = req.user.userId;
        
        // Simple conversion logic based on CDC
        // This is a placeholder for a more complex parser if needed
        const importedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        const typeEnnemi = {
            name: importedData.name || "Inconnu",
            category: "creature_basique",
            creatureType: importedData.type || "Humanoïde",
            subType: importedData.subtype || "",
            size: importedData.size || "M",
            alignment: importedData.alignment || "Neutre",
            source: "Importé",
            stats: JSON.stringify({
                ca: importedData.armor_class || 10,
                pv_formule: importedData.hit_points_roll || "1d8",
                pv_moyenne: importedData.hit_points || 10,
                vitesse: importedData.speed || { walk: "9m" },
                caracteristiques: {
                    force: importedData.strength || 10,
                    dexterite: importedData.dexterity || 10,
                    constitution: importedData.constitution || 10,
                    intelligence: importedData.intelligence || 10,
                    sagesse: importedData.wisdom || 10,
                    charisme: importedData.charisma || 10
                }
            }),
            actions: JSON.stringify(importedData.actions || []),
            reactions: JSON.stringify(importedData.reactions || []),
            legendaryActions: JSON.stringify(importedData.legendary_actions || []),
            specialAbilities: JSON.stringify(importedData.special_abilities || []),
            encyclopedia: JSON.stringify({
                courte: `Importé depuis ${importedData.name}`,
                longue: ""
            }),
            authorId
        };

        const newType = await prisma.enemyType.create({ data: typeEnnemi });
        res.status(201).json(newType);
    } catch (error) {
        console.error("Import Enemy Error", error);
        res.status(500).json({ message: "Erreur lors de l'import JSON" });
    }
};

// --- AI GENERATION ---

exports.generateWithAI = async (req, res) => {
    try {
        console.log('[AI Generation] Request received');
        console.log('[AI Generation] User:', req.user);
        console.log('[AI Generation] Body:', req.body);

        const {
            concept,
            type,
            taille,
            niveauGroupe,
            nombreJoueurs,
            difficulte,
            role,
            portee,
            capacitesTexte,
            capacitesPredefinies,
            habitat,
            comportement,
            genererLore,
            estBoss
        } = req.body;

        // Validation
        if (!concept || !type || !taille || !niveauGroupe || !nombreJoueurs || !difficulte) {
            return res.status(400).json({ 
                message: "Paramètres manquants (concept, type, taille, niveauGroupe, nombreJoueurs, difficulte requis)" 
            });
        }

        // Calcul du FP suggéré
        const { calculerFPSuggere } = require('../utils/fpCalculator');
        const fpSuggere = calculerFPSuggere({ niveauGroupe, nombreJoueurs, difficulte });

        // Génération via Groq
        const { genererEnnemiAvecGroq } = require('../utils/groqClient');
        const statblock = await genererEnnemiAvecGroq({
            concept,
            type,
            taille,
            fpSuggere,
            role: role || 'Bruiser',
            portee: portee || 'Corps à corps',
            capacitesTexte: capacitesTexte || '',
            capacitesPredefinies: capacitesPredefinies || [],
            habitat: habitat || '',
            comportement: comportement || '',
            genererLore: genererLore || false,
            estBoss: estBoss || false
        });

        // Validation basique du statblock
        if (!statblock.name || !statblock.stats) {
            return res.status(500).json({ 
                message: "L'IA a généré un statblock incomplet. Réessayez." 
            });
        }

        // Retourner le statblock (pas encore sauvegardé en BDD)
        res.json({ 
            statblock,
            fpSuggere,
            message: "Ennemi généré avec succès. Vous pouvez le modifier avant de sauvegarder."
        });

    } catch (error) {
        console.error("Generate with AI Error", error);
        res.status(500).json({ 
            message: error.message || "Erreur lors de la génération IA",
            suggestion: "Vérifiez votre clé API Groq ou réessayez."
        });
    }
};
