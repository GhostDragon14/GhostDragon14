const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);
router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.put('/users/:id', ctrl.updateUser);
router.get('/diseases', ctrl.getDiseases);
router.post('/diseases', ctrl.createDisease);
router.put('/diseases/:id', ctrl.updateDisease);
router.delete('/diseases/:id', ctrl.deleteDisease);

module.exports = router;
