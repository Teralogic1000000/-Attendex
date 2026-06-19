import prisma from '../config/prisma.js';

/**
 * WARNING: This script deletes ALL data from the database.
 * Use only for development/testing purposes!
 */
async function resetDatabase() {
  console.log('⚠️  Resetting database - all data will be deleted...');

  try {
    // Delete in correct order due to foreign key constraints
    await prisma.attendance.deleteMany({});
    console.log('✓ Deleted all attendance records');

    await prisma.organizationSubscription.deleteMany({});
    console.log('✓ Deleted all subscriptions');

    await prisma.user.deleteMany({});
    console.log('✓ Deleted all users');

    await prisma.organization.deleteMany({});
    console.log('✓ Deleted all organizations');

    await prisma.subscriptionPlan.deleteMany({});
    console.log('✓ Deleted all subscription plans');

    await prisma.role.deleteMany({});
    console.log('✓ Deleted all roles');

    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
