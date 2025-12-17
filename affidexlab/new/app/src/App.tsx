import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import AppPage from "./pages/AppPage";
import PrivacySwap from "./pages/PrivacySwap";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import SolanaStaking from "./pages/SolanaStaking";
import { TransactionEventsProvider } from "./contexts/TransactionEventsContext";

function getPageFromLocation(): string {
  const path = window.location.pathname;
  const hash = window.location.hash;
  
  if (path.startsWith("/staking") || hash === "#staking") {
    return "staking";
  }
  if (path.startsWith("/leaderboard") || hash === "#leaderboard") {
    return "leaderboard";
  }
  if (path.startsWith("/admin") || hash === "#admin") {
    return "admin";
  }
  if (path.startsWith("/app/privacy") || hash === "#privacy") {
    return "privacy";
  }
  if (path.startsWith("/app") || hash === "#app") {
    return "app";
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
      {currentPage === "staking" && <SolanaStaking />}
      {currentPage === "leaderboard" && <Leaderboard />}
      {currentPage === "admin" && <Admin />}
      {currentPage === "privacy" && (
        <div className="min-h-screen bg-[#0A0E27] text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2">Privacy Swap</h1>
              <p className="text-gray-400">Trade with complete anonymity using MEV protection</p>
            </div>
            <PrivacySwap />
          </div>
        </div>
      )}
      {currentPage === "app" && <AppPage />}
    </TransactionEventsProvider>
  );
}
