const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/waterController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', ctrl.logWater);
router.get('/', ctrl.getDailyWater);
router.delete('/:id', ctrl.deleteWaterLog);

module.exports = router;
