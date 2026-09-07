const fs = require('fs');
const path = require('path');

// ─── Cloud Persistence via JSONBin.io ───
// Set these environment variables on your hosting platform (Render/Railway/etc):
//   JSONBIN_API_KEY  - Your JSONBin.io Master Key (get free at https://jsonbin.io)
//   JSONBIN_BIN_ID   - The Bin ID (created automatically on first run if empty)
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '';
const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';

// ─── Local file fallback for development ───
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'database.backup.json');

const DEFAULT_PRICING_TEMPLATE = {
  currency: 'INR',
  currencySymbol: '₹',
  minOrderAmount: 5,
  paperSizes: {
    A4: { name: 'A4', active: true, baseMultiplier: 1.0 },
    A3: { name: 'A3', active: true, baseMultiplier: 2.0 },
    Legal: { name: 'Legal', active: true, baseMultiplier: 1.25 },
    Letter: { name: 'Letter', active: true, baseMultiplier: 1.0 },
    Photo_4x6: { name: 'Photo (4x6")', active: true, baseMultiplier: 2.5 }
  },
  rates: {
    A4: {
      monoSingle: 2.0,
      monoDuplex: 1.5,
      colorSingle: 8.0,
      colorDuplex: 7.0
    },
    A3: {
      monoSingle: 5.0,
      monoDuplex: 4.0,
      colorSingle: 18.0,
      colorDuplex: 15.0
    },
    Legal: {
      monoSingle: 3.0,
      monoDuplex: 2.5,
      colorSingle: 10.0,
      colorDuplex: 9.0
    },
    Photo_4x6: {
      colorSingle: 15.0
    }
  },
  paperTypes: {
    standard_75gsm: { name: 'Standard (75 GSM)', extraPerPage: 0.0, default: true },
    bond_85gsm: { name: 'Executive Bond (85 GSM)', extraPerPage: 1.0 },
    glossy_180gsm: { name: 'Glossy / Photo (180 GSM)', extraPerPage: 8.0 },
    cardstock_250gsm: { name: 'Heavy Cardstock (250 GSM)', extraPerPage: 12.0 }
  },
  finishing: {
    none: { name: 'No Finishing', price: 0 },
    stapling: { name: 'Corner Staple', price: 2 },
    spiral_binding: { name: 'Spiral Binding', price: 30 },
    hard_binding: { name: 'Hard Bound Project Binding', price: 150 },
    lamination_a4: { name: 'A4 Thermal Lamination', price: 25 },
    lamination_a3: { name: 'A3 Thermal Lamination', price: 50 }
  },
  urgentRushFee: 15,
  volumeDiscounts: [
    { minPages: 25, maxPages: 50, discountPercent: 10 },
    { minPages: 51, maxPages: 100, discountPercent: 15 },
    { minPages: 101, maxPages: 9999, discountPercent: 25 }
  ]
};

const DEFAULT_BOT_TEMPLATE = {
  botName: 'Print Support Assistant',
  greetingMessage: '👋 Welcome to our Print Hub!\n\nSend your PDF/Document or Image here to get instant print quotes and queue your job without waiting in counter line.',
  autoReplyEnabled: true,
  autoQuoteEnabled: true,
  instantPayLinkEnabled: true,
  qaPairs: [
    {
      id: 'qa_1',
      question: 'What are your shop timings?',
      answer: 'We are open Monday to Saturday from 9:00 AM to 9:30 PM, and Sunday from 10:00 AM to 6:00 PM.'
    },
    {
      id: 'qa_2',
      question: 'Do you do spiral and hard binding?',
      answer: 'Yes! Spiral binding and Hard Bound project golden-embossed binding are available.'
    },
    {
      id: 'qa_3',
      question: 'Where is your shop located?',
      answer: 'Please contact our store team or check our shop counter address.'
    }
  ],
  simulatedChats: []
};

