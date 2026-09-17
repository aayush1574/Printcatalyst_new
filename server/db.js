const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { MongoClient } = require('mongodb');

// ─── Cloud Persistence via MongoDB Atlas ───
// Set MONGODB_URI in your environment / Render / Railway / .env:
// Example: mongodb+srv://<username>:<password>@cluster0.mongodb.net/printcatalyst?retryWrites=true&w=majority
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'printcatalyst';

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
    autoPrintEnabled: false,
    instantReleaseOnPayment: false,
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

// ─── Cloud Sync Helper (MongoDB Atlas) ───
let _mongoClient = null;
let _mongoDb = null;
let _mongoSyncTimer = null;
let _pendingMongoData = null;

async function ensureIndexes(database) {
  if (!database) return;
  try {
    const shopsCol = database.collection('shops');
    const ordersCol = database.collection('orders');
    const printersCol = database.collection('printers');
    const filesCol = database.collection('uploaded_files');

    await Promise.allSettled([
      shopsCol.createIndex({ id: 1 }, { unique: true, background: true }),
      shopsCol.createIndex({ slug: 1 }, { background: true }),
      shopsCol.createIndex({ email: 1 }, { background: true }),
      ordersCol.createIndex({ id: 1 }, { unique: true, background: true }),
      ordersCol.createIndex({ shopId: 1, createdAt: -1 }, { background: true }),
      ordersCol.createIndex({ status: 1 }, { background: true }),
      ordersCol.createIndex({ pickupToken: 1 }, { background: true }),
      ordersCol.createIndex({ paymentStatus: 1 }, { background: true }),
      printersCol.createIndex({ id: 1, shopId: 1 }, { background: true }),
      filesCol.createIndex({ filename: 1 }, { unique: true, background: true })
    ]);
    console.log('⚡ [DB] MongoDB Database indexes verified & optimized');
  } catch (err) {
    console.warn('⚠️ [DB] Index creation notice:', err.message);
  }
}

async function connectMongoDB() {
  if (!MONGODB_URI) return null;
  try {
    _mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 50,       // Connection pooling: up to 50 concurrent sockets
      minPoolSize: 10,       // Keep 10 idle connections ready
      maxIdleTimeMS: 30000,  // Close idle sockets after 30s
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      waitQueueTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
      family: 4,
    });
    await _mongoClient.connect();
    _mongoDb = _mongoClient.db(MONGODB_DB_NAME);
    console.log(`🍃 [DB] Connected to MongoDB Atlas successfully with Connection Pool (Database: ${MONGODB_DB_NAME})`);
    
    // Asynchronously ensure optimized indexes
    ensureIndexes(_mongoDb).catch(() => {});
    return _mongoDb;
  } catch (err) {
    console.warn('⚠️ [DB] MongoDB Atlas connection error:', err.message);
    if (err.message && (err.message.includes('alert') || err.message.includes('SSL') || err.message.includes('timed out'))) {
      console.warn('💡 [DB Hint] Ensure MongoDB Atlas -> Network Access allows 0.0.0.0/0 (Access from Anywhere) for cloud hosts like Render.');
    }
    _mongoClient = null;
    _mongoDb = null;
    return null;
  }
}

