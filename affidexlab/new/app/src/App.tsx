import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import AppPage from "./pages/AppPage";
import PrivacySwap from "./pages/PrivacySwap";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import VDMAdmin from "./pages/VDMAdmin";
import SolanaStaking from "./pages/SolanaStaking";
import InvestorMetrics from "./pages/InvestorMetrics";
import Quests from "./pages/Quests";
import MEVDashboard from "./pages/MEVDashboard";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import SDKLanding from "./pages/SDKLanding";
import DashboardLanding from "./pages/DashboardLanding";
import Pricing from "./pages/Pricing";
import Compliance from "./pages/Compliance";
import Contact from "./pages/contact";
import Audit from "./pages/Audit";
import Verify from "./pages/Verify";
import { TransactionEventsProvider } from "./contexts/TransactionEventsContext";

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
      {currentPage === "advanced-analytics" && <AdvancedAnalytics />}
      {currentPage === "mev-dashboard" && <MEVDashboard />}
      {currentPage === "investor-metrics" && (
        <div className="min-h-screen bg-[#0A0E27] text-white">
          <InvestorMetrics />
        </div>
      )}
      {currentPage === "staking" && <SolanaStaking />}
      {currentPage === "leaderboard" && <Leaderboard />}
      {currentPage === "vdm-admin" && <VDMAdmin />}
      {currentPage === "admin" && <Admin />}
      {currentPage === "privacy" && <AppPage initialTab="privacy" />}
      {currentPage === "app" && <AppPage />}
      {currentPage === "quests" && <Quests />}
      {currentPage === "contact" && <Contact />}
      {currentPage === "compliance" && <Compliance />}
      {currentPage === "audit" && <Audit />}
      {currentPage === "verify" && <Verify />}
    </TransactionEventsProvider>
  );
}
