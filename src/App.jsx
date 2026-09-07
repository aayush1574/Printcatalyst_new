import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductTourPage from './pages/ProductTourPage';
import WhatsAppTourPage from './pages/WhatsAppTourPage';
import QROrdersTourPage from './pages/QROrdersTourPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { OrderManagementPage, PrinterRoutingPage } from './pages/FeaturePages';
import { GuidePage, LegalPage, ContactPage } from './pages/GuidesAndLegalPages';
import { useAuth } from './context/AuthContext';

// Code-split heavy interactive dashboards
const MerchantDashboardPage = lazy(() => import('./pages/MerchantDashboardPage'));
const CustomerPortalPage = lazy(() => import('./pages/CustomerPortalPage'));
const SuperAdminPage = lazy(() => import('./pages/SuperAdminPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-slate-400">
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-3 shadow-2xl backdrop-blur-md">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-300">Loading Workspace...</span>
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  // Wait for auth session check to finish before rendering routes
  // This prevents blank pages from lazy-loaded pages reading stale auth state
  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/print-shop-automation-software" element={<ProductTourPage />} />
        <Route path="/whatsapp-printing-software" element={<WhatsAppTourPage />} />
        <Route path="/qr-code-printing-system" element={<QROrdersTourPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/print-order-management-software" element={<OrderManagementPage />} />
        <Route path="/automatic-printer-routing" element={<PrinterRoutingPage />} />
        <Route path="/merchant" element={<MerchantDashboardPage />} />
        <Route path="/portal/:shopId" element={<CustomerPortalPage />} />
        <Route path="/admin" element={<SuperAdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Guides */}
        <Route
          path="/guides/automate-whatsapp-print-orders"
          element={
            <GuidePage
              title="How to Automate WhatsApp Print Orders"
              headline="Step-by-step guide to connecting your shop WhatsApp number and letting bot AI calculate instant quotes."
              content={`1. Connecting Your Number: Pair your shop WhatsApp number with the Print Support Bot engine in your Merchant Dashboard.
2. Auto File Intake: When walk-in or remote customers forward PDFs, Word documents or images, the bot immediately extracts page count and document dimensions.
3. Structured Quote & Pay: Customer receives an instant breakdown with options for B&W vs Color and Single vs Duplex. Payment is routed directly to your shop UPI VPA.
4. Auto Dispatch: The moment payment is verified, the job enters your active printer queue.`}
            />
          }
        />

        <Route
          path="/guides/qr-vs-whatsapp-print-orders"
          element={
            <GuidePage
              title="QR Code vs WhatsApp Print Orders"
              headline="Comparing counter QR self-service portals with WhatsApp chat order intake."
              content={`• QR Code Portals are best for walk-in counter customers who want to configure multi-file jobs, select custom page ranges (e.g. 1-5, 8-12), and pay via UPI on their phone without crowding the counter.
• WhatsApp Print Orders are ideal for regular college students and corporate clients who forward documents from home or on the go before arriving at the shop.`}
            />
          }
        />

        <Route
          path="/guides/prevent-mixed-print-orders"
          element={
            <GuidePage
              title="How to Prevent Mixed-Up Print Orders"
              headline="Using unique pickup tokens and automated separator sheets to streamline physical pickups."
              content={`Print Support assigns a 3-character unique pickup token (e.g. CAT-481) to every submitted order. The token is stamped on customer screens, in the merchant dashboard, and on the physical cover ticket, ensuring zero customer handover confusion.`}
            />
          }
        />

        {/* Legal Pages */}
        <Route
          path="/privacy-policy"
          element={
            <LegalPage
              title="Privacy Policy"
              content={`Print Support prioritizes the security and privacy of print shop owners and end-customers.
• Data Encryption: All uploaded customer documents are transferred using end-to-end SSL/TLS encryption.
• Automated 24-Hour File Purging: Document files stored on the server for printing are automatically deleted 24 hours after completion.
• Direct Merchant Payments: Customer UPI payments go 100% directly to the shop merchant's VPA.`}
            />
          }
        />

        <Route
          path="/terms"
          element={
            <LegalPage
              title="Terms of Service"
              content={`By accessing or using Print Support software, you agree to these Terms of Service.
• Merchants are responsible for configuring accurate rate matrix pricing and maintaining their physical printers.
• Print Support provides software automation, queue management, and desktop agent bridge services.`}
            />
          }
        />

        <Route
          path="/refund-policy"
          element={
            <LegalPage
              title="Cancellation & Refund Policy"
              content={`Print Support subscriptions can be cancelled at any time from the merchant billing settings. Subscriptions remain active until the end of the billing period.`}
            />
          }
        />

        <Route
          path="/shipping-delivery"
          element={
            <LegalPage
              title="Shipping & Delivery Policy"
              content={`Print Support software services and digital desktop agent downloads are delivered instantly online upon merchant registration.`}
            />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
}
