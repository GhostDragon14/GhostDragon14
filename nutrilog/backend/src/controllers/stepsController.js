const prisma = require('../config/database');

exports.logSteps = async (req, res) => {
  try {
    const { steps, date, source } = req.body;
    if (!steps) return res.status(400).json({ error: 'Steps required' });
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate); end.setHours(23, 59, 59, 999);
    const existing = await prisma.stepLog.findFirst({ where: { userId: req.user.id, date: { gte: start, lte: end } } });
    let log;
    if (existing) {
      log = await prisma.stepLog.update({ where: { id: existing.id }, data: { steps: parseInt(steps), source: source || 'manual' } });
    } else {
      log = await prisma.stepLog.create({ data: { userId: req.user.id, steps: parseInt(steps), date: targetDate, source: source || 'manual' } });
    }
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log steps' });
  }
};

exports.getStepHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const start = new Date(); start.setDate(start.getDate() - parseInt(days));
    const [logs, goals] = await Promise.all([
      prisma.stepLog.findMany({ where: { userId: req.user.id, date: { gte: start } }, orderBy: { date: 'asc' } }),
      prisma.nutritionGoal.findUnique({ where: { userId: req.user.id } }),
    ]);
    res.json({ logs, goal: goals?.steps || 10000 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get step history' });
  }
};
