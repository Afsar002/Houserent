"use client";

import React from "react";
import type { Manager, Owner, Property, Receipt } from "@/lib/types";
import { compressImage } from "@/lib/utils";

interface SettingsEditorProps {
  templates: Property[];
  owners: Owner[];
  managers: Manager[];
  savedReceipts: Receipt[];
  onAddProperty: (data: { name: string; ownerId: number; sealUrl?: string; units?: Property["units"] }) => Promise<void>;
  onUpdateProperty: (id: number, data: { name?: string; ownerId?: number; sealUrl?: string; units?: Property["units"] }) => Promise<void>;
  onDeleteProperty: (id: number) => Promise<void>;
  onAddOwner: (data: { name: string; address?: string; phone?: string }) => Promise<Owner>;
  onUpdateOwner: (id: number, data: { name?: string; address?: string; phone?: string }) => Promise<Owner>;
  onDeleteOwner: (id: number) => Promise<void>;
  onAddManager: (data: { name: string; address?: string; phone?: string }) => Promise<Manager>;
  onUpdateManager: (id: number, data: { name?: string; address?: string; phone?: string }) => Promise<Manager>;
  onDeleteManager: (id: number) => Promise<void>;
  onClearReceipts: () => Promise<void>;
}

export default function SettingsEditor({
  templates,
  owners,
  managers,
  savedReceipts,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onAddOwner,
  onUpdateOwner,
  onDeleteOwner,
  onAddManager,
  onUpdateManager,
  onDeleteManager,
  onClearReceipts,
}: SettingsEditorProps) {
  const [showAddPropertyForm, setShowAddPropertyForm] = React.useState(false);
  const [newPropertyName, setNewPropertyName] = React.useState("");

  const [showOwnerForm, setShowOwnerForm] = React.useState(false);
  const [editingOwnerId, setEditingOwnerId] = React.useState<number | null>(null);
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerAddress, setOwnerAddress] = React.useState("");
  const [ownerPhone, setOwnerPhone] = React.useState("");

  const [showManagerForm, setShowManagerForm] = React.useState(false);
  const [editingManagerId, setEditingManagerId] = React.useState<number | null>(null);
  const [managerName, setManagerName] = React.useState("");
  const [managerAddress, setManagerAddress] = React.useState("");
  const [managerPhone, setManagerPhone] = React.useState("");

  const [receiptsPage, setReceiptsPage] = React.useState(1);
  const RECEIPTS_PER_PAGE = 10;

  // Local state for inline table edits to prevent API spam on every keystroke
  const [localTemplates, setLocalTemplates] = React.useState<Property[]>(templates);

  React.useEffect(() => {
    setLocalTemplates(templates);
  }, [templates]);

  const handleAddProperty = async () => {
    if (!newPropertyName.trim()) {
      alert("Please enter property name");
      return;
    }
    await onAddProperty({
      name: newPropertyName,
      ownerId: owners[0]?.id || 1,
      sealUrl: "",
      units: [],
    });
    setNewPropertyName("");
    setShowAddPropertyForm(false);
  };

  const handleDeleteProperty = async (id: number) => {
    if (confirm("Are you sure you want to delete this property?")) {
      await onDeleteProperty(id);
    }
  };

  const handleAddOwner = async () => {
    if (!ownerName.trim()) {
      alert("Please enter owner name");
      return;
    }
    await onAddOwner({ name: ownerName, address: ownerAddress, phone: ownerPhone });
    resetOwnerForm();
  };

  const handleUpdateOwner = async () => {
    if (!ownerName.trim() || !editingOwnerId) {
      alert("Please enter owner name");
      return;
    }
    await onUpdateOwner(editingOwnerId, { name: ownerName, address: ownerAddress, phone: ownerPhone });
    resetOwnerForm();
  };

  const handleDeleteOwner = async (id: number) => {
    if (confirm("Are you sure you want to delete this owner?")) {
      await onDeleteOwner(id);
    }
  };

  const handleEditOwner = (owner: Owner) => {
    setEditingOwnerId(owner.id);
    setOwnerName(owner.name);
    setOwnerAddress(owner.address || "");
    setOwnerPhone(owner.phone || "");
    setShowOwnerForm(true);
  };

  const resetOwnerForm = () => {
    setShowOwnerForm(false);
    setEditingOwnerId(null);
    setOwnerName("");
    setOwnerAddress("");
    setOwnerPhone("");
  };

  const handleAddManager = async () => {
    if (!managerName.trim()) {
      alert("Please enter manager name");
      return;
    }
    await onAddManager({ name: managerName, address: managerAddress, phone: managerPhone });
    resetManagerForm();
  };

  const handleUpdateManager = async () => {
    if (!managerName.trim() || !editingManagerId) {
      alert("Please enter manager name");
      return;
    }
    await onUpdateManager(editingManagerId, { name: managerName, address: managerAddress, phone: managerPhone });
    resetManagerForm();
  };

  const handleDeleteManager = async (id: number) => {
    if (confirm("Are you sure you want to delete this manager?")) {
      await onDeleteManager(id);
    }
  };

  const handleEditManager = (manager: Manager) => {
    setEditingManagerId(manager.id);
    setManagerName(manager.name);
    setManagerAddress(manager.address || "");
    setManagerPhone(manager.phone || "");
    setShowManagerForm(true);
  };

  const resetManagerForm = () => {
    setShowManagerForm(false);
    setEditingManagerId(null);
    setManagerName("");
    setManagerAddress("");
    setManagerPhone("");
  };

  const handleSealUpload = async (index: number, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      const tpl = localTemplates[index];
      await onUpdateProperty(tpl.id, {
        name: tpl.name,
        ownerId: tpl.ownerId,
        sealUrl: compressed,
        units: tpl.units,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLocalPropertyChange = (index: number, field: "name" | "ownerId", value: string | number) => {
    const updated = [...localTemplates];
    if (field === "name") updated[index].name = value as string;
    if (field === "ownerId") updated[index].ownerId = Number(value);
    setLocalTemplates(updated);
  };

  const handleCommitPropertyChange = async (index: number) => {
    const tpl = localTemplates[index];
    await onUpdateProperty(tpl.id, {
      name: tpl.name,
      ownerId: tpl.ownerId,
      sealUrl: tpl.sealUrl,
      units: tpl.units,
    });
  };

  const handleLocalUnitChange = (index: number, uIdx: number, field: string, value: any) => {
    const updated = [...localTemplates];
    const unit = { ...updated[index].units[uIdx] };
    (unit as any)[field] = field === "rent" || field === "water" || field === "tax" || field === "prevBalance" ? Number(value) : value;
    updated[index].units[uIdx] = unit;
    setLocalTemplates(updated);
  };

  const handleCommitUnitChange = async (index: number) => {
    const tpl = localTemplates[index];
    await onUpdateProperty(tpl.id, {
      name: tpl.name,
      ownerId: tpl.ownerId,
      sealUrl: tpl.sealUrl,
      units: tpl.units,
    });
  };

  const handleAddUnit = async (index: number) => {
    const tpl = localTemplates[index];
    const updatedUnits = [...tpl.units, {
      floor: "1st Floor",
      unit: "Unit NEW",
      tenantName: "New Tenant",
      tenantPhone: "",
      rent: 10000,
      water: 500,
      tax: 0,
      prevBalance: 0,
    }];
    await onUpdateProperty(tpl.id, {
      name: tpl.name,
      ownerId: tpl.ownerId,
      sealUrl: tpl.sealUrl,
      units: updatedUnits,
    });
  };

  const handleDeleteUnit = async (index: number, uIdx: number) => {
    const tpl = localTemplates[index];
    const updatedUnits = [...tpl.units];
    updatedUnits.splice(uIdx, 1);
    await onUpdateProperty(tpl.id, {
      name: tpl.name,
      ownerId: tpl.ownerId,
      sealUrl: tpl.sealUrl,
      units: updatedUnits,
    });
  };

  const handleClearAllHistory = async () => {
    if (confirm("Are you sure you want to clear all history?")) {
      await onClearReceipts();
      setReceiptsPage(1);
    }
  };

  const totalPages = Math.max(1, Math.ceil(savedReceipts.length / RECEIPTS_PER_PAGE));
  const safePage = Math.min(receiptsPage, totalPages);

  return (
    <div className="space-y-6">
      {/* Property Templates & Unit Master */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🏢</span> Property Templates & Unit Master
          </h2>
          <button
            onClick={() => setShowAddPropertyForm(true)}
            className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded hover:bg-indigo-100"
          >
            + Add Property
          </button>
        </div>

        {showAddPropertyForm && (
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Property</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Property Name</label>
                <input
                  type="text"
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Enter property name"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddProperty} className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
                  Add Property
                </button>
                <button
                  onClick={() => { setShowAddPropertyForm(false); setNewPropertyName(""); }}
                  className="px-4 bg-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {localTemplates.map((tpl, index) => (
            <div key={tpl.id} className="border rounded-xl p-5 bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Property / Template Name</label>
                  <input
                    type="text"
                    value={tpl.name}
                    onChange={(e) => handleLocalPropertyChange(index, "name", e.target.value)}
                    onBlur={() => handleCommitPropertyChange(index)}
                    className="w-full border p-2 rounded text-sm bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Owner</label>
                  <select
                    value={tpl.ownerId}
                    onChange={(e) => {
                      handleLocalPropertyChange(index, "ownerId", e.target.value);
                      handleCommitPropertyChange(index);
                    }}
                    className="w-full border p-2 rounded text-sm bg-white"
                  >
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>{owner.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Floors, Units & Tenant Mapping</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs bg-white border rounded">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="p-2 text-left">Floor</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-left">Tenant Name</th>
                        <th className="p-2 text-left">Phone</th>
                        <th className="p-2 text-right">Base Rent (₹)</th>
                        <th className="p-2 text-right">Water (₹)</th>
                        <th className="p-2 text-right">Tax (₹)</th>
                        <th className="p-2 text-right">Prev Due (₹)</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {tpl.units.map((u, uIdx) => (
                        <tr key={uIdx}>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={u.floor}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "floor", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={u.unit}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "unit", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={u.tenantName}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "tenantName", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={u.tenantPhone || ""}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "tenantPhone", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              value={u.rent}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "rent", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded text-right"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              value={u.water}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "water", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded text-right"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              value={u.tax}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "tax", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded text-right"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              value={u.prevBalance}
                              onChange={(e) => handleLocalUnitChange(index, uIdx, "prevBalance", e.target.value)}
                              onBlur={() => handleCommitUnitChange(index)}
                              className="w-full border p-1 rounded text-right text-red-600"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button onClick={() => handleDeleteUnit(index, uIdx)} className="text-red-600 hover:text-red-800 font-bold text-xs">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => handleAddUnit(index)} className="mt-2 text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded hover:bg-indigo-100">
                  + Add Unit Row
                </button>
              </div>

              <div className="border-t pt-3">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Seal / Signature Image Upload</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSealUpload(index, e.target.files?.[0])}
                    className="text-xs"
                  />
                  {tpl.sealUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tpl.sealUrl} alt="Seal Preview" className="h-10 border p-1 rounded bg-white" />
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleDeleteProperty(tpl.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100">
                    Delete Property
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owners Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>👤</span> Owners Management
          </h2>
          <button onClick={() => setShowOwnerForm(true)} className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded hover:bg-indigo-100">
            + Add Owner
          </button>
        </div>

        {showOwnerForm && (
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{editingOwnerId ? "Edit Owner" : "Add New Owner"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Name</label>
                <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Enter owner name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Address</label>
                <input type="text" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Enter address" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone</label>
                <input type="text" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Enter phone number" />
              </div>
              <div className="flex gap-2">
                <button onClick={editingOwnerId ? handleUpdateOwner : handleAddOwner} className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
                  {editingOwnerId ? "Update" : "Add"} Owner
                </button>
                <button onClick={resetOwnerForm} className="px-4 bg-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {owners.map((owner) => (
            <div key={owner.id} className="border rounded-lg p-3 bg-white flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">{owner.name}</div>
                <div className="text-xs text-gray-500">{owner.address}</div>
                <div className="text-xs text-gray-500">Ph: {owner.phone}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditOwner(owner)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Edit</button>
                <button onClick={() => handleDeleteOwner(owner.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Managers & Receivers */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>👥</span> Managers & Receivers
          </h2>
          <button onClick={() => setShowManagerForm(true)} className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded hover:bg-indigo-100">
            + Add Manager
          </button>
        </div>

        {showManagerForm && (
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{editingManagerId ? "Edit Manager" : "Add New Manager"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Name</label>
                <input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Enter name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Address</label>
                <input type="text" value={managerAddress} onChange={(e) => setManagerAddress(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Enter address" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone</label>
                <input type="text" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Enter phone number" />
              </div>
              <div className="flex gap-2">
                <button onClick={editingManagerId ? handleUpdateManager : handleAddManager} className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
                  {editingManagerId ? "Update" : "Add"} Manager
                </button>
                <button onClick={resetManagerForm} className="px-4 bg-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {managers.map((manager) => (
            <div key={manager.id} className="border rounded-lg p-3 bg-white flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">{manager.name}</div>
                <div className="text-xs text-gray-500">{manager.address}</div>
                <div className="text-xs text-gray-500">Ph: {manager.phone}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditManager(manager)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Edit</button>
                <button onClick={() => handleDeleteManager(manager.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Receipts History */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📜</span> Saved Receipts History ({savedReceipts.length})
          </h2>
          {savedReceipts.length > 0 && (
            <button onClick={handleClearAllHistory} className="text-xs text-red-600 hover:underline">
              Clear Log
            </button>
          )}
        </div>

        {savedReceipts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No receipts generated yet.</p>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border rounded">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-2">Receipt #</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Property</th>
                    <th className="p-2">Tenant Name</th>
                    <th className="p-2 text-right">Total (₹)</th>
                    <th className="p-2 text-right">Received (₹)</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {savedReceipts
                    .slice((safePage - 1) * RECEIPTS_PER_PAGE, safePage * RECEIPTS_PER_PAGE)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-2 font-mono font-bold text-indigo-600">{r.receiptNo}</td>
                        <td className="p-2">{r.date}</td>
                        <td className="p-2">{r.propertyName} ({r.unit})</td>
                        <td className="p-2 font-medium">{r.tenantName}</td>
                        <td className="p-2 text-right font-mono">₹{r.totalAmountToBeReceived.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono text-green-700 font-bold">₹{r.amountReceived.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          {r.isFullPaid ? (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold">FULL PAID</span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">DUE: ₹{r.dueAmount.toFixed(2)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {savedReceipts.length > RECEIPTS_PER_PAGE && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  Page {safePage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReceiptsPage(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setReceiptsPage(Math.min(totalPages, safePage + 1))}
                    disabled={safePage >= totalPages}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}