# Print Catalyst — Project Architecture Map

---

## 1. High-Level Overview

```
[ Customer / Merchant Browser ]
              │ (HTTP / WebSocket)
              ▼
    [ Node.js Backend Server ] (server/server.js)
         │               │
         ▼               ▼
 [ MongoDB Atlas Cloud ]  [ Desktop Spooler Agent ] (server/agent-client/)
 (Permanent Database)    (Local Shop Printer Driver)
```

---

## 2. Directory & Component Map

| Component | Location | What It Does |
| :--- | :--- | :--- |
| **Frontend (React + Vite)** | [`src/`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/src) | Single Page App (Customer portal, Merchant dashboard, SuperAdmin, Landing). |
| **Backend (Express + WS)** | [`server/server.js`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/server/server.js) | REST API, WebSocket server for real-time live queues & instant notifications. |
| **Database Layer** | [`server/db.js`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/server/db.js) | Cloud sync with MongoDB Atlas + local file fallback (`database.json`). |
| **Desktop Print Agent** | [`server/agent-client/`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/server/agent-client) | Node.js agent running on shop PC to auto-print jobs directly to USB/LAN printers. |
| **File Uploads** | [`server/uploads/`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/server/uploads) | Storage for customer PDF/documents sent for printing. |
| **Static HTML Entry** | [`index.html`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/index.html) | Root HTML shell with Google Fonts & Lucide icons. |

---

## 3. Frontend Breakdown (`src/`)

- **Main Entry Point**: [`src/main.jsx`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/src/main.jsx) & [`src/App.jsx`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/src/App.jsx) (Routes & Auth).
- **Configuration**: [`src/config.js`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/src/config.js) (Auto-detects API & WebSocket URLs).
- **Core Pages** (`src/pages/`):
  - `LandingPage.jsx`: Hero, features, pricing, and live interactive print calculator.
  - `CustomerPortalPage.jsx`: Customer order flow (drag-drop PDF upload, page calculation, paper select, UPI payment, live order tracker).
  - `MerchantDashboardPage.jsx`: Shop owner panel (live incoming order feed, 1-click print, ledger, pricing setup, QR generator).
  - `SuperAdminPage.jsx`: Platform-wide manager (all shops, subscriptions, stats).
  - `AuthPages.jsx`: Merchant login, signup, and shop setup wizard.
- **Interactive Components** (`src/components/`):
  - `Navbar.jsx` / `Footer.jsx`: Global header & footer with quick contact info.
  - `StandeeGeneratorModal.jsx`: Generates printable shop QR standee for counter.
  - `Interactive3DCalculator.jsx`: 3D visual live page/cost estimator.
  - `PricingMatrixEditor.jsx`: Paper size & rate manager for merchants.

---

## 4. Backend Breakdown (`server/`)

- **Main Server**: [`server/server.js`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/server/server.js)
  - Port: `5000` (Local) / `10000` (Render)
  - Multer upload handler for PDFs (100MB limit)
  - WebSocket hub (`wss`): Broadcasts instant order notifications between Customers, Merchants, and Desktop Agents.
  - Health Route: `/api/v1/health` (Reports uptime, active shops, and DB status).
- **Database Engine**: [`server/db.js`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/server/db.js)
  - Connects to MongoDB Atlas using the `MONGODB_URI` environment variable.
  - Automatically loads and seeds initial state into MongoDB collection `app_state`.
  - Non-blocking, debounced writes ensure sub-millisecond API response times.
  - Automatically falls back to [`server/data/database.json`](file:///c:/Users/aayus/OneDrive/Desktop/printcatalyst/server/data/database.json) if offline.

---

## 5. Database (MongoDB Atlas)

- **Cluster**: AWS Mumbai (`Cluster0`)
- **Database Name**: `printcatalyst`
- **Collection**: `app_state` (Doc ID: `main_state`)
- **What is stored**:
  - `shops`: Merchant profiles, shop slug, credentials, UPI IDs, printer configs.
  - `orders`: All customer print orders, document metadata, payment statuses.
  - `pricing`: Rate sheets per paper size (A4, A3, Legal, Photo), duplex/color multipliers.
  - `plans`: Subscription tiers.

---

## 6. How To Run & Deploy

| Target | Command / Action |
| :--- | :--- |
| **Run Locally** | `npm run dev` (Starts backend on `:5000` + frontend on `:5173`) |
| **Backend Deploy** | Hosted on **Render** (`Printcatalyst_new`). Auto-deploys from GitHub `main`. |
| **Frontend Deploy** | Hosted on **Vercel** or served directly via backend. |
| **Environment Vars** | Set in `.env` (local) and Render Dashboard (production). |
