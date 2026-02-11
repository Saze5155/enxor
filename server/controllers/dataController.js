const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

const { readJsonFile } = require('../utils/dataLoader');

exports.getClasses = (req, res) => {
    const data = readJsonFile('classes.json');
    res.json(data);
};

exports.getRaces = (req, res) => {
    const data = readJsonFile('races.json');
    res.json(data);
};

exports.getSpells = (req, res) => {
    const data = readJsonFile('spells.json');
    res.json(data);
};

exports.getItems = (req, res) => {
    const data = readJsonFile('items.json');
    res.json(data);
};

exports.getFeats = (req, res) => {
    const data = readJsonFile('feats.json');
    res.json(data);
};

exports.getBackgrounds = (req, res) => {
    const data = readJsonFile('backgrounds.json');
    res.json(data);
};

// Create Methods
const { writeJsonFile } = require('../utils/dataLoader');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { formatRace, formatItem, formatClass, formatSpell, formatFeat } = require('../utils/wikiFormatter');

// Helper to create Wiki Article
async function createWikiArticle(title, content, categoryName, visibility) {
    try {
        const category = await prisma.category.findFirst({
            where: { name: categoryName }
        });

        if (!category) {
            console.warn(`Category ${categoryName} not found, skipping article creation.`);
            return;
        }

        const wikiVisibility = visibility ? 'PUBLIC' : 'MJ'; 

        await prisma.article.create({
            data: {
                title,
                content,
                visibility: wikiVisibility,
                category: { connect: { id: category.id } }
            }
        });
        console.log(`Wiki article created for ${title}`);
    } catch (error) {
        console.error('Error creating wiki article:', error);
    }
}

exports.createRace = async (req, res) => {
    try {
        const races = readJsonFile('races.json');
        const newRace = { ...req.body, visible: req.body.visible !== false }; 
        races.push(newRace);
        
        if (writeJsonFile('races.json', races)) {
            // Create "Sexy" Wiki Article
            await createWikiArticle(newRace.nom, formatRace(newRace), 'Races & Peuples', newRace.visible);
            res.status(201).json({ message: 'Race created successfully', race: newRace });
        } else {
            res.status(500).json({ message: 'Failed to write race data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating race', error: error.message });
    }
};

exports.createItem = async (req, res) => {
    try {
        const items = readJsonFile('items.json');
        const newItem = { ...req.body, visible: req.body.visible !== false };
        items.push(newItem);
        
        if (writeJsonFile('items.json', items)) {
            await createWikiArticle(newItem.name, formatItem(newItem), 'Objets & Artefacts', newItem.visible);
            res.status(201).json({ message: 'Item created successfully', item: newItem });
        } else {
            res.status(500).json({ message: 'Failed to write item data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
};

exports.createClass = async (req, res) => {
    try {
        const classes = readJsonFile('classes.json');
        const newClass = { ...req.body, visible: req.body.visible !== false };
        classes.push(newClass);
        
        if (writeJsonFile('classes.json', classes)) {
            await createWikiArticle(newClass.nom, formatClass(newClass), 'Classes', newClass.visible);
            res.status(201).json({ message: 'Class created successfully', class: newClass });
        } else {
            res.status(500).json({ message: 'Failed to write class data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating class', error: error.message });
    }
};

exports.createFeat = async (req, res) => {
    try {
        const feats = readJsonFile('feats.json');
        const newFeat = { ...req.body, visible: req.body.visible !== false };
        feats.push(newFeat);
        
        if (writeJsonFile('feats.json', feats)) {
             await createWikiArticle(newFeat.nom, formatFeat(newFeat), 'Magie & Systèmes', newFeat.visible);
            res.status(201).json({ message: 'Feat created successfully', feat: newFeat });
        } else {
            res.status(500).json({ message: 'Failed to write feat data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating feat', error: error.message });
    }
};

exports.createSpell = async (req, res) => {
    try {
        const spells = readJsonFile('spells.json');
        const newSpell = { ...req.body, visible: req.body.visible !== false };
        spells.push(newSpell);
        
        if (writeJsonFile('spells.json', spells)) {
            await createWikiArticle(newSpell.nom, formatSpell(newSpell), 'Magie & Systèmes', newSpell.visible);
            res.status(201).json({ message: 'Spell created successfully', spell: newSpell });
        } else {
            res.status(500).json({ message: 'Failed to write spell data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating spell', error: error.message });
    }
};

// Update Methods (for visibility toggle etc.)
exports.updateRace = (req, res) => {
    try {
        const races = readJsonFile('races.json');
        const { nom, visible } = req.body; // Identified by name for now
        const index = races.findIndex(r => r.nom === nom);
        
        if (index !== -1) {
            races[index].visible = visible;
            if (writeJsonFile('races.json', races)) {
                // Ideally sync wiki here too, but visibility sync is complex (Wiki has its own field)
                // For now just data update
                 res.json({ message: 'Race updated', race: races[index] });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Race not found' });
        }
    } catch (e) { res.status(500).json({ message: 'Error updating' }); }
};

exports.updateClass = (req, res) => {
    try {
        const classes = readJsonFile('classes.json');
        const { nom, visible } = req.body;
        const index = classes.findIndex(c => c.nom === nom);
        
        if (index !== -1) {
            classes[index].visible = visible;
            if (writeJsonFile('classes.json', classes)) {
                 res.json({ message: 'Class updated', class: classes[index] });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Class not found' });
        }
    } catch (e) { res.status(500).json({ message: 'Error updating' }); }
};

exports.updateItem = (req, res) => {
    try {
        const items = readJsonFile('items.json');
        const { name, visible } = req.body;
        const index = items.findIndex(i => i.name === name);
        
        if (index !== -1) {
            items[index].visible = visible;
            if (writeJsonFile('items.json', items)) {
                 res.json({ message: 'Item updated', item: items[index] });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (e) { res.status(500).json({ message: 'Error updating' }); }
};

exports.updateSpell = (req, res) => {
    try {
        const spells = readJsonFile('spells.json');
        const { nom, visible } = req.body;
        const index = spells.findIndex(s => s.nom === nom);
        
        if (index !== -1) {
            spells[index].visible = visible;
            if (writeJsonFile('spells.json', spells)) {
                 res.json({ message: 'Spell updated', spell: spells[index] });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Spell not found' });
        }
    } catch (e) { res.status(500).json({ message: 'Error updating' }); }
};

exports.updateFeat = (req, res) => {
    try {
        const feats = readJsonFile('feats.json');
        const { nom, visible } = req.body;
        const index = feats.findIndex(f => f.nom === nom);
        
        if (index !== -1) {
            feats[index].visible = visible;
            if (writeJsonFile('feats.json', feats)) {
                 res.json({ message: 'Feat updated', feat: feats[index] });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Feat not found' });
        }
    } catch (e) { res.status(500).json({ message: 'Error updating' }); }
};
