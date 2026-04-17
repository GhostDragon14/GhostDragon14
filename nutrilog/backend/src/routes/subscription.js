const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

router.get('/plans', ctrl.getPlans);
router.post('/webhook', ctrl.webhook);
router.get('/status', authenticate, ctrl.getStatus);
router.post('/checkout', authenticate, ctrl.createCheckout);
router.post('/portal', authenticate, ctrl.createPortal);
router.post('/cancel', authenticate, ctrl.cancel);

module.exports = router;
