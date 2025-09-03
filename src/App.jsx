import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CitizensDashboard from './components/CitizensDashboard';
import GovernmentDashboard from './components/GovernmentDashboard';
import CitizenComplaint from './components/CitizenComplaint';
import CitizenFeedback from './components/CitizenFeedback';
import GovernmentSolution from './components/GovernmentSolution';
import About from './components/About';
import HelpContact from './components/HelpContact';
import ResetPassword from './components/ResetPassword';
import VerifyOTP from './components/VerifyOTP';

// Protected Route component to handle authentication
const ProtectedRoute = ({ user, role, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Role mapping to match your database
  const roleMap = {
    1: 'Citizen',
    2: 'Government Official'
  };

  useEffect(() => {
    // Check for stored user data on app load
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        // Ensure the user data has the role string format for compatibility
        const userWithRole = {
          ...userData,
          role: roleMap[userData.role_id] || userData.role
        };
        setUser(userWithRole);
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user'); // Remove corrupted data
    }
    setLoading(false);
  }, []);

  const updateUser = (userData) => {
    // Ensure the user data has the role string format
    const userWithRole = {
      ...userData,
      role: roleMap[userData.role_id] || userData.role
    };

    setUser(userWithRole);
    localStorage.setItem('user', JSON.stringify(userWithRole));

    // Navigate based on role
    if (userWithRole.role === 'Citizen') {
      navigate('/citizens-dashboard');
    } else if (userWithRole.role === 'Government Official') {
      navigate('/government-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to={user.role === 'Citizen' ? '/citizens-dashboard' : '/government-dashboard'} replace /> : <Login updateUser={updateUser} />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'Citizen' ? '/citizens-dashboard' : '/government-dashboard'} replace /> : <Register updateUser={updateUser} />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Citizen Routes */}
        <Route path="/citizens-dashboard" element={
          <ProtectedRoute user={user} role="Citizen">
            <CitizensDashboard user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/complaint" element={
          <ProtectedRoute user={user} role="Citizen">
            <CitizenComplaint user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/feedback" element={
          <ProtectedRoute user={user} role="Citizen">
            <CitizenFeedback user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Protected Government Routes */}
        <Route path="/government-dashboard" element={
          <ProtectedRoute user={user} role="Government Official">
            <GovernmentDashboard user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/solution" element={
          <ProtectedRoute user={user} role="Government Official">
            <GovernmentSolution user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Protected Common Routes */}
        <Route path="/about" element={
          <ProtectedRoute user={user}>
            <About user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute user={user}>
            <HelpContact user={user} handleLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/" element={<Navigate to={user ? (user.role === 'Citizen' ? '/citizens-dashboard' : '/government-dashboard') : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;