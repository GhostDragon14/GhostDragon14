const prisma = require('../config/database');

exports.logWater = async (req, res) => {
  try {
    const { amountMl, date } = req.body;
    if (!amountMl) return res.status(400).json({ error: 'Amount required' });
    const log = await prisma.waterLog.create({
      data: { userId: req.user.id, amountMl: parseFloat(amountMl), date: date ? new Date(date) : new Date() },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log water' });
  }
};

exports.getDailyWater = async (req, res) => {
  try {
    const { date } = req.query;
    const target = date ? new Date(date) : new Date();
    const start = new Date(target); start.setHours(0, 0, 0, 0);
    const end = new Date(target); end.setHours(23, 59, 59, 999);
    const [logs, goals] = await Promise.all([
      prisma.waterLog.findMany({ where: { userId: req.user.id, date: { gte: start, lte: end } }, orderBy: { createdAt: 'asc' } }),
      prisma.nutritionGoal.findUnique({ where: { userId: req.user.id } }),
    ]);
    const totalMl = logs.reduce((s, l) => s + l.amountMl, 0);
    res.json({ logs, totalMl, goalMl: goals?.waterMl || 2000 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get water logs' });
  }
};

exports.deleteWaterLog = async (req, res) => {
  try {
    const log = await prisma.waterLog.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ error: 'Not found' });
    await prisma.waterLog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
