// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 }   from 'uuid';
import { faker }          from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding…');

  // 1) Ensure fixed roles exist
  for (const roleName of ['USER', 'ADMIN'] as const) {
    await prisma.role.upsert({
      where:   { name: roleName },
      update:  {},
      create:  { name: roleName },
    });
  }

  // 2) Seed three static products
  const fixedProducts = [
    { code: 'PRD001', name: 'Basic Notebook',  description: '100-page ruled notebook', price: 2.50, unit: 'piece' },
    { code: 'PRD002', name: 'Ballpoint Pen',    description: 'Blue ink ballpoint pen',   price: 1.00, unit: 'piece' },
    { code: 'PRD003', name: 'Stapler',          description: 'Standard office stapler',   price: 5.99, unit: 'piece' },
  ];

  for (const p of fixedProducts) {
    await prisma.product.upsert({
      where:  { code: p.code },
      update: {},
      create: {
        id:           uuidv4(),
        code:         p.code,
        name:         p.name,
        description:  p.description,
        price:        p.price,
        unit:         p.unit,
        createdById:  null,
      },
    });
  }

  // 3) Seed two static clients
  const fixedClients = [
    { code: 'CLI001', name: 'Acme Corporation',  nit: '900123456', phone: '555-0001', email: 'contact@acme.com' },
    { code: 'CLI002', name: 'Global Enterprises', nit: '900654321', phone: '555-0002', email: 'info@globalent.com' },
  ];

  for (const c of fixedClients) {
    await prisma.client.upsert({
      where:  { code: c.code },
      update: {},
      create: {
        id:           uuidv4(),
        code:         c.code,
        name:         c.name,
        nit:          c.nit,
        phone:        c.phone,
        email:        c.email,
        createdById:  null,
      },
    });
  }

  // 4) Seed one discount on the first fixed product
  const firstProduct = await prisma.product.findUnique({ where: { code: fixedProducts[0].code } });
  if (firstProduct) {
    await prisma.discount.upsert({
      where:  { code: 'DISC10' },
      update: {},
      create: {
        id:          uuidv4(),
        code:        'DISC10',
        percentage:  10,
        validFrom:   new Date(),
        validTo:     new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive:    true,
        createdById: null,
        productId:   firstProduct.id,
      },
    });
  }

  // 5) Generate 1 000 random products
  console.log('…generating 1 000 random products');
  const randomProducts = Array.from({ length: 1000 }).map(() => ({
    id:           uuidv4(),
    code:         faker.string.alphanumeric({ length: 6, casing: 'upper' }),
    name:         faker.commerce.productName(),
    description:  faker.datatype.boolean() ? faker.commerce.productDescription() : null,
    price:        parseFloat(faker.commerce.price({ min: 1, max: 1000, dec: 2 })),  // use `dec` here
    unit:         faker.helpers.arrayElement(['piece', 'kg', 'litre']),
  }));

  await prisma.product.createMany({
    data: randomProducts.map(p => ({
      id:          p.id,
      code:        p.code,
      name:        p.name,
      description: p.description,
      price:       p.price,
      unit:        p.unit,
      isDeleted:   false,
    })),
    // drop skipDuplicates—Prisma's TS signature no longer includes it by default
  });

  // 6) Generate 1 000 random clients
  console.log('…generating 1 000 random clients');
  const randomClients = Array.from({ length: 1000 }).map(() => ({
    id:    uuidv4(),
    code:  faker.string.alphanumeric({ length: 6, casing: 'upper' }),
    name:  faker.company.name(),
    nit:   faker.string.numeric({ length: 8 }),
    email: faker.datatype.boolean() ? faker.internet.email() : null,
    phone: faker.phone.number(),
  }));

  await prisma.client.createMany({
    data: randomClients.map(c => ({
      id:        c.id,
      code:      c.code,
      name:      c.name,
      nit:       c.nit,
      email:     c.email,
      phone:     c.phone,
      isDeleted: false,
    })),
  });

  console.log('🎉 Database seeding complete');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
