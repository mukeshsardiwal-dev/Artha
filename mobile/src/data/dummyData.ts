// Hardcoded dummy data — replace with API calls when backend is ready

export const COMPANY_NAME = 'Nanda Cotton Mills';
export const CURRENCY = '₹';

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export const DASHBOARD_STATS = [
  { id: '1', label: "Today's Sales",     value: 24500,   accent: '#22c55e' },
  { id: '2', label: "Today's Purchases", value: 18200,   accent: '#388bfd' },
  { id: '3', label: 'Gross Profit',      value: 6300,    accent: '#a371f7' },
  { id: '4', label: 'Cash in Hand',      value: 85000,   accent: '#e3b341' },
  { id: '5', label: 'Receivable',        value: 142500,  accent: '#3fb950' },
  { id: '6', label: 'Payable',           value: 38750,   accent: '#f85149' },
];

// ─── Top Items Today ───────────────────────────────────────────────────────────
export const TOP_ITEMS_TODAY = [
  { id: '1', name: 'Cotton Bales',  qty: 50,  unit: 'bale', amount: 12500 },
  { id: '2', name: 'Rice Bags',     qty: 120, unit: 'bag',  amount: 8400  },
  { id: '3', name: 'Wheat',         qty: 80,  unit: 'kg',   amount: 4800  },
  { id: '4', name: 'Maize',         qty: 60,  unit: 'kg',   amount: 3600  },
  { id: '5', name: 'Soybean',       qty: 35,  unit: 'kg',   amount: 2800  },
];

// ─── Sales ─────────────────────────────────────────────────────────────────────
export const SALES_LIST = [
  { id: 'S001', party: 'Ram Traders',     date: '30 May 2026', amount: 12500, status: 'Paid'    },
  { id: 'S002', party: 'Shyam Agencies',  date: '30 May 2026', amount: 8400,  status: 'Pending' },
  { id: 'S003', party: 'Mohan Stores',    date: '29 May 2026', amount: 6200,  status: 'Paid'    },
  { id: 'S004', party: 'Laxmi Traders',   date: '29 May 2026', amount: 9800,  status: 'Partial' },
  { id: 'S005', party: 'Ganesh Wholesale',date: '28 May 2026', amount: 15600, status: 'Paid'    },
];

// ─── Purchases ────────────────────────────────────────────────────────────────
export const PURCHASES_LIST = [
  { id: 'P001', party: 'Gujarat Cotton Co.',  date: '30 May 2026', amount: 18200, status: 'Paid'    },
  { id: 'P002', party: 'Punjab Agro Supply',  date: '29 May 2026', amount: 11500, status: 'Pending' },
  { id: 'P003', party: 'Rajasthan Farms Ltd', date: '28 May 2026', amount: 9200,  status: 'Paid'    },
  { id: 'P004', party: 'Maharashtra Seeds',   date: '27 May 2026', amount: 7800,  status: 'Partial' },
];

// ─── Parties ─────────────────────────────────────────────────────────────────
export const PARTIES_LIST = [
  { id: 'PA001', name: 'Ram Traders',          phone: '9812345678', balance: 12500,  type: 'Customer'  },
  { id: 'PA002', name: 'Gujarat Cotton Co.',   phone: '9823456789', balance: -18200, type: 'Supplier'  },
  { id: 'PA003', name: 'Shyam Agencies',       phone: '9834567890', balance: 8400,   type: 'Customer'  },
  { id: 'PA004', name: 'Laxmi Traders',        phone: '9845678901', balance: 4800,   type: 'Customer'  },
  { id: 'PA005', name: 'Punjab Agro Supply',   phone: '9856789012', balance: -11500, type: 'Supplier'  },
  { id: 'PA006', name: 'Mohan Stores',         phone: '9867890123', balance: 6200,   type: 'Customer'  },
];

// ─── Items ────────────────────────────────────────────────────────────────────
export const ITEMS_LIST = [
  { id: 'I001', name: 'Cotton Bales', unit: 'bale', salePrice: 250,  purchasePrice: 210, stock: 340 },
  { id: 'I002', name: 'Rice Bags',    unit: 'bag',  salePrice: 70,   purchasePrice: 58,  stock: 820 },
  { id: 'I003', name: 'Wheat',        unit: 'kg',   salePrice: 60,   purchasePrice: 50,  stock: 1200},
  { id: 'I004', name: 'Maize',        unit: 'kg',   salePrice: 45,   purchasePrice: 38,  stock: 650 },
  { id: 'I005', name: 'Soybean',      unit: 'kg',   salePrice: 80,   purchasePrice: 68,  stock: 430 },
  { id: 'I006', name: 'Sunflower Oil',unit: 'litre',salePrice: 150,  purchasePrice: 128, stock: 280 },
];

// ─── Cashbook ─────────────────────────────────────────────────────────────────
export const CASHBOOK_ENTRIES = [
  { id: 'C001', date: '30 May 2026', narration: 'Sale to Ram Traders',          type: 'In',  amount: 12500 },
  { id: 'C002', date: '30 May 2026', narration: 'Purchase from Gujarat Cotton', type: 'Out', amount: 18200 },
  { id: 'C003', date: '29 May 2026', narration: 'Sale to Mohan Stores',         type: 'In',  amount: 6200  },
  { id: 'C004', date: '29 May 2026', narration: 'Transport Charges',            type: 'Out', amount: 1500  },
  { id: 'C005', date: '28 May 2026', narration: 'Sale to Ganesh Wholesale',     type: 'In',  amount: 15600 },
  { id: 'C006', date: '28 May 2026', narration: 'Purchase from Punjab Agro',    type: 'Out', amount: 11500 },
  { id: 'C007', date: '27 May 2026', narration: 'Salary Payments',              type: 'Out', amount: 45000 },
];