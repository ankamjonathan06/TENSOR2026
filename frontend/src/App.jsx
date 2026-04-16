import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Compress from './pages/Compress';
import Results from './pages/Results';
import History from './pages/History';
import About from './pages/About';
import ApiPortal from './pages/ApiPortal';
import Pricing from './pages/Pricing';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compress" element={<Compress />} />
            <Route path="/results/:jobId" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/api-portal" element={<ApiPortal />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
