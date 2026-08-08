import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/owners - list all owners
export async function GET() {
  try {
    const owners = await prisma.owner.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(owners);
  } catch (error) {
    console.error("Error fetching owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch owners" },
      { status: 500 }
    );
  }
}

// POST /api/owners - create a new owner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Owner name is required" },
        { status: 400 }
      );
    }

    const owner = await prisma.owner.create({
      data: {
        name: body.name,
        address: body.address || "",
        phone: body.phone || "",
      },
    });

    return NextResponse.json(owner, { status: 201 });
  } catch (error) {
    console.error("Error creating owner:", error);
    return NextResponse.json(
      { error: "Failed to create owner" },
      { status: 500 }
    );
  }
}

// PUT /api/owners?id=1 - update an owner
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "Owner id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const owner = await prisma.owner.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        address: body.address ?? undefined,
        phone: body.phone ?? undefined,
      },
    });

    return NextResponse.json(owner);
  } catch (error) {
    console.error("Error updating owner:", error);
    return NextResponse.json(
      { error: "Failed to update owner" },
      { status: 500 }
    );
  }
}

// DELETE /api/owners?id=1 - delete an owner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "Owner id is required" },
        { status: 400 }
      );
    }

    // Delete or reassign properties referencing this owner
    await prisma.owner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting owner:", error);
    return NextResponse.json(
      { error: "Failed to delete owner" },
      { status: 500 }
    );
  }
}