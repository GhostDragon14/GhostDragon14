const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stepsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', ctrl.logSteps);
router.get('/history', ctrl.getStepHistory);

module.exports = router;
