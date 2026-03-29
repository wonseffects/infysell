import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Pages (to be created)
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Onboarding from './pages/Onboarding'; // Wizard wrapper index.jsx
import Dashboard from './pages/Dashboard';
import CampaignDetails from './pages/Dashboard/CampaignDetails';
import Settings from './pages/Settings';

function App() {
  const { fetchMe, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/campaign/:id" element={
          <ProtectedRoute>
            <CampaignDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/onboarding/*" element={
          <ProtectedRoute>
            {/* Wizard Logic will go here */}
            <Onboarding />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
