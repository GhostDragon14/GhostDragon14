const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/weightController');
const { authenticate } = require('../middleware/auth');
const { requirePremium } = require('../middleware/subscription');

router.use(authenticate, requirePremium);
router.post('/', ctrl.logWeight);
router.get('/history', ctrl.getWeightHistory);
router.delete('/:id', ctrl.deleteWeightLog);

module.exports = router;
