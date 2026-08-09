"use client";

import React, { RefObject } from "react";
import type { Manager, Property, Owner, Receipt } from "@/lib/types";

interface ReceiptGenerationProps {
  onBack: () => void;
  onSave: () => void;
  onDownloadPDF: () => void;
  isSaving: boolean;
  children: React.ReactNode;
  receiptRef: RefObject<HTMLDivElement>;
  receiptNo: string;
  tenantName: string;
}

export default function ReceiptGeneration({
  onBack,
  onSave,
  onDownloadPDF,
  isSaving,
  children,
  receiptRef,
  receiptNo,
  tenantName,
}: ReceiptGenerationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">1</div>
          <span className="text-sm font-medium text-gray-500">Controls</span>
        </div>
        <div className="h-1 w-12 bg-indigo-600 rounded"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">2</div>
          <span className="text-sm font-medium text-gray-900">Generate Receipt</span>
        </div>
      </div>

      <div className="flex justify-center">{children}</div>

      <div className="max-w-2xl mx-auto flex gap-3 no-print">
        <button onClick={onBack} className="flex-1 bg-gray-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-700 transition text-sm flex items-center justify-center gap-2">
          ← Back to Edit
        </button>
        <button onClick={onSave} disabled={isSaving} className="flex-1 bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {isSaving ? "Saving..." : "💾 Save to Backend"}
        </button>
        <button onClick={onDownloadPDF} disabled={isSaving} className="flex-1 bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {isSaving ? "Saving & Sharing..." : "📤 Share PDF"}
        </button>
      </div>
    </div>
  );
}