const { stripe, PLANS } = require('../config/stripe');
const prisma = require('../config/database');
const { sendWelcomePremiumEmail } = require('./emailService');

const getOrCreateCustomer = async (user) => {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
  await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
};

const createCheckoutSession = async (user, planKey, successUrl, cancelUrl) => {
  const plan = PLANS[planKey];
  if (!plan) throw new Error('Invalid plan');
  const customerId = await getOrCreateCustomer(user);
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { userId: user.id, tier: plan.tier },
    allow_promotion_codes: true,
  });
  return session;
};

const createPortalSession = async (user, returnUrl) => {
  const customerId = await getOrCreateCustomer(user);
  const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  return session;
};

const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, tier } = session.metadata;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: tier,
          stripeSubId: session.subscription,
          subscriptionEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await sendWelcomePremiumEmail(user, tier === 'PREMIUM_PLUS' ? 'Premium Plus' : 'Premium');
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const user = await prisma.user.findFirst({ where: { stripeSubId: sub.id } });
      if (user) {
        const tier = sub.status === 'active' ? (user.subscription || 'FREE') : 'FREE';
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionEnd: new Date(sub.current_period_end * 1000) },
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await prisma.user.updateMany({
        where: { stripeSubId: sub.id },
        data: { subscription: 'FREE', stripeSubId: null, subscriptionEnd: null },
      });
      break;
    }
  }
};

module.exports = { createCheckoutSession, createPortalSession, handleWebhookEvent, getOrCreateCustomer };
