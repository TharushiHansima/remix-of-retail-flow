// Mock data for Inventory Valuation

import type {
  ValuationRow,
  FifoLayerRow,
  MovementRow,
  ProductValuationDetails,
  Branch,
  Location,
  Category,
  Supplier,
  CostingMethod,
  AgingBucket,
} from "./types";

// Historical snapshot data structure
export interface HistoricalSnapshot {
  snapshotDate: string;
  rows: ValuationRow[];
}

// Reference data
export const mockBranches: Branch[] = [
  { id: "br-1", name: "Main Store" },
  { id: "br-2", name: "Warehouse A" },
  { id: "br-3", name: "Branch Office" },
];

export const mockLocations: Location[] = [
  { id: "loc-1", name: "Shelf A1", branchId: "br-1" },
  { id: "loc-2", name: "Shelf B2", branchId: "br-1" },
  { id: "loc-3", name: "Storage Zone 1", branchId: "br-2" },
  { id: "loc-4", name: "Storage Zone 2", branchId: "br-2" },
];

export const mockCategories: Category[] = [
  { id: "cat-1", name: "Printer Consumables" },
  { id: "cat-2", name: "Computer Hardware" },
  { id: "cat-3", name: "Office Supplies" },
  { id: "cat-4", name: "Networking Equipment" },
];

export const mockSuppliers: Supplier[] = [
  { id: "sup-1", name: "HP Sri Lanka" },
  { id: "sup-2", name: "Canon Distributors" },
  { id: "sup-3", name: "Tech Solutions Ltd" },
  { id: "sup-4", name: "Office Pro Supplies" },
];

// FIFO Layers for products
export const mockFifoLayers: Record<string, FifoLayerRow[]> = {
  "prod-1": [
    {
      id: "layer-1-1",
      productId: "prod-1",
      grnId: "grn-101",
      grnNumber: "GRN-2024-0101",
      grnDate: "2024-10-15",
      receivedQty: 50,
      remainingQty: 20,
      unitCost: 1050, // Base 1000 + 50 landed cost
      layerValue: 21000,
      isExhausted: false,
    },
    {
      id: "layer-1-2",
      productId: "prod-1",
      grnId: "grn-102",
      grnNumber: "GRN-2024-0125",
      grnDate: "2024-11-20",
      receivedQty: 30,
      remainingQty: 30,
      unitCost: 1080, // Price increased
      layerValue: 32400,
      isExhausted: false,
    },
    {
      id: "layer-1-3",
      productId: "prod-1",
      grnId: "grn-103",
      grnNumber: "GRN-2024-0150",
      grnDate: "2024-12-10",
      receivedQty: 25,
      remainingQty: 25,
      unitCost: 1100,
      layerValue: 27500,
      isExhausted: false,
    },
  ],
  "prod-2": [
    {
      id: "layer-2-1",
      productId: "prod-2",
      grnId: "grn-201",
      grnNumber: "GRN-2024-0089",
      grnDate: "2024-09-05",
      receivedQty: 100,
      remainingQty: 45,
      unitCost: 850,
      layerValue: 38250,
      isExhausted: false,
    },
    {
      id: "layer-2-2",
      productId: "prod-2",
      grnId: "grn-202",
      grnNumber: "GRN-2024-0112",
      grnDate: "2024-10-28",
      receivedQty: 75,
      remainingQty: 75,
      unitCost: 875,
      layerValue: 65625,
      isExhausted: false,
    },
  ],
  "prod-3": [
    {
      id: "layer-3-1",
      productId: "prod-3",
      grnId: "grn-301",
      grnNumber: "GRN-2024-0200",
      grnDate: "2024-12-01",
      receivedQty: 200,
      remainingQty: 180,
      unitCost: 45,
      layerValue: 8100,
      isExhausted: false,
    },
  ],
};

