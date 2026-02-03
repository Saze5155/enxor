const express = require('express');
const router = express.Router();
const wikiController = require('../controllers/wikiController');
const { authenticateToken, requireMJ } = require('../middleware/authMiddleware');

// Public/Protected Routes (Authenticated Users)
router.get('/categories', authenticateToken, wikiController.getCategories);
router.get('/articles', authenticateToken, wikiController.getArticles);
router.get('/articles/:id', authenticateToken, wikiController.getArticle);

// MJ Only Routes (Temporarily relaxed for dev)
router.post('/categories', authenticateToken, wikiController.createCategory);
router.post('/articles', authenticateToken, wikiController.createArticle);
router.put('/articles/:id', authenticateToken, wikiController.updateArticle);

module.exports = router;
