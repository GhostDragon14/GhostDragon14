const prisma = require('../config/database');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, premiumUsers, ppUsers, totalFoodLogs, totalWorkouts, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscription: 'PREMIUM' } }),
      prisma.user.count({ where: { subscription: 'PREMIUM_PLUS' } }),
      prisma.foodLog.count(),
      prisma.workout.count(),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, email: true, name: true, subscription: true, emailVerified: true, createdAt: true, role: true } }),
    ]);
    res.json({ stats: { totalUsers, premiumUsers, ppUsers, freeUsers: totalUsers - premiumUsers - ppUsers, totalFoodLogs, totalWorkouts }, recentUsers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, subscription, limit = 20, offset = 0 } = req.query;
    const where = {};
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }];
    if (subscription) where.subscription = subscription;
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, take: parseInt(limit), skip: parseInt(offset), orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, subscription: true, emailVerified: true, role: true, createdAt: true } }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { subscription, role, emailVerified } = req.body;
    const data = {};
    if (subscription) data.subscription = subscription;
    if (role) data.role = role;
    if (emailVerified !== undefined) data.emailVerified = emailVerified;
    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: { id: true, email: true, name: true, subscription: true, role: true, emailVerified: true } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.getDiseases = async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;
    const diseases = await prisma.disease.findMany({ where, orderBy: { name: 'asc' } });
    res.json(diseases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get diseases' });
  }
};

exports.createDisease = async (req, res) => {
  try {
    const { name, description, symptoms, dietaryRecs, exerciseRecs, avoidFoods, goodFoods, category, icdCode } = req.body;
    const disease = await prisma.disease.create({ data: { name, description, symptoms: symptoms || [], dietaryRecs: dietaryRecs || [], exerciseRecs: exerciseRecs || [], avoidFoods: avoidFoods || [], goodFoods: goodFoods || [], category, icdCode: icdCode || null } });
    res.status(201).json(disease);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create disease' });
  }
};

exports.updateDisease = async (req, res) => {
  try {
    const disease = await prisma.disease.update({ where: { id: req.params.id }, data: req.body });
    res.json(disease);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteDisease = async (req, res) => {
  try {
    await prisma.disease.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
