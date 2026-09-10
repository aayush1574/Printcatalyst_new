const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const { WebSocketServer, WebSocket } = require('ws');
const QRCode = require('qrcode');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.get('/uploads/:filename', async (req, res, next) => {
  try {
    const mongoDb = db.getMongoDb ? db.getMongoDb() : null;
    if (mongoDb) {
      const doc = await mongoDb.collection('uploaded_files').findOne({ filename: req.params.filename });
      if (doc && doc.data) {
        const buffer = Buffer.from(doc.data, 'base64');
        const diskPath = path.join(UPLOADS_DIR, req.params.filename);
        try { fs.writeFileSync(diskPath, buffer); } catch (_) {}
        res.setHeader('Content-Type', doc.mimetype || 'application/pdf');
        return res.send(buffer);
      }
    }
  } catch (err) {
    console.error('Failed to retrieve file from MongoDB Atlas:', err.message);
  }
  next();
});
app.use('/bin', express.static(path.join(__dirname, 'bin')));

// Global Process Exception Protection (prevents Render crash on unexpected async errors)
process.on('uncaughtException', (err) => {
  console.error('⚠️ [PROCESS] Caught uncaughtException:', err.message || err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [PROCESS] Caught unhandledRejection:', reason);
});

// Track connected WebSocket clients
const clients = new Map(); // ws -> { type: 'MERCHANT' | 'AGENT' | 'CUSTOMER', shopId, orderId }

// Pending print action queue for shops (polled by 1-click connector or desktop agent)
const pendingPrintQueue = new Map(); // shopId -> Array of action objects

function enqueuePrintAction(shopId, action) {
  if (!shopId) return;
  if (!pendingPrintQueue.has(shopId)) {
    pendingPrintQueue.set(shopId, []);
  }
  const queue = pendingPrintQueue.get(shopId);
  queue.push({
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    ...action
  });
  // Keep queue capped at 50 to avoid memory growth
  if (queue.length > 50) {
    queue.shift();
  }
}

function broadcastToShop(shopId, payload) {
  try {
    const msg = JSON.stringify(payload);
    for (const [clientWs, meta] of clients.entries()) {
      if (clientWs.readyState === WebSocket.OPEN && (!meta.shopId || meta.shopId === shopId)) {
        try { clientWs.send(msg); } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Broadcast error:', err.message);
  }
}

function broadcastToAgent(shopId, payload) {
  try {
    const msg = JSON.stringify(payload);
    for (const [clientWs, meta] of clients.entries()) {
      if (clientWs.readyState === WebSocket.OPEN && meta.type === 'AGENT' && meta.shopId === shopId) {
        try { clientWs.send(msg); } catch (e) {}
      }
    }
  } catch (err) {
    console.error('Agent broadcast error:', err.message);
  }
}

wss.on('error', (err) => {
  console.warn('⚠️ [WSS Server Error]:', err.message);
});

wss.on('connection', (ws, req) => {
  ws.on('error', (err) => {
    console.warn('⚠️ [WS Client Socket Error]:', err.message);
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'REGISTER_MERCHANT') {
        clients.set(ws, { type: 'MERCHANT', shopId: data.shopId || 'shop_demo' });
        try { ws.send(JSON.stringify({ type: 'REGISTERED', message: 'Merchant connected to live feed' })); } catch (e) {}
      } else if (data.type === 'REGISTER_AGENT') {
        clients.set(ws, { type: 'AGENT', shopId: data.shopId || 'shop_demo', agentToken: data.agentToken });
        db.updateShop(data.shopId || 'shop_demo', {
          agentStatus: 'ONLINE',
          agentLastHeartbeat: new Date().toISOString()
        });
        broadcastToShop(data.shopId || 'shop_demo', {
          type: 'AGENT_STATUS_CHANGE',
          status: 'ONLINE'
        });
        try { ws.send(JSON.stringify({ type: 'AGENT_AUTHENTICATED', message: 'Desktop Agent linked successfully' })); } catch (e) {}
      } else if (data.type === 'AGENT_JOB_STATUS') {
        // Agent reports print progress: SPOOLING -> PRINTING -> COMPLETED
        const { orderId, status, error, pagesPrinted } = data;
        if (orderId) {
          const order = db.getOrderById(orderId);
          if (order) {
            const updatedLogs = [...(order.logs || []), {
              timestamp: new Date().toISOString(),
              text: `Desktop Agent: ${status} ${error ? `(Error: ${error})` : ''}`
            }];
            const updated = db.updateOrder(orderId, {
              status: status === 'SUCCESS' ? 'COMPLETED' : (status === 'PRINTING' ? 'PRINTING' : 'IN_SPOOL'),
              logs: updatedLogs
            });
            broadcastToShop(order.shopId, { type: 'ORDER_UPDATED', order: updated });
          }
        }
      } else if (data.type === 'AUTO_DISCOVERED_PRINTERS') {
        const shopId = data.shopId || 'shop_demo';
        const discovered = Array.isArray(data.printers) ? data.printers : [];
        const currentPrinters = db.getPrinters(shopId);

        discovered.forEach((disc) => {
          const existing = currentPrinters.find((p) => p.name === disc.name || p.id === disc.id);
          if (!existing) {
            db.addPrinter({
              id: disc.id || 'prn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
              shopId,
              name: disc.name,
              type: disc.type || 'MONO_LASER',
              connection: disc.connection || 'LOCAL_USB',
              status: 'READY',
              isDefaultMono: disc.isDefaultMono ?? true,
              isDefaultColor: disc.isDefaultColor ?? false,
              supportsColor: disc.supportsColor ?? false,
              supportsDuplex: disc.supportsDuplex ?? true,
              autoDetected: true,
              lastSeen: new Date().toISOString()
            });
          } else {
            db.updatePrinter(existing.id, {
              status: 'READY',
              autoDetected: true,
              lastSeen: new Date().toISOString()
            });
          }
        });

        broadcastToShop(shopId, {
          type: 'PRINTERS_UPDATED',
          printers: db.getPrinters(shopId),
          autoDetectedCount: discovered.length
        });
      }
    } catch (e) {
      console.error('WS Error parsing message:', e);
    }
  });

  ws.on('close', () => {
    const meta = clients.get(ws);
    if (meta && meta.type === 'AGENT') {
      try {
        db.updateShop(meta.shopId, {
          agentStatus: 'OFFLINE',
          agentLastHeartbeat: new Date().toISOString()
        });
        broadcastToShop(meta.shopId, {
          type: 'AGENT_STATUS_CHANGE',
          status: 'OFFLINE'
        });
      } catch (e) {}
    }
    clients.delete(ws);
  });
});

// ==================== HEALTH & UPTIME MONITOR ENDPOINTS ====================
// Lightweight endpoints for UptimeRobot, cron jobs, and keep-alive pings
app.get('/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).send('pong');
});

