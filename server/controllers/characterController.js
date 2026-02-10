const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to parse JSON fields safely
const parseJSON = (str) => {
    try { return JSON.parse(str); } catch (e) { return {}; }
};

// CREATE
const { readJsonFile } = require('../utils/dataLoader');

// CREATE
exports.createCharacter = async (req, res) => {
    try {
        const { name, race, class: charClass, background, alignment, stats, subClass } = req.body;
        const userId = req.user.userId;

        // Default stats
        const defaultStats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        const finalStats = stats || defaultStats;

        // Load Game Data for Automation
        const racesData = readJsonFile('races.json');
        const classesData = readJsonFile('classes.json');
        const backgroundsData = readJsonFile('backgrounds.json');

        const raceRef = racesData.find(r => r.nom === race);
        
        // classes.json structure: { classes: [ ... ] }
        const classList = classesData.classes || [];
        const classRef = classList.find(c => c.nom === charClass);

        const bgRef = backgroundsData.find(b => b.nom === background);

        // --- 1. HP Calculation ---
        // Level 1 HP = Max Hit Die + Con Modifier
        let hpMax = 10; // default
        let hitDice = "d10";
        if (classRef && classRef.de_vie) {
            hitDice = classRef.de_vie; // e.g., "d10"
            const dieValue = parseInt(hitDice.replace('d', ''));
            const conMod = Math.floor((finalStats.con - 10) / 2);
            hpMax = dieValue + conMod;
        }

        // --- 2. Proficiencies & Skills ---
        let proficiencies = { armor: [], weapons: [], tools: [], languages: [], savingThrows: [] };
        let charSkills = []; // Array of strings

        if (classRef && classRef.maitrises) {
            proficiencies.armor = classRef.maitrises.armures || [];
            proficiencies.weapons = classRef.maitrises.armes || [];
            proficiencies.tools = classRef.maitrises.outils || [];
            proficiencies.savingThrows = classRef.maitrises.jets_de_sauvegarde || [];
        }
        
        // Add Background Proficiencies (Skills + Tools)
        if (bgRef) {
            if (bgRef.competences) {
                charSkills = [...charSkills, ...bgRef.competences];
            }
            if (bgRef.outils) {
                proficiencies.tools = [...proficiencies.tools, ...bgRef.outils];
            }
        }

        // --- 3. Features (Race & Class & Background) ---
        const featuresToCreate = [];

        // Race Traits
        if (raceRef && raceRef.traits) {
            raceRef.traits.forEach(trait => {
                const traitName = typeof trait === 'string' ? trait : trait.nom;
                const traitDesc = typeof trait === 'string' ? trait : (trait.description || "Trait racial");
                
                featuresToCreate.push({
                    name: traitName,
                    source: "RACE",
                    levelObtained: 1,
                    description: traitDesc
                });
            });
        }

        // Class Features (Level 1)
        if (classRef && classRef.capacites_par_niveau && classRef.capacites_par_niveau['1']) {
            classRef.capacites_par_niveau['1'].forEach(feat => {
                 featuresToCreate.push({
                    name: feat.nom,
                    source: "CLASS",
                    levelObtained: 1,
                    description: feat.description || "Capacité de classe"
                });
            });
        }
        
        // Background Feature
        if (bgRef && bgRef.feature) {
             featuresToCreate.push({
                name: bgRef.feature.nom,
                source: "BACKGROUND",
                levelObtained: 1,
                description: bgRef.feature.description
            });
        }
        
        // --- 4. Starting Equipment from Background ---
        // (Optional: we can add items if we have a robust Item system, otherwise add to Notes or similar)
        // For now, let's keep it simple and just do Features/Skills. Equipment needs Item parsing.


        const character = await prisma.character.create({
            data: {
                userId,
                name,
                race,
                class: charClass,
                subClass,
                background,
                alignment,
                stats: JSON.stringify(finalStats),
                
                // Calculated values
                hpMax: hpMax,
                hpCurrent: hpMax,
                hitDiceMax: `1${hitDice}`,
                hitDiceUsed: 0,
                
                skills: JSON.stringify(charSkills),
                proficiencies: JSON.stringify(proficiencies),
                
                // Relations
                features: {
                    create: featuresToCreate
                }
            },
            include: {
                inventory: true,
                spells: true,
                features: true
            }
        });
        res.status(201).json(character);
    } catch (error) {
        console.error("Create Char Error", error);
        res.status(500).json({ message: "Erreur création personnage" });
    }
};

// GET ALL (User's chars + MJ sees all)
exports.getCharacters = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const where = role === 'MJ' ? {} : { userId };

        const characters = await prisma.character.findMany({
            where,
            include: { 
                user: { select: { username: true } },
                // Include summary counts or basic info if needed, but for list maybe keep it light
                // inventory: false 
            }
        });

        // Parse JSON fields for frontend
        const parsedChars = characters.map(c => ({
            ...c,
            stats: parseJSON(c.stats),
            skills: parseJSON(c.skills),
            proficiencies: parseJSON(c.proficiencies)
        }));

        res.json(parsedChars);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur récupération personnages" });
    }
};

