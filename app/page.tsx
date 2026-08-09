"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Owner, Manager, Property, Receipt } from "@/lib/types";
import { formatDateForInput } from "@/lib/utils";
import {
  fetchReceipts,
  createReceipt,
  fetchProperties,
  fetchOwners,
  fetchManagers,
  createProperty,
  updateProperty,
  deleteProperty,
  createOwner,
  updateOwner,
  deleteOwner,
  createManager,
  updateManager,
  deleteManager,
  clearReceipts,
} from "@/lib/api";
import ReceiptControls from "@/components/ReceiptControls";
import ReceiptPreview from "@/components/ReceiptPreview";
import ReceiptGeneration from "@/components/ReceiptGeneration";
import SettingsEditor from "@/components/SettingsEditor";

// Default per-unit electricity rate (₹/unit) applied to new receipts
const DEFAULT_ELEC_RATE = 7.95;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"controls" | "generation" | "settings">("controls");
  const [receiptStep, setReceiptStep] = useState(1);

  // Server-persisted data
  const [templates, setTemplates] = useState<Property[]>([]);
  const [savedReceipts, setSavedReceipts] = useState<Receipt[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [receiptNo, setReceiptNo] = useState("0001");
  const [receiptDate, setReceiptDate] = useState(formatDateForInput(new Date()));
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [periodStart, setPeriodStart] = useState(formatDateForInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [periodEnd, setPeriodEnd] = useState(formatDateForInput(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)));
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [rentMaint, setRentMaint] = useState(0);
  const [waterCharges, setWaterCharges] = useState(0);
  const [rentalTax, setRentalTax] = useState(0);
  const [prevUnit, setPrevUnit] = useState(0);
  const [currUnit, setCurrUnit] = useState(0);
  const [elecRate, setElecRate] = useState(DEFAULT_ELEC_RATE);
  const [balanceDue, setBalanceDue] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [selectedReceivedById, setSelectedReceivedById] = useState<number>(0);
  const [lookupReceiptNo, setLookupReceiptNo] = useState("");

  const receiptRef = useRef<HTMLDivElement>(null);
  const isLookupRef = useRef(false);
  // Monotonic token bumped on every lookup so the guard-release effect always
  // fires, even when receiptNo/template don't change (e.g. re-fetching the same
  // receipt).
  const [lookupToken, setLookupToken] = useState(0);

  // Serialize property saves so two overlapping commits can't race each other.
  // Without this, rapid onBlur commits (while typing in the unit table) fire
  // concurrent PUTs that can interleave on the server and multiply unit rows.
  const pendingPropertyUpdates = useRef<
    Array<{ id: number; data: { name?: string; ownerId?: number; sealUrl?: string; qrUrl?: string; units?: Property["units"] } }>
  >([]);
  const isPropertyUpdateRunning = useRef(false);

  // Load data from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [props, own, mgrs, rcpts] = await Promise.all([
          fetchProperties(),
          fetchOwners(),
          fetchManagers(),
          fetchReceipts(),
        ]);
        setTemplates(props);
        setOwners(own);
        setManagers(mgrs);
        setSavedReceipts(rcpts);

        if (props.length > 0) {
          setSelectedTemplateId(String(props[0].id));
        }
        if (mgrs.length > 0) {
          setSelectedReceivedById(mgrs[0].id);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentTemplate = templates.find((t) => String(t.id) === selectedTemplateId) || templates[0];
  const templateOwner = owners.find((o) => o.id === currentTemplate?.ownerId) || owners[0];

  // Auto-select first unit when template changes
  useEffect(() => {
    if (isLookupRef.current) {
      isLookupRef.current = false;
      return;
    }
    if (currentTemplate && currentTemplate.units.length > 0) {
      const firstUnit = currentTemplate.units[0];
      setSelectedFloor(firstUnit.floor);
      setSelectedUnit(firstUnit.unit);
      setTenantName(firstUnit.tenantName);
      setTenantPhone(firstUnit.tenantPhone || "");
      setRentMaint(firstUnit.rent);
      setWaterCharges(firstUnit.water);
      setRentalTax(firstUnit.tax);
      setBalanceDue(firstUnit.prevBalance);
    }
  }, [selectedTemplateId]);

  // Release the lookup guard after the hydration render completes, so a later
  // manual template change is not accidentally swallowed. Keyed on a monotonic
  // token (not receiptNo) so re-fetching the same receipt still releases it.
  useEffect(() => {
    if (lookupToken > 0 && isLookupRef.current) {
      isLookupRef.current = false;
    }
  }, [lookupToken]);

  // Auto-increment receipt number when new receipts are saved
  useEffect(() => {
    if (savedReceipts.length > 0) {
      const lastNo = Math.max(...savedReceipts.map((r) => parseInt(r.receiptNo, 10) || 0));
      setReceiptNo(String(lastNo + 1).padStart(4, "0"));
    } else {
      setReceiptNo("0001");
    }
  }, [savedReceipts.length]);

  const fetchPreviousBillData = useCallback(
    (floor: string, unit: string, tenantName: string, defaultPrevBalance: number) => {
      const lastReceiptForUnit = savedReceipts.find(
        (r) =>
          r.propertyName === currentTemplate?.name &&
          r.floor === floor &&
          r.unit === unit &&
          r.tenantName === tenantName
      );
      if (lastReceiptForUnit) {
        setPrevUnit(lastReceiptForUnit.currUnit);
        const previousPendingBalance = lastReceiptForUnit.dueAmount > 0 ? lastReceiptForUnit.dueAmount : 0;
        setBalanceDue(previousPendingBalance);
      } else {
        setPrevUnit(0);
        setBalanceDue(defaultPrevBalance);
      }
    },
    [savedReceipts, currentTemplate]
  );

  const handleUnitChange = (unitObj: Property["units"][0]) => {
    setSelectedFloor(unitObj.floor);
    setSelectedUnit(unitObj.unit);
    setTenantName(unitObj.tenantName);
    setTenantPhone(unitObj.tenantPhone || "");
    setRentMaint(unitObj.rent);
    setWaterCharges(unitObj.water);
    setRentalTax(unitObj.tax);
    fetchPreviousBillData(unitObj.floor, unitObj.unit, unitObj.tenantName, unitObj.prevBalance);
  };

  const handleLookupReceipt = () => {
    const found = savedReceipts.find((r) => parseInt(r.receiptNo, 10) === parseInt(lookupReceiptNo, 10));
    if (found) {
      // Block auto-calculation side-effects (template auto-select / prev-balance
      // carry-forward) while we hydrate the historical snapshot below.
      isLookupRef.current = true;
      setLookupToken((t) => t + 1);

      const matchedTemplate = templates.find((t) => t.name === found.propertyName);
      if (matchedTemplate && String(matchedTemplate.id) !== selectedTemplateId) {
        setSelectedTemplateId(String(matchedTemplate.id));
      }

      // Strictly hydrate the form from the EXACT values saved on this receipt
      // record, so editing/printing an old receipt never recomputes and
      // overwrites the historical figures.
      setReceiptNo(found.receiptNo);
      setReceiptDate(found.date);
      setTenantName(found.tenantName);
      setTenantPhone(found.tenantPhone || "");
      setSelectedFloor(found.floor);
      setSelectedUnit(found.unit);
      setPeriodStart(found.periodStart);
      setPeriodEnd(found.periodEnd);
      setPaymentMode(found.paymentMode);
      setRentMaint(found.rentMaint);
      setWaterCharges(found.waterCharges);
      setRentalTax(found.rentalTax);
      setPrevUnit(found.prevUnit);
      setCurrUnit(found.currUnit);
      setElecRate(found.elecRate ?? DEFAULT_ELEC_RATE);
      setAmountReceived(found.amountReceived);

      // Restore the "Received By Manager" dropdown from the saved record.
      const matchedManager = managers.find((m) => m.name === found.receivedBy);
      if (matchedManager) {
        setSelectedReceivedById(matchedManager.id);
      }

      // The "Previous Balance Due" printed on this receipt is the balance that
      // was carried INTO it. It is not persisted as its own column, but it is
      // recovered exactly from the saved snapshot:
      //   totalAmountToBeReceived = rentMaint + waterCharges + rentalTax + elecTotalAmount + balanceDue
      const currentMonthTotal =
        (found.rentMaint || 0) +
        (found.waterCharges || 0) +
        (found.rentalTax || 0) +
        (found.elecTotalAmount || 0);
      setBalanceDue((found.totalAmountToBeReceived || 0) - currentMonthTotal);

      let message = "Receipt details loaded! You can now edit and save changes.";
      if (!matchedTemplate) {
        message = `Warning: The property "${found.propertyName}" for Receipt #${found.receiptNo} is no longer available in your templates. The receipt was loaded, but select a valid template before saving changes.`;
      }
      alert(message);
    } else {
      alert("Receipt not found!");
    }
  };

  const goToGenerationTab = () => {
    if (receiptStep === 1) {
      if (!selectedUnit) {
        alert("Please select a Floor & Unit before proceeding.");
        return;
      }
      if (!tenantName.trim()) {
        alert("Please enter a Tenant Name before proceeding.");
        return;
      }
    }
    setActiveTab("generation");
    setReceiptStep(2);
  };

  const elecUnitsConsumed = Math.max(0, currUnit - prevUnit);
  const elecTotalAmount = elecUnitsConsumed * elecRate;
  const totalBalanceCurrentMonth = rentMaint + waterCharges + rentalTax + elecTotalAmount;
  const totalAmountToBeReceived = totalBalanceCurrentMonth + balanceDue;
  const dueAmount = totalAmountToBeReceived - amountReceived;
  const isFullPaid = dueAmount <= 0 && totalAmountToBeReceived > 0;
  const activeReceivedBy = managers.find((m) => m.id === selectedReceivedById) || managers[0];

  const persistReceipt = async () => {
    if (!currentTemplate || !activeReceivedBy) {
      throw new Error("Missing template or manager");
    }

    // Idempotency guard: skip only when the ENTIRE snapshot already exists, so
    // Save → Share / Share-twice don't duplicate the ledger row, while a genuine
    // edit of any field still persists a new record.
    const alreadySaved = savedReceipts.some(
      (r) =>
        r.receiptNo === receiptNo &&
        r.date === receiptDate &&
        r.propertyName === currentTemplate.name &&
        r.ownerName === (templateOwner?.name || "") &&
        r.floor === selectedFloor &&
        r.unit === selectedUnit &&
        r.tenantName === tenantName &&
        r.tenantPhone === tenantPhone &&
        r.periodStart === periodStart &&
        r.periodEnd === periodEnd &&
        r.paymentMode === paymentMode &&
        r.rentMaint === rentMaint &&
        r.waterCharges === waterCharges &&
        r.rentalTax === rentalTax &&
        r.prevUnit === prevUnit &&
        r.currUnit === currUnit &&
        r.elecRate === elecRate &&
        r.elecTotalAmount === elecTotalAmount &&
        r.totalAmountToBeReceived === totalAmountToBeReceived &&
        r.amountReceived === amountReceived &&
        r.dueAmount === dueAmount &&
        r.isFullPaid === isFullPaid &&
        r.receivedBy === activeReceivedBy.name
    );
    if (alreadySaved) return;

    await createReceipt({
      receiptNo,
      date: receiptDate,
      propertyName: currentTemplate.name,
      ownerName: templateOwner?.name || "",
      floor: selectedFloor,
      unit: selectedUnit,
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
      elecTotalAmount,
      totalAmountToBeReceived,
      amountReceived,
      dueAmount,
      isFullPaid,
      receivedBy: activeReceivedBy.name,
    });

    // Refresh the receipts list so the ledger and the auto-incremented receipt
    // number stay in sync.
    const updated = await fetchReceipts();
    setSavedReceipts(updated);
  };

  const handleSaveReceipt = async () => {
    setIsSaving(true);
    try {
      await persistReceipt();
      alert(`Receipt #${receiptNo} saved successfully!`);
      clearForm();
    } catch (err) {
      console.error("Failed to save receipt:", err);
      alert("Failed to save receipt. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    setIsSaving(true);

    // 1. Persist the receipt to the backend BEFORE generating the PDF, so a
    //    shared/downloaded receipt is always backed by a ledger record.
    try {
      await persistReceipt();
    } catch (err) {
      console.error("Failed to save receipt before sharing:", err);
      alert("Could not save the receipt. Sharing cancelled. Please try again.");
      setIsSaving(false);
      return;
    }

    try {
      // 2. Generate the PDF blob from the current receipt.
      const html2pdf = (await import("html2pdf.js")).default;

      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      const originalMinHeight = element.style.minHeight;
      const originalPadding = element.style.padding;
      const originalMargin = element.style.margin;

      element.style.width = "750px";
      element.style.maxWidth = "750px";
      element.style.minHeight = "auto";
      element.style.padding = "24px";
      element.style.margin = "0 auto";

      try {
        const images = element.getElementsByTagName("img");
        const imagePromises = Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
        await Promise.all(imagePromises);

        const opt = {
          margin: [0.2, 0.2, 0.2, 0.2],
          filename: `Rent_Receipt_${receiptNo}_${tenantName.replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
          pagebreak: { mode: "avoid-all" },
        };

        const blob = await html2pdf().set(opt).from(element).output("blob");
        const pdfFile = new File(
          [blob],
          `Rent_Receipt_${receiptNo}_${tenantName.replace(/\s+/g, "_")}.pdf`,
          { type: "application/pdf" }
        );

        // 3. Native Web Share sheet on mobile; standard download fallback elsewhere.
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          try {
            await navigator.share({
              files: [pdfFile],
              title: `Rent Receipt #${receiptNo}`,
              text: `Rent Receipt #${receiptNo} for ${tenantName}`,
            });
          } catch (shareErr) {
            if (shareErr instanceof Error && shareErr.name === "AbortError") {
              // User dismissed the share sheet — stop WITHOUT downloading.
              return;
            }
            // Genuine share failure → fall back to a direct download.
            console.error("Web Share failed:", shareErr);
            await html2pdf().set(opt).from(element).save();
          }
        } else {
          await html2pdf().set(opt).from(element).save();
        }
      } finally {
        // Always restore the capture styling, even on errors or cancellation.
        element.style.width = originalWidth;
        element.style.maxWidth = originalMaxWidth;
        element.style.minHeight = originalMinHeight;
        element.style.padding = originalPadding;
        element.style.margin = originalMargin;
      }
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to generate / share the PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const clearForm = () => {
    setRentMaint(0);
    setWaterCharges(0);
    setRentalTax(0);
    setPrevUnit(0);
    setCurrUnit(0);
    setElecRate(DEFAULT_ELEC_RATE);
    setBalanceDue(0);
    setAmountReceived(0);
    setTenantName("");
    setTenantPhone("");
    const today = new Date();
    const firstDayStr = formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1));
    const lastDayStr = formatDateForInput(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    setPeriodStart(firstDayStr);
    setPeriodEnd(lastDayStr);
    setPaymentMode("Cash");
  };

  const handleAddProperty = async (data: { name: string; ownerId: number; sealUrl?: string; qrUrl?: string; units?: Property["units"] }) => {
    try {
      const created = await createProperty(data);
      setTemplates([...templates, created]);
    } catch (err) {
      console.error("Failed to add property:", err);
      alert("Failed to add property. Please try again.");
    }
  };

  const flushPropertyUpdates = useCallback(async () => {
    if (isPropertyUpdateRunning.current) return;
    isPropertyUpdateRunning.current = true;
    try {
      while (pendingPropertyUpdates.current.length > 0) {
        const next = pendingPropertyUpdates.current.shift()!;
        try {
          const updated = await updateProperty(next.id, next.data);
          setTemplates((prev) => prev.map((t) => (t.id === next.id ? updated : t)));
        } catch (err) {
          console.error("Failed to update property:", err);
        }
      }
    } finally {
      isPropertyUpdateRunning.current = false;
    }
  }, []);

  const handleUpdateProperty = async (id: number, data: { name?: string; ownerId?: number; sealUrl?: string; qrUrl?: string; units?: Property["units"] }) => {
    pendingPropertyUpdates.current.push({ id, data });
    await flushPropertyUpdates();
  };

  const handleDeleteProperty = async (id: number) => {
    try {
      await deleteProperty(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete property:", err);
    }
  };

  const handleAddOwner = async (data: { name: string; address?: string; phone?: string }) => {
    try {
      const created = await createOwner(data);
      setOwners([...owners, created]);
      return created;
    } catch (err) {
      console.error("Failed to add owner:", err);
      alert("Failed to add owner. Please try again.");
      throw err;
    }
  };

  const handleUpdateOwner = async (id: number, data: { name?: string; address?: string; phone?: string }) => {
    try {
      const updated = await updateOwner(id, data);
      setOwners(owners.map((o) => (o.id === id ? updated : o)));
      return updated;
    } catch (err) {
      console.error("Failed to update owner:", err);
      alert("Failed to update owner. Please try again.");
      throw err;
    }
  };

  const handleDeleteOwner = async (id: number) => {
    try {
      await deleteOwner(id);
      setOwners(owners.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to delete owner:", err);
    }
  };

  const handleAddManager = async (data: { name: string; address?: string; phone?: string }) => {
    try {
      const created = await createManager(data);
      setManagers([...managers, created]);
      return created;
    } catch (err) {
      console.error("Failed to add manager:", err);
      alert("Failed to add manager. Please try again.");
      throw err;
    }
  };

  const handleUpdateManager = async (id: number, data: { name?: string; address?: string; phone?: string }) => {
    try {
      const updated = await updateManager(id, data);
      setManagers(managers.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err) {
      console.error("Failed to update manager:", err);
      alert("Failed to update manager. Please try again.");
      throw err;
    }
  };

  const handleDeleteManager = async (id: number) => {
    try {
      await deleteManager(id);
      setManagers(managers.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete manager:", err);
    }
  };

  const handleClearReceipts = async () => {
    try {
      await clearReceipts();
      setSavedReceipts([]);
    } catch (err) {
      console.error("Failed to clear receipts:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rent Receipt Portal</h1>
          <p className="text-sm text-gray-500">Generate receipts, manage properties, and maintain tenant ledger</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => { setActiveTab("controls"); setReceiptStep(1); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
              activeTab === "controls" ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>📝</span> Receipt Controls
          </button>
          <button
            onClick={goToGenerationTab}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
              activeTab === "generation" ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>🧾</span> Receipt Generation
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
              activeTab === "settings" ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>⚙️</span> Templates & Data Editor
          </button>
        </div>
      </header>

      {activeTab === "controls" && (
        <ReceiptControls
          templates={templates}
          ownersList={owners}
          managers={managers}
          savedReceipts={savedReceipts}
          currentTemplate={currentTemplate}
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          receiptNo={receiptNo}
          setReceiptNo={setReceiptNo}
          receiptDate={receiptDate}
          setReceiptDate={setReceiptDate}
          selectedFloor={selectedFloor}
          selectedUnit={selectedUnit}
          tenantName={tenantName}
          setTenantName={setTenantName}
          tenantPhone={tenantPhone}
          setTenantPhone={setTenantPhone}
          periodStart={periodStart}
          setPeriodStart={setPeriodStart}
          periodEnd={periodEnd}
          setPeriodEnd={setPeriodEnd}
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          rentMaint={rentMaint}
          setRentMaint={setRentMaint}
          waterCharges={waterCharges}
          setWaterCharges={setWaterCharges}
          rentalTax={rentalTax}
          setRentalTax={setRentalTax}
          prevUnit={prevUnit}
          setPrevUnit={setPrevUnit}
          currUnit={currUnit}
          setCurrUnit={setCurrUnit}
          elecRate={elecRate}
          setElecRate={setElecRate}
          balanceDue={balanceDue}
          setBalanceDue={setBalanceDue}
          amountReceived={amountReceived}
          setAmountReceived={setAmountReceived}
          selectedReceivedById={selectedReceivedById}
          setSelectedReceivedById={setSelectedReceivedById}
          lookupReceiptNo={lookupReceiptNo}
          setLookupReceiptNo={setLookupReceiptNo}
          onLookupReceipt={handleLookupReceipt}
          onUnitChange={handleUnitChange}
          onGoToGeneration={goToGenerationTab}
          elecUnitsConsumed={elecUnitsConsumed}
          elecTotalAmount={elecTotalAmount}
        />
      )}

      {activeTab === "generation" && (
        <ReceiptGeneration
          onBack={() => { setActiveTab("controls"); setReceiptStep(1); }}
          onSave={handleSaveReceipt}
          onDownloadPDF={handleDownloadPDF}
          isSaving={isSaving}
          receiptRef={receiptRef}
          receiptNo={receiptNo}
          tenantName={tenantName}
        >
          <ReceiptPreview
            template={currentTemplate}
            owner={templateOwner}
            receiptNo={receiptNo}
            receiptDate={receiptDate}
            selectedFloor={selectedFloor}
            selectedUnit={selectedUnit}
            tenantName={tenantName}
            tenantPhone={tenantPhone}
            periodStart={periodStart}
            periodEnd={periodEnd}
            paymentMode={paymentMode}
            rentMaint={rentMaint}
            waterCharges={waterCharges}
            rentalTax={rentalTax}
            prevUnit={prevUnit}
            currUnit={currUnit}
            elecRate={elecRate}
            elecUnitsConsumed={elecUnitsConsumed}
            elecTotalAmount={elecTotalAmount}
            totalBalanceCurrentMonth={totalBalanceCurrentMonth}
            balanceDue={balanceDue}
            totalAmountToBeReceived={totalAmountToBeReceived}
            amountReceived={amountReceived}
            dueAmount={dueAmount}
            isFullPaid={isFullPaid}
            activeReceivedBy={activeReceivedBy}
            innerRef={receiptRef}
          />
        </ReceiptGeneration>
      )}

      {activeTab === "settings" && (
        <SettingsEditor
          templates={templates}
          owners={owners}
          managers={managers}
          savedReceipts={savedReceipts}
          onAddProperty={handleAddProperty}
          onUpdateProperty={handleUpdateProperty}
          onDeleteProperty={handleDeleteProperty}
          onAddOwner={handleAddOwner}
          onUpdateOwner={handleUpdateOwner}
          onDeleteOwner={handleDeleteOwner}
          onAddManager={handleAddManager}
          onUpdateManager={handleUpdateManager}
          onDeleteManager={handleDeleteManager}
          onClearReceipts={handleClearReceipts}
        />
      )}
    </div>
  );
}
