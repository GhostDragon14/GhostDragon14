const prisma = require('../config/database');

exports.logWorkout = async (req, res) => {
  try {
    const { name, category, duration, calories, notes, date, exercises } = req.body;
    if (!name || !category || !duration || !date) return res.status(400).json({ error: 'Required fields missing' });
    const workout = await prisma.workout.create({
      data: {
        userId: req.user.id, name, category, duration: parseInt(duration),
        calories: parseFloat(calories) || 0, notes: notes || null, date: new Date(date),
        exercises: exercises?.length ? {
          create: exercises.map(e => ({
            name: e.name, sets: e.sets ? parseInt(e.sets) : null,
            reps: e.reps ? parseInt(e.reps) : null,
            weightKg: e.weightKg ? parseFloat(e.weightKg) : null,
            durationSec: e.durationSec ? parseInt(e.durationSec) : null,
            distanceKm: e.distanceKm ? parseFloat(e.distanceKm) : null,
            restSec: e.restSec ? parseInt(e.restSec) : null,
            notes: e.notes || null,
          }))
        } : undefined,
      },
      include: { exercises: true },
    });
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log workout' });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    const { start, end, category, limit = 20, offset = 0 } = req.query;
    const where = { userId: req.user.id };
    if (start || end) {
      where.date = {};
      if (start) where.date.gte = new Date(start);
      if (end) where.date.lte = new Date(end);
    }
    if (category) where.category = category;
    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({ where, orderBy: { date: 'desc' }, take: parseInt(limit), skip: parseInt(offset), include: { exercises: true } }),
      prisma.workout.count({ where }),
    ]);
    res.json({ workouts, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get workouts' });
  }
};

exports.getWorkout = async (req, res) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { exercises: true },
    });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get workout' });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.workout.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Workout not found' });
    const { name, category, duration, calories, notes, completed } = req.body;
    const updated = await prisma.workout.update({
      where: { id },
      data: {
        name: name || existing.name, category: category || existing.category,
        duration: duration ? parseInt(duration) : existing.duration,
        calories: calories !== undefined ? parseFloat(calories) : existing.calories,
        notes: notes !== undefined ? notes : existing.notes,
        completed: completed !== undefined ? completed : existing.completed,
      },
      include: { exercises: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const existing = await prisma.workout.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Workout not found' });
    await prisma.workout.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const start = weekStart ? new Date(weekStart) : getWeekStart(new Date());
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const schedules = await prisma.workoutSchedule.findMany({
      where: { userId: req.user.id, weekStart: { gte: start, lte: end } },
      orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
    });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get schedule' });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { name, category, dayOfWeek, time, notes, weekStart } = req.body;
    const start = weekStart ? new Date(weekStart) : getWeekStart(new Date());
    const schedule = await prisma.workoutSchedule.create({
      data: { userId: req.user.id, name, category, dayOfWeek: parseInt(dayOfWeek), time: time || null, notes: notes || null, weekStart: start },
    });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

exports.toggleScheduleComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await prisma.workoutSchedule.findFirst({ where: { id, userId: req.user.id } });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    const updated = await prisma.workoutSchedule.update({ where: { id }, data: { completed: !schedule.completed } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Toggle failed' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const existing = await prisma.workoutSchedule.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.workoutSchedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};