// GET ONE
exports.getCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const character = await prisma.character.findUnique({
             where: { id },
             include: { 
                 user: { select: { username: true } },
                 inventory: true,
                 spells: true,
                 features: true
             }
        });

        if (!character) return res.status(404).json({ message: "Personnage introuvable" });

        // Access check
        if (role !== 'MJ' && character.userId !== userId) {
            return res.status(403).json({ message: "Accès interdit" });
        }

        // Parse JSON fields
        const parsedChar = {
            ...character,
            stats: parseJSON(character.stats),
            skills: parseJSON(character.skills),
            proficiencies: parseJSON(character.proficiencies)
        };

        res.json(parsedChar);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur récupération personnage" });
    }
};

// UPDATE
exports.updateCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;
        
        // Find existing to check permissions
        const existing = await prisma.character.findUnique({ where: { id }});
        if (!existing) return res.status(404).json({ message: "Personnage introuvable" });

        if (role !== 'MJ' && existing.userId !== userId) {
            return res.status(403).json({ message: "Modification interdite" });
        }

        const updateData = { ...req.body };

        // Handle JSON fields
        ['stats', 'skills', 'proficiencies'].forEach(field => {
            if (updateData[field] && typeof updateData[field] === 'object') {
                updateData[field] = JSON.stringify(updateData[field]);
            }
        });

        // Remove protected fields
        delete updateData.id;
        delete updateData.userId;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        
        // Handle Relations (Inventory, Spells, Features)
        // If these arrays are passed, we assume a full replace logic (for simplicity of "Save" button)
        // OR we can implement specific endpoints for adding/removing items.
        // For now, let's separate relation updates to avoid accidental wipes if not sent.
        // Only update relations if strictly provided as an array
        
        const prismaUpdateData = { ...updateData };
        delete prismaUpdateData.inventory;
        delete prismaUpdateData.spells;
        delete prismaUpdateData.features;

        // Transaction to handle potential relation updates + main update
        const result = await prisma.$transaction(async (prisma) => {
            // Update main character data
            const updatedChar = await prisma.character.update({
                where: { id },
                data: prismaUpdateData,
                include: { inventory: true, spells: true, features: true }
            });

            // If inventory provided, reconcile
            // This is a naive "delete all and recreate" approach. 
            // Better: Upsert by ID if provided, create otherwise, delete missing.
            // For MVP: let's trust the "Save" sends the current state.
            
            // Actually, for a rich UI, granular updates are better. 
            // Let's NOT update relations here unless explicitly simpler to do so.
            // BUT the user asked for a "Save" system. 
            // Let's implement a "replace relations" logic if provided.
            
            if (req.body.inventory && Array.isArray(req.body.inventory)) {
                 await prisma.characterItem.deleteMany({ where: { characterId: id } });
                 if (req.body.inventory.length > 0) {
                     await prisma.characterItem.createMany({
                         data: req.body.inventory.map(item => ({
                             characterId: id,
                             itemId: item.itemId,
                             name: item.name,
                             quantity: item.quantity,
                             isEquipped: item.isEquipped,
                             type: item.type,
                             properties: item.properties ? (typeof item.properties === 'string' ? item.properties : JSON.stringify(item.properties)) : null,
                             notes: item.notes
                         }))
                     });
                 }
            }
            
            if (req.body.spells && Array.isArray(req.body.spells)) {
                await prisma.characterSpell.deleteMany({ where: { characterId: id } });
                if (req.body.spells.length > 0) {
                     await prisma.characterSpell.createMany({
                         data: req.body.spells.map(spell => ({
                             characterId: id,
                             spellId: spell.spellId,
                             name: spell.name,
                             level: spell.level,
                             isPrepared: spell.isPrepared,
                             properties: spell.properties ? (typeof spell.properties === 'string' ? spell.properties : JSON.stringify(spell.properties)) : null
                         }))
                     });
                }
            }

            if (req.body.features && Array.isArray(req.body.features)) {
                await prisma.characterFeature.deleteMany({ where: { characterId: id } });
                if (req.body.features.length > 0) {
                     await prisma.characterFeature.createMany({
                         data: req.body.features.map(feat => ({
                             characterId: id,
                             name: feat.name,
                             source: feat.source,
                             levelObtained: feat.levelObtained,
                             description: feat.description,
                             usesMax: feat.usesMax,
                             usesCurrent: feat.usesCurrent,
                             resetType: feat.resetType
                         }))
                     });
                }
            }

            return await prisma.character.findUnique({
                where: { id },
                include: { inventory: true, spells: true, features: true }
            });
        });

        // Real-time update
        if (result.campaignId && req.io) {
            req.io.to(`campaign_${result.campaignId}`).emit('character_updated', result);
        }

        // Parse JSON for response
        const finalResponse = {
            ...result,
            stats: parseJSON(result.stats),
            skills: parseJSON(result.skills),
            proficiencies: parseJSON(result.proficiencies)
        };

        res.json(finalResponse);
    } catch (error) {
         console.error("Update Char Error", error);
        res.status(500).json({ message: "Erreur mise à jour personnage" });
    }
};

// DELETE
exports.deleteCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const existing = await prisma.character.findUnique({ where: { id }});
        if (!existing) return res.status(404).json({ message: "Personnage introuvable" });

        if (role !== 'MJ' && existing.userId !== userId) {
            return res.status(403).json({ message: "Suppression interdite" });
        }

        await prisma.character.delete({ where: { id } });
        res.json({ message: "Personnage supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur suppression" });
    }
};
