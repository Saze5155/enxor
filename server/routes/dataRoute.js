const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/classes', dataController.getClasses);
router.get('/races', dataController.getRaces);
router.get('/spells', dataController.getSpells);
router.get('/items', dataController.getItems);
router.get('/feats', dataController.getFeats);
router.get('/backgrounds', dataController.getBackgrounds);

// Create Routes
router.post('/races', dataController.createRace);
router.post('/classes', dataController.createClass);
router.post('/items', dataController.createItem);
router.post('/spells', dataController.createSpell);
router.post('/feats', dataController.createFeat);

// Update Routes
router.put('/races/:name', dataController.updateRace);
router.put('/classes/:name', dataController.updateClass);
router.put('/items/:name', dataController.updateItem);
router.put('/spells/:name', dataController.updateSpell);
router.put('/feats/:name', dataController.updateFeat);

module.exports = router;