const defaultPermanentShops = [
  {
    id: 'shop_main',
    slug: 'printsupport-hub',
    name: 'Print Support Main Hub',
    ownerName: 'Aayush Purohit',
    email: 'shop@printsupport.in',
    phone: '7225083904',
    password: 'password123',
    address: 'Vidisha, Madhya Pradesh (MP)',
    upiId: 'printsupport@upi',
    autoPrintEnabled: true,
    instantReleaseOnPayment: true,
    whatsappAutomationEnabled: true,
    whatsappPhoneNumber: '7225083904',
    whatsappSessionStatus: 'CONNECTED',
    agentToken: 'agt_tok_main_hub_01',
    agentStatus: 'ONLINE',
    plan: 'ENTERPRISE',
    planExpiresAt: '2099-12-31T23:59:59.000Z',
    printCredits: 999999,
    createdAt: new Date().toISOString()
  }
];

const defaultData = {
  shops: defaultPermanentShops,
  pricing: {},
  printers: [
    {
      id: 'prn_main_01',
      shopId: 'shop_main',
      name: 'Counter Master (B&W / Color)',
      model: 'LaserJet Pro M428dw',
      connectionType: 'USB_DIRECT',
      status: 'ONLINE',
      isDefaultMono: true,
      supportsColor: true,
      supportedSizes: ['A4', 'Legal', 'Letter', 'A3'],
      autoCut: true,
      ipAddress: '127.0.0.1'
    }
  ],
  orders: [],
  counters: {
    shop_main: 0,
    global: 0
  },
  whatsappBot: {},
  plans: [
    {
      id: 'plan_starter',
      name: 'Starter Solo',
      price: 499,
      interval: 'month',
      printCredits: 500,
      features: [
        'Single Counter Terminal',
        'Customer Self-Intake QR',
        'Direct UPI Payments (0% fee)',
        'Standard Email Support'
      ]
    },
    {
      id: 'plan_growth',
      name: 'Growth Automation',
      price: 1299,
      interval: 'month',
      isPopular: true,
      printCredits: 2500,
      features: [
        'Up to 3 Printers Automated',
        'Desktop Print Spooler Agent',
        'WhatsApp AI Quote & Order Bot',
        'Real-time Ledger & Daily Tally',
        'Priority Phone & WhatsApp Support'
      ]
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise Multi-Shop',
      price: 2999,
      interval: 'month',
      printCredits: 10000,
      features: [
        'Unlimited Spoolers & Printers',
        'Multi-Counter Station Control',
        'Intelligent Color/Mono Auto-Routing',
        'Dedicated Cloud SLA & Custom Domain',
        'On-site Setup & 24/7 VIP Hotline'
      ]
    }
  ],
  supportEnquiries: []
};

// ─── Cloud Sync Helper (JSONBin.io) ───
// Reads and writes data to JSONBin.io for persistence across deploys.
// Falls back gracefully to local file if JSONBin is not configured.

async function cloudRead() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) return null;
  try {
    const res = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    if (!res.ok) {
      console.warn('⚠️ [DB] Cloud read failed:', res.status, res.statusText);
      return null;
    }
    const json = await res.json();
    // JSONBin wraps data in { record: {...} }
    return json.record || json;
  } catch (e) {
    console.warn('⚠️ [DB] Cloud read error:', e.message);
    return null;
  }
}

// Debounced cloud write - batches rapid saves into one request
let _cloudWriteTimer = null;
let _pendingCloudData = null;

function cloudWriteDebounced(data) {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) return;
  _pendingCloudData = data;
  if (_cloudWriteTimer) clearTimeout(_cloudWriteTimer);
  _cloudWriteTimer = setTimeout(async () => {
    const toWrite = _pendingCloudData;
    _pendingCloudData = null;
    try {
      const res = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify(toWrite)
      });
      if (!res.ok) {
        console.warn('⚠️ [DB] Cloud write failed:', res.status);
      } else {
        console.log('☁️  [DB] Cloud sync OK');
      }
    } catch (e) {
      console.warn('⚠️ [DB] Cloud write error:', e.message);
    }
  }, 2000); // 2s debounce to batch rapid saves
}

