const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const PLANS = {
  PREMIUM: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    name: 'Premium',
    amount: 1000,
    currency: 'usd',
    interval: 'month',
    tier: 'PREMIUM',
  },
  PREMIUM_PLUS: {
    priceId: process.env.STRIPE_PREMIUM_PLUS_PRICE_ID,
    name: 'Premium Plus',
    amount: 2000,
    currency: 'usd',
    interval: 'month',
    tier: 'PREMIUM_PLUS',
  },
};

module.exports = { stripe, PLANS };