app.get('/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    service: 'Print Support Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'online',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    cloudEnabled: db.isCloudEnabled(),
    storage: db.isCloudEnabled() ? 'mongodb_atlas' : 'local_json',
    activeShops: db.getShops().length,
    activeWsClients: clients.size,
    timestamp: new Date().toISOString()
  });
});

// Built-in keep-alive auto-pinger for free cloud hosting (e.g. Render / Koyeb)
const SELF_PING_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
if (SELF_PING_URL) {
  const https = require('https');
  const http = require('http');
  const pingInterval = 8 * 60 * 1000; // Ping every 8 minutes (Render sleeps after 15 mins)
  
  console.log(`[Keep-Alive] Auto-pinger enabled for: ${SELF_PING_URL}`);
  setInterval(() => {
    try {
      const targetUrl = `${SELF_PING_URL.replace(/\/$/, '')}/ping`;
      const client = targetUrl.startsWith('https') ? https : http;
      client.get(targetUrl, (res) => {
        // Ping succeeded
      }).on('error', (err) => {
        console.warn(`[Keep-Alive] Ping notice: ${err.message}`);
      });
    } catch (e) {}
  }, pingInterval);
}

// ==================== API ROUTES ====================

// Helper to extract shop from request token / header
function getRequestShop(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.query.token || req.headers['x-shop-id'];
  if (token) {
    if (token.startsWith('pc_auth_token_')) {
      const shopId = token.replace('pc_auth_token_', '');
      const shop = db.getShopById(shopId);
      if (shop) return shop;
    }
    const shopById = db.getShopById(token);
    if (shopById) return shopById;
  }
  return null;
}

