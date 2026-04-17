const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const verifyToken = uuidv4();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashed,
        name: name.trim(),
        verifyToken,
        verifyTokenExp,
        goals: { create: {} },
      },
      select: { id: true, email: true, name: true, subscription: true, emailVerified: true, role: true },
    });
    await sendVerificationEmail(user, verifyToken);
    const token = signToken(user.id);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const user = await prisma.user.findFirst({
      where: { verifyToken: token, verifyTokenExp: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
    });
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });
    const verifyToken = uuidv4();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { verifyToken, verifyTokenExp } });
    await sendVerificationEmail(user, verifyToken);
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend verification' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent' });
    const resetToken = uuidv4();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExp } });
    await sendPasswordResetEmail(user, resetToken);
    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExp: null },
    });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, name: true, avatar: true, emailVerified: true,
        subscription: true, language: true, theme: true, heightCm: true,
        weightUnit: true, heightUnit: true, role: true, createdAt: true,
        subscriptionEnd: true, goals: true,
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, language, theme, heightCm, weightUnit, heightUnit } = req.body;
    const data = {};
    if (name) data.name = name.trim();
    if (language && ['en', 'es', 'fr'].includes(language)) data.language = language;
    if (theme && ['light', 'dark'].includes(theme)) data.theme = theme;
    if (heightCm) data.heightCm = parseFloat(heightCm);
    if (weightUnit) data.weightUnit = weightUnit;
    if (heightUnit) data.heightUnit = heightUnit;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, name: true, avatar: true, language: true, theme: true, heightCm: true, weightUnit: true, heightUnit: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: req.file.path },
      select: { id: true, avatar: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Avatar upload failed' });
  }
};

exports.updateGoals = async (req, res) => {
  try {
    const { calories, protein, carbs, fat, fiber, sodium, waterMl, steps, weightTarget, activityLevel } = req.body;
    const data = {};
    if (calories !== undefined) data.calories = parseInt(calories);
    if (protein !== undefined) data.protein = parseInt(protein);
    if (carbs !== undefined) data.carbs = parseInt(carbs);
    if (fat !== undefined) data.fat = parseInt(fat);
    if (fiber !== undefined) data.fiber = parseInt(fiber);
    if (sodium !== undefined) data.sodium = parseInt(sodium);
    if (waterMl !== undefined) data.waterMl = parseInt(waterMl);
    if (steps !== undefined) data.steps = parseInt(steps);
    if (weightTarget !== undefined) data.weightTarget = parseFloat(weightTarget);
    if (activityLevel) data.activityLevel = activityLevel;
    const goals = await prisma.nutritionGoal.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Goals update failed' });
  }
};
