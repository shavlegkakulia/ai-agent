import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { normalizeEmail, normalizePhoneNumber } from '../src/helper/factory';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // მხოლოდ ჩვენი ახალი commerce data გავასუფთაოთ.
  // FK-ების გამო Order პირველი უნდა წაიშალოს.
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  const iphone = await prisma.product.create({
    data: {
      name: 'Apple iPhone 16 128GB',
      price: '2799.00',
      stockQuantity: 12,
    },
  });

  const samsung = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S24 128GB',
      price: '2199.00',
      stockQuantity: 18,
    },
  });

  const airpods = await prisma.product.create({
    data: {
      name: 'Apple AirPods Pro 2',
      price: '699.00',
      stockQuantity: 30,
    },
  });

  const sonyHeadphones = await prisma.product.create({
    data: {
      name: 'Sony WH-1000XM5',
      price: '999.00',
      stockQuantity: 10,
    },
  });

  const mouse = await prisma.product.create({
    data: {
      name: 'Logitech MX Master 3S',
      price: '329.00',
      stockQuantity: 25,
    },
  });

  const tv = await prisma.product.create({
    data: {
      name: 'LG OLED C4 55"',
      price: '4299.00',
      stockQuantity: 6,
    },
  });

  const monitor = await prisma.product.create({
    data: {
      name: 'Dell UltraSharp U2723QE 27"',
      price: '1799.00',
      stockQuantity: 8,
    },
  });

  const nika = await prisma.customer.create({
    data: {
      name: 'ნიკა ბერიძე',
      phone: normalizePhoneNumber('+995555111222'),
      address: 'თბილისი, ვაჟა-ფშაველას გამზირი 71',
      email: normalizeEmail('nika.beri@example.com'),
      customerRef: randomUUID(),
    },
  });

  const mariam = await prisma.customer.create({
    data: {
      name: 'მარიამ კაპანაძე',
      phone: normalizePhoneNumber('+995599234567'),
      address: 'თბილისი, პეკინის გამზირი 24',
      email: normalizeEmail('mariam.kapanadze@example.com'),
      customerRef: randomUUID(),
    },
  });

  const giorgi = await prisma.customer.create({
    data: {
      name: 'გიორგი მაისურაძე',
      phone: normalizePhoneNumber('+995577345678'),
      address: 'რუსთავი, მეგობრობის გამზირი 18',
      email: normalizeEmail('giorgi.maisuradze@example.com'),
      customerRef: randomUUID(),
    },
  });

  const ana = await prisma.customer.create({
    data: {
      name: 'ანა ლომიძე',
      phone: normalizePhoneNumber('+995568456789'),
      address: 'ქუთაისი, რუსთაველის გამზირი 42',
      email: normalizeEmail('ana.lomidze@example.com'),
      customerRef: randomUUID(),
    },
  });

  const levan = await prisma.customer.create({
    data: {
      name: 'ლევან ხუციშვილი',
      phone: normalizePhoneNumber('+995591567890'),
      address: 'ბათუმი, ფარნავაზ მეფის ქუჩა 63',
      email: normalizeEmail('levan.khutsishvili@example.com'),
      customerRef: randomUUID(),
    },
  });

  const salome = await prisma.customer.create({
    data: {
      name: 'სალომე ჯაფარიძე',
      phone: normalizePhoneNumber('+995551678901'),
      address: 'თბილისი, ყაზბეგის გამზირი 31',
      email: normalizeEmail('salome.japaridze@example.com'),
      customerRef: randomUUID(),
    },
  });

  await prisma.order.createMany({
    data: [
      // ნიკას რამდენიმე შეკვეთა აქვს
      {
        customerId: nika.id,
        productId: iphone.id,
        quantity: 1,
        status: 'DELIVERED',
      },
      {
        customerId: nika.id,
        productId: airpods.id,
        quantity: 1,
        status: 'PENDING',
      },
      {
        customerId: nika.id,
        productId: mouse.id,
        quantity: 2,
        status: 'CANCELLED',
      },

      // მარიამი
      {
        customerId: mariam.id,
        productId: samsung.id,
        quantity: 1,
        status: 'DELIVERED',
      },
      {
        customerId: mariam.id,
        productId: sonyHeadphones.id,
        quantity: 1,
        status: 'PENDING',
      },

      // გიორგი
      {
        customerId: giorgi.id,
        productId: tv.id,
        quantity: 1,
        status: 'PENDING',
      },
      {
        customerId: giorgi.id,
        productId: mouse.id,
        quantity: 1,
        status: 'DELIVERED',
      },

      // ანა
      {
        customerId: ana.id,
        productId: monitor.id,
        quantity: 2,
        status: 'DELIVERED',
      },
      {
        customerId: ana.id,
        productId: airpods.id,
        quantity: 1,
        status: 'REFUNDED',
      },

      // ლევანი
      {
        customerId: levan.id,
        productId: iphone.id,
        quantity: 1,
        status: 'PENDING',
      },
      {
        customerId: levan.id,
        productId: sonyHeadphones.id,
        quantity: 1,
        status: 'CANCELLED',
      },

      // სალომე
      {
        customerId: salome.id,
        productId: samsung.id,
        quantity: 1,
        status: 'DELIVERED',
      },
      {
        customerId: salome.id,
        productId: monitor.id,
        quantity: 1,
        status: 'PENDING',
      },
    ],
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
