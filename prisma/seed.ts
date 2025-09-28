import { PrismaClient, PromotionType } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

async function seedCars() {
  const basePrice = 1000; // IDR

  const cars = [
    { name: "Toyota Avanza", price: 640 * basePrice },
    { name: "Toyota Innova", price: 890 * basePrice },
    { name: "New Atlis", price: 1500 * basePrice },
    { name: "New Camry", price: 2190 * basePrice },
    { name: "Toyota Alphard", price: 3220 * basePrice },
    { name: "Mitsubishi Xpander", price: 400 * basePrice },
    { name: "Suzuki Ertiga", price: 600 * basePrice },
    { name: "Honda Mobilio", price: 500 * basePrice },
    { name: "Toyota Fortuner", price: 900 * basePrice },
    { name: "Mitsubishi Pajero Sport", price: 950 * basePrice },
    { name: "Hiace Commuter", price: 1200 * basePrice },
    { name: "Daihatsu Sigra", price: 300 * basePrice },
  ];

  // prevent duplicate data
  const existingCar = await prisma.car.findFirst({
    select: { name: true },
    where: { name: cars[0].name },
  });

  if (existingCar) {
    console.log(
      "Car seed not executed because there is already data in the database"
    );
    return;
  }

  // seed database with cars
  await prisma.car.createMany({
    data: cars,
  });

  console.log("Car seed complete");
}

async function seedPromotions() {
  const promotions = [
    {
      name: "Program diskon rental 4 hari",
      type: PromotionType.PERCENTAGE,
      value: 10,
      minDuration: 4,
      maxDuration: 4,
      minAmount: null,
      maxDiscount: null,
    },
    {
      name: "Program diskon rental 1 minggu",
      type: PromotionType.PERCENTAGE,
      value: 20,
      minDuration: 7,
      maxDuration: 7,
      minAmount: null,
      maxDiscount: null,
    },
    {
      name: "Program diskon rental 10 hari",
      type: PromotionType.PERCENTAGE,
      value: 25,
      minDuration: 10,
      maxDuration: 10,
      minAmount: null,
      maxDiscount: null,
    },
  ];

  // prevent duplicate data
  const existingPromotion = await prisma.promotion.findFirst({
    select: { name: true },
    where: { name: promotions[0].name },
  });

  if (existingPromotion) {
    console.log(
      "Promotion seed not executed because there is already data in the database"
    );
    return;
  }

  // seed database with promotions
  await prisma.promotion.createMany({
    data: promotions,
  });

  console.log("Promotion seed complete");
}

async function main() {
  await seedCars();
  await seedPromotions();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
