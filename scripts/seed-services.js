const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding initial clinical services for Sangli - Miraj...');

  // Ensure category exists
  let cat = await prisma.serviceCategory.findFirst({
    where: { slug: 'home-clinical-procedures' }
  });

  if (!cat) {
    cat = await prisma.serviceCategory.create({
      data: {
        name: 'Home Clinical Procedures',
        slug: 'home-clinical-procedures',
        description: 'Hospital-grade sterile nursing procedures delivered at your doorstep across Sangli - Miraj.',
        displayOrder: 1,
        isActive: true,
      }
    });
    console.log('✓ Created category: Home Clinical Procedures');
  }

  const initialServices = [
    {
      name: 'Surgical Wound Dressing (Aseptic)',
      slug: 'surgical-wound-dressing',
      description: 'Complete aseptic wound cleaning, suture check, infection assessment, and sterile surgical dressing by verified MNC registered nurse.',
      shortDescription: 'Complete aseptic wound cleaning, suture check, infection assessment, and sterile dressing.',
      basePrice: 750,
      durationMinutes: 45,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Sterile dressing kit provided', 'Doctor prescription required for complex wounds']),
    },
    {
      name: 'Full Health Vitals & Blood Sugar Monitoring',
      slug: 'vitals-blood-sugar-monitoring',
      description: 'Complete clinical assessment: Blood Pressure, Pulse, SpO2, Temperature, and Random Blood Glucose with clinical chart handover.',
      shortDescription: 'Complete clinical assessment: BP, Pulse, SpO2, Temperature, and Blood Sugar.',
      basePrice: 400,
      durationMinutes: 30,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Digital calibrated equipment included', 'Instant WhatsApp digital report']),
    },
    {
      name: 'Urinary Catheterization & Care',
      slug: 'urinary-catheterization-care',
      description: 'Aseptic Foley catheter insertion, replacement, drainage bag management, and antiseptic bladder wash under sterile protocols.',
      shortDescription: 'Aseptic Foley catheter insertion, replacement, and drainage bag management.',
      basePrice: 1100,
      durationMinutes: 60,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Sterile catheter kit included', 'Must have physician prescription']),
    },
    {
      name: 'IV Infusion & Cannulation',
      slug: 'iv-infusion-cannulation',
      description: 'Intravenous cannula insertion, fluid drip setup, infusion rate monitoring, and adverse reaction check by licensed nurse.',
      shortDescription: 'Intravenous cannula insertion, fluid drip setup, and infusion rate monitoring.',
      basePrice: 650,
      durationMinutes: 60,
      commissionPercent: 15.0,
      eligibilityRules: JSON.stringify(['Doctor prescription mandatory', 'Prescribed IV fluids & medications must be kept ready']),
    },
  ];

  for (const s of initialServices) {
    const existing = await prisma.service.findFirst({
      where: { slug: s.slug }
    });
    if (!existing) {
      await prisma.service.create({
        data: {
          ...s,
          categoryId: cat.id,
          isActive: true,
        }
      });
      console.log(`✓ Created procedure: ${s.name} (₹${s.basePrice})`);
    } else {
      console.log(`- Procedure already exists: ${s.name}`);
    }
  }

  console.log('Seeding finished successfully.');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
