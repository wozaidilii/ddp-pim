// Demo data: a published organic cotton t-shirt and a draft water bottle
import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

async function main() {
  const existing = await db.product.count();
  if (existing > 0) {
    console.log("Products already exist, skipping seed");
    return;
  }

  await db.product.create({
    data: {
      name: "Organic Cotton T-Shirt",
      sku: "TS-ORG-001",
      gtin: "4712345678901",
      brand: "Verdant",
      category: "Apparel",
      description:
        "Classic-fit t-shirt made from 100% GOTS-certified organic cotton, dyed with low-impact pigments.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      countryOfOrigin: "Portugal",
      carbonFootprintKg: 4.2,
      recyclabilityPct: 95,
      durabilityYears: 5,
      repairabilityScore: 8.5,
      careInstructions:
        "Machine wash cold with like colors. Tumble dry low. Do not bleach.",
      certifications: "GOTS, OEKO-TEX Standard 100",
      materials: {
        create: [
          {
            name: "Organic Cotton",
            percentage: 92,
            recycled: false,
            origin: "Turkey",
          },
          {
            name: "Recycled Polyester",
            percentage: 8,
            recycled: true,
            origin: "Netherlands",
          },
        ],
      },
      supplyChain: {
        create: [
          {
            order: 0,
            stage: "Raw Material",
            facility: "Aegean Organic Farms",
            location: "Izmir, Turkey",
            description: "Organic cotton cultivation and harvesting",
          },
          {
            order: 1,
            stage: "Spinning & Weaving",
            facility: "TexNova Mills",
            location: "Guimarães, Portugal",
          },
          {
            order: 2,
            stage: "Manufacturing",
            facility: "Verdant Atelier",
            location: "Porto, Portugal",
            description: "Cutting, sewing and low-impact dyeing",
          },
          {
            order: 3,
            stage: "Distribution",
            facility: "EU Fulfilment Hub",
            location: "Rotterdam, Netherlands",
          },
        ],
      },
    },
  });

  await db.product.create({
    data: {
      name: "Stainless Steel Water Bottle 750ml",
      sku: "WB-SS-750",
      brand: "Verdant",
      category: "Drinkware",
      description:
        "Double-walled insulated bottle keeping drinks cold for 24h.",
      status: "DRAFT",
      countryOfOrigin: "Taiwan",
      carbonFootprintKg: 6.8,
      recyclabilityPct: 100,
      durabilityYears: 12,
      materials: {
        create: [
          {
            name: "18/8 Stainless Steel",
            percentage: 85,
            recycled: true,
            origin: "Taiwan",
          },
          { name: "Silicone", percentage: 10, recycled: false },
          { name: "Polypropylene", percentage: 5, recycled: false },
        ],
      },
      supplyChain: {
        create: [
          {
            order: 0,
            stage: "Raw Material",
            facility: "Formosa Steel Works",
            location: "Kaohsiung, Taiwan",
          },
          {
            order: 1,
            stage: "Manufacturing",
            facility: "HydroTech Manufacturing",
            location: "Taichung, Taiwan",
          },
        ],
      },
    },
  });

  console.log("Seed complete: created 2 demo products");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
