import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordManager from './pages/PasswordManager';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  // Update authentication state on token change
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-manager" element={isAuthenticated ? <PasswordManager /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