// Movements for products
export const mockMovements: Record<string, MovementRow[]> = {
  "prod-1": [
    {
      id: "mov-1-1",
      productId: "prod-1",
      dateTime: "2024-10-15T09:30:00",
      type: "IN",
      documentType: "GRN",
      documentId: "grn-101",
      referenceNo: "GRN-2024-0101",
      qty: 50,
      unitCost: 1050,
      runningBalance: 50,
    },
    {
      id: "mov-1-2",
      productId: "prod-1",
      dateTime: "2024-10-20T14:15:00",
      type: "OUT",
      documentType: "Invoice",
      documentId: "inv-501",
      referenceNo: "INV-2024-0501",
      qty: 15,
      unitCost: 1050,
      runningBalance: 35,
    },
    {
      id: "mov-1-3",
      productId: "prod-1",
      dateTime: "2024-11-05T11:00:00",
      type: "OUT",
      documentType: "JobCard",
      documentId: "jc-301",
      referenceNo: "JC-2024-0301",
      qty: 5,
      unitCost: 1050,
      runningBalance: 30,
    },
    {
      id: "mov-1-4",
      productId: "prod-1",
      dateTime: "2024-11-20T10:00:00",
      type: "IN",
      documentType: "GRN",
      documentId: "grn-102",
      referenceNo: "GRN-2024-0125",
      qty: 30,
      unitCost: 1080,
      runningBalance: 60,
    },
    {
      id: "mov-1-5",
      productId: "prod-1",
      dateTime: "2024-11-25T16:30:00",
      type: "OUT",
      documentType: "Invoice",
      documentId: "inv-520",
      referenceNo: "INV-2024-0520",
      qty: 10,
      unitCost: 1050,
      runningBalance: 50,
    },
    {
      id: "mov-1-6",
      productId: "prod-1",
      dateTime: "2024-12-10T08:45:00",
      type: "IN",
      documentType: "GRN",
      documentId: "grn-103",
      referenceNo: "GRN-2024-0150",
      qty: 25,
      unitCost: 1100,
      runningBalance: 75,
    },
  ],
  "prod-2": [
    {
      id: "mov-2-1",
      productId: "prod-2",
      dateTime: "2024-09-05T10:00:00",
      type: "IN",
      documentType: "GRN",
      documentId: "grn-201",
      referenceNo: "GRN-2024-0089",
      qty: 100,
      unitCost: 850,
      runningBalance: 100,
    },
    {
      id: "mov-2-2",
      productId: "prod-2",
      dateTime: "2024-09-15T13:20:00",
      type: "OUT",
      documentType: "Invoice",
      documentId: "inv-450",
      referenceNo: "INV-2024-0450",
      qty: 30,
      unitCost: 850,
      runningBalance: 70,
    },
    {
      id: "mov-2-3",
      productId: "prod-2",
      dateTime: "2024-10-02T09:15:00",
      type: "OUT",
      documentType: "Invoice",
      documentId: "inv-465",
      referenceNo: "INV-2024-0465",
      qty: 25,
      unitCost: 850,
      runningBalance: 45,
    },
    {
      id: "mov-2-4",
      productId: "prod-2",
      dateTime: "2024-10-28T11:30:00",
      type: "IN",
      documentType: "GRN",
      documentId: "grn-202",
      referenceNo: "GRN-2024-0112",
      qty: 75,
      unitCost: 875,
      runningBalance: 120,
    },
  ],
  "prod-3": [
    {
      id: "mov-3-1",
      productId: "prod-3",
      dateTime: "2024-12-01T08:00:00",
      type: "IN",
      documentType: "GRN",
      documentId: "grn-301",
      referenceNo: "GRN-2024-0200",
      qty: 200,
      unitCost: 45,
      runningBalance: 200,
    },
    {
      id: "mov-3-2",
      productId: "prod-3",
      dateTime: "2024-12-05T14:00:00",
      type: "OUT",
      documentType: "Invoice",
      documentId: "inv-540",
      referenceNo: "INV-2024-0540",
      qty: 20,
      unitCost: 45,
      runningBalance: 180,
    },
  ],
};

