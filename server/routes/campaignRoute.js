const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, campaignController.createCampaign); // Create
router.get('/', authenticateToken, campaignController.getMyCampaigns); // List my campaigns
router.get('/public', authenticateToken, campaignController.getPublicCampaigns); // List others
router.get('/:id', authenticateToken, campaignController.getCampaign); // Get details
router.post('/:id/join', authenticateToken, campaignController.joinCampaign); // Join existing
router.post('/:id/toggle-session', authenticateToken, campaignController.toggleSession); // Toggle status

module.exports = router;
