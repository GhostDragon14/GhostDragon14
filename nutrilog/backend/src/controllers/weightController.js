const prisma = require('../config/database');
const { calculateBMI } = require('../utils/calculations');

exports.logWeight = async (req, res) => {
  try {
    const { weight, unit, date, note } = req.body;
    if (!weight) return res.status(400).json({ error: 'Weight required' });
    const log = await prisma.weightLog.create({
      data: { userId: req.user.id, weight: parseFloat(weight), unit: unit || 'kg', date: date ? new Date(date) : new Date(), note: note || null },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log weight' });
  }
};

exports.getWeightHistory = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const start = new Date(); start.setDate(start.getDate() - parseInt(days));
    const [logs, user] = await Promise.all([
      prisma.weightLog.findMany({ where: { userId: req.user.id, date: { gte: start } }, orderBy: { date: 'asc' } }),
      prisma.user.findUnique({ where: { id: req.user.id }, select: { heightCm: true } }),
    ]);
    const latest = logs[logs.length - 1];
    let bmi = null;
    if (latest && user.heightCm) {
      const weightKg = latest.unit === 'lbs' ? latest.weight * 0.453592 : latest.weight;
      bmi = calculateBMI(weightKg, user.heightCm);
    }
    res.json({ logs, bmi, latest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weight history' });
  }
};

exports.deleteWeightLog = async (req, res) => {
  try {
    const log = await prisma.weightLog.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ error: 'Not found' });
    await prisma.weightLog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
