import type { Owner, Manager, Property, Receipt, ReceiptInput } from "./types";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Receipts ----------
export async function fetchReceipts(params?: {
  receiptNo?: string;
  propertyName?: string;
  tenantName?: string;
}): Promise<Receipt[]> {
  const query = new URLSearchParams();
  if (params?.receiptNo) query.set("receiptNo", params.receiptNo);
  if (params?.propertyName) query.set("propertyName", params.propertyName);
  if (params?.tenantName) query.set("tenantName", params.tenantName);
  const qs = query.toString();
  const res = await fetch(`/api/receipts${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return handleResponse<Receipt[]>(res);
}

export async function createReceipt(data: ReceiptInput): Promise<Receipt> {
  const res = await fetch("/api/receipts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Receipt>(res);
}

// ---------- Properties ----------
export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch("/api/properties", { cache: "no-store" });
  return handleResponse<Property[]>(res);
}

export async function createProperty(data: {
  name: string;
  ownerId: number;
  sealUrl?: string;
  units?: Property["units"];
}): Promise<Property> {
  const res = await fetch("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Property>(res);
}

export async function updateProperty(
  id: number,
  data: {
    name?: string;
    ownerId?: number;
    sealUrl?: string;
    units?: Property["units"];
  }
): Promise<Property> {
  const res = await fetch(`/api/properties?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Property>(res);
}

export async function deleteProperty(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`/api/properties?id=${id}`, { method: "DELETE" });
  return handleResponse<{ success: boolean }>(res);
}

// ---------- Owners ----------
export async function fetchOwners(): Promise<Owner[]> {
  const res = await fetch("/api/owners", { cache: "no-store" });
  return handleResponse<Owner[]>(res);
}

export async function createOwner(data: {
  name: string;
  address?: string;
  phone?: string;
}): Promise<Owner> {
  const res = await fetch("/api/owners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Owner>(res);
}

export async function updateOwner(
  id: number,
  data: { name?: string; address?: string; phone?: string }
): Promise<Owner> {
  const res = await fetch(`/api/owners?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Owner>(res);
}

export async function deleteOwner(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`/api/owners?id=${id}`, { method: "DELETE" });
  return handleResponse<{ success: boolean }>(res);
}

// ---------- Managers ----------
export async function fetchManagers(): Promise<Manager[]> {
  const res = await fetch("/api/managers", { cache: "no-store" });
  return handleResponse<Manager[]>(res);
}

export async function createManager(data: {
  name: string;
  address?: string;
  phone?: string;
}): Promise<Manager> {
  const res = await fetch("/api/managers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Manager>(res);
}

export async function updateManager(
  id: number,
  data: { name?: string; address?: string; phone?: string }
): Promise<Manager> {
  const res = await fetch(`/api/managers?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Manager>(res);
}

export async function deleteManager(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`/api/managers?id=${id}`, { method: "DELETE" });
  return handleResponse<{ success: boolean }>(res);
}

// ---------- Receipts History ----------
export async function clearReceipts(): Promise<{ success: boolean }> {
  const res = await fetch("/api/receipts?clearAll=true", { method: "DELETE" });
  return handleResponse<{ success: boolean }>(res);
}
