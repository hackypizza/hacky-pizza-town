import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
const sql = neon(dbUrl);

async function runMigration() {
  console.log('Running database schema migration...');
  try {
    // 1. Update User table
    await sql`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'CUSTOMER',
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
    `;
    try {
      await sql`ALTER TABLE "User" ALTER COLUMN "address" DROP NOT NULL;`;
    } catch {}
    console.log('User table updated.');

    // 2. Ensure Order table with all required columns
    await sql`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT PRIMARY KEY DEFAULT ('ord_' || substr(md5(random()::text), 1, 16)),
        "orderNumber" TEXT,
        "userId" TEXT,
        "userEmail" TEXT,
        "customerName" TEXT,
        "customerPhone" TEXT,
        "customerAddress" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "items" JSONB,
        "subTotal" NUMERIC DEFAULT 0,
        "walletDiscount" NUMERIC DEFAULT 0,
        "totalAmount" NUMERIC DEFAULT 0,
        "status" TEXT DEFAULT 'PENDING',
        "orderStatus" TEXT DEFAULT 'PENDING',
        "rejectionReason" TEXT,
        "paymentMethod" TEXT DEFAULT 'COD',
        "couponCode" TEXT,
        "discountAmount" NUMERIC DEFAULT 0,
        "affiliateUserId" TEXT,
        "affiliateCommissionEarned" NUMERIC DEFAULT 0,
        "isViewedByManager" BOOLEAN DEFAULT false,
        "riderId" TEXT,
        "riderName" TEXT,
        "riderPhone" TEXT,
        "cookingStartedAt" TIMESTAMP WITH TIME ZONE,
        "readyAt" TIMESTAMP WITH TIME ZONE,
        "deliveredAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Ensure every single column exists if Order table was already present
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userEmail" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" NUMERIC DEFAULT 0;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "affiliateUserId" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "affiliateCommissionEarned" NUMERIC DEFAULT 0;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "isViewedByManager" BOOLEAN DEFAULT false;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING';`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderStatus" TEXT DEFAULT 'PENDING';`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerAddress" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "subTotal" NUMERIC DEFAULT 0;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "walletDiscount" NUMERIC DEFAULT 0;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "riderId" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "riderName" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "riderPhone" TEXT;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cookingStartedAt" TIMESTAMP WITH TIME ZONE;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "readyAt" TIMESTAMP WITH TIME ZONE;`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP WITH TIME ZONE;`;
    console.log('Order table updated.');

    // 3. Ensure Coupon table
    await sql`
      CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT PRIMARY KEY DEFAULT ('cpn_' || substr(md5(random()::text), 1, 16)),
        "code" TEXT UNIQUE NOT NULL,
        "discountType" TEXT NOT NULL,
        "discountValue" NUMERIC NOT NULL,
        "minOrderValue" NUMERIC DEFAULT 0,
        "applicableCategory" TEXT,
        "applicableItem" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "usageCount" INTEGER DEFAULT 0,
        "influencerUserId" TEXT,
        "influencerCommissionPercentage" NUMERIC DEFAULT 10,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('Coupon table updated.');

    // 4. Seed a default promo coupon if none exists
    const existing = await sql`SELECT "id" FROM "Coupon" WHERE "code" = 'BURGERKING50' LIMIT 1;`;
    if (!existing || existing.length === 0) {
      await sql`
        INSERT INTO "Coupon" ("code", "discountType", "discountValue", "minOrderValue", "applicableCategory", "isActive", "influencerCommissionPercentage")
        VALUES ('BURGERKING50', 'PERCENTAGE', 15, 199, 'combos', true, 10);
      `;
      console.log('Default BURGERKING50 coupon seeded.');
    }

    // Seed an influencer demo coupon: HACKYVIP
    const existingHacky = await sql`SELECT "id" FROM "Coupon" WHERE "code" = 'HACKYVIP' LIMIT 1;`;
    if (!existingHacky || existingHacky.length === 0) {
      // Upsert influencer user
      const infUser = await sql`
        INSERT INTO "User" ("id", "name", "email", "phone", "address", "password", "role", "isActive", "walletBalance", "updatedAt")
        VALUES ('usr_inf_aman', 'Aman Influencer', 'influencer@hackypizza.com', '9876543219', 'Ramkund Chauraha, Mahmudabad', 'Hacky@123', 'INFLUENCER', true, 500, NOW())
        ON CONFLICT ("email") DO UPDATE SET "role" = 'INFLUENCER', "address" = 'Ramkund Chauraha, Mahmudabad'
        RETURNING "id";
      `;
      const infId = infUser[0]?.id || 'usr_inf_aman';

      await sql`
        INSERT INTO "Coupon" ("code", "discountType", "discountValue", "minOrderValue", "isActive", "influencerUserId", "influencerCommissionPercentage")
        VALUES ('HACKYVIP', 'PERCENTAGE', 20, 249, true, ${infId}, 15);
      `;
      console.log('Influencer coupon HACKYVIP seeded.');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
