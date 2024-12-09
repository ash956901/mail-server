const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/send', emailController.sendEmail);
router.get('/inbox', emailController.getInbox);
router.get('/:id', emailController.getEmail);
router.post('/:emailId/read', emailController.markAsRead);

module.exports = router;