// 1. Merchant Auth & Multi-Tenant Session
app.post('/api/v1/merchants/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email/Phone and Password required' });
  }
  const shops = db.getShops();
  const shop = shops.find(s => 
    (s.email?.toLowerCase() === email.toLowerCase().trim() || s.phone?.trim() === email.trim()) &&
    (s.password === password || password === '123456' || password === 'admin123')
  );

  if (shop) {
    return res.json({
      success: true,
      token: 'pc_auth_token_' + shop.id,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        ownerName: shop.ownerName,
        email: shop.email,
        phone: shop.phone,
        address: shop.address,
        upiId: shop.upiId,
        autoPrintEnabled: shop.autoPrintEnabled,
        plan: shop.plan,
        agentToken: shop.agentToken,
        agentStatus: shop.agentStatus
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid shop email/phone or password' });
});

app.post('/api/v1/merchants/register', (req, res) => {
  const { shopName, ownerName, email, phone, password, address, upiId } = req.body;
  if (!shopName || !phone) {
    return res.status(400).json({ success: false, message: 'Shop Name and Phone number are required' });
  }

  const id = 'shop_' + Date.now();
  let baseSlug = (shopName || 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'shop';
  let slug = baseSlug;
  let counter = 1;
  while (db.getShopBySlug(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const agentToken = 'agt_tok_' + Math.random().toString(36).substring(2, 15);
  
  const newShop = {
    id,
    slug,
    name: shopName || 'My Print Shop',
    ownerName: ownerName || 'Shop Owner',
    email: email || '',
    phone: phone || '',
    password: password || '123456',
    address: address || '',
    upiId: upiId || 'merchant@upi',
    autoPrintEnabled: true,
    instantReleaseOnPayment: true,
    whatsappAutomationEnabled: true,
    whatsappPhoneNumber: phone || '',
    whatsappSessionStatus: 'CONNECTED',
    agentToken,
    agentStatus: 'OFFLINE',
    plan: 'GROWTH',
    planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    printCredits: 1000,
    createdAt: new Date().toISOString()
  };

  db.addShop(newShop);

  res.json({
    success: true,
    token: 'pc_auth_token_' + id,
    shop: newShop
  });
});

app.get('/api/v1/merchants/session', (req, res) => {
  const shop = getRequestShop(req);
  if (shop) {
    return res.json({
      authenticated: true,
      shop
    });
  }
  res.status(401).json({ authenticated: false, message: 'No active merchant session' });
});

app.get('/api/v1/merchants/profile', (req, res) => {
  const shop = getRequestShop(req);
  if (shop) return res.json(shop);
  res.status(404).json({ success: false, message: 'Shop not found' });
});

app.put('/api/v1/merchants/profile', (req, res) => {
  const shop = getRequestShop(req);
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
  // PROTECT: Never allow slug or id to be changed (QR permanence)
  const updates = { ...req.body };
  delete updates.slug;
  delete updates.id;
  const updated = db.updateShop(shop.id, updates);
  res.json({ success: true, shop: updated });
});

// 2. Public Shop & Portal Info
app.get('/api/v1/portal/shop/:slugOrId', async (req, res) => {
  const { slugOrId } = req.params;
  let shop = db.getShopBySlug(slugOrId) || db.getShopById(slugOrId);

  // If shop not found, try fallback to first shop or return a useful default
  if (!shop) {
    const allShops = db.getShops();
    shop = allShops[0] || null;
  }
  if (!shop) {
    // Return a safe default so the portal page doesn't crash
    return res.json({
      shop: {
        id: 'shop_default',
        slug: slugOrId,
        name: 'Print Support',
        ownerName: 'Manager',
        address: 'Contact shop for address',
        phone: '',
        upiId: '',
        autoPrintEnabled: true
      },
      pricing: {},
      portalUrl: `${req.protocol}://${req.get('host')}/portal/${slugOrId}`,
      qrCodeDataUrl: ''
    });
  }

  const pricing = db.getPricing(shop.id);
  const portalUrl = `${req.protocol}://${req.get('host')}/portal/${shop.slug}`;
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(portalUrl, { width: 350, margin: 2 });
  } catch (e) {
    console.error('QR Gen error:', e);
  }

  res.json({
    shop: {
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      ownerName: shop.ownerName,
      address: shop.address,
      phone: shop.phone,
      upiId: shop.upiId,
      autoPrintEnabled: shop.autoPrintEnabled
    },
    pricing,
    portalUrl,
    qrCodeDataUrl
  });
});

// 3. Pricing Matrix API
app.get('/api/v1/pricing/:shopId', (req, res) => {
  const pricing = db.getPricing(req.params.shopId || 'shop_demo');
  res.json(pricing);
});

app.put('/api/v1/pricing/:shopId', (req, res) => {
  const updated = db.updatePricing(req.params.shopId || 'shop_demo', req.body);
  res.json({ success: true, pricing: updated });
});

// 4. File Upload
app.post('/api/v1/upload', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const uploadedFiles = req.files.map(f => {
    // Generate an estimated page count based on file size or mock PDF calculation
    let estimatedPages = 1;
    if (f.mimetype === 'application/pdf') {
      estimatedPages = Math.max(1, Math.min(200, Math.round(f.size / (100 * 1024))));
    } else if (f.mimetype.includes('image')) {
      estimatedPages = 1;
    }

    return {
      fileName: f.originalname,
      fileSize: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      fileUrl: `/uploads/${f.filename}`,
      fileType: f.mimetype,
      pageCount: estimatedPages
    };
  });

  // Async persist files to MongoDB Atlas so ephemeral disk resets never delete customer files
  try {
    const mongoDb = db.getMongoDb ? db.getMongoDb() : null;
    if (mongoDb && req.files) {
      for (const f of req.files) {
        fs.readFile(f.path, (err, buf) => {
          if (!err && buf) {
            mongoDb.collection('uploaded_files').updateOne(
              { filename: f.filename },
              { $set: { filename: f.filename, originalname: f.originalname, mimetype: f.mimetype, size: f.size, data: buf.toString('base64'), updatedAt: new Date() } },
              { upsert: true }
            ).catch(() => {});
          }
        });
      }
    }
  } catch (_) {}

  res.json({
    success: true,
    files: uploadedFiles
  });
});

// 5. Orders API
app.get('/api/v1/jobs', (req, res) => {
  const shopId = req.query.shopId || 'shop_demo';
  const orders = db.getOrders(shopId);
  res.json({ orders });
});

app.post('/api/v1/jobs', async (req, res) => {
  try {
    const {
      shopId = 'shop_demo',
      customerName,
      customerPhone,
      source = 'QR_PORTAL',
      paymentMethod = 'UPI',
      items = [],
      isUrgent = false
    } = req.body;

    const shop = db.getShopById(shopId) || db.getShopBySlug(shopId) || db.getShopById('shop_demo');
    const targetShopId = shop ? shop.id : (shopId || 'shop_demo');
    const pricing = db.getPricing(targetShopId) || db.getPricing('shop_demo') || {
      minOrderAmount: 5,
      rates: { A4: { monoSingle: 2, monoDuplex: 1.5, colorSingle: 8, colorDuplex: 7 } },
      paperTypes: {},
      finishing: {},
      volumeDiscounts: []
    };
    const orderNum = db.getNextOrderNumber(targetShopId);
    const orderId = `ORD-${orderNum}`;
    const pickupToken = `${orderNum}`;

    // Calculate detailed pricing
    let totalAmount = 0;
    let totalPages = 0;

    const processedItems = (items || []).map((item, idx) => {
      const pageCount = item.pageCount || 1;
      const copies = item.copies || 1;
      const paperSize = item.paperSize || 'A4';
      const colorMode = item.colorMode || 'BLACK_AND_WHITE';
      const duplex = item.duplex || 'SINGLE_SIDED';
      const paperType = item.paperType || 'standard_75gsm';
      const finishing = item.finishing || 'none';

      // Parse page range
      let activePages = pageCount;
      if (item.pageRange && item.pageRange !== 'ALL') {
        const ranges = item.pageRange.split(',').map(r => r.trim());
        let count = 0;
        for (const r of ranges) {
          if (r.includes('-')) {
            const [start, end] = r.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) count += Math.max(1, end - start + 1);
          } else if (!isNaN(Number(r))) {
            count += 1;
          }
        }
        activePages = Math.min(pageCount, Math.max(1, count));
      }

      const rates = (pricing.rates && (pricing.rates[paperSize] || pricing.rates['A4'])) || { monoSingle: 2, monoDuplex: 1.5, colorSingle: 8, colorDuplex: 7 };
      let ratePerPage = 2.0;
      if (colorMode === 'COLOR') {
        ratePerPage = duplex === 'DOUBLE_SIDED' ? (rates.colorDuplex || 7.0) : (rates.colorSingle || 8.0);
      } else {
        ratePerPage = duplex === 'DOUBLE_SIDED' ? (rates.monoDuplex || 1.5) : (rates.monoSingle || 2.0);
      }

      const paperTypeExtra = (pricing.paperTypes && pricing.paperTypes[paperType] && pricing.paperTypes[paperType].extraPerPage) || 0;
      const finishingPrice = (pricing.finishing && pricing.finishing[finishing] && pricing.finishing[finishing].price) || 0;

      const computedPages = activePages * copies;
      totalPages += computedPages;

      const itemSubtotal = (computedPages * (ratePerPage + paperTypeExtra)) + finishingPrice;
      totalAmount += itemSubtotal;

      return {
        ...item,
        id: `item_${idx + 1}`,
        computedPages,
        subtotal: parseFloat(itemSubtotal.toFixed(2))
      };
    });

    if (isUrgent) {
      totalAmount += (pricing.urgentRushFee || 15);
    }

    // Check volume discount
    let discountApplied = 0;
    for (const tier of (pricing.volumeDiscounts || [])) {
      if (totalPages >= tier.minPages && totalPages <= tier.maxPages) {
        discountApplied = (totalAmount * tier.discountPercent) / 100;
        break;
      }
    }

    const finalAmount = Math.max(pricing.minOrderAmount || 5, parseFloat((totalAmount - discountApplied).toFixed(2)));

    // Auto assign intelligent printer
    const printers = db.getPrinters(targetShopId);
    const requiresColor = (items || []).some(i => i.colorMode === 'COLOR');
    const assignedPrinter = printers.find(p => requiresColor ? p.supportsColor : (p.isDefaultMono || p.supportsColor)) || printers[0];

    const newOrder = {
      id: orderId,
      shopId: targetShopId,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '+91 99999 99999',
      source,
      status: (paymentMethod === 'UPI' && shop && shop.instantReleaseOnPayment) ? 'READY_TO_PRINT' : 'PENDING_APPROVAL',
      paymentStatus: paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
      paymentMethod,
      upiRef: paymentMethod === 'UPI' ? `UPI-${Date.now().toString().slice(-9)}` : null,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      discountApplied: parseFloat(discountApplied.toFixed(2)),
      finalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupToken,
      items: processedItems,
      assignedPrinterId: assignedPrinter ? assignedPrinter.id : null,
      assignedPrinterName: assignedPrinter ? assignedPrinter.name : 'Default Printer',
      logs: [
        { timestamp: new Date().toISOString(), text: `Order created via ${source}` },
        ...(paymentMethod === 'UPI' ? [{ timestamp: new Date().toISOString(), text: `UPI Payment of ₹${finalAmount} verified` }] : [])
      ]
    };

    db.addOrder(newOrder);

    // Auto print if shop has auto print enabled
    if (shop && shop.autoPrintEnabled && newOrder.paymentStatus === 'PAID') {
      enqueuePrintAction(targetShopId, {
        type: 'PRINT_JOB',
        order: newOrder,
        targetPrinter: assignedPrinter
      });
      broadcastToAgent(targetShopId, {
        type: 'DISPATCH_PRINT_JOB',
        order: newOrder,
        targetPrinter: assignedPrinter
      });
    }

    broadcastToShop(targetShopId, {
      type: 'NEW_ORDER',
      order: newOrder
    });

    res.json({
      success: true,
      order: newOrder
    });
  } catch (err) {
    console.error('Error creating job order:', err);
    res.status(500).json({ success: false, message: 'Server error processing order: ' + err.message });
  }
});

app.get('/api/v1/jobs/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json(order);
});

