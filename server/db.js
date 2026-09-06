const fs = require('fs');
const path = require('path');

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

const defaultData = {
  shops: [],
  pricing: {},
  printers: [],
  orders: [],
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

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...defaultData,
            ...parsed,
            shops: Array.isArray(parsed.shops) ? parsed.shops : []
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
            return {
              ...defaultData,
              ...parsedBackup,
              shops: Array.isArray(parsedBackup.shops) ? parsedBackup.shops : []
            };
          }
        }
      } catch (backupErr) {
        console.error('⚠️ [DB] Backup restore error:', backupErr.message);
      }
    }
    this.save(defaultData);
    return defaultData;
  }

  save(data = this.data) {
    try {
      const serialized = JSON.stringify(data, null, 2);
      fs.writeFileSync(DB_FILE, serialized, 'utf8');
      // Always maintain persistent mirror backup
      fs.writeFileSync(BACKUP_FILE, serialized, 'utf8');
    } catch (e) {
      console.error('⚠️ [DB] Error persisting database to disk:', e.message);
    }
  }

  getShops() { return this.data.shops; }
  
  getShopById(id) { 
    if (!id) return this.data.shops[0] || null;
    return this.data.shops.find(s => s.id === id || s.slug === id) || this.data.shops[0] || null; 
  }
  
  getShopBySlug(slug) { 
    if (!slug) return this.data.shops[0] || null;
    return this.data.shops.find(s => s.slug === slug || s.id === slug) || this.data.shops[0] || null; 
  }
  
  addShop(shop) {
    this.data.shops.push(shop);
    if (!this.data.pricing[shop.id]) {
      this.data.pricing[shop.id] = JSON.parse(JSON.stringify(DEFAULT_PRICING_TEMPLATE));
    }
    if (!this.data.whatsappBot[shop.id]) {
      const botConfig = JSON.parse(JSON.stringify(DEFAULT_BOT_TEMPLATE));
      botConfig.greetingMessage = `👋 Welcome to ${shop.name}!\n\nSend your PDF/Document or Image here to get instant print quotes and queue your job without waiting in counter line.`;
      this.data.whatsappBot[shop.id] = botConfig;
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

module.exports = new Database();
