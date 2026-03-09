import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import prisma from '../src/config/prisma.js'
import bcrypt from 'bcrypt'

const seedData = async () => {
  console.log('🌱 Starting seed script...')

  try {
    // Create organizations
    const org1 = await prisma.organization.upsert({
      where: { id: 'org-demo-1' },
      update: {},
      create: {
        id: 'org-demo-1',
        name: 'Demo Corporation',
        email: 'admin@democorp.com',
        phone: '+1-800-DEMO-123',
        address: '123 Business Ave, Tech City, TC 12345',
        industry: 'Technology',
        size: 'Medium',
      },
    })

    const org2 = await prisma.organization.upsert({
      where: { id: 'org-demo-2' },
      update: {},
      create: {
        id: 'org-demo-2',
        name: 'Sample Industries',
        email: 'contact@sample.com',
        phone: '+1-800-SAMPLE-1',
        address: '456 Industrial Blvd, Business City, BC 67890',
        industry: 'Manufacturing',
        size: 'Large',
      },
    })

    console.log(`✓ Created organizations: ${org1.name}, ${org2.name}`)

    // Create roles
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'Super_Admin' },
      update: {},
      create: {
        name: 'Super_Admin',
      },
    })

    const adminRole = await prisma.role.upsert({
      where: { name: 'Org_Admin' },
      update: {},
      create: {
        name: 'Org_Admin',
      },
    })

    const empRole = await prisma.role.upsert({
      where: { name: 'Employee' },
      update: {},
      create: {
        name: 'Employee',
      },
    })

    console.log(`✓ Created roles: ${superAdminRole.name}, ${adminRole.name}, ${empRole.name}`)

    // Create superadmin user (no organization)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@attendex.com' },
      update: {},
      create: {
        email: 'superadmin@attendex.com',
        firstName: 'System',
        lastName: 'Admin',
        password: await bcrypt.hash('SuperAdmin@123', 10),
        phone: '+1-800-SUPER-ADMIN',
        position: 'System Administrator',
        roleId: superAdminRole.id,
        status: 'ACTIVE',
      },
    })

    console.log(`✓ Created SuperAdmin user: ${superAdmin.email}`)

    // Create admin users for organizations
    const adminUser1 = await prisma.user.upsert({
      where: { email: 'admin@democorp.com' },
      update: {},
      create: {
        email: 'admin@democorp.com',
        firstName: 'Alice',
        lastName: 'Admin',
        password: await bcrypt.hash('Admin@123', 10),
        phone: '+1-800-ADMIN-1',
        position: 'Administrator',
        orgId: org1.id,
        roleId: adminRole.id,
        status: 'ACTIVE',
      },
    })

    const adminUser2 = await prisma.user.upsert({
      where: { email: 'admin@sample.com' },
      update: {},
      create: {
        email: 'admin@sample.com',
        firstName: 'Bob',
        lastName: 'Manager',
        password: await bcrypt.hash('Admin@123', 10),
        phone: '+1-800-ADMIN-2',
        position: 'Manager',
        orgId: org2.id,
        roleId: adminRole.id,
        status: 'ACTIVE',
      },
    })

    console.log(`✓ Created admin users: ${adminUser1.email}, ${adminUser2.email}`)

    // Create employee users for org1
    const employees = ['john.doe@democorp.com', 'jane.smith@democorp.com', 'mike.johnson@democorp.com', 'sarah.williams@democorp.com', 'david.brown@democorp.com']
    const createdEmployees = []

    for (let i = 0; i < employees.length; i++) {
      const emp = await prisma.user.upsert({
        where: { email: employees[i] },
        update: {},
        create: {
          email: employees[i],
          firstName: employees[i].split('.')[0].charAt(0).toUpperCase() + employees[i].split('.')[0].slice(1),
          lastName: employees[i].split('.')[1].split('@')[0].charAt(0).toUpperCase() + employees[i].split('.')[1].split('@')[0].slice(1),
          password: await bcrypt.hash('Emp@1234', 10),
          phone: `+1-800-EMP-${1000 + i}`,
          position: 'Employee',
          orgId: org1.id,
          roleId: empRole.id,
          status: 'ACTIVE',
        },
      })
      createdEmployees.push(emp)
    }

    console.log(`✓ Created ${createdEmployees.length} employees for ${org1.name}`)

    // Create attendance records for the last 7 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const attDate = new Date(today)
      attDate.setDate(attDate.getDate() - dayOffset)

      for (const emp of createdEmployees) {
        // Random attendance: 80% of employees check in
        if (Math.random() < 0.8) {
          const checkInTime = new Date(attDate)
          checkInTime.setHours(9, Math.floor(Math.random() * 30), 0)

          const checkOutTime = new Date(attDate)
          checkOutTime.setHours(17, Math.floor(Math.random() * 30), 0)

          const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600)

          await prisma.attendance.upsert({
            where: {
              userId_date: {
                userId: emp.id,
                date: attDate,
              },
            },
            update: {
              checkIn: checkInTime,
              checkOut: checkOutTime,
              totalHours,
              status: 'Present',
              ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            },
            create: {
              userId: emp.id,
              orgId: org1.id,
              date: attDate,
              checkIn: checkInTime,
              checkOut: checkOutTime,
              totalHours,
              status: 'Present',
              ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            },
          })
        }
      }
    }

    console.log('✓ Created attendance records for last 7 days')

    // Create subscription plans
    const freePlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Free' },
      update: {},
      create: {
        name: 'Free',
        description: 'Basic attendance tracking for up to 10 employees',
        maxEmployees: 10,
        maxAttendanceRecords: 1000,
        price: 0,
        credits: 0,
        interval: 'monthly',
        features: ['basic_tracking', 'single_org'],
      },
    })

    const proPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Pro' },
      update: {},
      create: {
        name: 'Pro',
        description: 'Advanced features for growing teams',
        maxEmployees: 100,
        maxAttendanceRecords: 50000,
        price: 9999,
        credits: 0,
        interval: 'monthly',
        features: ['advanced_analytics', 'multi_org', 'api_access', 'support'],
      },
    })

    const enterprisePlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'Enterprise' },
      update: {},
      create: {
        name: 'Enterprise',
        description: 'Unlimited features with dedicated support',
        maxEmployees: 10000,
        maxAttendanceRecords: 1000000,
        price: 99999,
        credits: 0,
        interval: 'monthly',
        features: ['unlimited_everything', 'dedicated_support', 'sso', 'custom_integrations'],
      },
    })

    console.log(`✓ Created subscription plans: ${freePlan.name}, ${proPlan.name}, ${enterprisePlan.name}`)

    // Create subscriptions for organizations
    await prisma.organizationSubscription.upsert({
      where: { orgId: org1.id },
      update: {
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        orgId: org1.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.organizationSubscription.upsert({
      where: { orgId: org2.id },
      update: {
        status: 'ACTIVE',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        orgId: org2.id,
        planId: freePlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    console.log('✓ Created organization subscriptions')

    console.log('\n✅ Seed completed successfully!')
    console.log('\n📝 Demo Accounts:')
    console.log('  SuperAdmin: superadmin@attendex.com / SuperAdmin@123')
    console.log('  Admin 1: admin@democorp.com / Admin@123')
    console.log('  Admin 2: admin@sample.com / Admin@123')
    console.log('  Employee: john.doe@democorp.com / Emp@1234')
  } catch (error) {
    console.error('❌ Seed error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })