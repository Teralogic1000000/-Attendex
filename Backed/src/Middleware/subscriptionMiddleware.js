import prisma from '../config/prisma.js'

export default async function checkSubscription(req, res, next) {
  try {
    if (!req.user || !req.user.orgId) {
      return res.status(401).json({ message: "User information missing" });
    }

    const subscription = await prisma.organizationSubscription.findFirst({
      where: { orgId: req.user.orgId }
    });

    if (!subscription || subscription.status !== "ACTIVE" || new Date(subscription.endDate) < new Date()) {
      return res.status(403).json({ message: "Subscription expired" });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
