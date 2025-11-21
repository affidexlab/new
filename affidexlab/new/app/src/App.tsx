import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import AppPage from "./pages/AppPage";
import PrivacySwap from "./pages/PrivacySwap";

function getPageFromLocation(): string {
  const path = window.location.pathname;
  const hash = window.location.hash;
  
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

  if (currentPage === "home") {
    return <Landing />;
  }

  if (currentPage === "privacy") {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Privacy Swap</h1>
            <p className="text-gray-400">Trade with complete anonymity using MEV protection</p>
          </div>
          <PrivacySwap />
        </div>
      </div>
    );
  }

  return <AppPage />;
}
