require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth');
const foodRoutes = require('./src/routes/food');
const workoutRoutes = require('./src/routes/workout');
const recipeRoutes = require('./src/routes/recipe');
const waterRoutes = require('./src/routes/water');
const stepsRoutes = require('./src/routes/steps');
const weightRoutes = require('./src/routes/weight');
const groupRoutes = require('./src/routes/groups');
const photoRoutes = require('./src/routes/photos');
const analyticsRoutes = require('./src/routes/analytics');
const adminRoutes = require('./src/routes/admin');
const subscriptionRoutes = require('./src/routes/subscription');
const integrationRoutes = require('./src/routes/integrations');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook needs raw body BEFORE json parsing
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/steps', stepsRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/integrations', integrationRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`NutriLog API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
