import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding');

  // 1) Ensure fixed roles exist
  for (const roleName of ['USER', 'ADMIN'] as const) {
    await prisma.role.upsert({
      where:  { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // 2) Create three static products
  const fixedProducts = [
    { code: 'PRD001', name: 'Basic Notebook', description: '100-page ruled notebook', price: 2.50, unit: 'piece' },
    { code: 'PRD002', name: 'Ballpoint Pen',   description: 'Blue ink ballpoint pen',   price: 1.00, unit: 'piece' },
    { code: 'PRD003', name: 'Stapler',         description: 'Standard office stapler',   price: 5.99, unit: 'piece' },
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

  // 3) Create two static clients
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

  // 4) Create a discount for the first static product
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

  // 5) Generate 1000 random products
  console.log('Generating 1000 random products');
  const randomProducts = Array.from({ length: 1000 }).map(() => ({
    id:           uuidv4(),
    code:         faker.string.alphanumeric({ length: 6, casing: 'upper' }),
    name:         faker.commerce.productName(),
    description:  faker.datatype.boolean() ? faker.commerce.productDescription() : null,
    price:        parseFloat(faker.commerce.price({ min: 1, max: 1000, dec: 2 })),
    unit:         faker.helpers.arrayElement(['piece', 'kg', 'litre'] as const),
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
  });

  // 6) Generate 1000 random clients
  console.log('Generating 1000 random clients');
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
      email:     c.email || undefined,
      phone:     c.phone,
      isDeleted: false,
    })),
  });

  // 7) Generate 5000 sales with items
  console.log('Generating 5000 sales with items');
  const allProductIds = (await prisma.product.findMany({ select: { id: true } })).map(p => p.id);
  const allClientIds  = (await prisma.client.findMany({ select: { id: true } })).map(c => c.id);

  for (let i = 0; i < 5000; i++) {
    const sale = await prisma.sale.create({
      data: {
        id:            uuidv4(),
        date:          faker.date.past({ years: 1 }),
        subtotal:      0,
        discountTotal: 0,
        total:         0,
        paymentMethod: faker.helpers.arrayElement(['cash','card','transfer'] as const),
        isCanceled:    faker.datatype.boolean(0.05),
        createdById:   null,
        clientId:      faker.helpers.arrayElement(allClientIds),
      },
    });

    let subtotal = 0;
    let discountTotal = 0;
    const itemCount = faker.number.int({ min: 1, max: 5 });

    for (let j = 0; j < itemCount; j++) {
      const productId  = faker.helpers.arrayElement(allProductIds);
      const product    = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
      const priceValue = Number(product.price);
      const quantity   = faker.number.int({ min: 1, max: 10 });
      const discount   = (productId === firstProduct?.id && faker.datatype.boolean(0.2))
        ? Math.round(priceValue * quantity * 0.10 * 100) / 100
        : 0;

      subtotal      += priceValue * quantity;
      discountTotal += discount;

      await prisma.saleItem.create({
        data: {
          id:              uuidv4(),
          quantity,
          unitPrice:       priceValue,
          discountApplied: discount,
          saleId:          sale.id,
          productId,
        },
      });
    }

    await prisma.sale.update({
      where: { id: sale.id },
      data:  {
        subtotal,
        discountTotal,
        total: subtotal - discountTotal,
      },
    });
  }

  // 8) Log top 10 products by quantity sold
  console.log('Top 10 products by quantity sold:');
  const topProducts = await prisma.saleItem.groupBy({
    by:      ['productId'],
    _sum:    { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take:    10,
  });

  for (const entry of topProducts) {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: entry.productId } });
    console.log(`${product.code} - ${product.name}: ${entry._sum.quantity}`);
  }

  // 9) Log top 10 clients by total billed
  console.log('Top 10 clients by total billed:');
  const topClients = await prisma.sale.groupBy({
    by:      ['clientId'],
    where:   { clientId: { not: null } },
    _sum:    { total: true },
    orderBy: { _sum: { total: 'desc' } },
    take:    10,
  });

  for (const entry of topClients) {
    const clientId = entry.clientId;
    if (clientId == null) continue;  // this narrows type to string
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId },
    });
    console.log(`${client.code} - ${client.name}: $${entry._sum.total!.toFixed(2)}`);
  }
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