// Main valuation rows
export const mockValuationRows: ValuationRow[] = [
  {
    id: "val-1",
    productId: "prod-1",
    productName: "HP 85A Black Toner Cartridge",
    sku: "HP-85A-BLK",
    categoryId: "cat-1",
    categoryName: "Printer Consumables",
    supplierId: "sup-1",
    supplierName: "HP Sri Lanka",
    branchId: "br-1",
    branchName: "Main Store",
    locationId: "loc-1",
    locationName: "Shelf A1",
    onHandQty: 75,
    unitCost: 1076, // Weighted avg of FIFO layers
    stockValue: 80900, // Sum of FIFO layer values
    agingBucket: "31-60",
    costingMethod: "FIFO",
    lastReceiptDate: "2024-12-10",
    avgCost: 1076,
    fifoValue: 80900,
    movingAvgValue: 80700,
  },
  {
    id: "val-2",
    productId: "prod-2",
    productName: "Canon 328 Toner Cartridge",
    sku: "CAN-328-BLK",
    categoryId: "cat-1",
    categoryName: "Printer Consumables",
    supplierId: "sup-2",
    supplierName: "Canon Distributors",
    branchId: "br-1",
    branchName: "Main Store",
    locationId: "loc-2",
    locationName: "Shelf B2",
    onHandQty: 120,
    unitCost: 865,
    stockValue: 103875,
    agingBucket: "61-90",
    costingMethod: "FIFO",
    lastReceiptDate: "2024-10-28",
    avgCost: 865,
    fifoValue: 103875,
    movingAvgValue: 103800,
  },
  {
    id: "val-3",
    productId: "prod-3",
    productName: "A4 Copy Paper (Ream)",
    sku: "PAPER-A4-500",
    categoryId: "cat-3",
    categoryName: "Office Supplies",
    supplierId: "sup-4",
    supplierName: "Office Pro Supplies",
    branchId: "br-2",
    branchName: "Warehouse A",
    locationId: "loc-3",
    locationName: "Storage Zone 1",
    onHandQty: 180,
    unitCost: 45,
    stockValue: 8100,
    agingBucket: "0-30",
    costingMethod: "MOVING_AVG",
    lastReceiptDate: "2024-12-01",
    avgCost: 45,
    fifoValue: 8100,
    movingAvgValue: 8100,
  },
  {
    id: "val-4",
    productId: "prod-4",
    productName: "Logitech M185 Wireless Mouse",
    sku: "LOG-M185-BLK",
    categoryId: "cat-2",
    categoryName: "Computer Hardware",
    supplierId: "sup-3",
    supplierName: "Tech Solutions Ltd",
    branchId: "br-1",
    branchName: "Main Store",
    locationId: "loc-1",
    locationName: "Shelf A1",
    onHandQty: 45,
    unitCost: 2850,
    stockValue: 128250,
    agingBucket: "0-30",
    costingMethod: "MOVING_AVG",
    lastReceiptDate: "2024-12-15",
    avgCost: 2850,
  },
  {
    id: "val-5",
    productId: "prod-5",
    productName: "TP-Link TL-SG108 8-Port Switch",
    sku: "TPL-SG108",
    categoryId: "cat-4",
    categoryName: "Networking Equipment",
    supplierId: "sup-3",
    supplierName: "Tech Solutions Ltd",
    branchId: "br-2",
    branchName: "Warehouse A",
    locationId: "loc-4",
    locationName: "Storage Zone 2",
    onHandQty: 20,
    unitCost: 8500,
    stockValue: 170000,
    agingBucket: "31-60",
    costingMethod: "FIFO",
    lastReceiptDate: "2024-11-25",
    avgCost: 8500,
  },
  {
    id: "val-6",
    productId: "prod-6",
    productName: "Samsung 256GB SSD 870 EVO",
    sku: "SAM-SSD-256",
    categoryId: "cat-2",
    categoryName: "Computer Hardware",
    supplierId: "sup-3",
    supplierName: "Tech Solutions Ltd",
    branchId: "br-1",
    branchName: "Main Store",
    locationId: "loc-2",
    locationName: "Shelf B2",
    onHandQty: 35,
    unitCost: 12500,
    stockValue: 437500,
    agingBucket: "0-30",
    costingMethod: "FIFO",
    lastReceiptDate: "2024-12-18",
    avgCost: 12500,
  },
  {
    id: "val-7",
    productId: "prod-7",
    productName: "Epson L3250 Ink Tank Printer",
    sku: "EPS-L3250",
    categoryId: "cat-2",
    categoryName: "Computer Hardware",
    supplierId: "sup-2",
    supplierName: "Canon Distributors",
    branchId: "br-3",
    branchName: "Branch Office",
    onHandQty: 8,
    unitCost: 45000,
    stockValue: 360000,
    agingBucket: "61-90",
    costingMethod: "MOVING_AVG",
    lastReceiptDate: "2024-10-10",
    avgCost: 45000,
  },
  {
    id: "val-8",
    productId: "prod-8",
    productName: "Brother TN-2480 Toner",
    sku: "BRO-TN2480",
    categoryId: "cat-1",
    categoryName: "Printer Consumables",
    supplierId: "sup-1",
    supplierName: "HP Sri Lanka",
    branchId: "br-1",
    branchName: "Main Store",
    locationId: "loc-1",
    locationName: "Shelf A1",
    onHandQty: 60,
    unitCost: 4200,
    stockValue: 252000,
    agingBucket: "31-60",
    costingMethod: "FIFO",
    lastReceiptDate: "2024-11-15",
    avgCost: 4200,
  },
  {
    id: "val-9",
    productId: "prod-9",
    productName: "Cat6 Network Cable (305m Box)",
    sku: "CAT6-305M",
    categoryId: "cat-4",
    categoryName: "Networking Equipment",
    supplierId: "sup-3",
    supplierName: "Tech Solutions Ltd",
    branchId: "br-2",
    branchName: "Warehouse A",
    locationId: "loc-3",
    locationName: "Storage Zone 1",
    onHandQty: 15,
    unitCost: 18500,
    stockValue: 277500,
    agingBucket: "90+",
    costingMethod: "MOVING_AVG",
    lastReceiptDate: "2024-08-20",
    avgCost: 18500,
  },
  {
    id: "val-10",
    productId: "prod-10",
    productName: "Kingston 16GB DDR4 RAM",
    sku: "KNG-DDR4-16",
    categoryId: "cat-2",
    categoryName: "Computer Hardware",
    supplierId: "sup-3",
    supplierName: "Tech Solutions Ltd",
    branchId: "br-1",
    branchName: "Main Store",
    locationId: "loc-2",
    locationName: "Shelf B2",
    onHandQty: 25,
    unitCost: 8900,
    stockValue: 222500,
    agingBucket: "0-30",
    costingMethod: "FIFO",
    lastReceiptDate: "2024-12-20",
    avgCost: 8900,
  },
  {
    id: "val-11",
    productId: "prod-11",
    productName: "Stapler Heavy Duty",
    sku: "STPL-HD-01",
    categoryId: "cat-3",
    categoryName: "Office Supplies",
    supplierId: "sup-4",
    supplierName: "Office Pro Supplies",
    branchId: "br-1",
    branchName: "Main Store",
    onHandQty: 50,
    unitCost: 1200,
    stockValue: 60000,
    agingBucket: "31-60",
    costingMethod: "MOVING_AVG",
    lastReceiptDate: "2024-11-08",
    avgCost: 1200,
  },
  {
    id: "val-12",
    productId: "prod-12",
    productName: "HP 12A Compatible Toner",
    sku: "HP-12A-COMP",
    categoryId: "cat-1",
    categoryName: "Printer Consumables",
    supplierId: "sup-1",
    supplierName: "HP Sri Lanka",
    branchId: "br-2",
    branchName: "Warehouse A",
    locationId: "loc-4",
    locationName: "Storage Zone 2",
    onHandQty: 100,
    unitCost: 750,
    stockValue: 75000,
    agingBucket: "0-30",
    costingMethod: "FIFO",
    lastReceiptDate: "2024-12-22",
    avgCost: 750,
  },
];

