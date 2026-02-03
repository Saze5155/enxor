const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to parse JSON fields safely
const parseJSON = (str) => {
    try { return JSON.parse(str); } catch (e) { return {}; }
};

// CREATE
exports.createCharacter = async (req, res) => {
    try {
        const { name, race, class: charClass, stats, background, alignment } = req.body;
        const userId = req.user.userId;

        // Simplify stats input for now or assume validated
        const statsStr = JSON.stringify(stats || {});

        const character = await prisma.character.create({
            data: {
                userId,
                name,
                race,
                class: charClass,
                stats: statsStr,
                // Defaults
                hpCurrent: 10, hpMax: 10, ac: 10, initiative: 0, speed: 30,
                skills: "{}", inventory: "[]", spells: "[]", features: "[]",
                background, alignment
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
            include: { user: { select: { username: true } } }
        });

        // Parse JSON fields for frontend convenience
        const parsedChars = characters.map(c => ({
            ...c,
            stats: parseJSON(c.stats),
            inventory: parseJSON(c.inventory)
        }));

        res.json(parsedChars);
    } catch (error) {
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
             include: { user: { select: { username: true } } }
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
            inventory: parseJSON(character.inventory),
            spells: parseJSON(character.spells),
            features: parseJSON(character.features)
        };

        res.json(parsedChar);
    } catch (error) {
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

        // Prepare update data (stringify JSON fields if present)
        const updateData = { ...req.body };
        const jsonFields = ['stats', 'skills', 'inventory', 'spells', 'features'];
        
        jsonFields.forEach(field => {
            if (updateData[field] && typeof updateData[field] === 'object') {
                updateData[field] = JSON.stringify(updateData[field]);
            }
        });

        // Remove ID and userId from updateData to prevent changing them
        delete updateData.id;
        delete updateData.userId;

        const updated = await prisma.character.update({
            where: { id },
            data: updateData
        });

        res.json(updated);
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