class Database {
  constructor() {
    this.data = null;
    this._ready = this._init();
  }

  async _init() {
    // 1. Try loading from cloud first (survives redeploys)
    const cloudData = await cloudRead();
    if (cloudData && typeof cloudData === 'object' && Array.isArray(cloudData.shops) && cloudData.shops.length > 0) {
      console.log('☁️  [DB] Loaded data from cloud storage (' + cloudData.shops.length + ' shops, ' + (cloudData.orders || []).length + ' orders)');
      this.data = {
        ...defaultData,
        ...cloudData,
        counters: cloudData.counters || { global: 0 }
      };
      // Mirror to local file for fast subsequent reads
      this._saveLocal(this.data);
      return;
    }

    // 2. Fall back to local file
    this.data = this._loadLocal();

    // 3. If we have cloud configured but no data there yet, seed it
    if (JSONBIN_API_KEY && JSONBIN_BIN_ID) {
      console.log('☁️  [DB] Seeding cloud with local data...');
      cloudWriteDebounced(this.data);
    }
  }

  // Wait for async initialization to complete
  async ready() {
    await this._ready;
    return this;
  }

  _loadLocal() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const loadedShops = Array.isArray(parsed.shops) && parsed.shops.length > 0
            ? parsed.shops
            : defaultPermanentShops;
            
