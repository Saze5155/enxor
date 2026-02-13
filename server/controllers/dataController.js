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

async function updateWikiArticle(oldTitle, newTitle, content, categoryName, visibility) {
    try {
        const article = await prisma.article.findFirst({
            where: { title: oldTitle }
        });

        const wikiVisibility = visibility ? 'PUBLIC' : 'MJ';

        if (article) {
            await prisma.article.update({
                where: { id: article.id },
                data: {
                    title: newTitle,
                    content,
                    visibility: wikiVisibility
                }
            });
            console.log(`Wiki article updated for ${newTitle}`);
        } else {
            await createWikiArticle(newTitle, content, categoryName, visibility);
        }
    } catch (error) {
        console.error('Error updating wiki article:', error);
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
exports.updateRace = async (req, res) => {
    try {
        const races = readJsonFile('races.json');
        const { name } = req.params;
        const index = races.findIndex(r => r.nom === name);
        
        if (index !== -1) {
            // Merge existing data with updates
            const updatedRace = { ...races[index], ...req.body, visible: req.body.visible !== false };
            races[index] = updatedRace;
            if (writeJsonFile('races.json', races)) {
                try {
                    await updateWikiArticle(name, updatedRace.nom, formatRace(updatedRace), 'Races & Peuples', updatedRace.visible);
                } catch (wikiError) {
                    console.error('Wiki update failed:', wikiError);
                }
                res.json({ message: 'Race updated', race: updatedRace });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Race not found' });
        }
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: 'Error updating' }); 
    }
};

exports.updateClass = async (req, res) => {
    try {
        const data = readJsonFile('classes.json');
        const classes = data.classes || data; // Handle both wrapper and direct array
        const { name } = req.params;
        const index = classes.findIndex(c => c.nom === name);

        if (index !== -1) {
            // Merge existing data with updates
            const updatedClass = { ...classes[index], ...req.body, visible: req.body.visible !== false };
            classes[index] = updatedClass;
            
            // Write back the whole structure
            const dataToWrite = data.classes ? { ...data, classes } : classes;
            if (writeJsonFile('classes.json', dataToWrite)) {
                try {
                    await updateWikiArticle(name, updatedClass.nom, formatClass(updatedClass), 'Classes', updatedClass.visible);
                } catch (wikiError) {
                    console.error('Wiki update failed:', wikiError);
                }
                res.json({ message: 'Class updated', class: updatedClass });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Class not found' });
        }
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: 'Error updating' }); 
    }
};

exports.updateItem = async (req, res) => {
    try {
        const items = readJsonFile('items.json');
        const { name } = req.params;
        const index = items.findIndex(i => i.name === name);

        if (index !== -1) {
            // Merge existing data with updates
            const updatedItem = { ...items[index], ...req.body, visible: req.body.visible !== false };
            items[index] = updatedItem;
            if (writeJsonFile('items.json', items)) {
                try {
                    await updateWikiArticle(name, updatedItem.name, formatItem(updatedItem), 'Objets & Artefacts', updatedItem.visible);
                } catch (wikiError) {
                    console.error('Wiki update failed:', wikiError);
                }
                res.json({ message: 'Item updated', item: updatedItem });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: 'Error updating' }); 
    }
};

exports.updateSpell = async (req, res) => {
    try {
        const spells = readJsonFile('spells.json');
        const { name } = req.params;
        const index = spells.findIndex(s => s.nom === name);

        if (index !== -1) {
            // Merge existing data with updates
            const updatedSpell = { ...spells[index], ...req.body, visible: req.body.visible !== false };
            spells[index] = updatedSpell;
            if (writeJsonFile('spells.json', spells)) {
                try {
                    await updateWikiArticle(name, updatedSpell.nom, formatSpell(updatedSpell), 'Magie & Systèmes', updatedSpell.visible);
                } catch (wikiError) {
                    console.error('Wiki update failed:', wikiError);
                }
                res.json({ message: 'Spell updated', spell: updatedSpell });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Spell not found' });
        }
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: 'Error updating' }); 
    }
};

exports.updateFeat = async (req, res) => {
    try {
        const feats = readJsonFile('feats.json');
        const { name } = req.params;
        const index = feats.findIndex(f => f.nom === name);

        if (index !== -1) {
            // Merge existing data with updates
            const updatedFeat = { ...feats[index], ...req.body, visible: req.body.visible !== false };
            feats[index] = updatedFeat;
            if (writeJsonFile('feats.json', feats)) {
                try {
                    await updateWikiArticle(name, updatedFeat.nom, formatFeat(updatedFeat), 'Magie & Systèmes', updatedFeat.visible);
                } catch (wikiError) {
                    console.error('Wiki update failed:', wikiError);
                }
                res.json({ message: 'Feat updated', feat: updatedFeat });
            } else {
                 res.status(500).json({ message: 'Failed to write' });
            }
        } else {
            res.status(404).json({ message: 'Feat not found' });
        }
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: 'Error updating' }); 
    }
};
