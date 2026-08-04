// Onam POS - client-only data layer.
// Everything is stored in the browser's localStorage. No server involved.

const STORAGE_KEY = 'onam-pos-data-v1';

function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function seedData() {
  const now = new Date().toISOString();
  const products = [
    { id: uid(), name: 'Sadhya Full Meal (26 items)', category: 'Sadhya', price: 250, stock: 100, unit: 'plate', available: true, createdAt: now },
    { id: uid(), name: 'Sadhya Mini Meal (12 items)', category: 'Sadhya', price: 150, stock: 100, unit: 'plate', available: true, createdAt: now },
    { id: uid(), name: 'Avial', category: 'Curry', price: 60, stock: 50, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Sambar', category: 'Curry', price: 50, stock: 50, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Olan', category: 'Curry', price: 55, stock: 40, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Thoran (Cabbage)', category: 'Curry', price: 45, stock: 40, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Pachadi', category: 'Curry', price: 40, stock: 40, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Kaalan', category: 'Curry', price: 55, stock: 30, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Pappadam', category: 'Sides', price: 10, stock: 200, unit: 'pc', available: true, createdAt: now },
    { id: uid(), name: 'Banana Chips', category: 'Sides', price: 30, stock: 100, unit: 'packet', available: true, createdAt: now },
    { id: uid(), name: 'Sharkara Varatti', category: 'Sides', price: 35, stock: 80, unit: 'packet', available: true, createdAt: now },
    { id: uid(), name: 'Pickle (Mango)', category: 'Sides', price: 25, stock: 60, unit: 'packet', available: true, createdAt: now },
    { id: uid(), name: 'Payasam (Ada Pradhaman)', category: 'Dessert', price: 70, stock: 60, unit: 'cup', available: true, createdAt: now },
    { id: uid(), name: 'Payasam (Palada)', category: 'Dessert', price: 65, stock: 60, unit: 'cup', available: true, createdAt: now },
    { id: uid(), name: 'Boiled Rice', category: 'Rice', price: 40, stock: 100, unit: 'plate', available: true, createdAt: now },
    { id: uid(), name: 'Matta Rice', category: 'Rice', price: 45, stock: 100, unit: 'plate', available: true, createdAt: now },
    { id: uid(), name: 'Curd', category: 'Sides', price: 20, stock: 80, unit: 'cup', available: true, createdAt: now },
    { id: uid(), name: 'Pulissery', category: 'Curry', price: 50, stock: 40, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Erissery', category: 'Curry', price: 55, stock: 40, unit: 'bowl', available: true, createdAt: now },
    { id: uid(), name: 'Banana (Nendran)', category: 'Sides', price: 15, stock: 150, unit: 'pc', available: true, createdAt: now }
  ];

  return {
    products,
    customers: [],
    bills: [],
    billItems: [],
    counters: { bill: 1000 },
    settings: {
      shopName: 'Onam Sadhya Store',
      ownerWhatsApp: '', // e.g. '919876543210' (country code, no + or spaces)
      autoOpenWhatsAppOnBill: true
    }
  };
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    // migrate older saved data that predates `settings`
    if (!parsed.settings) {
      parsed.settings = seedData().settings;
      save(parsed);
    }
    return parsed;
  } catch {
    const seeded = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAllData() {
  const seeded = seedData();
  save(seeded);
  return seeded;
}

// ---------- Settings ----------
export function getSettings() {
  return load().settings;
}

export function updateSettings(updates) {
  const data = load();
  data.settings = { ...data.settings, ...updates };
  save(data);
  return data.settings;
}

// ---------- Products ----------
export function getProducts() {
  return load().products;
}

export function getProductById(id) {
  return load().products.find(p => p.id === id) || null;
}

export function createProduct(product) {
  const data = load();
  const newProduct = {
    id: uid(),
    name: product.name,
    category: product.category || 'General',
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    unit: product.unit || 'pc',
    available: product.available !== undefined ? product.available : true,
    createdAt: new Date().toISOString()
  };
  data.products.push(newProduct);
  save(data);
  return newProduct;
}

export function updateProduct(id, updates) {
  const data = load();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  data.products[idx] = { ...data.products[idx], ...updates, id };
  save(data);
  return data.products[idx];
}

export function deleteProduct(id) {
  const data = load();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  data.products.splice(idx, 1);
  save(data);
  return true;
}

// ---------- Customers ----------
export function getCustomers() {
  return load().customers;
}

export function createCustomer(customer) {
  const data = load();
  const newCustomer = {
    id: uid(),
    name: customer.name,
    phone: customer.phone,
    createdAt: new Date().toISOString()
  };
  data.customers.push(newCustomer);
  save(data);
  return newCustomer;
}

export function updateCustomer(id, updates) {
  const data = load();
  const idx = data.customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  data.customers[idx] = { ...data.customers[idx], ...updates, id };
  save(data);
  return data.customers[idx];
}

export function deleteCustomer(id) {
  const data = load();
  const idx = data.customers.findIndex(c => c.id === id);
  if (idx === -1) return false;
  data.customers.splice(idx, 1);
  save(data);
  return true;
}

export function getCustomerHistory(id) {
  const data = load();
  return data.bills
    .filter(b => b.customerId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ---------- Bills ----------
function nextBillNumber(data) {
  data.counters.bill += 1;
  return `ONM-${data.counters.bill}`;
}

export function getBills({ from, to, billNumber } = {}) {
  let bills = load().bills;
  if (billNumber) {
    bills = bills.filter(b => b.billNumber.toLowerCase().includes(billNumber.toLowerCase()));
  }
  if (from) {
    bills = bills.filter(b => new Date(b.createdAt) >= new Date(from));
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    bills = bills.filter(b => new Date(b.createdAt) <= toDate);
  }
  return bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getBillById(id) {
  const data = load();
  const bill = data.bills.find(b => b.id === id);
  if (!bill) return null;
  const items = data.billItems.filter(i => i.billId === id);
  return { ...bill, items };
}

export function createBill({ customerId, customerName, customerPhone, items, discount, tax, paymentMethod }) {
  const data = load();

  // validate stock before committing anything
  for (const item of items) {
    const product = data.products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Product not found: ${item.name}`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = Number(discount) || 0;
  const taxAmount = Number(tax) || 0;
  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  const bill = {
    id: uid(),
    billNumber: nextBillNumber(data),
    customerId: customerId || null,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || '',
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    total,
    paymentMethod: paymentMethod || 'Cash',
    createdAt: new Date().toISOString()
  };

  data.bills.push(bill);

  items.forEach(i => {
    data.billItems.push({
      id: uid(),
      billId: bill.id,
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      lineTotal: i.price * i.quantity
    });
    const product = data.products.find(p => p.id === i.productId);
    if (product) {
      product.stock = Math.max(0, (Number(product.stock) || 0) - i.quantity);
    }
  });

  save(data);
  const fullBill = getBillById(bill.id);

  // Fire-and-forget WhatsApp handoff: owner always, customer if we have a number.
  if (data.settings?.autoOpenWhatsAppOnBill) {
    sendBillOnWhatsApp(fullBill.id);
  }

  return fullBill;
}

export function deleteBill(id) {
  const data = load();
  const idx = data.bills.findIndex(b => b.id === id);
  if (idx === -1) return false;

  // restore stock for each item on the deleted bill
  const items = data.billItems.filter(i => i.billId === id);
  items.forEach(i => {
    const product = data.products.find(p => p.id === i.productId);
    if (product) {
      product.stock = (Number(product.stock) || 0) + i.quantity;
    }
  });

  data.bills.splice(idx, 1);
  data.billItems = data.billItems.filter(i => i.billId !== id);

  save(data);
  return true;
}

// ---------- WhatsApp ----------

// Keeps digits only, and assumes India (91) if a 10-digit local number is given.
function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  return digits; // already has a country code (or is unusual — pass through)
}

function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

// Builds the human-readable bill text shared on WhatsApp.
export function formatBillMessage(bill, { forOwner = false } = {}) {
  const shopName = load().settings?.shopName || 'Onam Sadhya Store';
  const lines = [];
  lines.push(`*${shopName}*`);
  lines.push(`Bill: ${bill.billNumber}`);
  lines.push(`Date: ${new Date(bill.createdAt).toLocaleString('en-IN')}`);
  if (forOwner) {
    lines.push(`Customer: ${bill.customerName}${bill.customerPhone ? ' (' + bill.customerPhone + ')' : ''}`);
  }
  lines.push('');
  lines.push('Items:');
  bill.items.forEach(i => {
    lines.push(`• ${i.name} x${i.quantity} — ${formatCurrency(i.lineTotal)}`);
  });
  lines.push('');
  lines.push(`Subtotal: ${formatCurrency(bill.subtotal)}`);
  if (bill.discount) lines.push(`Discount: -${formatCurrency(bill.discount)}`);
  if (bill.tax) lines.push(`Tax: +${formatCurrency(bill.tax)}`);
  lines.push(`*Total: ${formatCurrency(bill.total)}*`);
  lines.push(`Payment: ${bill.paymentMethod}`);
  if (!forOwner) {
    lines.push('');
    lines.push('Thank you for your order! Happy Onam 🌼');
  }
  return lines.join('\n');
}

export function buildWhatsAppLink(phone, message) {
  const number = normalizePhone(phone);
  const text = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

// Returns { owner, customer } wa.me links for a given bill.
// `customer` is null if the bill has no phone number on file.
export function getBillWhatsAppLinks(billId) {
  const bill = getBillById(billId);
  if (!bill) return { owner: null, customer: null };

  const settings = load().settings;
  const ownerNumber = settings?.ownerWhatsApp;

  const owner = ownerNumber
    ? buildWhatsAppLink(ownerNumber, formatBillMessage(bill, { forOwner: true }))
    : null;

  const customer = bill.customerPhone
    ? buildWhatsAppLink(bill.customerPhone, formatBillMessage(bill, { forOwner: false }))
    : null;

  return { owner, customer };
}

// Opens WhatsApp chat tab(s) for a bill. Call this from a click handler
// (e.g. a "Send" button) — browsers block window.open() outside a user gesture,
// so this is best triggered directly by the person tapping something.
export function sendBillOnWhatsApp(billId, { to = 'both' } = {}) {
  const { owner, customer } = getBillWhatsAppLinks(billId);
  const opened = { owner: false, customer: false };

  if ((to === 'both' || to === 'owner') && owner) {
    window.open(owner, '_blank');
    opened.owner = true;
  }
  if ((to === 'both' || to === 'customer') && customer) {
    window.open(customer, '_blank');
    opened.customer = true;
  }
  return opened;
}

// ---------- Dashboard & Reports ----------
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getDashboardStats() {
  const data = load();
  const today = new Date();
  const todaysBills = data.bills.filter(b => isSameDay(new Date(b.createdAt), today));
  const todaysRevenue = todaysBills.reduce((sum, b) => sum + b.total, 0);
  const totalRevenue = data.bills.reduce((sum, b) => sum + b.total, 0);

  return {
    todaysSales: todaysBills.length,
    todaysRevenue,
    totalRevenue,
    totalBills: data.bills.length,
    totalProducts: data.products.length,
    lowStockProducts: data.products.filter(p => p.stock <= 5).length
  };
}

export function getSalesReport(range = 'daily') {
  const data = load();
  const now = new Date();
  let start;
  if (range === 'weekly') {
    start = new Date(now);
    start.setDate(start.getDate() - 7);
  } else if (range === 'monthly') {
    start = new Date(now);
    start.setMonth(start.getMonth() - 1);
  } else {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  }

  const bills = data.bills.filter(b => new Date(b.createdAt) >= start);
  const revenue = bills.reduce((sum, b) => sum + b.total, 0);
  const totalOrders = bills.length;
  const avgOrderValue = totalOrders ? revenue / totalOrders : 0;

  const byDay = {};
  bills.forEach(b => {
    const day = new Date(b.createdAt).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + b.total;
  });
  const series = Object.entries(byDay)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, total]) => ({ date, total }));

  return { range, revenue, totalOrders, avgOrderValue, series };
}

export function getBestSellers(limit = 5) {
  const data = load();
  const tally = {};
  data.billItems.forEach(i => {
    if (!tally[i.productId]) {
      tally[i.productId] = { productId: i.productId, name: i.name, quantitySold: 0, revenue: 0 };
    }
    tally[i.productId].quantitySold += i.quantity;
    tally[i.productId].revenue += i.lineTotal;
  });
  return Object.values(tally)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}