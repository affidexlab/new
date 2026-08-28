import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import AppPage from "./pages/AppPage";
import PrivacySwap from "./pages/PrivacySwap";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import FounderAdmin from "./pages/FounderAdmin";
import VDMAdmin from "./pages/VDMAdmin";
import SolanaStaking from "./pages/SolanaStaking";
import InvestorMetrics from "./pages/InvestorMetrics";
import Quests from "./pages/Quests";
import MEVDashboard from "./pages/MEVDashboard";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import SDKLanding from "./pages/SDKLanding";
import DashboardLanding from "./pages/DashboardLanding";
import Pricing from "./pages/Pricing";
import Compliance from "./pages/compliance";
import Contact from "./pages/contact";
import Audit from "./pages/audit";
import Verify from "./pages/verify";
import Shield from "./pages/Shield";
import Institutional from "./pages/Institutional";
import IssuerPortal from "./pages/IssuerPortal";
import Agents from "./pages/Agents";
import CustomerPortal from "./pages/CustomerPortal";
import { TransactionEventsProvider } from "./contexts/TransactionEventsContext";
import ProductGate from "./components/ProductGate";
import KycAdmin from "./pages/KycAdmin";

function getPageFromLocation(): string {
  const path = window.location.pathname;
  const hash = window.location.hash;
  
  if (path.startsWith("/sdk") || hash === "#sdk") {
    return "sdk-landing";
  }
  if (path.startsWith("/dashboard-product") || hash === "#dashboard-product") {
    return "dashboard-landing";
  }
  if (path.startsWith("/pricing") || hash === "#pricing") {
    return "pricing";
  }
  if (path.startsWith("/advanced-analytics") || hash === "#advanced-analytics") {
    return "advanced-analytics";
  }
  if (path.startsWith("/mev-dashboard") || hash === "#mev-dashboard") {
    return "mev-dashboard";
  }
  if (path.startsWith("/investor-metrics") || hash === "#investor-metrics") {
    return "investor-metrics";
  }
  if (path.startsWith("/staking") || hash === "#staking") {
    return "staking";
  }
  if (path.startsWith("/leaderboard") || hash === "#leaderboard") {
    return "leaderboard";
  }
  if (path.startsWith("/still-vdm-decalab") || hash === "#still-vdm-decalab") {
    return "vdm-admin";
  }
  if (path.startsWith("/founder-control") || hash === "#founder-control") {
    return "founder-admin";
  }
  if (path.startsWith("/timothy-access") || hash === "#timothy-access") {
    return "admin";
  }
  if (path.startsWith("/app/privacy") || hash === "#privacy") {
    return "privacy";
  }
  if (path.startsWith("/app") || hash === "#app") {
    return "app";
  }
  if (path.startsWith("/quests") || hash === "#quests") {
    return "quests";
  }
  if (path.startsWith("/contact") || hash === "#contact") {
    return "contact";
  }
  if (path.startsWith("/compliance") || hash === "#compliance") {
    return "compliance";
  }
  if (path.startsWith("/audit") || hash === "#audit") {
    return "audit";
  }
  if (path.startsWith("/verify") || hash === "#verify") {
    return "verify";
  }
  if (path.startsWith("/shield") || hash === "#shield") {
    return "shield";
  }
  if (path.startsWith("/institutional/portal") || hash === "#institutional-portal") {
    return "issuer-portal";
  }
  if (path.startsWith("/institutional") || hash === "#institutional") {
    return "institutional";
  }
  if (path.startsWith("/agents") || hash === "#agents") {
    return "agents";
  }
  if (path.startsWith("/login") || path.startsWith("/account") || hash === "#login" || hash === "#account") {
    return "customer-portal";
  }
  if (path.startsWith("/kyc-admin") || hash === "#kyc-admin") {
    return "kyc-admin";
  }
  return "home";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => getPageFromLocation());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPage(getPageFromLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return (
    <TransactionEventsProvider>
      {currentPage === "home" && <Landing />}
      {currentPage === "sdk-landing" && <SDKLanding />}
      {currentPage === "dashboard-landing" && <DashboardLanding />}
      {currentPage === "pricing" && <Pricing />}
      {currentPage === "advanced-analytics" && <ProductGate productKey="analytics"><AdvancedAnalytics /></ProductGate>}
      {currentPage === "mev-dashboard" && <ProductGate productKey="analytics"><MEVDashboard /></ProductGate>}
      {currentPage === "investor-metrics" && (
        <div className="min-h-screen bg-[#0A0E27] text-white">
          <InvestorMetrics />
        </div>
      )}
      {currentPage === "staking" && <ProductGate productKey="staking"><SolanaStaking /></ProductGate>}
      {currentPage === "leaderboard" && <Leaderboard />}
      {currentPage === "vdm-admin" && <VDMAdmin />}
      {currentPage === "admin" && <Admin />}
      {currentPage === "founder-admin" && <FounderAdmin />}
      {currentPage === "privacy" && <ProductGate productKey="swap_bridge"><AppPage initialTab="privacy" /></ProductGate>}
      {currentPage === "app" && <ProductGate productKey="swap_bridge"><AppPage /></ProductGate>}
      {currentPage === "quests" && <Quests />}
      {currentPage === "contact" && <Contact />}
      {currentPage === "compliance" && <ProductGate productKey="compliance"><Compliance /></ProductGate>}
      {currentPage === "audit" && <ProductGate productKey="audit"><Audit /></ProductGate>}
      {currentPage === "verify" && <ProductGate productKey="verify"><Verify /></ProductGate>}
      {currentPage === "shield" && <ProductGate productKey="shield"><Shield /></ProductGate>}
      {currentPage === "institutional" && <ProductGate productKey="institutional"><Institutional /></ProductGate>}
      {currentPage === "agents" && <ProductGate productKey="agents"><Agents /></ProductGate>}
      {currentPage === "issuer-portal" && <ProductGate productKey="institutional"><IssuerPortal /></ProductGate>}
      {currentPage === "customer-portal" && <CustomerPortal />}
      {currentPage === "kyc-admin" && <KycAdmin />}
    </TransactionEventsProvider>
  );
}