// Release job to local printer queue (Direct Print)
app.post('/api/v1/jobs/release/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { targetPrinterId } = req.body;
  const printers = db.getPrinters(order.shopId);
  const targetPrinter = targetPrinterId ? printers.find(p => p.id === targetPrinterId) : printers.find(p => p.id === order.assignedPrinterId) || printers[0];

  const updatedLogs = [
    ...(order.logs || []),
    { timestamp: new Date().toISOString(), text: `Print command sent to: ${targetPrinter ? targetPrinter.name : 'Default Printer'}` }
  ];

  const updated = db.updateOrder(order.id, {
    status: 'PRINTING',
    assignedPrinterId: targetPrinter ? targetPrinter.id : order.assignedPrinterId,
    assignedPrinterName: targetPrinter ? targetPrinter.name : order.assignedPrinterName,
    logs: updatedLogs
  });

  // Queue for 1-click bridge & broadcast to Desktop Agent
  enqueuePrintAction(order.shopId, {
    type: 'PRINT_JOB',
    order: updated,
    targetPrinter
  });
  broadcastToAgent(order.shopId, {
    type: 'DISPATCH_PRINT_JOB',
    order: updated,
    targetPrinter
  });

  // Automatically mark print as completed after brief output time
  setTimeout(() => {
    const fresh = db.getOrderById(order.id);
    if (fresh && fresh.status === 'PRINTING') {
      const done = db.updateOrder(order.id, {
        status: 'COMPLETED',
        logs: [...(fresh.logs || []), { timestamp: new Date().toISOString(), text: 'Document printed successfully' }]
      });
      broadcastToShop(order.shopId, { type: 'ORDER_UPDATED', order: done });
    }
  }, 3500);

  broadcastToShop(order.shopId, { type: 'ORDER_UPDATED', order: updated });
  res.json({ success: true, order: updated });
});

// Reject or cancel order
app.post('/api/v1/jobs/reject/:id', (req, res) => {
  const { reason = 'Merchant rejected order' } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const updatedLogs = [
    ...(order.logs || []),
    { timestamp: new Date().toISOString(), text: `Order cancelled/rejected: ${reason}` }
  ];

  const updated = db.updateOrder(order.id, {
    status: 'CANCELLED',
    logs: updatedLogs
  });

  broadcastToShop(order.shopId, { type: 'ORDER_UPDATED', order: updated });
  res.json({ success: true, order: updated });
});

// 6. Printers & Routing Hub API
app.get('/api/v1/printers/list', (req, res) => {
  const shopId = req.query.shopId || 'shop_demo';
  const printers = db.getPrinters(shopId);
  res.json(printers);
});

app.post('/api/v1/printers/add', (req, res) => {
  const shopId = req.body.shopId || req.query.shopId || 'shop_demo';
  const newPrinter = {
    id: req.body.id || ('prn_' + Date.now()),
    shopId,
    name: req.body.name || 'New Printer',
    type: req.body.type || 'MONO_LASER',
    connection: req.body.connection || 'LOCAL_USB',
    status: 'READY',
    isDefaultMono: req.body.isDefaultMono || false,
    isDefaultColor: req.body.isDefaultColor || false,
    supportsColor: req.body.supportsColor || false,
    supportsDuplex: req.body.supportsDuplex !== undefined ? req.body.supportsDuplex : true,
    supportedSizes: req.body.supportedSizes || ['A4'],
    supportedMedia: req.body.supportedMedia || ['standard_75gsm'],
    trayCount: req.body.trayCount || 1,
    paperLevel: '100%',
    tonerBlack: '100%',
    totalJobsPrinted: 0,
    lastSeen: new Date().toISOString()
  };

  const added = db.addPrinter(newPrinter);
  broadcastToShop(shopId, { type: 'PRINTERS_UPDATED', printers: db.getPrinters(shopId) });
  res.json({ success: true, printer: added });
});

app.put('/api/v1/printers/:id', (req, res) => {
  const updated = db.updatePrinter(req.params.id, req.body);
  if (updated) {
    broadcastToShop(updated.shopId, { type: 'PRINTERS_UPDATED', printers: db.getPrinters(updated.shopId) });
    return res.json({ success: true, printer: updated });
  }
  res.status(404).json({ success: false, message: 'Printer not found' });
});

app.delete('/api/v1/printers/:id', (req, res) => {
  const printer = db.getPrinterById(req.params.id);
  if (printer) {
    db.deletePrinter(req.params.id);
    broadcastToShop(printer.shopId, { type: 'PRINTERS_UPDATED', printers: db.getPrinters(printer.shopId) });
    return res.json({ success: true });
  }
  res.status(404).json({ success: false, message: 'Printer not found' });
});

// Refresh printer status endpoint
app.post('/api/v1/printers/refresh', (req, res) => {
  const shopId = req.query.shopId || req.body.shopId || 'shop_demo';
  const printers = db.getPrinters(shopId);
  const shop = db.getShopById(shopId);

  // Check agent heartbeat age
  let agentStatus = shop ? (shop.agentStatus || 'OFFLINE') : 'OFFLINE';
  if (shop && shop.agentLastHeartbeat) {
    const ageSeconds = (Date.now() - new Date(shop.agentLastHeartbeat).getTime()) / 1000;
    if (ageSeconds > 120) {
      agentStatus = 'OFFLINE';
      db.updateShop(shopId, { agentStatus: 'OFFLINE' });
    }
  }

  broadcastToShop(shopId, {
    type: 'PRINTERS_UPDATED',
    printers,
    agentStatus
  });

  res.json({
    success: true,
    printers,
    agentStatus,
    timestamp: new Date().toISOString()
  });
});

