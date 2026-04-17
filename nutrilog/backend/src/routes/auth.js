const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, ctrl.updateProfile);
router.put('/password', authenticate, ctrl.changePassword);
router.post('/resend-verification', authenticate, ctrl.resendVerification);
router.put('/goals', authenticate, ctrl.updateGoals);
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), ctrl.updateAvatar);

module.exports = router;
