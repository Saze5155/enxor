const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to parse JSON fields safely
const parseJSON = (str) => {
    try { return JSON.parse(str); } catch (e) { return {}; }
};

// CREATE
const { readJsonFile } = require('../utils/dataLoader');
const { calculateSpellSlots } = require('../utils/spellSlots');

// Database of items stats for starting equipment
const STARTING_GEAR_STATS = {
    // Weapons
    'arme de guerre': { damage: '1d8', damage2: '1d10', properties: 'Polyvalente (1d10)', type: 'arme' },
    'arme courante': { damage: '1d6', damage2: '', properties: '', type: 'arme' },
    'épée à deux mains': { damage: '2d6', damage2: '', properties: 'Lourde, Deux mains', type: 'arme' },
    'épée longue': { damage: '1d8', damage2: '1d10', properties: 'Polyvalente (1d10)', type: 'arme' },
    'épée courte': { damage: '1d6', damage2: '', properties: 'Finesse, Légère', type: 'arme' },
    'dague': { damage: '1d4', damage2: '', properties: 'Finesse, Légère, Lancer (portée 6/18)', type: 'arme' },
    'hache à deux mains': { damage: '1d12', damage2: '', properties: 'Lourde, Deux mains', type: 'arme' },
    'hache d\'armes': { damage: '1d8', damage2: '1d10', properties: 'Polyvalente (1d10)', type: 'arme' },
    'hachette': { damage: '1d6', damage2: '', properties: 'Légère, Lancer (portée 6/18)', type: 'arme' },
    'masse d\'armes': { damage: '1d6', damage2: '', properties: '', type: 'arme' },
    'marteau de guerre': { damage: '1d8', damage2: '1d10', properties: 'Polyvalente (1d10)', type: 'arme' },
    'bâton': { damage: '1d6', damage2: '1d8', properties: 'Polyvalente (1d8)', type: 'arme' },
    'lance': { damage: '1d6', damage2: '1d8', properties: 'Lancer (portée 6/18), Polyvalente (1d8)', type: 'arme' },
    'javelot': { damage: '1d6', damage2: '', properties: 'Lancer (portée 9/36)', type: 'arme' },
    'arc long': { damage: '1d8', damage2: '', properties: 'Munitions (portée 45/180), Lourde, Deux mains', type: 'arme' },
    'arc court': { damage: '1d6', damage2: '', properties: 'Munitions (portée 24/96), Deux mains', type: 'arme' },
    'arbalète légère': { damage: '1d8', damage2: '', properties: 'Munitions (portée 24/96), Chargement, Deux mains', type: 'arme' },
    'arbalète lourde': { damage: '1d10', damage2: '', properties: 'Munitions (portée 30/120), Chargement, Deux mains', type: 'arme' },
    'fronde': { damage: '1d4', damage2: '', properties: 'Munitions (portée 9/36)', type: 'arme' },
    'rapière': { damage: '1d8', damage2: '', properties: 'Finesse', type: 'arme' },
    'cimeterre': { damage: '1d6', damage2: '', properties: 'Finesse, Légère', type: 'arme' },
    'gourdin': { damage: '1d4', damage2: '', properties: 'Légère', type: 'arme' },
    'massue': { damage: '1d8', damage2: '', properties: 'Deux mains', type: 'arme' },
    
    // Armor & Shields
    'armure de cuir': { type: 'armure', properties: 'Légère, CA 11 + Dex' },
    'armure de cuir clouté': { type: 'armure', properties: 'Légère, CA 12 + Dex' },
    'chemise de mailles': { type: 'armure', properties: 'Intermédiaire, CA 13 + Dex (max 2)' },
    'cotte de mailles': { type: 'armure', properties: 'Lourde, CA 16, Discrétion désavantagée, For 13' },
    'harnois': { type: 'armure', properties: 'Lourde, CA 18, Discrétion désavantagée, For 15' },
    'bouclier': { type: 'bouclier', properties: '+2 CA' },
    'robe': { type: 'armure', properties: 'Pas d\'armure' },

    // New Items
    'casque': { type: 'tête', properties: '' },
    'bottes': { type: 'pieds', properties: '' },
    'cape': { type: 'dos', properties: '' },
    'anneau': { type: 'accessoire', properties: '' },
    'collier': { type: 'cou', properties: '' },
    'amulette': { type: 'cou', properties: '' },
    'potion': { type: 'consommable', properties: 'Usage unique' },
    'trousse': { type: 'outil', properties: '' },
    'kit': { type: 'outil', properties: '' },
    'sac': { type: 'conteneur', properties: '' }
};

