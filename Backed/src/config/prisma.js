import { PrismaClient } from '@prisma/client';

const globalForPrisma = global || {};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
}

const prisma = globalForPrisma.prisma;

// Retry connection logic
let retries = 0;
const maxRetries = 3;

async function connectWithRetry() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
  } catch (error) {
    retries++;
    if (retries < maxRetries) {
      console.log(`⚠ Connection attempt ${retries} failed, retrying in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectWithRetry();
    } else {
      console.error('✗ Database connection failed after retries:', error.message);
      console.log('📋 DATABASE_URL:', process.env.DATABASE_URL);
      // Don't exit - server can still run with mock data
    }
  }
}

connectWithRetry();

export default prisma;