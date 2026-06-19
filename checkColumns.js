import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

(async () => {
  const p = new PrismaClient();
  const cols = await p.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='User'");
  console.log(cols);
  await p.$disconnect();
})();