const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const messagesController = require('../controllers/messages');

// Chat view route
router.get('/property/:propertyId/chat', isAuth, messagesController.getChatView);

// Message routes
router.get('/property/:propertyId/messages', isAuth, messagesController.getPropertyMessages);
router.post('/user/message', isAuth, messagesController.postUserMessage); // Update this route
router.post('/agent/reply', isAuth, messagesController.postAgentReply);

// User/Agent message lists
// router.get('/user/messages', isAuth, messagesController.getUserMessages);
router.get('/agent/messages', isAuth, messagesController.getAgentMessages);

module.exports = router;