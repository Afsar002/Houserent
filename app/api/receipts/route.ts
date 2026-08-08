import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ReceiptInput } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/receipts - list all receipts, or fetch by receiptNo via query param ?receiptNo=0005
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const receiptNo = searchParams.get("receiptNo");
    const propertyName = searchParams.get("propertyName");
    const tenantName = searchParams.get("tenantName");

    let receipts;
    if (receiptNo) {
      receipts = await prisma.receipt.findMany({
        where: { receiptNo },
        orderBy: { createdAt: "desc" },
      });
    } else if (propertyName && tenantName) {
      receipts = await prisma.receipt.findMany({
        where: { propertyName, tenantName },
        orderBy: { createdAt: "desc" },
      });
    } else {
      receipts = await prisma.receipt.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
      });
    }

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    );
  }
}

// POST /api/receipts - create a new receipt
export async function POST(request: NextRequest) {
  try {
    const body: ReceiptInput = await request.json();

    // Basic validation
    if (!body.receiptNo || !body.tenantName || !body.propertyName) {
      return NextResponse.json(
        { error: "receiptNo, tenantName, and propertyName are required" },
        { status: 400 }
      );
    }

    const receipt = await prisma.receipt.create({
      data: {
        receiptNo: body.receiptNo,
        date: body.date || new Date().toISOString().split("T")[0],
        propertyName: body.propertyName,
        ownerName: body.ownerName || "",
        floor: body.floor || "",
        unit: body.unit || "",
        tenantName: body.tenantName,
        tenantPhone: body.tenantPhone || "",
        periodStart: body.periodStart || "",
        periodEnd: body.periodEnd || "",
        paymentMode: body.paymentMode || "Cash",
        rentMaint: Number(body.rentMaint) || 0,
        waterCharges: Number(body.waterCharges) || 0,
        rentalTax: Number(body.rentalTax) || 0,
        prevUnit: Number(body.prevUnit) || 0,
        currUnit: Number(body.currUnit) || 0,
        elecRate: Number(body.elecRate) || 0,
        elecTotalAmount: Number(body.elecTotalAmount) || 0,
        totalAmountToBeReceived: Number(body.totalAmountToBeReceived) || 0,
        amountReceived: Number(body.amountReceived) || 0,
        dueAmount: Number(body.dueAmount) || 0,
        isFullPaid: Boolean(body.isFullPaid),
        receivedBy: body.receivedBy || "",
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}