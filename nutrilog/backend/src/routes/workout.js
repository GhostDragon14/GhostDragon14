const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workoutController');
const { authenticate } = require('../middleware/auth');
const { requirePremium } = require('../middleware/subscription');

router.use(authenticate, requirePremium);
router.post('/', ctrl.logWorkout);
router.get('/', ctrl.getWorkouts);
router.get('/:id', ctrl.getWorkout);
router.put('/:id', ctrl.updateWorkout);
router.delete('/:id', ctrl.deleteWorkout);
router.get('/schedule/week', ctrl.getSchedule);
router.post('/schedule', ctrl.createSchedule);
router.patch('/schedule/:id/toggle', ctrl.toggleScheduleComplete);
router.delete('/schedule/:id', ctrl.deleteSchedule);

module.exports = router;
