"use client";

import React from "react";
import type { Manager, Property, Receipt } from "@/lib/types";

interface ReceiptControlsProps {
  templates: Property[];
  ownersList: { id: number; name: string }[];
  managers: Manager[];
  savedReceipts: Receipt[];
  currentTemplate: Property | undefined;
  selectedTemplateId: string | number;
  setSelectedTemplateId: (id: string) => void;
  receiptNo: string;
  setReceiptNo: (v: string) => void;
  receiptDate: string;
  setReceiptDate: (v: string) => void;
  selectedFloor: string;
  selectedUnit: string;
  tenantName: string;
  setTenantName: (v: string) => void;
  tenantPhone: string;
  setTenantPhone: (v: string) => void;
  periodStart: string;
  setPeriodStart: (v: string) => void;
  periodEnd: string;
  setPeriodEnd: (v: string) => void;
  paymentMode: string;
  setPaymentMode: (v: string) => void;
  rentMaint: number;
  setRentMaint: (v: number) => void;
  waterCharges: number;
  setWaterCharges: (v: number) => void;
  rentalTax: number;
  setRentalTax: (v: number) => void;
  prevUnit: number;
  setPrevUnit: (v: number) => void;
  currUnit: number;
  setCurrUnit: (v: number) => void;
  elecRate: number;
  setElecRate: (v: number) => void;
  balanceDue: number;
  setBalanceDue: (v: number) => void;
  amountReceived: number;
  setAmountReceived: (v: number) => void;
  selectedReceivedById: number;
  setSelectedReceivedById: (v: number) => void;
  lookupReceiptNo: string;
  setLookupReceiptNo: (v: string) => void;
  onLookupReceipt: () => void;
  onUnitChange: (unit: any) => void;
  onGoToGeneration: () => void;
  elecUnitsConsumed: number;
  elecTotalAmount: number;
}

export default function ReceiptControls(props: ReceiptControlsProps) {
  const {
    templates, ownersList, managers, savedReceipts, currentTemplate,
    selectedTemplateId, setSelectedTemplateId,
    receiptNo, setReceiptNo, receiptDate, setReceiptDate,
    selectedFloor, selectedUnit, tenantName, setTenantName, tenantPhone, setTenantPhone,
    periodStart, setPeriodStart, periodEnd, setPeriodEnd,
    paymentMode, setPaymentMode,
    rentMaint, setRentMaint, waterCharges, setWaterCharges, rentalTax, setRentalTax,
    prevUnit, setPrevUnit, currUnit, setCurrUnit, elecRate, setElecRate,
    balanceDue, setBalanceDue, amountReceived, setAmountReceived,
    selectedReceivedById, setSelectedReceivedById,
    lookupReceiptNo, setLookupReceiptNo, onLookupReceipt, onUnitChange, onGoToGeneration,
    elecUnitsConsumed, elecTotalAmount,
  } = props;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm space-y-4 no-print">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">Receipt Controls - Step 1 of 2</h2>
        <span className="text-xs text-gray-500">Fill in the details below</span>
      </div>

      {/* Receipt Lookup */}
      <div className="border-b pb-4">
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Lookup Previous Receipt (Optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={lookupReceiptNo}
            onChange={(e) => setLookupReceiptNo(e.target.value)}
            placeholder="Enter receipt number to fetch details"
            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
          />
          <button onClick={onLookupReceipt} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm">
            Fetch Receipt
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Property / Template</label>
        <select
          value={String(selectedTemplateId)}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          {templates.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Receipt No.</label>
          <input type="text" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono font-bold text-gray-700" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Receipt Date</label>
          <input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Floor & Unit</label>
          <select
            value={`${selectedFloor}|${selectedUnit}`}
            onChange={(e) => {
              const [f, u] = e.target.value.split("|");
              const unitObj = currentTemplate?.units.find((item) => item.floor === f && item.unit === u);
              if (unitObj) onUnitChange(unitObj);
            }}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          >
            {currentTemplate?.units.map((u, idx) => (
              <option key={idx} value={`${u.floor}|${u.unit}`}>{u.floor} - {u.unit}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tenant Name</label>
          <input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tenant Phone</label>
          <input type="text" value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Period To</label>
          <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Period From</label>
          <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Payment Mode</label>
          <div className="flex gap-4 items-center mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="payMode" checked={paymentMode === "Cash"} onChange={() => setPaymentMode("Cash")} className="text-indigo-600 focus:ring-indigo-500" /> Cash
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="payMode" checked={paymentMode === "Online"} onChange={() => setPaymentMode("Online")} className="text-indigo-600 focus:ring-indigo-500" /> Online / UPI
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t pt-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase">Charges Breakdown</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-gray-600">Rent & Maint.</label>
            <input type="number" value={rentMaint} onChange={(e) => setRentMaint(Number(e.target.value))} className="w-full border rounded p-1.5 text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-gray-600">Water</label>
            <input type="number" value={waterCharges} onChange={(e) => setWaterCharges(Number(e.target.value))} className="w-full border rounded p-1.5 text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-gray-600">Rental Tax</label>
            <input type="number" value={rentalTax} onChange={(e) => setRentalTax(Number(e.target.value))} className="w-full border rounded p-1.5 text-sm" />
          </div>
        </div>
      </div>

      <div className="border-t pt-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Electricity Calculation</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-gray-600">Prev Unit</label>
            <input type="number" value={prevUnit} onChange={(e) => setPrevUnit(Number(e.target.value))} className="w-full border rounded p-1.5 text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-gray-600">Curr Unit</label>
            <input type="number" value={currUnit} onChange={(e) => setCurrUnit(Number(e.target.value))} className="w-full border rounded p-1.5 text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-gray-600">Rate / Unit</label>
            <input type="number" value={elecRate} onChange={(e) => setElecRate(Number(e.target.value))} className="w-full border rounded p-1.5 text-sm" />
          </div>
        </div>
        <div className="text-xs text-right mt-1 text-gray-500 font-mono">
          Elec Amount: ₹{elecTotalAmount} ({elecUnitsConsumed} units)
        </div>
      </div>

      <div className="border-t pt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Prev Balance Due</label>
          <input type="number" value={balanceDue} onChange={(e) => setBalanceDue(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2 text-sm text-red-600 font-medium" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Amount Received</label>
          <input type="number" value={amountReceived} onChange={(e) => setAmountReceived(Number(e.target.value))} className="w-full border border-indigo-400 rounded-lg p-2 text-sm font-bold text-indigo-700 bg-indigo-50" />
        </div>
      </div>

      <div className="border-t pt-3">
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Received By Manager</label>
        <select value={selectedReceivedById} onChange={(e) => setSelectedReceivedById(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2 text-sm">
          {managers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="pt-4 flex justify-end">
        <button onClick={onGoToGeneration} className="bg-indigo-600 text-white font-medium py-2.5 px-8 rounded-lg hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2">
          Next: Generate Receipt →
        </button>
      </div>
    </div>
  );
}