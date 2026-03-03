import prisma from '../config/prisma.js';

export async function ensureDefaults() {
  // make sure essential reference data exists so registrations won't blow up
  await prisma.role.createMany({
    data: [
      { name: 'SuperAdmin' },
      { name: 'OrgAdmin' },
      { name: 'Employee' }
    ],
    skipDuplicates: true
  });

  await prisma.subscriptionPlan.createMany({
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
}
