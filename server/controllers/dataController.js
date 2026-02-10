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
