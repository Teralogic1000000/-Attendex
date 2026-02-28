# Database Migration & Setup Instructions

## 🚀 Quick Setup (3 steps)

```bash
# Step 1: Generate Prisma client
npx prisma generate

# Step 2: Apply schema to database
npx prisma db push

# Step 3: Seed initial data
npx prisma db seed
```

---

## 📋 What Gets Created

After running the commands above:

### Roles (automatically created)
- ✅ SuperAdmin
- ✅ OrgAdmin  
- ✅ Employee

### Subscription Plans (seeded)

#### Basic Plan
- **ID:** basic
- **Name:** Basic
- **Max Users:** 5
- **Price:** $0
- **Duration:** 30 days
- **Features:** Limited features, core access, basic support

#### Standard Plan
- **ID:** standard
- **Name:** Standard
- **Max Users:** 10
- **Price:** $15/month
- **Duration:** 30 days
- **Features:** Advanced reporting, better support, 100GB storage

#### Pro Plan
- **ID:** pro
- **Name:** Pro
- **Max Users:** 999
- **Price:** $30/month
- **Duration:** 30 days
- **Features:** Analytics, export, custom roles, API access, priority support

---

## 🔄 Migration from Old Schema

If you had an old subscription model, you need to run a migration:

### Step 1: Backup your data
```bash
# PostgreSQL backup
pg_dump YOUR_DATABASE_NAME > backup_$(date +%s).sql

# Or use Prisma's built-in
npx prisma db pull  # Downloads current schema
```

### Step 2: Create migration
```bash
# This creates a migration file showing the changes
npx prisma migrate dev --name update_subscription_schema
```

### Step 3: Review migration (if prompted)
A new file will be created in `prisma/migrations/`. Review to ensure it only changes what you expect.

### Step 4: Apply migration
```bash
npx prisma migrate deploy
```

---

## 🧹 Reset Database (Development Only)

**WARNING: This deletes all data!**

```bash
# Reset and reseed database
npx prisma migrate reset

# Choose 'y' when prompted to reset and seed
```

This will:
1. Drop all tables
2. Run all migrations
3. Run seed script (creates roles + plans)
4. Starting fresh state

---

## ✅ Verification Checklist

After setup, verify everything:

### Check database tables exist
```bash
# In psql terminal, run:
\dt
# Should show tables for:
# - users
# - organizations
# - roles
# - attendance
# - subscription_plans
# - organization_subscriptions
```

### Check roles were created
```sql
SELECT * FROM "Role";
-- Should return 3 rows: SuperAdmin, OrgAdmin, Employee
```

### Check plans were created
```sql
SELECT id, name, "maxUsers", price FROM "SubscriptionPlan" ORDER BY price;
-- Should return 3 rows: Basic ($0), Standard ($15), Pro ($30)
```

### Check plan features
```sql
SELECT name, features FROM "SubscriptionPlan";
-- Should show JSON array features for each plan
```

---

## 🔧 Prisma Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# View database (interactive)
npx prisma studio

# Create new migration
npx prisma migrate dev --name <migration_name>

# Apply pending migrations
npx prisma migrate deploy

# Sync schema with database (dev only)
npx prisma db push

# Reset database (dev only - WARNING: deletes all data!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# View Prisma errors
npx prisma validate
```

---

## 🐘 PostgreSQL Commands

### Connect to database
```bash
psql -U postgres -d attendex_db
```

### View subscription plans
```sql
SELECT 
  id, 
  name, 
  "maxUsers" as max_users,
  price,
  features
FROM "SubscriptionPlan"
ORDER BY price;
```

### Count data
```sql
SELECT 
  'Plans' as table_name, COUNT(*) FROM "SubscriptionPlan"
  UNION ALL
  SELECT 'Roles', COUNT(*) FROM "Role"
  UNION ALL
  SELECT 'Organizations', COUNT(*) FROM "Organization"
  UNION ALL
  SELECT 'Users', COUNT(*) FROM "User"
  UNION ALL
  SELECT 'Subscriptions', COUNT(*) FROM "OrganizationSubscription";
