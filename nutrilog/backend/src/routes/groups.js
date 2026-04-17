const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/groupController');
const { authenticate } = require('../middleware/auth');
const { requirePremiumPlus } = require('../middleware/subscription');

router.use(authenticate, requirePremiumPlus);
router.get('/', ctrl.getPublicGroups);
router.get('/mine', ctrl.getMyGroups);
router.post('/', ctrl.createGroup);
router.post('/join-code', ctrl.joinByInviteCode);
router.get('/:id', ctrl.getGroup);
router.post('/:id/join', ctrl.joinGroup);
router.delete('/:id/leave', ctrl.leaveGroup);
router.post('/:id/challenges', ctrl.createChallenge);
router.post('/:id/challenges/:challengeId/join', ctrl.joinChallenge);

module.exports = router;
