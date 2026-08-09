export interface Owner {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface Manager {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface Unit {
  id?: number;
  propertyId?: number;
  floor: string;
  unit: string;
  tenantName: string;
  tenantPhone: string;
  rent: number;
  water: number;
  tax: number;
  prevBalance: number;
}

export interface Property {
  id: number;
  name: string;
  ownerId: number;
  sealUrl: string;
  qrUrl: string;
  units: Unit[];
  owner?: Owner;
}

export interface Receipt {
  id: number;
  receiptNo: string;
  date: string;
  propertyName: string;
  ownerName: string;
  floor: string;
  unit: string;
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
  elecTotalAmount: number;
  totalAmountToBeReceived: number;
  amountReceived: number;
  dueAmount: number;
  isFullPaid: boolean;
  receivedBy: string;
  createdAt?: string;
}

export interface ReceiptInput {
  receiptNo: string;
  date: string;
  propertyName: string;
  ownerName: string;
  floor: string;
  unit: string;
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
  elecTotalAmount: number;
  totalAmountToBeReceived: number;
  amountReceived: number;
  dueAmount: number;
  isFullPaid: boolean;
  receivedBy: string;
}