import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/managers - list all managers
export async function GET() {
  try {
    const managers = await prisma.manager.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { error: "Failed to fetch managers" },
      { status: 500 }
    );
  }
}

// POST /api/managers - create a new manager
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Manager name is required" },
        { status: 400 }
      );
    }

    const manager = await prisma.manager.create({
      data: {
        name: body.name,
        address: body.address || "",
        phone: body.phone || "",
      },
    });

    return NextResponse.json(manager, { status: 201 });
  } catch (error) {
    console.error("Error creating manager:", error);
    return NextResponse.json(
      { error: "Failed to create manager" },
      { status: 500 }
    );
  }
}

// PUT /api/managers?id=1 - update a manager
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "Manager id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const manager = await prisma.manager.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        address: body.address ?? undefined,
        phone: body.phone ?? undefined,
      },
    });

    return NextResponse.json(manager);
  } catch (error) {
    console.error("Error updating manager:", error);
    return NextResponse.json(
      { error: "Failed to update manager" },
      { status: 500 }
    );
  }
}

// DELETE /api/managers?id=1 - delete a manager
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "Manager id is required" },
        { status: 400 }
      );
    }

    await prisma.manager.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting manager:", error);
    return NextResponse.json(
      { error: "Failed to delete manager" },
      { status: 500 }
    );
  }
}