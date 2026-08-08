"use client";

import React from "react";
import type { Manager, Property, Owner } from "@/lib/types";
import { numberToWords } from "@/lib/utils";

interface ReceiptPreviewProps {
  template: Property | undefined;
  owner: Owner | undefined;
  receiptNo: string;
  receiptDate: string;
  selectedFloor: string;
  selectedUnit: string;
  tenantName: string;
  tenantPhone: string;
  periodStart: string;
  periodEnd: string;
  paymentMode: string;
  rentMaint: number;
  waterCharges: number;
  rentalTax: number;
  prevUnit: number;
  currUnit: number;
  elecRate: number;
  elecUnitsConsumed: number;
  elecTotalAmount: number;
  totalBalanceCurrentMonth: number;
  balanceDue: number;
  totalAmountToBeReceived: number;
  amountReceived: number;
  dueAmount: number;
  isFullPaid: boolean;
  activeReceivedBy: Manager | undefined;
  innerRef?: React.Ref<HTMLDivElement>;
}

export default function ReceiptPreview({
  template,
  owner,
  receiptNo,
  receiptDate,
  selectedFloor,
  selectedUnit,
  tenantName,
  tenantPhone,
  periodStart,
  periodEnd,
  paymentMode,
  rentMaint,
  waterCharges,
  rentalTax,
  prevUnit,
  currUnit,
  elecRate,
  elecUnitsConsumed,
  elecTotalAmount,
  totalBalanceCurrentMonth,
  balanceDue,
  totalAmountToBeReceived,
  amountReceived,
  dueAmount,
  isFullPaid,
  activeReceivedBy,
  innerRef,
}: ReceiptPreviewProps) {
  return (
    <div
      ref={innerRef}
      className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full max-w-[794px] text-gray-800 text-sm flex flex-col justify-between"
      style={{ minHeight: "auto" }}
    >
      <div>
        <div className="border-b-2 border-gray-800 pb-3 mb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-wide text-gray-900">RENT RECEIPT</h2>
            <p className="text-xs text-gray-500 font-medium">{template?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-600">
              Receipt No: <span className="text-red-600 text-base">{receiptNo}</span>
            </div>
            <div className="text-xs text-gray-500">
              Date: <span className="font-semibold">{receiptDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="col-span-2">
            <span className="text-xs text-gray-500 block uppercase font-bold">Owner Name:</span>
            <span className="font-semibold text-gray-800">{owner?.name}</span>
            <span className="text-xs text-gray-500 block mt-1">{owner?.address}</span>
            <span className="text-xs text-gray-500 block">Ph: {owner?.phone}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block uppercase font-bold">Floor & Unit:</span>
            <span className="font-semibold text-gray-800">{selectedFloor} | {selectedUnit}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block uppercase font-bold">Tenant Name:</span>
            <span className="font-bold text-indigo-900 text-base">{tenantName || "_______________________"}</span>
            <span className="text-xs text-gray-500 block">Ph: {tenantPhone}</span>
          </div>
        </div>

        <div className="mb-4 text-xs bg-indigo-50/50 p-2.5 rounded border border-indigo-100 flex justify-between items-center">
          <span className="font-semibold text-indigo-900">Rent for Period:</span>
          <span className="font-mono text-gray-700">
            {periodStart} <span className="text-gray-400">to</span> {periodEnd}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-4 border rounded-lg p-3 bg-gray-50">
            <span className="text-xs font-bold text-gray-600 uppercase block mb-2">Payment Mode</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 border rounded flex items-center justify-center font-bold text-xs ${paymentMode === "Cash" ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-400"}`}>
                  {paymentMode === "Cash" ? "✓" : ""}
                </span>
                <span>Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 border rounded flex items-center justify-center font-bold text-xs ${paymentMode === "Online" ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-400"}`}>
                  {paymentMode === "Online" ? "✓" : ""}
                </span>
                <span>Online / UPI</span>
              </div>
            </div>
          </div>

          <div className="col-span-8 border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-2 font-bold text-gray-600">Particulars</th>
                  <th className="text-right p-2 font-bold text-gray-600">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2">Rent & Maintenance</td>
                  <td className="p-2 text-right font-mono">{rentMaint.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2">Water Charges</td>
                  <td className="p-2 text-right font-mono">{waterCharges.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2">Rental Tax</td>
                  <td className="p-2 text-right font-mono">{rentalTax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2">
                    Electrical Charges
                    <div className="text-[10px] text-gray-400 font-mono">
                      [{prevUnit} → {currUnit} = {elecUnitsConsumed} units @ ₹{elecRate}]
                    </div>
                  </td>
                  <td className="p-2 text-right font-mono align-top">{elecTotalAmount.toFixed(2)}</td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="p-2">Current Month Total</td>
                  <td className="p-2 text-right font-mono">₹{totalBalanceCurrentMonth.toFixed(2)}</td>
                </tr>
                <tr className="text-red-600">
                  <td className="p-2">Previous Balance Due</td>
                  <td className="p-2 text-right font-mono">₹{balanceDue.toFixed(2)}</td>
                </tr>
                <tr className="bg-indigo-50 font-bold text-indigo-950 text-xs border-t-2 border-indigo-200">
                  <td className="p-2">Total Amount To Be Received</td>
                  <td className="p-2 text-right font-mono">₹{totalAmountToBeReceived.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 p-3 rounded-lg bg-yellow-50/30 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase text-gray-600">Amount Received:</span>
            <span className="text-lg font-bold font-mono text-green-700">₹{Number(amountReceived).toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-600 italic">
            <span className="font-semibold text-gray-700">In Words:</span> {numberToWords(amountReceived)}
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="flex items-center">
            {isFullPaid ? (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg border border-green-300">
                <span className="text-xl">✅</span>
                <div>
                  <div className="font-bold text-xs uppercase">Full Paid</div>
                  <div className="text-[10px] text-green-700">No outstanding balance due</div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-800 px-3 py-2 rounded-lg border border-red-200 w-full">
                <div className="font-bold text-xs uppercase">Balance Pending</div>
                <div className="text-sm font-bold font-mono">Due: ₹{dueAmount.toFixed(2)}</div>
              </div>
            )}
          </div>

          <div className="text-right flex flex-col items-end justify-end">
            {template?.sealUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={template.sealUrl} alt="Seal & Signature" className="h-12 max-w-[120px] object-contain mb-1" />
            )}
            <div className="text-xs font-bold text-gray-800">{activeReceivedBy?.name}</div>
            <div className="text-[11px] text-gray-500">{activeReceivedBy?.address}</div>
            <div className="text-[11px] text-gray-500">Ph: {activeReceivedBy?.phone}</div>
            <div className="text-[10px] text-gray-400 mt-2 border-t border-gray-300 pt-1 w-36 text-center">Seal & Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}