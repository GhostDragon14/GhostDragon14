const prisma = require('../config/database');
const nutritionix = require('../services/nutritionixService');
const usda = require('../services/usdaService');

exports.search = async (req, res) => {
  try {
    const { q, source = 'nutritionix' } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ error: 'Query must be at least 2 characters' });
    let results = [];
    if (source === 'usda') {
      results = await usda.searchFood(q);
    } else {
      results = await nutritionix.searchFood(q);
    }
    res.json(results);
  } catch (err) {
    console.error('Food search error:', err.message);
    res.status(500).json({ error: 'Food search failed' });
  }
};

exports.getNutrition = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });
    const data = await nutritionix.getNutritionByName(query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get nutrition data' });
  }
};

exports.getByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const food = await nutritionix.getByBarcode(barcode);
    if (!food) {
      const usdaResult = await usda.searchFood(barcode, 5);
      return res.json(usdaResult[0] || null);
    }
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: 'Barcode lookup failed' });
  }
};

exports.getUSDADetails = async (req, res) => {
  try {
    const { fdcId } = req.params;
    const food = await usda.getFoodDetails(fdcId);
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get food details' });
  }
};

exports.logFood = async (req, res) => {
  try {
    const { foodName, brandName, calories, protein, carbs, fat, fiber, sugar, sodium, saturatedFat, cholesterol, serving, servingUnit, mealType, date, barcode, source, externalId } = req.body;
    if (!foodName || !calories || !mealType || !date) return res.status(400).json({ error: 'Required fields missing' });
    const log = await prisma.foodLog.create({
      data: {
        userId: req.user.id,
        foodName,
        brandName: brandName || null,
        calories: parseFloat(calories),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
        sugar: parseFloat(sugar) || 0,
        sodium: parseFloat(sodium) || 0,
        saturatedFat: parseFloat(saturatedFat) || 0,
        cholesterol: parseFloat(cholesterol) || 0,
        serving: parseFloat(serving) || 1,
        servingUnit: servingUnit || 'serving',
        mealType,
        date: new Date(date),
        barcode: barcode || null,
        source: source || 'manual',
        externalId: externalId || null,
      },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log food' });
  }
};

exports.getDailyLog = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate); end.setHours(23, 59, 59, 999);
    const logs = await prisma.foodLog.findMany({
      where: { userId: req.user.id, date: { gte: start, lte: end } },
      orderBy: { createdAt: 'asc' },
    });
    const totals = logs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
      fiber: acc.fiber + log.fiber,
      sodium: acc.sodium + log.sodium,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });
    const byMeal = { BREAKFAST: [], LUNCH: [], DINNER: [], SNACK: [] };
    logs.forEach(log => byMeal[log.mealType]?.push(log));
    res.json({ logs, totals, byMeal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get food log' });
  }
};

exports.updateFoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await prisma.foodLog.findFirst({ where: { id, userId: req.user.id } });
    if (!log) return res.status(404).json({ error: 'Food log not found' });
    const { serving, mealType, calories, protein, carbs, fat } = req.body;
    const updated = await prisma.foodLog.update({
      where: { id },
      data: {
        serving: serving ? parseFloat(serving) : log.serving,
        mealType: mealType || log.mealType,
        calories: calories ? parseFloat(calories) : log.calories,
        protein: protein !== undefined ? parseFloat(protein) : log.protein,
        carbs: carbs !== undefined ? parseFloat(carbs) : log.carbs,
        fat: fat !== undefined ? parseFloat(fat) : log.fat,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteFoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await prisma.foodLog.findFirst({ where: { id, userId: req.user.id } });
    if (!log) return res.status(404).json({ error: 'Food log not found' });
    await prisma.foodLog.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
