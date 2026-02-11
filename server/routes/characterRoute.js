const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', characterController.createCharacter);
router.get('/', characterController.getCharacters);
router.get('/:id', characterController.getCharacter);
router.put('/:id', characterController.updateCharacter);
router.post('/:id/level-up', characterController.levelUp);
router.delete('/:id', characterController.deleteCharacter);

module.exports = router;
