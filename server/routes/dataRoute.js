const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/classes', dataController.getClasses);
router.get('/races', dataController.getRaces);
router.get('/spells', dataController.getSpells);
router.get('/items', dataController.getItems);
router.get('/feats', dataController.getFeats);
router.get('/backgrounds', dataController.getBackgrounds);

module.exports = router;
