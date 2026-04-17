const requirePremium = (req, res, next) => {
  const { subscription } = req.user;
  if (subscription !== 'PREMIUM' && subscription !== 'PREMIUM_PLUS') {
    return res.status(403).json({ error: 'Premium subscription required', upgradeRequired: true });
  }
  next();
};

const requirePremiumPlus = (req, res, next) => {
  if (req.user.subscription !== 'PREMIUM_PLUS') {
    return res.status(403).json({ error: 'Premium Plus subscription required', upgradeRequired: true });
  }
  next();
};

module.exports = { requirePremium, requirePremiumPlus };
