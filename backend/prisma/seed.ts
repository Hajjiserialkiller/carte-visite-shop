import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "classic-matte",
    name: "Classic Matte",
    description:
      "The timeless standard. Thick 350gsm uncoated card with a soft matte touch, ideal for elegant minimal designs.",
    category: "classic",
    material: "350gsm uncoated",
    finish: "Matte",
    imageUrl: "/images/cards/classic-matte.svg",
    featured: true,
    tiers: [
      { quantity: 50, pricePer100: 2400 },
      { quantity: 100, pricePer100: 1800 },
      { quantity: 250, pricePer100: 1400 },
      { quantity: 500, pricePer100: 1100 },
    ],
  },
  {
    slug: "classic-gloss",
    name: "Classic Gloss",
    description:
      "Vivid colours with a glossy coating. A punchy finish that makes photographs and gradients pop.",
    category: "classic",
    material: "350gsm coated",
    finish: "Gloss",
    imageUrl: "/images/cards/classic-gloss.svg",
    featured: false,
    tiers: [
      { quantity: 50, pricePer100: 2400 },
      { quantity: 100, pricePer100: 1800 },
      { quantity: 250, pricePer100: 1400 },
      { quantity: 500, pricePer100: 1100 },
    ],
  },
  {
    slug: "premium-soft-touch",
    name: "Premium Soft Touch",
    description:
      "A velvet-soft lamination that feels luxurious in the hand. Our best-seller for premium brands.",
    category: "premium",
    material: "400gsm silk",
    finish: "Soft touch",
    imageUrl: "/images/cards/premium-soft-touch.svg",
    featured: true,
    tiers: [
      { quantity: 50, pricePer100: 3800 },
      { quantity: 100, pricePer100: 2900 },
      { quantity: 250, pricePer100: 2300 },
      { quantity: 500, pricePer100: 1900 },
    ],
  },
  {
    slug: "premium-gold-foil",
    name: "Gold Foil Luxury",
    description:
      "Hot-stamped real gold foil on deep black. A statement card that commands attention.",
    category: "premium",
    material: "400gsm cotton",
    finish: "Gold foil",
    imageUrl: "/images/cards/premium-gold-foil.svg",
    featured: true,
    tiers: [
      { quantity: 50, pricePer100: 6200 },
      { quantity: 100, pricePer100: 4800 },
      { quantity: 250, pricePer100: 3900 },
      { quantity: 500, pricePer100: 3200 },
    ],
  },
  {
    slug: "metal-brushed",
    name: "Brushed Metal",
    description:
      "0.5mm brushed stainless steel, engraved and rounded. Built to last a lifetime.",
    category: "metal",
    material: "0.5mm stainless steel",
    finish: "Brushed",
    imageUrl: "/images/cards/metal-brushed.svg",
    featured: false,
    tiers: [
      { quantity: 50, pricePer100: 14500 },
      { quantity: 100, pricePer100: 11000 },
      { quantity: 250, pricePer100: 9000 },
    ],
  },
  {
    slug: "transparent-crystal",
    name: "Transparent Crystal",
    description:
      "Crystal-clear PVC cards with crisp white printing. A modern choice for creative agencies.",
    category: "transparent",
    material: "0.5mm PVC",
    finish: "Transparent",
    imageUrl: "/images/cards/transparent-crystal.svg",
    featured: true,
    tiers: [
      { quantity: 50, pricePer100: 5200 },
      { quantity: 100, pricePer100: 4000 },
      { quantity: 250, pricePer100: 3200 },
      { quantity: 500, pricePer100: 2600 },
    ],
  },
  {
    slug: "velvet-deboss",
    name: "Velvet Deboss",
    description:
      "Thick cotton stock with a deep letterpress deboss. Tactile, quiet, unmistakably premium.",
    category: "luxury",
    material: "600gsm cotton",
    finish: "Debossed",
    imageUrl: "/images/cards/velvet-deboss.svg",
    featured: false,
    tiers: [
      { quantity: 50, pricePer100: 7800 },
      { quantity: 100, pricePer100: 6200 },
      { quantity: 250, pricePer100: 5200 },
    ],
  },
  {
    slug: "kraft-eco",
    name: "Eco Kraft",
    description:
      "Recycled kraft stock, printed with soy inks. Sustainable without sacrificing style.",
    category: "kraft",
    material: "330gsm recycled",
    finish: "Uncoated",
    imageUrl: "/images/cards/kraft-eco.svg",
    featured: false,
    tiers: [
      { quantity: 50, pricePer100: 2000 },
      { quantity: 100, pricePer100: 1500 },
      { quantity: 250, pricePer100: 1200 },
      { quantity: 500, pricePer100: 950 },
    ],
  },
];

async function main() {
  await prisma.product.deleteMany();

  for (const p of products) {
    const { tiers, ...product } = p;
    await prisma.product.create({
      data: {
        ...product,
        tiers: { create: tiers },
      },
    });
  }

  const count = await prisma.product.count();
  console.log(`Seeded ${count} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
