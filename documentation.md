# Rent Receipt Application Specification

## Application Layout
The application features a 3-tab user interface:
1. **Tab 1: Receipt Controls**: Step 1 of 2 - Form interface for entering receipt details with auto-save functionality
2. **Tab 2: Receipt Generation**: Step 2 of 2 - Live PDF preview with action buttons (Save, Share PDF, Back to Edit)
3. **Tab 3: Settings & Data Editor**: Master configuration for Property Templates, Owners, Managers, Tenants, Meter Rates, Owner Seal/Signature Uploads, and Historical Log

---

## Technical Calculations & Data Logic

### 1. Electrical Charges Calculation
The total electrical charges are computed using current and previous meter readings:
$$ \text{Electrical Charges} = (\text{Current Reading} - \text{Previous Reading}) \times \text{Rate per Unit} $$

### 2. Monthly Rent Breakdown
$$ \text{Current Month Total} = \text{Rent \& Maintenance} + \text{Water Charges} + \text{Rental Tax} + \text{Electrical Charges} $$

### 3. Total Amount To Be Received
$$ \text{Total Amount} = \text{Current Month Total} + \text{Balance Due from Previous Month} $$

### 4. Remaining Balance / Status Indicator
$$ \text{Due Amount} = \text{Total Amount To Be Received} - \text{Amount Received} $$
* **If $\text{Due Amount} \le 0$**: Displays a green checkmark badge labeled **FULL PAID**.
* **If $\text{Due Amount} > 0$**: Displays a red notification showing **Balance Pending: ₹X**.

### 5. Previous Bill Data Auto-Fetch
When selecting a floor/unit, the system automatically fetches:
- **Previous Unit Reading**: Current unit reading from the last receipt for that specific unit
- **Previous Balance Due**: Pending amount (dueAmount) from the last receipt for that unit
- If no previous receipt exists, uses template default values

---

## Features Checklist

### Core Features
- **2-Page Receipt Flow**: Step 1 (Controls) → Step 2 (Generation) with step indicator
- **Auto-Save on Refresh**: All form data persists in localStorage across page refreshes
- **Scrollable Property Selector**: Switch between properties (e.g., House, Godown 1, Godown 2)
- **Add New Properties**: Create new property templates dynamically from Settings tab
- **Auto Receipt Numbering**: Sequences automatically starting from `0001`
- **Number to Words**: Real-time conversion of numerical receipt amounts into written currency terms
- **Seal & Signature**: Upload JPEG/PNG images to attach signatures directly onto the receipt layout
- **Seal Persistence**: Seal/signature saved with template and persists until updated

### Owner & Manager Management
- **Owners Management**: Centralized owner list with CRUD operations (Add, Edit, Delete)
- **Managers/Receivers Management**: Centralized manager list with CRUD operations
- **Owner Assignment**: Each template can be assigned a specific owner from the owners list
- **Reusable Details**: Owner and manager details (name, address, phone) are reused across all receipts

### Tenant Management
- **Tenant Phone Number**: Store and display tenant contact numbers on receipts
- **Tenant Auto-Fill**: Selecting floor/unit auto-fills tenant name and phone from template

### Receipt Lookup & History
- **Receipt Lookup**: Enter receipt number to fetch and load all previous details
- **Previous Bill Fetch**: Automatically fetches previous unit reading and balance due when selecting floor/unit
- **Receipt History Log**: View all saved receipts with status indicators
- **Clear History**: Option to clear all receipt history

### PDF Generation
- **A4 Format**: Generates PDFs in standard A4 size (210mm x 297mm)
- **No Cropping**: Uses off-screen clone technique to prevent truncation
- **High Quality**: 2x scale rendering for crisp output
- **Auto-Save**: PDF generation automatically saves receipt to backend

### Form Management
- **Clear Form After Save**: Automatically clears form entries after saving for next receipt
- **Form Auto-Save**: All form fields auto-save to localStorage on every change
- **Smart Defaults**: Dates default to current month, payment mode defaults to Cash

### Data Persistence
- **localStorage**: All data persists in browser localStorage
- **Auto-Recovery**: Form state restored on page reload
- **Receipt History**: Complete history of all generated receipts saved locally

---

## User Workflow

### Creating a New Receipt
1. Go to **Receipt Controls** tab
2. Select property/template from dropdown
3. Enter or verify receipt number and date
4. Select floor/unit (auto-fills tenant details and previous bill data)
5. Enter rent period dates
6. Select payment mode (Cash/Online)
7. Enter charges breakdown (rent, water, tax)
8. Enter electricity meter readings (previous unit auto-filled)
9. Verify previous balance due (auto-filled from last receipt)
10. Enter amount received
11. Select manager/receiver
12. Click "Next: Generate Receipt"
13. Review receipt preview
14. Click "Save to Backend" or "Share PDF"

### Looking Up Previous Receipt
1. In **Receipt Controls** tab, enter receipt number in "Lookup Previous Receipt" field
2. Click "Fetch Receipt"
3. All details load automatically including previous unit and balance
4. Edit any fields as needed
5. Continue to generation and save

### Managing Properties
1. Go to **Settings & Data Editor** tab
2. Click "+ Add Property" to create new property
3. Enter property name
4. Select owner from dropdown
5. Add units with tenant details
6. Upload seal/signature image

### Managing Owners
1. Go to **Settings & Data Editor** tab
2. Scroll to "Owners Management" section
3. Click "+ Add Owner"
4. Enter name, address, phone
5. Use Edit/Delete buttons to manage existing owners

### Managing Managers
1. Go to **Settings & Data Editor** tab
2. Scroll to "Managers & Receivers" section
3. Click "+ Add Manager"
4. Enter name, address, phone
5. Use Edit/Delete buttons to manage existing managers

---

## Technical Stack
- **Frontend**: React 18 with hooks (useState, useEffect, useRef)
- **Styling**: Tailwind CSS for responsive design
- **PDF Generation**: html2pdf.js with off-screen clone technique
- **Storage**: Browser localStorage for data persistence
- **Icons**: Lucide icons library

---

## Data Structures

### Template Object
```javascript
{
  id: string,
  name: string,
  ownerId: number,
  units: [
    {
      floor: string,
      unit: string,
      tenantName: string,
      tenantPhone: string,
      rent: number,
      water: number,
      tax: number,
      prevBalance: number
    }
  ],
  sealUrl: string
}
```

### Receipt Object
```javascript
{
  id: number,
  receiptNo: string,
  date: string,
  propertyName: string,
  ownerName: string,
  floor: string,
  unit: string,
  tenantName: string,
  tenantPhone: string,
  periodStart: string,
  periodEnd: string,
  paymentMode: string,
  rentMaint: number,
  waterCharges: number,
  rentalTax: number,
  elecDetails: {
    prevUnit: number,
    currUnit: number,
    elecRate: number,
    elecTotalAmount: number
  },
  totalAmountToBeReceived: number,
  amountReceived: number,
  dueAmount: number,
  isFullPaid: boolean,
  receivedBy: string
}
```

### Owner Object
```javascript
{
  id: number,
  name: string,
  address: string,
  phone: string
}
```

### Manager Object
```javascript
{
  id: number,
  name: string,
  address: string,
  phone: string
}