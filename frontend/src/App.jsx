import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Compress from './pages/Compress';
import Results from './pages/Results';
import History from './pages/History';
import About from './pages/About';
import ApiPortal from './pages/ApiPortal';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chatbot from './components/Chatbot';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading AdaptZip...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app-layout">
      {!isAuthPage && user && <Sidebar />}
      <main className={!isAuthPage && user ? "main-content" : "full-content"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/compress" element={<ProtectedRoute><Compress /></ProtectedRoute>} />
          <Route path="/results/:jobId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/api-portal" element={<ProtectedRoute><ApiPortal /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isAuthPage && user && <Chatbot />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
