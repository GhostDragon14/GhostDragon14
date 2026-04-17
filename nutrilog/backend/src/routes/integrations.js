const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePremium } = require('../middleware/subscription');
const prisma = require('../config/database');
const axios = require('axios');

router.use(authenticate, requirePremium);

// Strava OAuth initiation
router.get('/strava/auth', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: `${process.env.FRONTEND_URL}/integrations/strava/callback`,
    response_type: 'code',
    scope: 'activity:read_all',
    state: req.user.id,
  });
  res.json({ url: `https://www.strava.com/oauth/authorize?${params}` });
});

// Strava OAuth callback
router.post('/strava/callback', async (req, res) => {
  try {
    const { code } = req.body;
    const { data } = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });
    // Store tokens and fetch recent activities
    const activities = await fetchStravaActivities(data.access_token);
    // Sync activities as workouts
    const synced = await syncStravaWorkouts(req.user.id, activities);
    res.json({ message: 'Strava connected', synced });
  } catch (err) {
    res.status(500).json({ error: 'Strava connection failed' });
  }
});

// Google Fit OAuth initiation  
router.get('/google-fit/auth', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.FRONTEND_URL}/integrations/google-fit/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read',
    access_type: 'offline',
    state: req.user.id,
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

const fetchStravaActivities = async (token) => {
  const after = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const { data } = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
    headers: { Authorization: `Bearer ${token}` },
    params: { after, per_page: 50 },
  });
  return data;
};

const STRAVA_CATEGORY_MAP = {
  Run: 'RUNNING', Ride: 'CYCLING', Swim: 'SWIMMING', WeightTraining: 'STRENGTH',
  Yoga: 'YOGA', Walk: 'CARDIO', Hike: 'CARDIO',
};

const syncStravaWorkouts = async (userId, activities) => {
  let synced = 0;
  for (const act of activities) {
    const existing = await prisma.workout.findFirst({ where: { userId, source: 'strava', notes: { contains: act.id.toString() } } });
    if (existing) continue;
    await prisma.workout.create({
      data: {
        userId, name: act.name,
        category: STRAVA_CATEGORY_MAP[act.type] || 'OTHER',
        duration: Math.round(act.moving_time / 60),
        calories: act.calories || 0,
        date: new Date(act.start_date),
        source: 'strava',
        notes: `Strava ID: ${act.id}`,
      },
    });
    synced++;
  }
  return synced;
};

module.exports = router;
