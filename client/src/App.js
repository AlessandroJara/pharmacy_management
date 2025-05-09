import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Users from './components/Users';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

function AppWrapper() {
  const location = useLocation();
  const role = localStorage.getItem('role');
  const isAuthenticated = !!localStorage.getItem('token');
  const showNavbar = isAuthenticated && location.pathname !== '/login';

  useEffect(() => {
    console.log('Role checked on route change:', role, 'Path:', location.pathname);
  }, [location, role]);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;