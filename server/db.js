const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'database.json');

const defaultData = {
  shops: [
    {
      id: 'shop_demo',
      slug: 'catalyst-print-hub',
      name: 'Catalyst Print & Stationery Hub',
      ownerName: 'Rajesh Sharma',
      email: 'rajesh@printsupport.in',
      phone: '+91 98765 43210',
      password: 'password123',
      address: 'Shop No. 4, Opposite University North Gate, Delhi 110007',
      upiId: 'printsupport@okaxis',
      upiQrImage: '',
      autoPrintEnabled: true,
      instantReleaseOnPayment: true,
      whatsappAutomationEnabled: true,
      whatsappPhoneNumber: '+919876543210',
      whatsappSessionStatus: 'CONNECTED',
      agentToken: 'agt_tok_demo_88392019482',
      agentStatus: 'ONLINE',
      agentLastHeartbeat: new Date().toISOString(),
      plan: 'PRO',
      planExpiresAt: '2027-12-31T23:59:59.000Z',
      printCredits: 9540,
      createdAt: '2026-01-10T10:00:00.000Z'
    }
  ],
  pricing: {
    shop_demo: {
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
    }
  },
  printers: [],
  orders: [],
  whatsappBot: {
    shop_demo: {
      botName: 'Print Support Assistant',
      greetingMessage: '👋 Welcome to Print Support Hub!\n\nSend your PDF/Document or Image here to get instant print quotes and queue your job without waiting in counter line.',
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
          answer: 'Please contact the shop owner or check the address listed in the header.'
        }
      ],
      simulatedChats: []
    }
  },
  subscriptionPlans: [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 99,
      annualPrice: 990,
      orderLimit: 200,
      printerLimit: 1,
      features: [
        '1 Connected Printer Queue',
        'Permanent Shop QR Portal',
        'Up to 200 monthly orders',
        'Live Desktop Agent Spooler',
        'Basic Rate Matrix',
        'Standard Email Support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      monthlyPrice: 299,
      annualPrice: 2990,
      orderLimit: 1000,
      printerLimit: 3,
      popular: true,
      features: [
        'Up to 3 Connected Printers',
        'WhatsApp Document Intake Bot',
        'Permanent Shop QR & Standee Generator',
        'Up to 1,000 monthly orders',
        'Intelligent Printer Routing (B&W/Color)',
        'Document Studio Pre-flight Inspector',
        'Priority Phone & Chat Support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 799,
      annualPrice: 7990,
      orderLimit: 5000,
      printerLimit: 10,
      features: [
        'Up to 10 Connected Printers',
        'Advanced WhatsApp Bot with Custom QA',
        'Auto-Print Instant Release Mode',
        'Bulk Quantity Discount Rules',
        'Multi-Staff Operator Logins',
        'Financial Analytics & Excel Export',
        '24/7 Dedicated Account Manager'
      ]
    },
    {
      id: 'scale',
      name: 'Scale',
      monthlyPrice: 1499,
      annualPrice: 14990,
      orderLimit: 25000,
      printerLimit: 50,
      features: [
        'Unlimited Connected Printers',
        'Multiple Branch / Store Support',
        'Custom Domain & Whitelabel Branding',
        'Meta WhatsApp Official Cloud API',
        'ERP & Billing POS Integration',
        'Custom SLA & On-premise agent setup'
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
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading DB, using defaults:', e.message);
    }
    this.save(defaultData);
    return defaultData;
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving DB:', e.message);
    }
  }

  getShops() { return this.data.shops; }
  getShopById(id) { return this.data.shops.find(s => s.id === id); }
  getShopBySlug(slug) { return this.data.shops.find(s => s.slug === slug); }
  
  addShop(shop) {
    this.data.shops.push(shop);
    if (!this.data.pricing[shop.id]) {
      this.data.pricing[shop.id] = JSON.parse(JSON.stringify(this.data.pricing['shop_demo'] || {}));
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
    return this.data.pricing[shopId] || this.data.pricing['shop_demo'];
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
    return this.data.subscriptionPlans;
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