          return {
            ...defaultData,
            ...parsed,
            shops: loadedShops,
            counters: parsed.counters || { global: 0 }
          };
        }
      }
    } catch (e) {
      console.warn('⚠️ [DB] Could not load main database file, attempting backup restore:', e.message);
      try {
        if (fs.existsSync(BACKUP_FILE)) {
          const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf8');
          const parsedBackup = JSON.parse(rawBackup);
          if (parsedBackup && typeof parsedBackup === 'object') {
            console.log('✅ [DB] Successfully recovered database from backup.');
            const loadedShops = Array.isArray(parsedBackup.shops) && parsedBackup.shops.length > 0
              ? parsedBackup.shops
              : defaultPermanentShops;
            return {
              ...defaultData,
              ...parsedBackup,
              shops: loadedShops,
              counters: parsedBackup.counters || { global: 0 }
            };
          }
        }
      } catch (backupErr) {
        console.error('⚠️ [DB] Backup restore error:', backupErr.message);
      }
    }
    this._saveLocal(defaultData);
    return { ...defaultData };
  }

  _saveLocal(data = this.data) {
    try {
      const serialized = JSON.stringify(data, null, 2);
      fs.writeFileSync(DB_FILE, serialized, 'utf8');
      fs.writeFileSync(BACKUP_FILE, serialized, 'utf8');
    } catch (e) {
      console.error('⚠️ [DB] Error persisting database to disk:', e.message);
    }
  }

  save(data = this.data) {
    // Save locally (fast)
    this._saveLocal(data);
    // Save to cloud (debounced, async)
    cloudWriteDebounced(data);
  }

  getShops() { return this.data.shops || []; }
  
  getShopById(id) { 
    if (!id) return (this.data.shops && this.data.shops[0]) || null;
    return this.data.shops.find(s => s.id === id || s.slug === id) || null; 
  }
  
  getShopBySlug(slug) { 
    if (!slug) return (this.data.shops && this.data.shops[0]) || null;
    return this.data.shops.find(s => s.slug === slug || s.id === slug) || null; 
  }

  getNextOrderNumber(shopId) {
    if (!this.data.counters) this.data.counters = {};
    const key = shopId || 'global';
    if (typeof this.data.counters[key] !== 'number') {
      const existing = (this.data.orders || []).filter(o => !shopId || o.shopId === shopId);
      this.data.counters[key] = existing.length;
    }
    this.data.counters[key] += 1;
    this.save();
    return this.data.counters[key];
  }
  
  addShop(shop) {
    if (!this.data.shops) this.data.shops = [];
    const exists = this.data.shops.some(s => s.id === shop.id || s.slug === shop.slug);
    if (!exists) {
      this.data.shops.push(shop);
    }
    if (!this.data.pricing[shop.id]) {
      this.data.pricing[shop.id] = JSON.parse(JSON.stringify(DEFAULT_PRICING_TEMPLATE));
    }
    if (!this.data.whatsappBot[shop.id]) {
      const botConfig = JSON.parse(JSON.stringify(DEFAULT_BOT_TEMPLATE));
      botConfig.greetingMessage = `👋 Welcome to ${shop.name}!\n\nSend your PDF/Document or Image here to get instant print quotes and queue your job without waiting in counter line.`;
      this.data.whatsappBot[shop.id] = botConfig;
    }
    // Add default printer for new shop
    if (!this.data.printers.some(p => p.shopId === shop.id)) {
      this.data.printers.push({
        id: `prn_${shop.id}_1`,
        shopId: shop.id,
        name: 'Main Counter Printer',
        model: 'Universal Document Spooler',
        connectionType: 'USB_DIRECT',
        status: 'ONLINE',
        isDefaultMono: true,
        supportsColor: true,
        supportedSizes: ['A4', 'Legal', 'Letter'],
        autoCut: true,
        ipAddress: '127.0.0.1'
      });
    }
    this.save();
    return shop;
  }

  deleteShop(id) {
    this.data.shops = this.data.shops.filter(s => s.id !== id);
    delete this.data.pricing[id];
    delete this.data.whatsappBot[id];
    this.data.printers = this.data.printers.filter(p => p.shopId !== id);
    this.data.orders = this.data.orders.filter(o => o.shopId !== id);
    this.save();
    return true;
  }

  updateShop(id, updates) {
    const idx = this.data.shops.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.shops[idx] = { ...this.data.shops[idx], ...updates };
      this.save();
      return this.data.shops[idx];
    }
    return null;
  }

  getPricing(shopId) {
    return this.data.pricing[shopId] || DEFAULT_PRICING_TEMPLATE;
  }

  updatePricing(shopId, pricingData) {
    this.data.pricing[shopId] = { ...this.getPricing(shopId), ...pricingData };
    this.save();
    return this.data.pricing[shopId];
  }

  getPrinters(shopId) {
    return this.data.printers.filter(p => !shopId || p.shopId === shopId);
  }

  getPrinterById(id) {
    return this.data.printers.find(p => p.id === id);
  }

  addPrinter(printer) {
    this.data.printers.push(printer);
    this.save();
    return printer;
  }

  updatePrinter(id, updates) {
    const idx = this.data.printers.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.printers[idx] = { ...this.data.printers[idx], ...updates };
      this.save();
      return this.data.printers[idx];
    }
    return null;
  }

  deletePrinter(id) {
    this.data.printers = this.data.printers.filter(p => p.id !== id);
    this.save();
    return true;
  }

  getOrders(shopId) {
    return this.data.orders.filter(o => !shopId || o.shopId === shopId);
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  addOrder(order) {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrder(id, updates) {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      const order = this.data.orders[idx];
      this.data.orders[idx] = {
        ...order,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }

  getWhatsAppBot(shopId) {
    return this.data.whatsappBot[shopId] || this.data.whatsappBot['shop_demo'];
  }

  updateWhatsAppBot(shopId, updates) {
    this.data.whatsappBot[shopId] = {
      ...this.getWhatsAppBot(shopId),
      ...updates
    };
    this.save();
    return this.data.whatsappBot[shopId];
  }

  getSubscriptionPlans() {
    return this.data.plans || [];
  }

  getSupportEnquiries() {
    return this.data.supportEnquiries;
  }

  addSupportEnquiry(enquiry) {
    this.data.supportEnquiries.unshift(enquiry);
    this.save();
    return enquiry;
  }
}

// Create singleton and export
const db = new Database();
module.exports = db;
