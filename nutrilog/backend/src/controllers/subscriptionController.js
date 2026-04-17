const { stripe, PLANS } = require('../config/stripe');
const { createCheckoutSession, createPortalSession, handleWebhookEvent } = require('../services/stripeService');
const prisma = require('../config/database');

exports.getPlans = async (req, res) => {
  res.json({
    plans: [
      { id: 'FREE', name: 'Free', price: 0, features: ['Food logging (Nutritionix + USDA)', 'Barcode scanning', '2 custom recipes/week', 'Water intake tracking', 'Daily step count', 'Email verification'] },
      { id: 'PREMIUM', name: 'Premium', price: 10, priceId: PLANS.PREMIUM.priceId, features: ['All Free features', 'Unlimited recipes', 'Advanced macro tracking', 'Workout logging', 'Weight/height tracking with graphs', 'Nutrition goal editing', 'Health app integrations', 'Workout scheduling with calendar', 'AI workout suggestions'] },
      { id: 'PREMIUM_PLUS', name: 'Premium Plus', price: 20, priceId: PLANS.PREMIUM_PLUS.priceId, features: ['All Premium features', 'Health recommendations engine', 'Progress photo uploads', 'BMI calculation', 'Average calorie graphs', 'Comprehensive analytics', 'Group challenges', 'Community groups'] },
    ]
  });
};

exports.createCheckout = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['PREMIUM', 'PREMIUM_PLUS'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const successUrl = `${process.env.FRONTEND_URL}/subscription/success`;
    const cancelUrl = `${process.env.FRONTEND_URL}/subscription`;
    const session = await createCheckoutSession(user, plan, successUrl, cancelUrl);
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

exports.createPortal = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.stripeCustomerId) return res.status(400).json({ error: 'No subscription found' });
    const session = await createPortalSession(user, `${process.env.FRONTEND_URL}/settings`);
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create portal session' });
  }
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed` });
  }
  try {
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { subscription: true, subscriptionEnd: true, stripeSubId: true } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

exports.cancel = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.stripeSubId) return res.status(400).json({ error: 'No active subscription' });
    await stripe.subscriptions.update(user.stripeSubId, { cancel_at_period_end: true });
    res.json({ message: 'Subscription will cancel at end of billing period' });
  } catch (err) {
    res.status(500).json({ error: 'Cancellation failed' });
  }
};
