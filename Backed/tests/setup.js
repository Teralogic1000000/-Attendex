import prisma from '../src/config/prisma.js'

/**
 * Setup test database and seed minimal data
 */
export async function setupTestDB() {
  try {
    // Clear existing data in reverse dependency order
    await prisma.attendance.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.role.deleteMany({})
    await prisma.organization.deleteMany({})

    // Create roles
    const roles = [
      { name: 'Super_Admin' },
      { name: 'Org_Admin' },
      { name: 'Employee' },
    ]

    for (const role of roles) {
      await prisma.role.create({ data: role })
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
      where: { name: 'Org_Admin' },
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

    return { org, admin }
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
    await prisma.attendance.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.role.deleteMany({})
    await prisma.organization.deleteMany({})
  } catch (err) {
    console.error('Test DB cleanup failed:', err)
  }
}
