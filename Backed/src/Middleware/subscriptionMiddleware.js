const prisma = require("../config/prisma");

const subscriptionMiddleware = async (req, res, next) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      organizationId: req.user.organizationId,
      status: "ACTIVE",
    },
  });

  if (!subscription) {
    return res.status(403).json({ message: "Subscription inactive" });
  }

  next();
};

module.exports = subscriptionMiddleware;
