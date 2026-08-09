import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/properties - list all properties with units and owner
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: true,
        units: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// POST /api/properties - create a new property with optional units
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Property name is required" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        name: body.name,
        ownerId: Number(body.ownerId) || 1,
        sealUrl: body.sealUrl || "",
        qrUrl: body.qrUrl || "",
        units: body.units?.length
          ? {
              create: body.units.map((u: any) => ({
                floor: u.floor || "",
                unit: u.unit || "",
                tenantName: u.tenantName || "",
                tenantPhone: u.tenantPhone || "",
                rent: Number(u.rent) || 0,
                water: Number(u.water) || 0,
                tax: Number(u.tax) || 0,
                prevBalance: Number(u.prevBalance) || 0,
              })),
            }
          : undefined,
      },
      include: {
        owner: true,
        units: true,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}

// PUT /api/properties?id=1 - update a property (name, ownerId, sealUrl, units)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "Property id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update property fields + replace units atomically in ONE transaction.
    // Doing deleteMany/createMany as separate queries lets two concurrent PUTs
    // interleave (delete, delete, insert, insert) and duplicate unit rows.
    const property = await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id },
        data: {
          name: body.name ?? undefined,
          ownerId: body.ownerId !== undefined ? Number(body.ownerId) : undefined,
          sealUrl: body.sealUrl ?? undefined,
          qrUrl: body.qrUrl ?? undefined,
        },
      });

      // If units are provided, replace all units for this property
      if (body.units && Array.isArray(body.units)) {
        await tx.unit.deleteMany({ where: { propertyId: id } });
        await tx.unit.createMany({
          data: body.units.map((u: any) => ({
            propertyId: id,
            floor: u.floor || "",
            unit: u.unit || "",
            tenantName: u.tenantName || "",
            tenantPhone: u.tenantPhone || "",
            rent: Number(u.rent) || 0,
            water: Number(u.water) || 0,
            tax: Number(u.tax) || 0,
            prevBalance: Number(u.prevBalance) || 0,
          })),
        });
      }

      return tx.property.findUnique({
        where: { id },
        include: { owner: true, units: true },
      });
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties?id=1 - delete a property (cascades to units)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "Property id is required" },
        { status: 400 }
      );
    }

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}