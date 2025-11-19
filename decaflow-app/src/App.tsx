import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DAppPage from './pages/DAppPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/swap" element={<DAppPage />} />
      <Route path="/app" element={<DAppPage />} />
    </Routes>
  );
}

export default App;
