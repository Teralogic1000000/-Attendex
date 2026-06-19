import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'prisma', 'dev.db');

console.log('🔧 Starting database reset...\n');

try {
  // Step 1: Delete existing database file
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✓ Deleted existing dev.db');
  }

  // Step 2: Run prisma db push to create fresh schema
  console.log('⏳ Creating fresh database schema...');
  execSync('npx prisma db push --skip-generate', { 
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✓ Database schema created\n');

  // Step 3: Seed the database
  console.log('⏳ Seeding database with demo data...');
  execSync('npx prisma db seed', { 
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✓ Database seeded successfully\n');

  console.log('✅ Database reset complete!');
  console.log('✓ Ready to test endpoints\n');

} catch (error) {
  console.error('❌ Error during database reset:', error.message);
  process.exit(1);
}
