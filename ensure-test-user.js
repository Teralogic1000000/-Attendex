import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function ensureTestUser() {
  try {
    console.log('Checking for test user...')
    
    // Check if test user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (existingUser) {
      console.log('✓ Test user already exists:', existingUser.email)
      return
    }
    
    // Get or create Super_Admin role
    let role = await prisma.role.findUnique({
      where: { name: 'Super_Admin' }
    })
    
    if (!role) {
      console.log('Creating Super_Admin role...')
      role = await prisma.role.create({
        data: { name: 'Super_Admin' }
      })
    }
    
    console.log('Role:', role.name)
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Test123456!', 10)
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        phone: null,
        position: null,
        departmentId: null,
        shiftId: null,
        orgId: null,
        roleId: role.id,
        status: 'ACTIVE'
      }
    })
    
    console.log('✓ Test user created:')
    console.log('  Email:', user.email)
    console.log('  ID:', user.id)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

ensureTestUser()
