import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Resetting Neon PostgreSQL cloud database to Pure Clean State (0 Data)...');

  // 1. Wipe existing data in foreign-key dependency order
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payable.deleteMany();
  await prisma.payoutBatch.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingOffer.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.nurseProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();

  console.log('✨ Cleaned all transactional and catalog tables.');

  // 2. Create ONLY Master Administrator account
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@careoon.com',
      phone: '+919999999999',
      fullName: 'Careoon Operations Admin',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
  });

  console.log(`🛡️ Master Admin created in Neon: admin@careoon.com / admin123 (ID: ${admin.id})`);
  console.log('✅ Neon PostgreSQL Clean State Completed Successfully!');
  console.log('📊 Statistics in Cloud DB:');
  console.log('   - Patients: 0 (Pure clean)');
  console.log('   - Nurses: 0 (Pure clean)');
  console.log('   - Bookings: 0 (Pure clean)');
  console.log('   - Service Categories: 0 (Admin will create)');
  console.log('   - Clinical Services: 0 (Admin will create)');
  console.log('   - Admin: admin@careoon.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
