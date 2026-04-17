const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nutrilog.com' },
    update: {},
    create: {
      email: 'admin@nutrilog.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
      goals: { create: {} },
    },
  });
  console.log('Admin user created:', admin.email);

  // Sample diseases
  const diseases = [
    { name: 'Type 2 Diabetes', description: 'A metabolic disorder affecting blood sugar regulation', category: 'Metabolic', symptoms: ['Frequent urination', 'Increased thirst', 'Fatigue', 'Blurred vision'], dietaryRecs: ['Low glycemic index foods', 'High fiber diet', 'Limit simple carbohydrates', 'Regular meal timing'], exerciseRecs: ['30 min moderate cardio daily', 'Resistance training 2-3x/week', 'Walking after meals'], avoidFoods: ['Sugary drinks', 'White bread', 'Candy', 'Processed foods'], goodFoods: ['Leafy greens', 'Whole grains', 'Lean proteins', 'Berries', 'Legumes'], icdCode: 'E11' },
    { name: 'Hypertension', description: 'High blood pressure affecting cardiovascular health', category: 'Cardiovascular', symptoms: ['Headaches', 'Shortness of breath', 'Nosebleeds'], dietaryRecs: ['DASH diet', 'Reduce sodium to <2300mg/day', 'Increase potassium', 'Limit alcohol'], exerciseRecs: ['Aerobic exercise 30 min most days', 'Yoga for stress reduction', 'Avoid heavy lifting'], avoidFoods: ['High sodium foods', 'Processed meats', 'Pickled foods', 'Alcohol'], goodFoods: ['Bananas', 'Spinach', 'Beets', 'Garlic', 'Oatmeal', 'Berries'], icdCode: 'I10' },
    { name: 'Celiac Disease', description: 'Autoimmune disorder triggered by gluten consumption', category: 'Autoimmune', symptoms: ['Diarrhea', 'Bloating', 'Fatigue', 'Weight loss'], dietaryRecs: ['Strict gluten-free diet', 'Increase iron and calcium', 'Supplement B vitamins'], exerciseRecs: ['Regular moderate exercise', 'Yoga for digestive health'], avoidFoods: ['Wheat', 'Barley', 'Rye', 'Oats (unless certified GF)', 'Beer'], goodFoods: ['Rice', 'Quinoa', 'Potatoes', 'Fruits', 'Vegetables', 'Lean meats'], icdCode: 'K90.0' },
  ];

  for (const d of diseases) {
    await prisma.disease.upsert({ where: { id: d.name }, update: {}, create: d }).catch(() => prisma.disease.create({ data: d }));
  }
  console.log('Sample diseases seeded');
  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
