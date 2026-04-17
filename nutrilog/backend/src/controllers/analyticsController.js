const prisma = require('../config/database');
const { calculateBMI, calculateMacroPercentages, caloriesBurnedFromSteps } = require('../utils/calculations');

exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);
    const [foodLogs, waterLogs, stepLog, workouts, goals, latestWeight, user] = await Promise.all([
      prisma.foodLog.findMany({ where: { userId: req.user.id, date: { gte: today, lte: todayEnd } } }),
      prisma.waterLog.findMany({ where: { userId: req.user.id, date: { gte: today, lte: todayEnd } } }),
      prisma.stepLog.findFirst({ where: { userId: req.user.id, date: { gte: today, lte: todayEnd } } }),
      prisma.workout.findMany({ where: { userId: req.user.id, date: { gte: today, lte: todayEnd } } }),
      prisma.nutritionGoal.findUnique({ where: { userId: req.user.id } }),
      prisma.weightLog.findFirst({ where: { userId: req.user.id }, orderBy: { date: 'desc' } }),
      prisma.user.findUnique({ where: { id: req.user.id }, select: { heightCm: true } }),
    ]);
    const caloriesIn = foodLogs.reduce((s, l) => s + l.calories, 0);
    const protein = foodLogs.reduce((s, l) => s + l.protein, 0);
    const carbs = foodLogs.reduce((s, l) => s + l.carbs, 0);
    const fat = foodLogs.reduce((s, l) => s + l.fat, 0);
    const waterMl = waterLogs.reduce((s, l) => s + l.amountMl, 0);
    const steps = stepLog?.steps || 0;
    const caloriesBurned = workouts.reduce((s, w) => s + w.calories, 0) + caloriesBurnedFromSteps(steps, latestWeight?.weight);
    let bmi = null;
    if (latestWeight && user.heightCm) {
      const wKg = latestWeight.unit === 'lbs' ? latestWeight.weight * 0.453592 : latestWeight.weight;
      bmi = calculateBMI(wKg, user.heightCm);
    }
    res.json({
      today: { caloriesIn: Math.round(caloriesIn), caloriesBurned: Math.round(caloriesBurned), net: Math.round(caloriesIn - caloriesBurned), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat), waterMl: Math.round(waterMl), steps, workoutCount: workouts.length },
      goals: goals || {},
      bmi,
      latestWeight,
      macroPercentages: calculateMacroPercentages(protein, carbs, fat),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get summary' });
  }
};

exports.getCalorieHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const start = new Date(); start.setDate(start.getDate() - parseInt(days)); start.setHours(0, 0, 0, 0);
    const logs = await prisma.foodLog.findMany({ where: { userId: req.user.id, date: { gte: start } }, orderBy: { date: 'asc' } });
    const byDay = {};
    logs.forEach(log => {
      const key = log.date.toISOString().split('T')[0];
      if (!byDay[key]) byDay[key] = { date: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
      byDay[key].calories += log.calories;
      byDay[key].protein += log.protein;
      byDay[key].carbs += log.carbs;
      byDay[key].fat += log.fat;
    });
    const data = Object.values(byDay).map(d => ({ ...d, calories: Math.round(d.calories), protein: Math.round(d.protein), carbs: Math.round(d.carbs), fat: Math.round(d.fat) }));
    const avg = data.length ? Math.round(data.reduce((s, d) => s + d.calories, 0) / data.length) : 0;
    res.json({ data, average: avg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get calorie history' });
  }
};

exports.getWeightTrend = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const start = new Date(); start.setDate(start.getDate() - parseInt(days));
    const logs = await prisma.weightLog.findMany({ where: { userId: req.user.id, date: { gte: start } }, orderBy: { date: 'asc' } });
    const trend = logs.length >= 2 ? (logs[logs.length - 1].weight - logs[0].weight).toFixed(1) : null;
    res.json({ data: logs, trend: trend !== null ? parseFloat(trend) : null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weight trend' });
  }
};

exports.getMacroBreakdown = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const start = new Date(); start.setDate(start.getDate() - parseInt(days));
    const logs = await prisma.foodLog.findMany({ where: { userId: req.user.id, date: { gte: start } } });
    const totals = logs.reduce((acc, l) => ({ protein: acc.protein + l.protein, carbs: acc.carbs + l.carbs, fat: acc.fat + l.fat }), { protein: 0, carbs: 0, fat: 0 });
    const avg = { protein: Math.round(totals.protein / parseInt(days)), carbs: Math.round(totals.carbs / parseInt(days)), fat: Math.round(totals.fat / parseInt(days)) };
    res.json({ totals, average: avg, percentages: calculateMacroPercentages(totals.protein, totals.carbs, totals.fat) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get macro breakdown' });
  }
};

exports.getWorkoutStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const start = new Date(); start.setDate(start.getDate() - parseInt(days));
    const workouts = await prisma.workout.findMany({ where: { userId: req.user.id, date: { gte: start } } });
    const byCategory = workouts.reduce((acc, w) => { acc[w.category] = (acc[w.category] || 0) + 1; return acc; }, {});
    const totalMinutes = workouts.reduce((s, w) => s + w.duration, 0);
    const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);
    res.json({ total: workouts.length, totalMinutes, totalCalories: Math.round(totalCalories), byCategory, avgDuration: workouts.length ? Math.round(totalMinutes / workouts.length) : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get workout stats' });
  }
};
