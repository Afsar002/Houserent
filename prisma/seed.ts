import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed Owner
  const owner = await prisma.owner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Afsar Hussain",
      address: "123 Park Avenue, Guwahati",
      phone: "+91 9876543210",
    },
  });

  // Seed Managers
  await prisma.manager.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Afsar Hussain (Owner)",
      address: "123 Park Avenue, Guwahati",
      phone: "+91 9876543210",
    },
  });
  await prisma.manager.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Ramesh Kumar (Manager)",
      address: "45 Lake View Road, Guwahati",
      phone: "+91 9123456789",
    },
  });

  // Seed Properties with Units
  const house1 = await prisma.property.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Residential House (Main Street)",
      ownerId: owner.id,
      sealUrl: "",
      units: {
        create: [
          { floor: "1st Floor", unit: "Unit 101", tenantName: "Rahul Sharma", tenantPhone: "+91 9876543210", rent: 15000, water: 500, tax: 0, prevBalance: 0 },
          { floor: "1st Floor", unit: "Unit 102", tenantName: "Priya Verma", tenantPhone: "+91 9876543211", rent: 16000, water: 500, tax: 0, prevBalance: 1200 },
          { floor: "2nd Floor", unit: "Unit 201", tenantName: "Amit Patel", tenantPhone: "+91 9876543212", rent: 18000, water: 600, tax: 0, prevBalance: 0 },
        ],
      },
    },
  });

  await prisma.property.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Godown 1 (Industrial Estate)",
      ownerId: owner.id,
      sealUrl: "",
      units: {
        create: [
          { floor: "Ground Floor", unit: "Bay A", tenantName: "Logistics Corp Pvt Ltd", tenantPhone: "+91 9876543213", rent: 45000, water: 1200, tax: 2250, prevBalance: 0 },
          { floor: "Ground Floor", unit: "Bay B", tenantName: "Metro Hardware Suppliers", tenantPhone: "+91 9876543214", rent: 50000, water: 1500, tax: 2500, prevBalance: 5000 },
        ],
      },
    },
  });

  await prisma.property.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Godown 2 (Commercial Complex)",
      ownerId: owner.id,
      sealUrl: "",
      units: {
        create: [
          { floor: "Ground Floor", unit: "Shop 01", tenantName: "Apex Electronics", tenantPhone: "+91 9876543215", rent: 30000, water: 800, tax: 1500, prevBalance: 0 },
        ],
      },
    },
  });

  console.log("Seed completed successfully!");
  console.log(`- Owner: ${owner.name}`);
  console.log("- Properties: Residential House, Godown 1, Godown 2");
  console.log("- Managers: Afsar Hussain, Ramesh Kumar");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });