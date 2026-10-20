import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Careoon database seeding...');

  // Clean existing data in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payable.deleteMany();
  await prisma.payoutBatch.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingOffer.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.nurseProfile.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const patientHash = await bcrypt.hash('patient123', salt);
  const nurseHash = await bcrypt.hash('nurse123', salt);
  const adminHash = await bcrypt.hash('admin123', salt);

  // 1. Seed Users
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@careoon.com',
      phone: '+919876543210',
      fullName: 'Sunita Deshmukh',
      role: 'PATIENT',
      passwordHash: patientHash,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  const nurseUser1 = await prisma.user.create({
    data: {
      email: 'nurse@careoon.com',
      phone: '+919876543211',
      fullName: 'Pooja Kulkarni',
      role: 'NURSE',
      passwordHash: nurseHash,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813583-7c593fc2fa37?w=150',
    },
  });

  const nurseUser2 = await prisma.user.create({
    data: {
      email: 'nurse.maya@careoon.com',
      phone: '+919876543212',
      fullName: 'Maya Patel',
      role: 'NURSE',
      passwordHash: nurseHash,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    },
  });

  const nurseUser3 = await prisma.user.create({
    data: {
      email: 'nurse.anita@careoon.com',
      phone: '+919876543213',
      fullName: 'Anita Shinde',
      role: 'NURSE',
      passwordHash: nurseHash,
      avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@careoon.com',
      phone: '+919876543214',
      fullName: 'Dr. Anand Joshi',
      role: 'ADMIN',
      passwordHash: adminHash,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    },
  });

  // 2. Seed Nurse Profiles
  const nurseProfile1 = await prisma.nurseProfile.create({
    data: {
      userId: nurseUser1.id,
      registrationNumber: 'MNC-2018-98421',
      qualifications: JSON.stringify(['B.Sc. Nursing', 'Critical Care Certified', 'BLS/ACLS']),
      experienceYears: 6,
      bio: 'Experienced ICU and post-operative home nurse with 6+ years in major multispecialty hospitals.',
      serviceRadiusKm: 12.0,
      latitude: 18.5204,
      longitude: 73.8567, // Pune Center
      policeVerificationStatus: 'VERIFIED',
      adminApprovalStatus: 'VERIFIED',
      ratingAverage: 4.9,
      ratingCount: 38,
      isAvailableNow: true,
      bankAccountNumber: '918237461928',
      bankIfsc: 'HDFC0001234',
      bankHolderName: 'Pooja Kulkarni',
    },
  });

  const nurseProfile2 = await prisma.nurseProfile.create({
    data: {
      userId: nurseUser2.id,
      registrationNumber: 'MNC-2016-54129',
      qualifications: JSON.stringify(['G.N.M.', 'Geriatric Care Specialist', 'Diabetes Educator']),
      experienceYears: 8,
      bio: 'Compassionate elderly care nurse specializing in bedridden patient care, catheterization, and vitals monitoring.',
      serviceRadiusKm: 15.0,
      latitude: 18.5529,
      longitude: 73.9014, // Kalyani Nagar
      policeVerificationStatus: 'VERIFIED',
      adminApprovalStatus: 'VERIFIED',
      ratingAverage: 4.95,
      ratingCount: 64,
      isAvailableNow: true,
      bankAccountNumber: '501004928172',
      bankIfsc: 'ICIC0000456',
      bankHolderName: 'Maya Patel',
    },
  });

  const nurseProfile3 = await prisma.nurseProfile.create({
    data: {
      userId: nurseUser3.id,
      registrationNumber: 'MNC-2020-11204',
      qualifications: JSON.stringify(['B.Sc. Nursing', 'Pediatric Care', 'Wound Management']),
      experienceYears: 4,
      bio: 'Specialized in sterile surgical wound dressing, IV infusion therapy, and pediatric home monitoring.',
      serviceRadiusKm: 10.0,
      latitude: 18.5074,
      longitude: 73.8077, // Kothrud
      policeVerificationStatus: 'VERIFIED',
      adminApprovalStatus: 'VERIFIED',
      ratingAverage: 4.85,
      ratingCount: 22,
      isAvailableNow: false,
      bankAccountNumber: '329182740192',
      bankIfsc: 'SBIN0001824',
      bankHolderName: 'Anita Shinde',
    },
  });

  // 3. Seed Service Categories
  const catPostOp = await prisma.serviceCategory.create({
    data: {
      name: 'Post-Surgical & Wound Care',
      slug: 'post-surgical-wound-care',
      description: 'Sterile surgical dressings, suture removal, and drain care at home.',
      displayOrder: 1,
      isActive: true,
    },
  });

  const catElderly = await prisma.serviceCategory.create({
    data: {
      name: 'Elderly & Bedridden Care',
      slug: 'elderly-bedridden-care',
      description: 'Comprehensive nursing assistance, catheterization, and vitals tracking.',
      displayOrder: 2,
      isActive: true,
    },
  });

  const catClinical = await prisma.serviceCategory.create({
    data: {
      name: 'Clinical Injections & Infusions',
      slug: 'clinical-injections-infusions',
      description: 'Doctor-prescribed IV fluid therapy, IM/SC injections, and blood draws.',
      displayOrder: 3,
      isActive: true,
    },
  });

  // 4. Seed Services
  const srvDressing = await prisma.service.create({
    data: {
      categoryId: catPostOp.id,
      name: 'Surgical Wound Dressing (Complex)',
      slug: 'surgical-wound-dressing-complex',
      description: 'Complete aseptic wound cleaning, inspection for signs of infection, necrotic tissue management, and sterile dressing.',
      shortDescription: 'Sterile surgical wound inspection and dressing at home.',
      basePrice: 850.0,
      durationMinutes: 45,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Active doctor prescription required', 'Patient must provide clean towel and well-lit room']),
      isActive: true,
    },
  });

  const srvCatheter = await prisma.service.create({
    data: {
      categoryId: catElderly.id,
      name: 'Urinary Catheterization & Bladder Wash',
      slug: 'urinary-catheterization-bladder-wash',
      description: 'Sterile Foley catheter insertion, replacement, bag change, and antiseptic bladder wash under aseptic protocols.',
      shortDescription: 'Safe home urinary catheter insertion and replacement.',
      basePrice: 1200.0,
      durationMinutes: 60,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Urologist/Physician recommendation slip', 'Patient must have sterile catheter kit ready or opt for nurse kit']),
      isActive: true,
    },
  });

  const srvIV = await prisma.service.create({
    data: {
      categoryId: catClinical.id,
      name: 'IV Infusion & Medication Administration',
      slug: 'iv-infusion-medication-administration',
      description: 'Intravenous cannulation, drip rate calculation, antibiotic infusion monitoring, and adverse reaction surveillance.',
      shortDescription: 'Prescribed IV drip and injectable medication at home.',
      basePrice: 750.0,
      durationMinutes: 60,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Signed medical prescription showing dosage and infusion time', 'Emergency contact person present']),
      isActive: true,
    },
  });

  const srvVitals = await prisma.service.create({
    data: {
      categoryId: catElderly.id,
      name: 'Full Clinical Vitals & Blood Sugar Monitoring',
      slug: 'full-clinical-vitals-blood-sugar-monitoring',
      description: 'Comprehensive check: Blood pressure, Pulse Ox, Temperature, Random Blood Sugar (glucometer), and respiratory assessment.',
      shortDescription: 'Complete health vitals and blood sugar checkup.',
      basePrice: 450.0,
      durationMinutes: 30,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['No special requirements']),
      isActive: true,
    },
  });

  // 5. Seed Sample Confirmed Booking
  const commAmount = (srvDressing.basePrice * srvDressing.commissionPercent) / 100;
  const nurseEarnings = srvDressing.basePrice - commAmount;

  const sampleBooking = await prisma.booking.create({
    data: {
      bookingCode: 'CRN-2026-9812',
      patientId: patientUser.id,
      serviceId: srvDressing.id,
      nurseId: nurseProfile2.id,
      scheduledDate: '2026-10-21',
      scheduledTime: '10:30',
      durationMinutes: srvDressing.durationMinutes,
      addressLine: 'Flat 402, Rohan Viti, Law College Road',
      landmark: 'Near Symbiosis Institute',
      city: 'Pune',
      postalCode: '411004',
      latitude: 18.5204,
      longitude: 73.8567,
      patientNotes: 'Post-abdominal surgery 5th day dressing. All sutures in place.',
      patientContactPhone: '+919876543210',
      patientName: 'Sunita Deshmukh',
      patientAge: 58,
      patientGender: 'Female',
      servicePrice: srvDressing.basePrice,
      commissionPercent: srvDressing.commissionPercent,
      commissionAmount: commAmount,
      nurseEarningsAmount: nurseEarnings,
      tipAmount: 50.0,
      totalPatientAmount: srvDressing.basePrice + 50.0,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
    },
  });

  // 6. Seed Payment Record
  await prisma.payment.create({
    data: {
      bookingId: sampleBooking.id,
      amount: sampleBooking.totalPatientAmount,
      currency: 'INR',
      method: 'UPI',
      status: 'PAID',
      paymentRef: 'UPI-CRN-847291048',
      reconciledByAdminId: adminUser.id,
      reconciledAt: new Date(),
    },
  });

  // 7. Seed Payable Record for Nurse
  await prisma.payable.create({
    data: {
      nurseId: nurseProfile2.id,
      bookingId: sampleBooking.id,
      amount: nurseEarnings + 50.0, // Earnings + Tip
      status: 'UNPAID',
    },
  });

  // 8. Audit Log
  await prisma.auditLog.create({
    data: {
      entityType: 'BOOKING',
      entityId: sampleBooking.id,
      action: 'BOOKING_CONFIRMED',
      actorId: adminUser.id,
      actorRole: 'ADMIN',
      newValues: JSON.stringify({ status: 'CONFIRMED', paymentStatus: 'PAID' }),
    },
  });

  console.log('✅ Seeding complete!');
  console.log('🔑 Test Credentials:');
  console.log('   - Patient: patient@careoon.com / patient123');
  console.log('   - Nurse: nurse@careoon.com / nurse123 (Pooja Kulkarni)');
  console.log('   - Nurse: nurse.maya@careoon.com / nurse123 (Maya Patel)');
  console.log('   - Admin: admin@careoon.com / admin123 (Dr. Anand Joshi)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
