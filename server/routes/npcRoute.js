const express = require('express');
const router = express.Router();
const npcController = require('../controllers/npcController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// NPC CRUD
router.get('/', npcController.getNPCs);
router.get('/:id', npcController.getNPC);
router.post('/', npcController.createNPC);
router.put('/:id', npcController.updateNPC);
router.delete('/:id', npcController.deleteNPC);

// AI Generation
router.post('/generate-ai', npcController.generateWithAI);

module.exports = router;