// Historical snapshots - showing how values changed over time
export const mockHistoricalSnapshots: HistoricalSnapshot[] = [
  {
    snapshotDate: "2024-11-01",
    rows: mockValuationRows.map((row) => ({
      ...row,
      id: `hist-${row.id}-nov`,
      onHandQty: Math.round(row.onHandQty * 0.7), // 70% of current stock
      stockValue: Math.round(row.stockValue * 0.65), // Lower value due to fewer items
      unitCost: Math.round(row.unitCost * 0.95), // Slightly lower costs
      agingBucket: row.agingBucket === "0-30" ? "0-30" : row.agingBucket === "31-60" ? "0-30" : row.agingBucket as AgingBucket,
    })),
  },
  {
    snapshotDate: "2024-10-01",
    rows: mockValuationRows.map((row) => ({
      ...row,
      id: `hist-${row.id}-oct`,
      onHandQty: Math.round(row.onHandQty * 0.5), // 50% of current stock
      stockValue: Math.round(row.stockValue * 0.45), // Lower value
      unitCost: Math.round(row.unitCost * 0.9), // Lower costs
      agingBucket: "0-30" as AgingBucket, // All newer at that point
    })),
  },
  {
    snapshotDate: "2024-09-01",
    rows: mockValuationRows.slice(0, 8).map((row) => ({
      ...row,
      id: `hist-${row.id}-sep`,
      onHandQty: Math.round(row.onHandQty * 0.3), // 30% of current stock
      stockValue: Math.round(row.stockValue * 0.28),
      unitCost: Math.round(row.unitCost * 0.88),
      agingBucket: "0-30" as AgingBucket,
    })),
  },
];

