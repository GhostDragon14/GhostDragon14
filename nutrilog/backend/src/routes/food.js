const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/foodController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/search', ctrl.search);
router.post('/nutrition', ctrl.getNutrition);
router.get('/barcode/:barcode', ctrl.getByBarcode);
router.get('/usda/:fdcId', ctrl.getUSDADetails);
router.post('/log', ctrl.logFood);
router.get('/log', ctrl.getDailyLog);
router.put('/log/:id', ctrl.updateFoodLog);
router.delete('/log/:id', ctrl.deleteFoodLog);

module.exports = router;