```

### View organization subscriptions
```sql
SELECT 
  os."id",
  o."name" as organization,
  sp."name" as plan,
  sp."maxUsers",
  os."status",
  os."startDate",
  os."endDate"
FROM "OrganizationSubscription" os
JOIN "Organization" o ON os."orgId" = o."id"
JOIN "SubscriptionPlan" sp ON os."planId" = sp."id"
ORDER BY os."startDate" DESC;
```

---

## 💾 Backup & Restore

### Backup the database
```bash
# PostgreSQL backup
pg_dump -U postgres attendex_db > backup_2026_02_28.sql

# Compressed backup
pg_dump -U postgres attendex_db | gzip > backup_2026_02_28.sql.gz
```

### Restore from backup
```bash
# From SQL file
psql -U postgres attendex_db < backup_2026_02_28.sql

# From compressed file
gunzip < backup_2026_02_28.sql.gz | psql -U postgres attendex_db
```

---

## 🐛 Troubleshooting

### "Unknown field 'refreshToken' in model 'User'"
- **Cause:** Prisma client not regenerated
- **Fix:** Run `npx prisma generate`

### "relation 'User' does not exist"
- **Cause:** Tables not created
- **Fix:** Run `npx prisma db push`

### "No subscription plans found"
- **Cause:** Seed script didn't run
- **Fix:** Run `npx prisma db seed`

### "P1000: Authentication failed"
- **Cause:** Wrong database URL or credentials
- **Fix:** Check `DATABASE_URL` in `.env`

### "Transaction failed: A unique constraint was violated"
- **Cause:** Trying to create duplicate plan
- **Fix:** Check if plans already exist; adjust seed script

### Port already in use
- **Cause:** Database already running on that port
- **Fix:** Change port in `.env` or kill existing process

---

## 📝 Environment Variables Required

Add to `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/attendex_db"

# JWT Secrets (generate random strings)
JWT_SECRET="your_random_jwt_secret_here_minimum_32_chars"
JWT_REFRESH_SECRET="your_random_refresh_secret_minimum_32_chars"

# Server
PORT=3000
NODE_ENV=development
```

### Generate secure secrets:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

---

## ✨ Post-Setup Testing

### Test database connection
```bash
# Try to run seed manually
npx prisma db seed

# Should show no errors and confirm seed completed
```

### Test Prisma Client
```bash
# Create a test file: test-db.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.subscriptionPlan.findMany();
  console.log('Plans found:', plans.length);
  plans.forEach(p => console.log(`- ${p.name} (${p.maxUsers} users, $${p.price})`));
}

main().finally(() => prisma.$disconnect());

# Run it
node test-db.mjs
```

Expected output:
```
Plans found: 3
- Basic (5 users, $0)
- Standard (10 users, $15)
- Pro (999 users, $30)
```

---

## 🔐 Security for Database

### Change default postgres password
```bash
psql -U postgres -c "ALTER USER postgres PASSWORD 'secure_password';"
```

### Create separate database user (recommended)
```sql
-- In psql terminal:
CREATE USER attendex_user WITH PASSWORD 'secure_password';
ALTER USER attendex_user CREATEDB;
\c attendex_db
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO attendex_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO attendex_user;
```

Update `.env`:
```env
DATABASE_URL="postgresql://attendex_user:secure_password@localhost:5432/attendex_db"
```

---

## 📊 Monitor Database Growth

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎯 Summary

Your database now has:
- ✅ 3 subscription plans with features
- ✅ 3 user roles
- ✅ Complete schema for organizations, users, attendance, subscriptions
- ✅ Ready for application code
- ✅ Seed data for testing

**Next Step:** Start the application server and test with the API!

```bash
npm start
```

Then test with Postman or curl:
```bash
curl http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Test",
    "lastName":"User",
    "email":"test@example.com",
    "password":"Test123!",
    "orgName":"Test Company"
  }'
```
