const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const categories = await prisma.serviceCategory.findMany({
    include: { services: true }
  });
  console.log('Categories & Services count:', categories.length);
  for (const c of categories) {
    console.log(`- Category: ${c.name} (${c.services.length} services)`);
    for (const s of c.services) {
      console.log(`    • ${s.name} - ₹${s.basePrice} (${s.durationMinutes}m, commission: ${s.commissionPercent}%) [slug: ${s.slug}]`);
    }
  }

  const coupons = await prisma.coupon.findMany();
  console.log('\nCoupons:', coupons.length);
  for (const cp of coupons) {
    console.log(`- Coupon: ${cp.code} -> ₹${cp.discountValue} (${cp.discountType}), active: ${cp.isActive}`);
  }

  const nurses = await prisma.nurseProfile.findMany({
    include: { user: true }
  });
  console.log('\nNurses in DB:', nurses.length);
  for (const n of nurses) {
    console.log(`- Nurse: ${n.user.fullName} | Code: ${n.nurseCode || 'NONE'} | Approval: ${n.adminApprovalStatus}`);
  }

  const users = await prisma.user.findMany();
  console.log('\nAll Users in DB:', users.length);
  for (const u of users) {
    console.log(`- User: ${u.fullName} (${u.role}) | Email: ${u.email} | Phone: ${u.phone}`);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
