import { PrismaClient } from '@prisma/client';

const globalForPrisma = global || {};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
}

const prisma = globalForPrisma.prisma;

prisma.$connect()
  .then(() => {
    console.log('✓ Database connected successfully');
  })
  .catch((error) => {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  });

export default prisma;