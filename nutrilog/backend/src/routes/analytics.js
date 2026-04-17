const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/summary', ctrl.getDashboardSummary);
router.get('/calories', ctrl.getCalorieHistory);
router.get('/weight-trend', ctrl.getWeightTrend);
router.get('/macros', ctrl.getMacroBreakdown);
router.get('/workouts', ctrl.getWorkoutStats);

module.exports = router;