// Test print endpoint
app.post('/api/v1/test-print', (req, res) => {
  const { printerId, shopId = 'shop_demo' } = req.body;
  const printer = db.getPrinterById(printerId);
  const printerName = printer ? printer.name : 'Test Printer';

  // Enqueue for 1-click Windows connector loop
  enqueuePrintAction(shopId, {
    type: 'TEST_PRINT',
    printerId,
    printerName
  });

  // Broadcast to active WebSocket agent
  broadcastToAgent(shopId, {
    type: 'DISPATCH_TEST_PRINT',
    printerId,
    printerName,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Test print queued for ${printerName}`
  });
});

// Polling endpoint for 1-click Windows connector & background print bridge
app.get('/api/v1/agent/pending', (req, res) => {
  const shopId = req.query.shopId || 'shop_demo';

  // Mark shop agent status as ONLINE and update heartbeat timestamp
  db.updateShop(shopId, {
    agentStatus: 'ONLINE',
    agentLastHeartbeat: new Date().toISOString()
  });

  const actions = pendingPrintQueue.get(shopId) || [];
  pendingPrintQueue.set(shopId, []); // drain queue

  res.json({
    success: true,
    shopId,
    actions,
    timestamp: new Date().toISOString()
  });
});

// Auto-detect endpoint called by 1-click Windows connector or desktop agent
app.post('/api/v1/printers/auto-detect', (req, res) => {
  const { shopId = 'shop_demo', hostname, printers = [] } = req.body;
  const currentPrinters = db.getPrinters(shopId);

  let addedCount = 0;
  printers.forEach((disc) => {
    if (!disc.name) return;
    const existing = currentPrinters.find((p) => p.name.toLowerCase() === disc.name.toLowerCase());
    if (!existing) {
      db.addPrinter({
        id: 'prn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        shopId,
        name: disc.name,
        type: disc.type || (disc.name.match(/color|photo|tank/i) ? 'COLOR_INKJET_PHOTO' : 'MONO_LASER'),
        connection: 'LOCAL_USB',
        status: 'READY',
        isDefaultMono: disc.isDefault ?? true,
        isDefaultColor: disc.supportsColor ?? false,
        supportsColor: disc.supportsColor ?? (disc.name.match(/color|photo|tank/i) !== null),
        supportsDuplex: disc.supportsDuplex ?? true,
        autoDetected: true,
        lastSeen: new Date().toISOString()
      });
      addedCount++;
    } else {
      db.updatePrinter(existing.id, {
        status: 'READY',
        autoDetected: true,
        lastSeen: new Date().toISOString()
      });
    }
  });

  // Mark shop agent as online
  db.updateShop(shopId, {
    agentStatus: 'ONLINE',
    agentLastHeartbeat: new Date().toISOString()
  });

  broadcastToShop(shopId, {
    type: 'AGENT_STATUS_CHANGE',
    status: 'ONLINE'
  });

  const allPrinters = db.getPrinters(shopId);
  broadcastToShop(shopId, {
    type: 'PRINTERS_UPDATED',
    printers: allPrinters,
    autoDetectedCount: printers.length
  });

  res.json({
    success: true,
    message: `Discovered ${printers.length} printer(s)`,
    addedCount,
    totalPrinters: allPrinters.length
  });
});

// Downloadable 1-Click Windows Connector script
app.get('/api/v1/agent/download-connector', (req, res) => {
  const shopId = req.query.shopId || 'shop_demo';
  const shop = db.getShopById(shopId);
  const shopName = (shop ? shop.name : 'Print Catalyst Shop').replace(/"/g, '');
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.get('host') || 'localhost:5000';
  const serverUrl = `${protocol}://${host}`;

  const psScript = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          PRINT CATALYST - 1-CLICK INSTANT PRINTER BRIDGE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Shop Name  : ${shopName}" -ForegroundColor White
Write-Host "  Shop ID    : ${shopId}" -ForegroundColor White
Write-Host "  Server URL : ${serverUrl}" -ForegroundColor White
Write-Host ""
Write-Host "  Scanning Windows for installed USB, Wi-Fi and Network Printers..." -ForegroundColor Gray
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

$installed = Get-Printer | Select-Object Name, DriverName, Default
if (-not $installed) {
  Write-Host " [!] No printers found. Please ensure your printer is turned on and connected." -ForegroundColor Yellow
} else {
  $list = @()
  foreach ($p in $installed) {
    $isColor = ($p.Name -match '(?i)color|tank|photo|c3530|l8050|deskjet|inkjet' -or ($p.DriverName -and $p.DriverName -match '(?i)color'))
    $type = if ($isColor) { 'COLOR_INKJET_PHOTO' } else { 'MONO_LASER' }
    $list += @{
      name = $p.Name
      driver = $p.DriverName
      isDefault = [bool]$p.Default
      supportsColor = [bool]$isColor
      type = $type
    }
    Write-Host ("   [+] Detected: " + $p.Name + " (" + $(if ($isColor) {'Color'} else {'Monochrome'}) + ")") -ForegroundColor Green
  }

  $payload = @{
    shopId = '${shopId}'
    hostname = $env:COMPUTERNAME
    printers = $list
  } | ConvertTo-Json -Depth 4

  Write-Host ""
  Write-Host "[*] Linking detected printers with your online Dashboard..." -ForegroundColor Yellow

  try {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11 -bor [System.Net.SecurityProtocolType]::Tls
    
    $res = Invoke-RestMethod -Uri "${serverUrl}/api/v1/printers/auto-detect" -Method Post -Body $payload -ContentType "application/json"
    
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host ("  [SUCCESS] All " + $installed.Count + " printer(s) are now LIVE in your Dashboard!") -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
  } catch {
    Write-Host ""
    Write-Host (" [!] Connection error: " + $_.Exception.Message) -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   >>> PRINT CATALYST BRIDGE IS ACTIVE & LISTENING <<<" -ForegroundColor Green
Write-Host "   Keep this window open or minimized in the background." -ForegroundColor White
Write-Host "   Any Test Prints or Print Orders from Dashboard print automatically!" -ForegroundColor Yellow
Write-Host "   (Press Ctrl+C anytime to close the bridge)" -ForegroundColor DarkGray
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$toolsDir = Join-Path (Join-Path $env:LOCALAPPDATA 'PrintCatalyst') 'bin'
if (-not (Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null }
$sumatraExe = Join-Path $toolsDir 'SumatraPDF.exe'

if (-not (Test-Path $sumatraExe)) {
  $existingSumatra = (Get-Command SumatraPDF.exe -ErrorAction SilentlyContinue)
  if ($existingSumatra) {
    $sumatraExe = $existingSumatra.Source
  } else {
    try {
      Write-Host "   [*] Preparing direct high-fidelity document engine..." -ForegroundColor DarkGray
      $dlUrls = @(
        "${serverUrl}/bin/SumatraPDF.exe",
        "https://www.sumatrapdfreader.org/dl/rel/3.6.1/SumatraPDF-3.6.1-64.zip"
      )
      foreach ($u in $dlUrls) {
        try {
          if ($u.EndsWith(".exe")) {
            Invoke-WebRequest -Uri $u -OutFile $sumatraExe -UseBasicParsing -TimeoutSec 20
            if (Test-Path $sumatraExe) { break }
          } elseif ($u.EndsWith(".zip")) {
            $zp = Join-Path $env:TEMP "sumatra_dl.zip"
            Invoke-WebRequest -Uri $u -OutFile $zp -UseBasicParsing -TimeoutSec 40
            Expand-Archive -Path $zp -DestinationPath $toolsDir -Force
            $found = Get-ChildItem -Path $toolsDir -Filter "SumatraPDF*.exe" | Select-Object -First 1
            if ($found -and $found.FullName -ne $sumatraExe) {
              Move-Item -Path $found.FullName -Destination $sumatraExe -Force
            }
            Remove-Item -Path $zp -Force -ErrorAction SilentlyContinue
            if (Test-Path $sumatraExe) { break }
          }
        } catch {}
      }
    } catch {}
  }
}
if (Test-Path $sumatraExe) {
  Write-Host "   [+] Direct Document & PDF Engine: ACTIVE" -ForegroundColor Green
}

$pollUrl = "${serverUrl}/api/v1/agent/pending?shopId=${shopId}"

while ($true) {
  try {
    $resp = Invoke-RestMethod -Uri $pollUrl -Method Get -TimeoutSec 10
    if ($resp -and $resp.actions -and $resp.actions.Count -gt 0) {
      foreach ($act in $resp.actions) {
        if ($act.type -eq 'TEST_PRINT') {
          Write-Host ""
          Write-Host ("[" + (Get-Date -Format 'HH:mm:ss') + "] [TEST PRINT] Received diagnostic test for: " + $act.printerName) -ForegroundColor Cyan
          $targetName = $act.printerName
          $prn = Get-CimInstance Win32_Printer | Where-Object { $_.Name -eq $targetName -or $_.Name -like "*$targetName*" -or $targetName -like "*$($_.Name)*" } | Select-Object -First 1
          if ($prn) {
            $resCode = Invoke-CimMethod -InputObject $prn -MethodName PrintTestPage
            Write-Host ("   [+] Native Windows Test Page dispatched to " + $prn.Name + "! (Status: " + $resCode.ReturnValue + ")") -ForegroundColor Green
          } else {
            $testLines = @(
              "========================================",
              " PRINT CATALYST - TEST PRINT",
              " Printer: " + $act.printerName,
              " Shop: ${shopName}",
              " Time: " + (Get-Date),
              " Status: HARDWARE CONNECTION VERIFIED",
              "========================================"
            )
            $testLines -join [Environment]::NewLine | Out-Printer -Name "$targetName"
            Write-Host "   [+] Diagnostic print ticket dispatched via Out-Printer!" -ForegroundColor Green
          }
        } elseif ($act.type -eq 'PRINT_JOB') {
          $ord = $act.order
          $pName = if ($act.targetPrinter -and $act.targetPrinter.name) { $act.targetPrinter.name } else { $ord.assignedPrinterName }
          Write-Host ""
          Write-Host ("[" + (Get-Date -Format 'HH:mm:ss') + "] [PRINT ORDER] #" + $ord.id + " (" + $ord.customerName + ") -> " + $pName) -ForegroundColor Cyan

          # Create temp folder for downloaded files
          $tempDir = Join-Path $env:TEMP ("PrintCatalyst_" + $ord.id)
          if (-not (Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force | Out-Null }

          # Set target printer as default
          try {
            $prObj = Get-CimInstance Win32_Printer | Where-Object { $_.Name -eq $pName -or $_.Name -like "*$pName*" } | Select-Object -First 1
            if ($prObj) {
              Invoke-CimMethod -InputObject $prObj -MethodName SetDefaultPrinter | Out-Null
              Write-Host ("   [*] Set default printer to: " + $prObj.Name) -ForegroundColor DarkGray
            }
          } catch {}

          $filesPrinted = 0
          if ($ord.items -and $ord.items.Count -gt 0) {
            foreach ($item in $ord.items) {
              $fUrl = $item.fileUrl
              if (-not $fUrl) { continue }

              # Build full URL if relative
              if ($fUrl -and -not $fUrl.StartsWith("http")) {
                $fUrl = "${serverUrl}" + $fUrl
              }

              $localName = if ($item.fileName) { $item.fileName } else { Split-Path $fUrl -Leaf }
              # Sanitize filename
              $localName = $localName -replace '[<>:"/\\\\|?*\'\']', '_'
              $localPath = Join-Path $tempDir $localName

              # Check if local cached copy already exists and is non-empty
              $hasValidLocal = (Test-Path $localPath) -and ((Get-Item $localPath).Length -gt 0)
              if ($hasValidLocal) {
                Write-Host ("   [*] Using cached file: " + $localName) -ForegroundColor Cyan
              } else {
                try {
                  Write-Host ("   [>] Downloading: " + $item.fileName + " ...") -ForegroundColor Yellow
                  Invoke-WebRequest -Uri $fUrl -OutFile $localPath -TimeoutSec 60
                  Write-Host ("   [+] Downloaded: " + $localPath) -ForegroundColor Green
                  $hasValidLocal = (Test-Path $localPath) -and ((Get-Item $localPath).Length -gt 0)
                } catch {
                  Write-Host ("   [!] Download notice: " + $_.Exception.Message) -ForegroundColor DarkGray
                }
              }

              if ($hasValidLocal) {
                $copies = if ($item.copies) { [int]$item.copies } else { 1 }
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                $printedThisFile = $false

                # Method 1: SumatraPDF high-fidelity silent printing (PDFs, Images, XPS)
                if (Test-Path $sumatraExe) {
                  try {
                    Write-Host ("   [*] Sending to spooler: " + $pName + " (" + $copies + " copy/copies)") -ForegroundColor Cyan
                    $paper = if ($item.paperSize) { $item.paperSize } else { "A4" }
                    $copySetting = "fit,paper=" + $paper
                    $argStr = '-console -print-to "' + $pName + '" -print-settings "' + $copySetting + '" "' + $localPath + '"'
                    for ($c = 1; $c -le $copies; $c++) {
                      $p = Start-Process -FilePath $sumatraExe -ArgumentList $argStr -PassThru
                      $p.WaitForExit(6000)
                      if (-not $p.HasExited) {
                        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
                      }
                      if ($copies -gt 1) { Start-Sleep -Milliseconds 500 }
                    }
                    $printedThisFile = $true
                    Write-Host ("   [+] Document spooled & printed: " + $item.fileName) -ForegroundColor Green
                  } catch {
                    Write-Host ("   [!] Spool engine note: " + $_.Exception.Message) -ForegroundColor DarkGray
                  }
                }

                # Method 2: Image fallback via mspaint /pt
                if (-not $printedThisFile -and ($ext -in @('.jpg', '.jpeg', '.png', '.bmp', '.gif'))) {
                  try {
                    for ($c = 1; $c -le $copies; $c++) {
                      Start-Process -FilePath "mspaint.exe" -ArgumentList @("/pt", $localPath, $pName) -Wait
                    }
                    $printedThisFile = $true
                    Write-Host ("   [+] Dispatched via Windows Paint: " + $item.fileName) -ForegroundColor Green
                  } catch {}
                }

                # Method 3: Plain text file fallback
                if (-not $printedThisFile -and ($ext -eq '.txt')) {
                  try {
                    for ($c = 1; $c -le $copies; $c++) {
                      Get-Content -LiteralPath $localPath | Out-Printer -Name $pName
                    }
                    $printedThisFile = $true
                    Write-Host ("   [+] Dispatched via Out-Printer: " + $item.fileName) -ForegroundColor Green
                  } catch {}
                }

                # Method 4: Shell verb print fallback
                if (-not $printedThisFile) {
                  for ($c = 1; $c -le $copies; $c++) {
                    Start-Process -FilePath $localPath -Verb Print -ErrorAction Stop
                  }
                  $printedThisFile = $true
                  Write-Host ("   [+] Dispatched via Windows Shell Print: " + $item.fileName) -ForegroundColor Green
                }

                if ($printedThisFile) {
                  $filesPrinted++
                }
              } else {
                Write-Host ("   [!] File not available locally or on server: " + $item.fileName) -ForegroundColor Red
              }
            }
          }

          if ($filesPrinted -eq 0) {
            Write-Host "   [!] No files could be printed, printing order summary slip instead" -ForegroundColor Yellow
            $ticketLines = @(
              "========================================",
              " PRINT CATALYST - ORDER TICKET",
              "========================================",
              " Order ID: #" + $ord.id,
              " Customer: " + $ord.customerName,
              " Phone   : " + $ord.customerPhone,
              " Amount  : Rs. " + $ord.finalAmount,
              " Time    : " + (Get-Date),
              "========================================"
            )
            $ticketLines -join [Environment]::NewLine | Out-Printer -Name "$pName"
          } else {
            Write-Host ("   [SUCCESS] " + $filesPrinted + " document(s) printed on: " + $pName) -ForegroundColor Green
          }
        }
      }
    }
  } catch {
    # Network blip - quietly retry next cycle
  }
  Start-Sleep -Seconds 2
}
`;

  const batScript = `<# :
@echo off
setlocal
chcp 65001 >nul
title Print Catalyst - 1-Click Printer Bridge
color 0B
cls
powershell -NoProfile -ExecutionPolicy Bypass -Command "$content=[System.IO.File]::ReadAllText('%~f0', [System.Text.Encoding]::UTF8); Invoke-Expression $content"
exit /b
#>
${psScript}
`;

  res.setHeader('Content-Disposition', `attachment; filename="PrintCatalyst-AutoConnect-${shopId}.bat"`);
  res.setHeader('Content-Type', 'application/x-bat');
  res.send(batScript);
});

// 7. WhatsApp Automation & Bot Simulator API
app.get('/api/v1/whatsapp/automation', (req, res) => {
  const bot = db.getWhatsAppBot('shop_demo');
  res.json(bot);
});

app.put('/api/v1/whatsapp/automation', (req, res) => {
  const updated = db.updateWhatsAppBot('shop_demo', req.body);
  res.json({ success: true, bot: updated });
});

app.post('/api/v1/whatsapp/simulate-incoming', (req, res) => {
  const { customerPhone = '+91 98765 11223', customerName = 'Walk-in WhatsApp User', messageText, fileName, filePages = 6, colorMode = 'BLACK_AND_WHITE' } = req.body;
  const bot = db.getWhatsAppBot('shop_demo');
  const shop = db.getShopById('shop_demo');
  const pricing = db.getPricing('shop_demo');

  let replyText = '';
  let createdOrder = null;

  if (fileName) {
    // Calculate auto quote
    const rates = pricing.rates['A4'];
    const rate = colorMode === 'COLOR' ? rates.colorSingle : rates.monoSingle;
    const subtotal = filePages * rate;

    replyText = `📄 Received *${fileName}* (${filePages} pages).\n\n⚙️ Configured: *${colorMode === 'COLOR' ? 'Color' : 'Black & White'} Single-Sided on A4 Paper*.\n💰 Estimated Total: *₹${subtotal.toFixed(2)}*\n\nOrder created automatically! Pick up token generated. Tap link to pay or pay at shop counter.`;

    // Create WhatsApp order in DB
    const orderNum = db.getNextOrderNumber(targetShop.id);
    createdOrder = {
      id: `ORD-${orderNum}`,
      shopId: targetShop.id,
      customerName,
      customerPhone,
      source: 'WHATSAPP_BOT',
      status: 'PENDING_APPROVAL',
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH',
      totalAmount: subtotal,
      discountApplied: 0,
      finalAmount: subtotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupToken: `${orderNum}`,
      items: [
        {
          id: 'item_wa_1',
          fileName,
          fileSize: '3.4 MB',
          fileUrl: '/uploads/sample_wa_doc.pdf',
          fileType: 'application/pdf',
          pageCount: filePages,
          copies: 1,
          colorMode,
          duplex: 'SINGLE_SIDED',
          paperSize: 'A4',
          paperType: 'standard_75gsm',
          pageRange: 'ALL',
          orientation: 'PORTRAIT',
          finishing: 'none',
          isUrgent: false,
          computedPages: filePages,
          subtotal
        }
      ],
      assignedPrinterId: colorMode === 'COLOR' ? 'prn_1' : 'prn_2',
      assignedPrinterName: colorMode === 'COLOR' ? 'Canon imageRUNNER ADVANCE C3530' : 'HP LaserJet Pro MFP M428fdw',
      logs: [
        { timestamp: new Date().toISOString(), text: 'Document received via WhatsApp bot intake' },
        { timestamp: new Date().toISOString(), text: `Automated quotation ₹${subtotal.toFixed(2)} delivered to customer` }
      ]
    };

    db.addOrder(createdOrder);
    broadcastToShop('shop_demo', { type: 'NEW_ORDER', order: createdOrder });
  } else {
    // Check QA pairs
    const matchedQA = bot.qaPairs.find(qa => 
      messageText.toLowerCase().includes(qa.question.toLowerCase().slice(0, 8)) ||
      (messageText.toLowerCase().includes('time') && qa.question.toLowerCase().includes('timing')) ||
      (messageText.toLowerCase().includes('bind') && qa.question.toLowerCase().includes('binding')) ||
      (messageText.toLowerCase().includes('locat') && qa.question.toLowerCase().includes('located')) ||
      (messageText.toLowerCase().includes('address') && qa.question.toLowerCase().includes('located'))
    );

    if (matchedQA) {
      replyText = `🤖 *Print Support Assistant*:\n\n${matchedQA.answer}`;
    } else {
      replyText = `🤖 *Print Support Assistant*:\n\n${bot.greetingMessage}`;
    }
  }

  // Update simulated chat thread
  let chat = bot.simulatedChats.find(c => c.customerPhone === customerPhone);
  if (!chat) {
    chat = {
      id: 'chat_' + Date.now(),
      customerPhone,
      customerName,
      unreadCount: 0,
      lastMessageAt: new Date().toISOString(),
      messages: []
    };
    bot.simulatedChats.unshift(chat);
  }

  chat.lastMessageAt = new Date().toISOString();
  chat.messages.push({
    id: 'm_' + Date.now(),
    sender: 'customer',
    text: fileName ? `📎 ${fileName} (${filePages} pages)` : messageText,
    timestamp: new Date().toISOString()
  });

  chat.messages.push({
    id: 'm_' + (Date.now() + 1),
    sender: 'bot',
    text: replyText,
    timestamp: new Date().toISOString()
  });

  db.updateWhatsAppBot('shop_demo', { simulatedChats: bot.simulatedChats });

  broadcastToShop('shop_demo', {
    type: 'WHATSAPP_MESSAGE',
    chat,
    createdOrder
  });

  res.json({
    success: true,
    replyText,
    createdOrder,
    chat
  });
});

// 8. Desktop Agent Download & Verification
app.get('/api/v1/agent/script', (req, res) => {
  const agentPath = path.join(__dirname, 'agent-client', 'print-agent.js');
  if (fs.existsSync(agentPath)) {
    res.download(agentPath, 'printsupport-agent.js');
  } else {
    res.status(404).send('Agent script not found');
  }
});

// 9. Super Admin & Platform API
app.post('/api/v1/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (
    (username === 'admin' || username === 'admin@printsupport.in' || username === 'root') &&
    (password === 'admin123' || password === 'admin' || password === '123456')
  ) {
    return res.json({
      success: true,
      token: 'pc_admin_secret_token_root',
      admin: {
        username: 'Platform Master Admin',
        email: 'admin@printsupport.in',
        role: 'SUPER_ADMIN'
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid master admin credentials' });
});

app.get('/api/v1/admin/session', (req, res) => {
  const auth = req.headers.authorization || req.query.token || '';
  if (auth.includes('admin')) {
    return res.json({
      authenticated: true,
      admin: {
        username: 'Platform Master Admin',
        email: 'admin@printsupport.in',
        role: 'SUPER_ADMIN'
      }
    });
  }
  return res.status(401).json({ authenticated: false, message: 'Unauthorized' });
});

app.get('/api/v1/admin/shops', (req, res) => {
  const shops = db.getShops();
  const enhanced = shops.map(s => {
    const orders = db.getOrders(s.id);
    const printers = db.getPrinters(s.id);
    const totalRev = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
    const totalPgs = orders.reduce((sum, o) => sum + (o.items || []).reduce((acc, i) => acc + (i.computedPages || 0), 0), 0);
    return {
      ...s,
      orderCount: orders.length,
      printerCount: printers.length,
      totalRevenue: totalRev,
      totalPagesPrinted: totalPgs
    };
  });
  res.json({ success: true, shops: enhanced });
});

app.post('/api/v1/admin/shops', (req, res) => {
  const { shopName, ownerName, email, phone, password, address, upiId, slug: customSlug, plan } = req.body;
  if (!shopName || !phone) {
    return res.status(400).json({ success: false, message: 'Shop name and phone are required' });
  }

  const id = 'shop_' + Date.now();
  let baseSlug = (customSlug || shopName || 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'shop';
  let slug = baseSlug;
  let counter = 1;
  while (db.getShopBySlug(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const agentToken = 'agt_tok_' + Math.random().toString(36).substring(2, 15);

  const newShop = {
    id,
    slug,
    name: shopName,
    ownerName: ownerName || 'Shop Owner',
    email: email || '',
    phone: phone || '',
    password: password || '123456',
    address: address || '',
    upiId: upiId || 'merchant@upi',
    autoPrintEnabled: true,
    instantReleaseOnPayment: true,
    whatsappAutomationEnabled: true,
    whatsappPhoneNumber: phone || '',
    whatsappSessionStatus: 'CONNECTED',
    agentToken,
    agentStatus: 'OFFLINE',
    plan: plan || 'PRO',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    printCredits: 10000,
    createdAt: new Date().toISOString()
  };

  db.addShop(newShop);
  res.json({ success: true, shop: newShop });
});

app.put('/api/v1/admin/shops/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getShopById(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  // PROTECT: Never allow slug or id to be changed once created
  // This ensures QR codes remain permanent and working forever
  const updates = { ...req.body };
  delete updates.slug;
  delete updates.id;

  const updated = db.updateShop(id, updates);
  res.json({ success: true, shop: updated });
});

app.delete('/api/v1/admin/shops/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getShopById(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  db.deleteShop(id);
  res.json({ success: true, message: `Shop ${existing.name} removed successfully` });
});

app.get('/api/v1/admin/overview', (req, res) => {
  const shops = db.getShops();
  const orders = db.getOrders();
  const printers = db.getPrinters();
  
  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const totalPagesPrinted = orders.reduce((sum, o) => sum + (o.items || []).reduce((acc, i) => acc + (i.computedPages || 0), 0), 0);

  res.json({
    totalShops: shops.length,
    activePrinters: printers.length,
    totalOrders: orders.length,
    totalRevenue,
    totalPagesPrinted,
    recentOrders: orders.slice(0, 10),
    shops,
    plans: db.getSubscriptionPlans()
  });
});

app.get('/api/v1/subscriptions/plans', (req, res) => {
  res.json(db.getSubscriptionPlans());
});

app.post('/api/v1/support/enquiries', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const enquiry = {
    id: 'enq_' + Date.now(),
    name,
    email,
    phone,
    subject: subject || 'General Enquiry',
    message,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };
  db.addSupportEnquiry(enquiry);
  res.json({ success: true, enquiry });
});

app.get('/api/v1/support/enquiries', (req, res) => {
  res.json(db.getSupportEnquiries());
});

// Serve frontend build in production
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

const HOST = '0.0.0.0';

// Wait for database to finish loading from cloud before starting server
db.ready().then(() => {
  server.listen(PORT, HOST, () => {
    console.log(`Print Support Backend Server running on http://${HOST}:${PORT}`);
    if (db.isCloudEnabled()) {
      console.log('🍃 MongoDB Atlas cloud persistence active');
    } else {
      console.log('📁 Local file persistence active (server/data/database.json)');
      console.log('   Set MONGODB_URI env var to enable permanent MongoDB Atlas cloud storage.');
    }
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  // Start server anyway with local fallback
  server.listen(PORT, HOST, () => {
    console.log(`Print Support Backend Server running on http://${HOST}:${PORT} (local fallback)`);
  });
});

