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
        maxEmployees: 5,
        maxAttendanceRecords: 1000,
        price: 0,
        interval: 'monthly',
        features: [
          'Limited features',
          'Core system access',
          'Up to 5 team members',
          'Basic support'
        ]
      },
      {
        name: 'Standard',
        maxEmployees: 10,
        maxAttendanceRecords: 5000,
        price: 1500,
        interval: 'monthly',
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
        maxEmployees: 999,
        maxAttendanceRecords: 50000,
        price: 3000,
        interval: 'monthly',
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
