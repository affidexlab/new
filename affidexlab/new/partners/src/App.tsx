import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Embed from './pages/Embed';

function getPageFromLocation(): 'dashboard' | 'embed' {
  const path = window.location.pathname;
  const hash = window.location.hash;
  
  if (path.includes('/embed') || hash.includes('embed')) {
    return 'embed';
  }
  return 'dashboard';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'embed'>(() => getPageFromLocation());

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

  if (currentPage === 'embed') {
    return <Embed />;
  }

  return <Dashboard />;
}
