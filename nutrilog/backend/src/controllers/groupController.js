const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../services/emailService');

exports.getPublicGroups = async (req, res) => {
  try {
    const { goal, search, limit = 20 } = req.query;
    const where = { isPublic: true };
    if (goal) where.goal = goal;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const groups = await prisma.group.findMany({
      where, take: parseInt(limit), orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } } },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get groups' });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
      include: { group: { include: { _count: { select: { members: true } } } } },
    });
    res.json(memberships.map(m => ({ ...m.group, role: m.role })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get groups' });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, goal, isPublic } = req.body;
    if (!name || !goal) return res.status(400).json({ error: 'Name and goal required' });
    const group = await prisma.group.create({
      data: {
        name, description: description || null, goal, isPublic: isPublic !== false,
        createdBy: req.user.id, inviteCode: uuidv4().substring(0, 8).toUpperCase(),
        members: { create: { userId: req.user.id, role: 'ADMIN' } },
      },
      include: { _count: { select: { members: true } } },
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: { members: { include: { user: { select: { id: true, name: true, avatar: true } } } }, challenges: { include: { _count: { select: { participants: true } } } }, _count: { select: { members: true } } },
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.isPublic) {
      const isMember = group.members.some(m => m.userId === req.user.id);
      if (!isMember) return res.status(403).json({ error: 'Private group' });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get group' });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await prisma.group.findUnique({ where: { id: req.params.id } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.isPublic) return res.status(403).json({ error: 'Use invite code to join private group' });
    const existing = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: group.id, userId: req.user.id } } });
    if (existing) return res.status(409).json({ error: 'Already a member' });
    const member = await prisma.groupMember.create({ data: { groupId: group.id, userId: req.user.id } });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join group' });
  }
};

exports.joinByInviteCode = async (req, res) => {
  try {
    const { code } = req.body;
    const group = await prisma.group.findUnique({ where: { inviteCode: code?.toUpperCase() } });
    if (!group) return res.status(404).json({ error: 'Invalid invite code' });
    const existing = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: group.id, userId: req.user.id } } });
    if (existing) return res.status(409).json({ error: 'Already a member' });
    const member = await prisma.groupMember.create({ data: { groupId: group.id, userId: req.user.id } });
    res.status(201).json({ member, group });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join group' });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const member = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: req.params.id, userId: req.user.id } } });
    if (!member) return res.status(404).json({ error: 'Not a member' });
    await prisma.groupMember.delete({ where: { id: member.id } });
    res.json({ message: 'Left group' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave group' });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    const { name, description, type, goal, startDate, endDate } = req.body;
    const adminMember = await prisma.groupMember.findFirst({ where: { groupId: req.params.id, userId: req.user.id, role: 'ADMIN' } });
    if (!adminMember) return res.status(403).json({ error: 'Admin only' });
    const challenge = await prisma.challenge.create({
      data: { groupId: req.params.id, name, description: description || null, type, goal: parseFloat(goal), startDate: new Date(startDate), endDate: new Date(endDate) },
    });
    res.status(201).json(challenge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await prisma.challenge.findUnique({ where: { id: req.params.challengeId } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    const participant = await prisma.challengeParticipant.create({ data: { challengeId: challenge.id, userId: req.user.id } });
    res.status(201).json(participant);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already joined' });
    res.status(500).json({ error: 'Failed to join challenge' });
  }
};