function mongoSyncDebounced(data) {
  if (!_mongoDb) return;
  _pendingMongoData = data;
  if (_mongoSyncTimer) clearTimeout(_mongoSyncTimer);
  _mongoSyncTimer = setTimeout(async () => {
    const toSave = _pendingMongoData;
    _pendingMongoData = null;
    if (!_mongoDb || !toSave) return;
    try {
      const colState = _mongoDb.collection('app_state');
      await colState.updateOne(
        { _id: 'main_state' },
        {
          $set: {
            shops: toSave.shops || [],
            orders: toSave.orders || [],
            pricing: toSave.pricing || {},
            printers: toSave.printers || [],
            counters: toSave.counters || {},
            plans: toSave.plans || [],
            supportEnquiries: toSave.supportEnquiries || [],
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      console.log('🍃 [DB] MongoDB Atlas sync OK');
    } catch (e) {
      console.warn('⚠️ [DB] MongoDB Atlas sync error:', e.message);
    }
  }, 1000);
}

class Database {
  constructor() {
    this._shopIdMap = new Map();
    this._shopSlugMap = new Map();
    this._orderIdMap = new Map();
    this._printerIdMap = new Map();
    this._queryCache = new Map(); // key -> { val, expiresAt }
    this.data = this._loadLocal();
    this._rebuildIndexes();
    this._ready = this._init();
  }

  _rebuildIndexes() {
    this._shopIdMap.clear();
    this._shopSlugMap.clear();
    this._orderIdMap.clear();
    this._printerIdMap.clear();

    if (this.data) {
      if (Array.isArray(this.data.shops)) {
        for (const s of this.data.shops) {
          if (s.id) this._shopIdMap.set(s.id, s);
          if (s.slug) this._shopSlugMap.set(s.slug, s);
        }
      }
      if (Array.isArray(this.data.orders)) {
        for (const o of this.data.orders) {
          if (o.id) this._orderIdMap.set(o.id, o);
        }
      }
      if (Array.isArray(this.data.printers)) {
        for (const p of this.data.printers) {
          if (p.id) this._printerIdMap.set(p.id, p);
        }
      }
    }
  }

  _getCached(key) {
    const cached = this._queryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this._queryCache.delete(key);
      return null;
    }
    return cached.val;
  }

  _setCached(key, val, ttlSeconds = 15) {
    this._queryCache.set(key, {
      val,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  _invalidateCache(shopId = null) {
    if (!shopId) {
      this._queryCache.clear();
      return;
    }
    for (const key of this._queryCache.keys()) {
      if (key.includes(shopId) || key.startsWith('global_')) {
        this._queryCache.delete(key);
      }
    }
  }

  async _init() {
    // 1. Try loading from MongoDB Atlas first (if configured)
    if (MONGODB_URI) {
      const dbInstance = await connectMongoDB();
      if (dbInstance) {
        try {
          const colState = dbInstance.collection('app_state');
          const doc = await colState.findOne({ _id: 'main_state' });
          if (doc && Array.isArray(doc.shops) && doc.shops.length > 0) {
            console.log(`🍃 [DB] Loaded data from MongoDB Atlas (${doc.shops.length} shops, ${(doc.orders || []).length} orders)`);
            this.data = {
              ...defaultData,
              ...doc,
              counters: doc.counters || { global: 0 }
            };
            this._rebuildIndexes();
            this._saveLocal(this.data);
            return;
          } else {
            console.log('🍃 [DB] MongoDB Atlas connected. Seeding initial data from local store...');
            this.data = this._loadLocal();
            this._rebuildIndexes();
            mongoSyncDebounced(this.data);
            return;
          }
        } catch (readErr) {
          console.warn('⚠️ [DB] Error reading from MongoDB Atlas:', readErr.message);
        }
      }
    }

    // 2. Fall back to local file
    this.data = this._loadLocal();
    this._rebuildIndexes();
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
    this._rebuildIndexes();
    this._saveLocal(data);
    if (_mongoDb) {
      mongoSyncDebounced(data);
    }
  }

  isCloudEnabled() {
    return Boolean(_mongoDb);
  }

  getMongoDb() {
    return _mongoDb;
  }

  getShops() { return this.data.shops || []; }
  
  // O(1) indexed lookups
  getShopById(id) { 
    if (!id) return (this.data.shops && this.data.shops[0]) || null;
    return this._shopIdMap.get(id) || this._shopSlugMap.get(id) || this.data.shops.find(s => s.id === id || s.slug === id) || null; 
  }
  
  getShopBySlug(slug) { 
    if (!slug) return (this.data.shops && this.data.shops[0]) || null;
    return this._shopSlugMap.get(slug) || this._shopIdMap.get(slug) || this.data.shops.find(s => s.slug === slug || s.id === slug) || null; 
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
    this._invalidateCache(shop.id);
    this.save();
    return shop;
  }

  deleteShop(id) {
    this.data.shops = this.data.shops.filter(s => s.id !== id);
    delete this.data.pricing[id];
    delete this.data.whatsappBot[id];
    this.data.printers = this.data.printers.filter(p => p.shopId !== id);
    this.data.orders = this.data.orders.filter(o => o.shopId !== id);
    this._invalidateCache(id);
    this.save();
    return true;
  }

  updateShop(id, updates) {
    const idx = this.data.shops.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.shops[idx] = { ...this.data.shops[idx], ...updates };
      this._invalidateCache(id);
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
    this._invalidateCache(shopId);
    this.save();
    return this.data.pricing[shopId];
  }

  getPrinters(shopId) {
    return this.data.printers.filter(p => !shopId || p.shopId === shopId);
  }

  getPrinterById(id) {
    return this._printerIdMap.get(id) || this.data.printers.find(p => p.id === id);
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

  // O(1) indexed order lookup
  getOrderById(id) {
    return this._orderIdMap.get(id) || this.data.orders.find(o => o.id === id);
  }

  // Batch query to eliminate N+1 database queries
  getOrdersBatch(orderIds = []) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) return [];
    const results = [];
    for (const id of orderIds) {
      const order = this._orderIdMap.get(id);
      if (order) results.push(order);
    }
    return results;
  }

  // Paginated and filtered order query for large queues
  getOrdersPaginated(shopId, { page = 1, limit = 25, status = 'ALL', search = '' } = {}) {
    const cacheKey = `orders_page_${shopId}_${page}_${limit}_${status}_${search}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    let filtered = this.getOrders(shopId);

    if (status && status !== 'ALL') {
      filtered = filtered.filter(o => o.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(o =>
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.pickupToken && String(o.pickupToken).includes(q))
      );
    }

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginatedOrders = filtered.slice(offset, offset + limitNum);

    const result = {
      orders: paginatedOrders,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasMore: pageNum < totalPages
    };

    this._setCached(cacheKey, result, 10);
    return result;
  }

  // Cached expensive analytics queries
  getShopStats(shopId) {
    const cacheKey = `stats_${shopId}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const orders = this.getOrders(shopId);
    let totalRevenue = 0;
    let pendingCount = 0;
    let printingCount = 0;
    let completedCount = 0;
    let totalPagesPrinted = 0;

    for (const o of orders) {
      if (o.status === 'COMPLETED' || o.paymentStatus === 'PAID') {
        totalRevenue += (o.finalAmount || o.totalAmount || 0);
      }
      if (o.status === 'READY_TO_PRINT' || o.status === 'SUBMITTED') {
        pendingCount++;
      } else if (o.status === 'PRINTING') {
        printingCount++;
      } else if (o.status === 'COMPLETED') {
        completedCount++;
      }

      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          totalPagesPrinted += (item.pageCount || 1) * (item.copies || 1);
        }
      }
    }

    const stats = {
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue),
      pendingCount,
      printingCount,
      completedCount,
      totalPagesPrinted
    };

    this._setCached(cacheKey, stats, 15);
    return stats;
  }

  addOrder(order) {
    this.data.orders.unshift(order);
    this._orderIdMap.set(order.id, order);
    this._invalidateCache(order.shopId);
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
      this._orderIdMap.set(id, this.data.orders[idx]);
      this._invalidateCache(order.shopId);
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
    this._invalidateCache(shopId);
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
