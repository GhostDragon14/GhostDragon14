const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recipeController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getRecipes);
router.post('/', ctrl.createRecipe);
router.get('/public', ctrl.getPublicRecipes);
router.get('/:id', ctrl.getRecipe);
router.put('/:id', ctrl.updateRecipe);
router.delete('/:id', ctrl.deleteRecipe);

module.exports = router;