// Get valuation for a specific date
export function getValuationForDate(asOfDate: string): ValuationRow[] {
  // If no date or today's date, return current data
  const today = new Date().toISOString().split("T")[0];
  if (!asOfDate || asOfDate >= today) {
    return mockValuationRows;
  }

  // Find the closest snapshot that is on or before the asOfDate
  const sortedSnapshots = [...mockHistoricalSnapshots].sort(
    (a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()
  );

  for (const snapshot of sortedSnapshots) {
    if (snapshot.snapshotDate <= asOfDate) {
      return snapshot.rows;
    }
  }

  // If asOfDate is before all snapshots, return the oldest snapshot
  const oldestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
  if (oldestSnapshot) {
    return oldestSnapshot.rows;
  }

  return mockValuationRows;
}

// Get available snapshot dates
export function getAvailableSnapshotDates(): string[] {
  const today = new Date().toISOString().split("T")[0];
  return [today, ...mockHistoricalSnapshots.map((s) => s.snapshotDate)].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
}

// Product valuation details generator
export function getProductValuationDetails(productId: string, asOfDate?: string): ProductValuationDetails | null {
  const rows = asOfDate ? getValuationForDate(asOfDate) : mockValuationRows;
  const row = rows.find((r) => r.productId === productId);
  if (!row) return null;

  // For historical dates, filter movements and layers
  let fifoLayers = mockFifoLayers[productId] || [];
  let movements = mockMovements[productId] || [];

  if (asOfDate) {
    const asOfDateTime = new Date(asOfDate).getTime();
    fifoLayers = fifoLayers.filter(
      (layer) => new Date(layer.grnDate).getTime() <= asOfDateTime
    );
    movements = movements.filter(
      (mov) => new Date(mov.dateTime.split("T")[0]).getTime() <= asOfDateTime
    );
  }

  return {
    productId: row.productId,
    productName: row.productName,
    sku: row.sku,
    brandName: row.supplierName,
    categoryName: row.categoryName,
    supplierName: row.supplierName,
    costingMethod: row.costingMethod,
    onHandQty: row.onHandQty,
    unitCost: row.unitCost,
    totalValue: row.stockValue,
    lastReceiptDate: row.lastReceiptDate,
    fifoLayers,
    movements,
  };
}