const resolveItemStats = (itemStr) => {
    let name = itemStr;
    let quantity = 1;
    
    // Parse quantity e.g. "Flèches (20)" or "2 Dagues"
    // Case 1: "Flèches (20)"
    const parenQtyMatch = itemStr.match(/(.*)\s\((\d+)\)$/);
    if (parenQtyMatch) {
        name = parenQtyMatch[1];
        quantity = parseInt(parenQtyMatch[2]);
    } else {
        // Case 2: "2 Dagues"
        const prefixQtyMatch = itemStr.match(/^(\d+)\s+(.*)/);
        if (prefixQtyMatch) {
            quantity = parseInt(prefixQtyMatch[1]);
            name = prefixQtyMatch[2];
        }
    }

    // Clean name prefixes
    const cleanName = name.replace(/^(un |une |des |le |la |les )/i, '').trim();
    const lowerName = cleanName.toLowerCase();

    let type = "objet";
    let damage = "";
    let damage2 = "";
    let properties = "";

    // 1. Exact match lookup (longest keys first)
    const sortedKeys = Object.keys(STARTING_GEAR_STATS).sort((a, b) => b.length - a.length);
    const matchedKey = sortedKeys.find(key => lowerName.includes(key));
    
    if (matchedKey) {
        const stats = STARTING_GEAR_STATS[matchedKey];
        type = stats.type;
        damage = stats.damage || "";
        damage2 = stats.damage2 || "";
        properties = stats.properties || "";
    } else {
        // Fallback logic by keywords
        const weaponKeywords = ['épée', 'hache', 'dague', 'arc', 'arbalète', 'marteau', 'glaive', 'bâton', 'masse', 'lance', 'javeline', 'trident', 'fouet', 'fléau', 'morningstar', 'pique', 'rapière', 'cimeterre', 'fronde', 'dard', 'arme'];
        const armorKeywords = ['armure', 'cotte', 'bouclier', 'robe', 'gilet', 'cuir', 'plaques', 'chemise', 'maille', 'casque', 'bottes', 'cape', 'tunique'];
        const consumableKeywords = ['potion', 'parchemin', 'kit', 'trousse', 'ration', 'repas'];

        if (weaponKeywords.some(t => lowerName.includes(t))) type = "arme";
        else if (armorKeywords.some(t => lowerName.includes(t))) type = "armure";
        else if (consumableKeywords.some(t => lowerName.includes(t))) type = "consommable";
    }

    // Manual overrides for generic items often found in start gear
    if (lowerName.includes('sac à dos')) type = "conteneur";

    return { 
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1), // Capitalize
        quantity, 
        type, 
        damage,
        damage2, 
        properties, 
        isEquipped: false 
    };
};

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
        
        // --- 4. Starting Equipment ---
        const itemsToCreate = [];
        const startingEquipment = req.body.startingEquipment || {};

        // Class Equipment
        if (classRef && classRef.equipement_depart && classRef.equipement_depart.choix) {
            classRef.equipement_depart.choix.forEach((choice, index) => {
                let optionIndex = -1;
                
                // If only one option, it's automatic
                if (choice.options.length === 1) {
                    optionIndex = 0;
                } else if (startingEquipment[index] !== undefined) {
                    optionIndex = parseInt(startingEquipment[index]);
                }

                if (optionIndex >= 0 && choice.options[optionIndex]) {
                    const selectedItems = choice.options[optionIndex];
                    selectedItems.forEach(itemStr => {
                        itemsToCreate.push(resolveItemStats(itemStr));
                    });
                }
            });
        }
        
        // Background Equipment
        if (bgRef && bgRef.equipement) {
             bgRef.equipement.forEach(itemStr => {
                 itemsToCreate.push(resolveItemStats(itemStr));
             });
        }


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
                spellSlots: JSON.stringify(calculateSpellSlots(charClass, 1)),
                
                // Relations
                features: {
                    create: featuresToCreate
                },
                inventory: {
                    create: itemsToCreate
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

        console.log(`[DEBUG] getCharacters for User: ${userId}, Role: ${role}`);

        const characters = await prisma.character.findMany({
            where,
            include: { 
                user: { select: { username: true } },
            }
        });

        console.log(`[DEBUG] Found ${characters.length} characters in DB.`);

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

        console.log(`[DEBUG] getCharacter ID: "${id}"`);
        console.log(`[DEBUG] User: ${userId}, Role: ${role}`);

        const character = await prisma.character.findUnique({
             where: { id },
             include: { 
                 user: { select: { username: true } },
                 inventory: true,
                 spells: true,
                 features: true
             }
        });

        if (!character) {
             console.log(`[DEBUG] Character NOT FOUND for ID: "${id}"`);
             return res.status(404).json({ message: "Personnage introuvable" });
        }

        // Access check
        if (role !== 'MJ' && character.userId !== userId) {
            return res.status(403).json({ message: "Accès interdit" });
        }

        // Parse JSON fields
        const racesData = readJsonFile('races.json');
        const raceRef = racesData.find(r => r.nom === character.race);

        const parsedChar = {
            ...character,
            stats: parseJSON(character.stats),
            skills: parseJSON(character.skills),
            proficiencies: parseJSON(character.proficiencies),
            wallet: parseJSON(character.wallet),
            raceData: raceRef || null
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
        ['stats', 'skills', 'proficiencies', 'wallet'].forEach(field => {
            if (updateData[field] && typeof updateData[field] === 'object') {
                updateData[field] = JSON.stringify(updateData[field]);
            }
        });

        // Remove protected fields
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Only allow userId change if MJ
        if (role !== 'MJ') {
            delete updateData.userId;
        }
        
        // Handle Relations (Inventory, Spells, Features)
        // If these arrays are passed, we assume a full replace logic (for simplicity of "Save" button)
        // OR we can implement specific endpoints for adding/removing items.
        // For now, let's separate relation updates to avoid accidental wipes if not sent.
        // Only update relations if strictly provided as an array
        
        const prismaUpdateData = { ...updateData };
        delete prismaUpdateData.inventory;
        delete prismaUpdateData.spells;
        delete prismaUpdateData.features;

        // Stringify JSON fields if they are objects
        const jsonFields = ['spellSlots', 'skills', 'proficiencies', 'wallet'];
        jsonFields.forEach(field => {
            if (prismaUpdateData[field] && typeof prismaUpdateData[field] === 'object') {
                prismaUpdateData[field] = JSON.stringify(prismaUpdateData[field]);
            }
        });

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
                 // SAFETY: Only update if not empty, to prevent accidental wipes from partial frontend loads
                 if (req.body.inventory.length > 0) {
                     await prisma.characterItem.deleteMany({ where: { characterId: id } });
                     await prisma.characterItem.createMany({
                         data: req.body.inventory.map(item => ({
                             characterId: id,
                             itemId: item.itemId,
                             name: item.name,
                             quantity: item.quantity,
                             isEquipped: item.isEquipped,
                             equippedSlot: item.equippedSlot || null,
                             type: item.type,
                             properties: item.properties ? (typeof item.properties === 'string' ? item.properties : JSON.stringify(item.properties)) : null,
                             notes: item.notes
                         }))
                     });
                 } else {
                     console.log(`[INFO] Received empty inventory for char ${id}. Ignoring update to prevent data loss.`);
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

// LEVEL UP
exports.levelUp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;
        const { hpGain, newLevel, subclass, newFeatures, asiChoice } = req.body; // hpGain from frontend
        
        console.log('=== LEVEL UP REQUEST ===');
        console.log('Character ID:', id);
        console.log('New Level:', newLevel);
        console.log('HP Gain:', hpGain);
        console.log('Subclass:', subclass);
        console.log('ASI Choice:', asiChoice);

        const character = await prisma.character.findUnique({
             where: { id },
             include: { features: true }
        });

        if (!character) return res.status(404).json({ message: "Personnage introuvable" });
        if (role !== 'MJ' && character.userId !== userId) return res.status(403).json({ message: "Interdit" });

        const featuresToCreate = [];

        // If frontend provided resolved features (with choices), use them
        if (newFeatures && Array.isArray(newFeatures)) {
            newFeatures.forEach(feat => {
                 featuresToCreate.push({
                    name: feat.nom,
                    source: "CLASS", // or feat.source if available
                    levelObtained: newLevel,
                    description: feat.description || feat.desc || '', // Default to empty string if missing
                    // Map other fields if needed
                 });
            });
        } else {
            // Fallback: Load from file (no choices)
            const classesData = readJsonFile('classes.json');
            const classList = classesData.classes || [];
            const classRef = classList.find(c => c.nom === character.class);
            
            if (classRef && classRef.capacites_par_niveau && classRef.capacites_par_niveau[newLevel.toString()]) {
                classRef.capacites_par_niveau[newLevel.toString()].forEach(feat => {
                     featuresToCreate.push({
                        name: feat.nom,
                        source: "CLASS",
                        levelObtained: newLevel,
                        description: feat.description || '' // Default to empty string if missing
                    });
                });
            }
            
             // Subclass features fallback
            if (subclass && classRef && classRef.sous_classes) {
                 const subRef = classRef.sous_classes.find(sc => sc.nom === subclass);
                 if (subRef && subRef.capacites) {
                     const subFeats = subRef.capacites.filter(f => f.niveau === newLevel);
                     subFeats.forEach(feat => {
                         featuresToCreate.push({
                            name: feat.nom,
                            source: "SUBCLASS",
                            levelObtained: newLevel,
                            description: feat.description || '' // Default to empty string if missing
                        });
                     });
                 }
            }
        }

        const activeSubclass = subclass || character.subClass;
        
        // Handle ASI (Ability Score Improvement)
        let updatedStats = null;
        if (asiChoice && asiChoice.type === 'stat_increase' && asiChoice.increases) {
            console.log('Applying ASI...');
            updatedStats = typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats || {};
            Object.entries(asiChoice.increases).forEach(([stat, increase]) => {
                const currentValue = updatedStats[stat] || 10;
                const newValue = Math.min(20, currentValue + increase); // Cap at 20
                updatedStats[stat] = newValue;
                console.log(`ASI: ${stat} increased from ${currentValue} to ${newValue}`);
            });
        } else if (asiChoice && asiChoice.type === 'feat' && asiChoice.featName) {
            // Add feat as a feature
            console.log('Applying Feat:', asiChoice.featName);
            const featData = asiChoice.featData || {};
            featuresToCreate.push({
                name: asiChoice.featName,
                source: "FEAT",
                levelObtained: newLevel,
                description: featData.description || ''
            });
        }

        // Build update data
        const updateData = {
            level: newLevel,
            hpMax: character.hpMax + hpGain,
            hpCurrent: character.hpCurrent + hpGain,
            subClass: activeSubclass,
            spellSlots: JSON.stringify(calculateSpellSlots(character.class, newLevel)),
            features: {
                create: featuresToCreate
            }
        };
        
        // Only update stats if ASI was applied
        if (updatedStats) {
            updateData.stats = JSON.stringify(updatedStats);
        }

        console.log('Updating character with data:', JSON.stringify(updateData, null, 2));

        const updated = await prisma.character.update({
            where: { id },
            data: updateData,
            include: { features: true, inventory: true, spells: true }
        });

        // Parse JSON for response
        const result = {
            ...updated,
            stats: parseJSON(updated.stats),
            skills: parseJSON(updated.skills),
            proficiencies: parseJSON(updated.proficiencies),
            wallet: parseJSON(updated.wallet)
        };

        console.log('Level up successful!');
        res.json(result);

    } catch (error) {
        console.error("=== LEVEL UP ERROR ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: "Erreur lors de la montée de niveau", error: error.message });
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
