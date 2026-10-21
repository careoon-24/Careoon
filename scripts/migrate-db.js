const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigrations() {
  console.log('Running DDL updates on Neon PostgreSQL...');

  // 1. NurseProfile nurseCode
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "NurseProfile" ADD COLUMN IF NOT EXISTS "nurseCode" TEXT;
  `);
  console.log('✓ NurseProfile.nurseCode column ensured');

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "NurseProfile_nurseCode_key" ON "NurseProfile"("nurseCode");
  `);
  console.log('✓ NurseProfile_nurseCode_key unique index ensured');

  // 2. Booking couponCode and discountAmount
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
  `);
  console.log('✓ Booking.couponCode column ensured');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
  `);
  console.log('✓ Booking.discountAmount column ensured');

  // 3. Coupon Table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Coupon" (
      "id" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "description" TEXT,
      "discountType" TEXT NOT NULL DEFAULT 'FIXED',
      "discountValue" DOUBLE PRECISION NOT NULL,
      "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "maxDiscountAmount" DOUBLE PRECISION,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "expiresAt" TIMESTAMP(3),
      "usageCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log('✓ Coupon table ensured');

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");
  `);
  console.log('✓ Coupon_code_key unique index ensured');

  // 4. Seed initial Sangli launch coupon if not present
  const existingCoupon = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Coupon" WHERE "code" = 'SANGLI100' LIMIT 1;
  `);

  if (!existingCoupon || existingCoupon.length === 0) {
    const couponId = 'coupon-sangli-100-launch';
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Coupon" ("id", "code", "description", "discountType", "discountValue", "minOrderAmount", "isActive", "usageCount", "createdAt", "updatedAt")
      VALUES ('${couponId}', 'SANGLI100', 'Special Sangli-Miraj Launch Offer: Flat ₹100 Off on any home clinical procedure', 'FIXED', 100, 300, true, 0, NOW(), NOW())
      ON CONFLICT ("code") DO NOTHING;
    `);
    console.log('✓ Default launch coupon SANGLI100 inserted');
  } else {
    console.log('✓ Launch coupon SANGLI100 already exists');
  }

  // 5. Check if any existing NurseProfile needs a nurseCode
  const nursesWithoutCode = await prisma.$queryRawUnsafe(`
    SELECT np.id, u."fullName" 
    FROM "NurseProfile" np
    JOIN "User" u ON u.id = np."userId"
    WHERE np."nurseCode" IS NULL;
  `);

  for (const nurse of nursesWithoutCode) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `SANGLI-RN-${randomSuffix}`;
    await prisma.$executeRawUnsafe(`
      UPDATE "NurseProfile" SET "nurseCode" = '${code}' WHERE "id" = '${nurse.id}';
    `);
    console.log(`✓ Assigned nurseCode ${code} to ${nurse.fullName}`);
  }

  console.log('All migrations applied successfully to Neon DB!');
}

runMigrations()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
