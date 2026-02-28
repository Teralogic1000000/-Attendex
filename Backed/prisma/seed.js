import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Roles
  await prisma.role.createMany({
    data: [
      { name: 'SuperAdmin' },
      { name: 'OrgAdmin' },
      { name: 'Employee' }
    ],
    skipDuplicates: true
  });

  console.log('Roles seeded successfully');

  // Seed Subscription Plans
  const plans = await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: 'Basic',
        maxUsers: 5,
        price: 0,
        duration: 30,
        features: [
          'Limited features',
          'Core system access',
          'Up to 5 team members',
          'Basic support'
        ]
      },
      {
        name: 'Standard',
        maxUsers: 10,
        price: 15,
        duration: 30,
        features: [
          'Up to 10 team members',
          'Advanced reporting',
          'More dashboard features',
          'Better support',
          'More storage (100GB)'
        ]
      },
      {
        name: 'Pro',
        maxUsers: 999,
        price: 30,
        duration: 30,
        features: [
          'Up to 999 team members',
          'Advanced analytics',
          'Export to CSV/Excel',
          'Custom roles',
          'API access',
          'Priority support',
          'Unlimited storage'
        ]
      }
    ],
    skipDuplicates: true
  });

  console.log('Subscription plans seeded successfully');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });