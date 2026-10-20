import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Resetting Careoon database to CLEAN ZERO state...');

  // 1. Wipe all transactional and user data
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

  console.log('✨ All bookings, offers, reviews, payments, and users purged.');

  // 2. Create single Master Admin account for operational oversight
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

  console.log(`🛡️ Master Admin created: admin@careoon.com / admin123 (ID: ${admin.id})`);

  // 3. Seed Base Medical Categories
  const catPostOp = await prisma.serviceCategory.create({
    data: {
      name: 'Post-Surgical & Wound Care',
      slug: 'post-surgical-wound-care',
      description: 'Sterile surgical dressings, suture removal, and drain management at home.',
      displayOrder: 1,
      isActive: true,
    },
  });

  const catElderly = await prisma.serviceCategory.create({
    data: {
      name: 'Elderly & Bedridden Care',
      slug: 'elderly-bedridden-care',
      description: 'Compassionate nursing, vitals tracking, and mobility assistance.',
      displayOrder: 2,
      isActive: true,
    },
  });

  const catClinical = await prisma.serviceCategory.create({
    data: {
      name: 'Clinical Injections & IV Therapy',
      slug: 'clinical-injections-iv-therapy',
      description: 'Prescribed intravenous infusions, intramuscular injections, and cannulation.',
      displayOrder: 3,
      isActive: true,
    },
  });

  // 4. Seed Standard Medical Procedures
  await prisma.service.create({
    data: {
      categoryId: catPostOp.id,
      name: 'Surgical Wound Dressing (Aseptic)',
      slug: 'surgical-wound-dressing-aseptic',
      description: 'Complete aseptic wound cleaning, suture check, infection assessment, and sterile surgical dressing.',
      shortDescription: 'Sterile dressing for post-op surgical wounds.',
      basePrice: 750.0,
      durationMinutes: 45,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Doctor surgical discharge summary', 'Clean room with adequate lighting']),
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      categoryId: catElderly.id,
      name: 'Urinary Catheterization & Care',
      slug: 'urinary-catheterization-care',
      description: 'Aseptic Foley catheter insertion, replacement, drainage bag management, and antiseptic bladder wash.',
      shortDescription: 'Safe Foley catheter insertion & bag change.',
      basePrice: 1100.0,
      durationMinutes: 60,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Doctor/Urologist prescription slip']),
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      categoryId: catClinical.id,
      name: 'IV Infusion & Cannulation',
      slug: 'iv-infusion-cannulation',
      description: 'Intravenous cannula insertion, fluid drip setup, infusion rate monitoring, and adverse reaction check.',
      shortDescription: 'Prescribed IV fluid drip & injectable medications.',
      basePrice: 650.0,
      durationMinutes: 60,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Signed medical prescription showing dosage']),
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      categoryId: catElderly.id,
      name: 'Full Health Vitals & Blood Sugar Monitoring',
      slug: 'full-health-vitals-blood-sugar',
      description: 'Complete clinical assessment: Blood Pressure, Pulse, SpO2, Temperature, and Random Blood Glucose.',
      shortDescription: 'Complete vitals checkup & blood sugar testing.',
      basePrice: 400.0,
      durationMinutes: 30,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['No special requirement']),
      isActive: true,
    },
  });

  console.log('✅ Clean 0 State Ready!');
  console.log('📊 Stats:');
  console.log('   - Patients in DB: 0 (Register your own patient at /login or /patient)');
  console.log('   - Nurses in DB: 0 (Register your own nurse at /login with role NURSE)');
  console.log('   - Bookings in DB: 0 (100% clean slate)');
  console.log('   - Admin: admin@careoon.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Clean zero reset error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
