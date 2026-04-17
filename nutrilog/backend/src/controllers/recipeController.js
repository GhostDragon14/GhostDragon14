const prisma = require('../config/database');

const WEEKLY_FREE_LIMIT = 2;

exports.getRecipes = async (req, res) => {
  try {
    const { limit = 20, offset = 0, search } = req.query;
    const where = { userId: req.user.id };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({ where, orderBy: { createdAt: 'desc' }, take: parseInt(limit), skip: parseInt(offset), include: { ingredients: true } }),
      prisma.recipe.count({ where }),
    ]);
    res.json({ recipes, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recipes' });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    if (req.user.subscription === 'FREE') {
      const weekStart = getWeekStart(new Date());
      const count = await prisma.recipe.count({ where: { userId: req.user.id, createdAt: { gte: weekStart } } });
      if (count >= WEEKLY_FREE_LIMIT) {
        return res.status(403).json({ error: 'Free plan limit: 2 recipes per week', upgradeRequired: true });
      }
    }
    const { name, description, servings, prepTime, cookTime, instructions, isPublic, tags, ingredients } = req.body;
    if (!name || !ingredients?.length) return res.status(400).json({ error: 'Name and ingredients required' });
    const calories = ingredients.reduce((s, i) => s + (parseFloat(i.calories) || 0), 0);
    const protein = ingredients.reduce((s, i) => s + (parseFloat(i.protein) || 0), 0);
    const carbs = ingredients.reduce((s, i) => s + (parseFloat(i.carbs) || 0), 0);
    const fat = ingredients.reduce((s, i) => s + (parseFloat(i.fat) || 0), 0);
    const recipe = await prisma.recipe.create({
      data: {
        userId: req.user.id, name, description: description || null,
        servings: parseInt(servings) || 1,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        instructions: instructions || null, isPublic: !!isPublic,
        tags: tags || [], calories, protein, carbs, fat,
        ingredients: { create: ingredients.map(i => ({ name: i.name, amount: parseFloat(i.amount), unit: i.unit, calories: parseFloat(i.calories) || 0, protein: parseFloat(i.protein) || 0, carbs: parseFloat(i.carbs) || 0, fat: parseFloat(i.fat) || 0 })) },
      },
      include: { ingredients: true },
    });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recipe' });
  }
};

exports.getRecipe = async (req, res) => {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: { id: req.params.id, OR: [{ userId: req.user.id }, { isPublic: true }] },
      include: { ingredients: true },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recipe' });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const existing = await prisma.recipe.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Recipe not found' });
    const { name, description, servings, instructions, isPublic, tags, ingredients } = req.body;
    let updateData = { name: name || existing.name, description, servings: servings ? parseInt(servings) : existing.servings, instructions, isPublic: isPublic !== undefined ? !!isPublic : existing.isPublic, tags: tags || existing.tags };
    if (ingredients?.length) {
      updateData.calories = ingredients.reduce((s, i) => s + (parseFloat(i.calories) || 0), 0);
      updateData.protein = ingredients.reduce((s, i) => s + (parseFloat(i.protein) || 0), 0);
      updateData.carbs = ingredients.reduce((s, i) => s + (parseFloat(i.carbs) || 0), 0);
      updateData.fat = ingredients.reduce((s, i) => s + (parseFloat(i.fat) || 0), 0);
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: req.params.id } });
      updateData.ingredients = { create: ingredients.map(i => ({ name: i.name, amount: parseFloat(i.amount), unit: i.unit, calories: parseFloat(i.calories) || 0, protein: parseFloat(i.protein) || 0, carbs: parseFloat(i.carbs) || 0, fat: parseFloat(i.fat) || 0 })) };
    }
    const recipe = await prisma.recipe.update({ where: { id: req.params.id }, data: updateData, include: { ingredients: true } });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const existing = await prisma.recipe.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Recipe not found' });
    await prisma.recipe.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

exports.getPublicRecipes = async (req, res) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query;
    const where = { isPublic: true };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({ where, orderBy: { createdAt: 'desc' }, take: parseInt(limit), skip: parseInt(offset), include: { ingredients: true } }),
      prisma.recipe.count({ where }),
    ]);
    res.json({ recipes, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get public recipes' });
  }
};

const getWeekStart = (date) => { const d = new Date(date); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d; };
