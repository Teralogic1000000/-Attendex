/**
 * Create Test Users for Dashboard Testing
 * Usage: node create-dashboard-test-users.js
 */

import prisma from './Backed/src/config/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function createTestUsers() {
  console.log('🔧 Creating test users for dashboard testing...\n');

  try {
    // Create SuperAdmin organization
    console.log('📋 Setting up SuperAdmin user...');
    const superAdminOrg = await prisma.organization.findFirst({
      where: { name: 'Attendex Platform' }
    });

    let superAdminRole = await prisma.role.findFirst({
      where: { name: 'Super_Admin' }
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: 'Super_Admin',
          description: 'Super Administrator'
        }
      });
    }

    const hashedSuperAdminPwd = await bcrypt.hash('TestSuperAdmin@123', 10);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@test.attendex.com' },
      update: {
        password: hashedSuperAdminPwd,
        status: 'ACTIVE'
      },
      create: {
        email: 'superadmin@test.attendex.com',
        firstName: 'Test',
        lastName: 'SuperAdmin',
        password: hashedSuperAdminPwd,
        status: 'ACTIVE',
        roleId: superAdminRole.id,
        orgId: superAdminOrg?.id,
        position: 'System Administrator'
      }
    });
    console.log(`✅ SuperAdmin created: ${superAdmin.email}\n`);

    // Create test organization for OrgAdmin
    console.log('📦 Setting up test organization...');
    const testOrg = await prisma.organization.upsert({
      where: { email: 'testorg@attendex.com' },
      update: { status: 'Active' },
      create: {
        name: 'Test Organization',
        email: 'testorg@attendex.com',
        phone: '+234 800 000 0001',
        address: '123 Test Street, Test City',
        country: 'Nigeria',
        status: 'Active'
      }
    });
    console.log(`✅ Test organization created: ${testOrg.name}\n`);

    // Create OrgAdmin role
    let orgAdminRole = await prisma.role.findFirst({
      where: { name: 'Org_Admin' }
    });

    if (!orgAdminRole) {
      orgAdminRole = await prisma.role.create({
        data: {
          name: 'Org_Admin',
          description: 'Organization Administrator'
        }
      });
    }

    // Create OrgAdmin user
    console.log('👨‍💼 Setting up OrgAdmin user...');
    const hashedOrgAdminPwd = await bcrypt.hash('TestOrgAdmin@123', 10);
    const orgAdmin = await prisma.user.upsert({
      where: { email: 'orgadmin@test.attendex.com' },
      update: {
        password: hashedOrgAdminPwd,
        status: 'ACTIVE',
        orgId: testOrg.id
      },
      create: {
        email: 'orgadmin@test.attendex.com',
        firstName: 'Test',
        lastName: 'OrgAdmin',
        password: hashedOrgAdminPwd,
        status: 'ACTIVE',
        roleId: orgAdminRole.id,
        orgId: testOrg.id,
        position: 'Organization Manager'
      }
    });
    console.log(`✅ OrgAdmin created: ${orgAdmin.email}\n`);

    // Create Employee role
    let employeeRole = await prisma.role.findFirst({
      where: { name: 'Employee' }
    });

    if (!employeeRole) {
      employeeRole = await prisma.role.create({
        data: {
          name: 'Employee',
          description: 'Regular Employee'
        }
      });
    }

    // Create test employee
    console.log('👥 Setting up Employee user...');
    const hashedEmployeePwd = await bcrypt.hash('TestEmployee@123', 10);
    
    // Create departments if needed
    let department = await prisma.department.findFirst({
      where: { orgId: testOrg.id }
    });

    if (!department) {
      department = await prisma.department.create({
        data: {
          name: 'Test Department',
          orgId: testOrg.id,
          status: 'Active'
        }
      });
    }

    const employee = await prisma.user.upsert({
      where: { email: 'employee@test.attendex.com' },
      update: {
        password: hashedEmployeePwd,
        status: 'ACTIVE',
        orgId: testOrg.id
      },
      create: {
        email: 'employee@test.attendex.com',
        firstName: 'Test',
        lastName: 'Employee',
        password: hashedEmployeePwd,
        status: 'ACTIVE',
        roleId: employeeRole.id,
        orgId: testOrg.id,
        position: 'Software Engineer',
        departmentId: department.id
      }
    });
    console.log(`✅ Employee created: ${employee.email}\n`);

    // Create some sample attendance records for today
    console.log('📅 Creating sample attendance records...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sampleAttendance = await prisma.attendance.create({
      data: {
        userId: employee.id,
        orgId: testOrg.id,
        date: today,
        checkIn: new Date(),
        checkOut: null,
        status: 'Present',
        approvedBy: orgAdmin.id
      }
    });
    console.log(`✅ Sample attendance record created\n`);

    console.log('╔════════════════════════════════════════════════╗');
    console.log('║          Test Users Created Successfully         ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log('📍 Test Credentials:\n');
    console.log('SuperAdmin:');
    console.log('  Email: superadmin@test.attendex.com');
    console.log('  Password: TestSuperAdmin@123\n');

    console.log('Organization Admin:');
    console.log('  Email: orgadmin@test.attendex.com');
    console.log('  Password: TestOrgAdmin@123\n');

    console.log('Employee:');
    console.log('  Email: employee@test.attendex.com');
    console.log('  Password: TestEmployee@123\n');

    console.log('⚠️  Update DASHBOARD_ENDPOINT_TEST.js with these credentials');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
