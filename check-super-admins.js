import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSuperAdmins() {
  try {
    const superAdmins = await prisma.User.findMany({
      where: {
        role: {
          name: "Super_Admin"
        }
      },
      include: {
        role: true
      }
    });

    console.log("Super Admins in database:");
    console.log(JSON.stringify(superAdmins, null, 2));
    
    if (superAdmins.length > 0) {
      console.log(`\n✓ Found ${superAdmins.length} Super Admin(s)`);
    } else {
      console.log("\n✗ No Super Admins found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmins();
