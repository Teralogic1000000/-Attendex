import prisma from '../src/config/prisma.js'

/**
 * Setup test database and seed minimal data
 */
export async function setupTestDB() {
  try {
    // Clear existing data in reverse dependency order
    await prisma.organizationSubscription.deleteMany({})
    await prisma.attendance.deleteMany({})
    await prisma.subscriptionPlan.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.role.deleteMany({})
    await prisma.organization.deleteMany({})

    // Create roles
    const roles = [
      { name: 'SuperAdmin' },
      { name: 'OrgAdmin' },
      { name: 'Employee' },
    ]

    for (const role of roles) {
      await prisma.role.create({ data: role })
    }

    // Create subscription plans
    const plans = [
      {
        name: 'Basic',
        maxUsers: 5,
        price: 0,
        duration: 30,
        features: ['Basic Attendance', '5 Employees'],
      },
      {
        name: 'Pro',
        maxUsers: 50,
        price: 99,
        duration: 30,
        features: ['Advanced Attendance', 'Reports', '50 Employees'],
      },
      {
        name: 'Enterprise',
        maxUsers: 1000,
        price: 499,
        duration: 30,
        features: ['All Features', 'Custom Support', '1000 Employees'],
      },
    ]

    for (const plan of plans) {
      await prisma.subscriptionPlan.create({
        data: {
          ...plan,
          features: JSON.stringify(plan.features),
        },
      })
    }

    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        email: 'test@testorg.com',
        phone: '1234567890',
      },
    })

    // Create OrgAdmin role
    const orgAdminRole = await prisma.role.findUnique({
      where: { name: 'OrgAdmin' },
    })

    // Create test admin user
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@testorg.com',
        password: 'hashed_password_here',
        orgId: org.id,
        roleId: orgAdminRole.id,
      },
    })

    // Create test subscription
    const basicPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: 'Basic' },
    })

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    const subscription = await prisma.organizationSubscription.create({
      data: {
        orgId: org.id,
        planId: basicPlan.id,
        startDate: new Date(),
        endDate,
        status: 'ACTIVE',
      },
    })

    return { org, admin, subscription }
  } catch (err) {
    console.error('Test DB setup failed:', err)
    throw err
  }
}

/**
 * Cleanup test database
 */
export async function cleanupTestDB() {
  try {
    await prisma.organizationSubscription.deleteMany({})
    await prisma.attendance.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.role.deleteMany({})
    await prisma.organization.deleteMany({})
    await prisma.subscriptionPlan.deleteMany({})
  } catch (err) {
    console.error('Test DB cleanup failed:', err)
  }
}
