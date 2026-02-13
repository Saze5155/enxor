const express = require('express');
const router = express.Router();
const combatController = require('../controllers/combatController');

// Gestion du combat
router.post('/start', combatController.startCombat);
router.get('/:id', combatController.getCombat);
router.post('/:id/end', combatController.endCombat);

// Initiative
router.post('/:id/initiative', combatController.rollInitiative);

// Tours et rounds
router.post('/:id/next-turn', combatController.nextTurn);
router.post('/:id/next-round', combatController.nextRound);

// Actions
router.post('/:id/action', combatController.executeAction);

// Gestion des participants
router.patch('/:id/participant/:participantId/hp', combatController.updateHP);
router.post('/:id/participant/:participantId/condition', combatController.addCondition);
router.delete('/:id/participant/:participantId/condition/:conditionId', combatController.removeCondition);

module.exports = router;
