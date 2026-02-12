const express = require('express');
const router = express.Router();
const enemyController = require('../controllers/enemyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Enemy Types
router.get('/types', enemyController.getEnemyTypes);
router.get('/types/:id', enemyController.getEnemyType);
router.post('/types', enemyController.createEnemyType);
router.put('/types/:id', enemyController.updateEnemyType);
router.delete('/types/:id', enemyController.deleteEnemyType);
router.post('/types/import', enemyController.importFromJSON);

// AI Generation
router.post('/generate-ai', enemyController.generateWithAI);

// Enemy Instances
router.get('/instances', enemyController.getEnemyInstances);
router.post('/instances', enemyController.createEnemyInstance);
router.put('/instances/:id', enemyController.updateEnemyInstance);
router.delete('/instances/:id', enemyController.deleteEnemyInstance);

module.exports = router;
