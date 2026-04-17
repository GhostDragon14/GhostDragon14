const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/photoController');
const { authenticate } = require('../middleware/auth');
const { requirePremiumPlus } = require('../middleware/subscription');
const { uploadPhoto } = require('../config/cloudinary');

router.use(authenticate, requirePremiumPlus);
router.post('/', uploadPhoto.single('photo'), ctrl.uploadPhoto);
router.get('/', ctrl.getPhotos);
router.delete('/:id', ctrl.deletePhoto);

module.exports = router;
