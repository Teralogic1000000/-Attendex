import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🔍 Checking JWT Configuration...\n');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

console.log('✓ JWT_SECRET:', JWT_SECRET ? `${JWT_SECRET.substring(0, 20)}...` : '❌ NOT SET');
console.log('✓ JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET ? `${JWT_REFRESH_SECRET.substring(0, 20)}...` : '❌ NOT SET');
console.log('✓ ADMIN_SECRET:', ADMIN_SECRET ? `${ADMIN_SECRET.substring(0, 20)}...` : '❌ NOT SET');

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('\n❌ ERROR: JWT secrets are not configured!');
  process.exit(1);
}

// Test token generation
const testUser = {
  id: 'test-user-id',
  role: 'Super_Admin',
  orgId: null
};

console.log('\n📝 Testing token generation...\n');

try {
  const accessToken = jwt.sign(
    { id: testUser.id, role: testUser.role, orgId: testUser.orgId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  console.log('✓ Access Token Generated:', accessToken.substring(0, 40) + '...');

  const refreshToken = jwt.sign(
    { id: testUser.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  console.log('✓ Refresh Token Generated:', refreshToken.substring(0, 40) + '...');

  // Verify tokens
  console.log('\n🔐 Verifying tokens...\n');

  const decodedAccess = jwt.verify(accessToken, JWT_SECRET);
  console.log('✓ Access Token Valid:', decodedAccess);

  const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  console.log('✓ Refresh Token Valid:', decodedRefresh);

  console.log('\n✅ All JWT tests passed!');
} catch (error) {
  console.error('❌ Token test failed:', error.message);
  process.exit(1);
}
