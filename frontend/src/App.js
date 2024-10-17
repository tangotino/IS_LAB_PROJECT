import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordManager from './pages/PasswordManager'; // Assuming PasswordManager is in 'pages' folder

function App() {
  // Check if the user is authenticated by looking for 'authToken'
  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <Router>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected route for password manager */}
        <Route
          path="/password-manager"
          element={isAuthenticated ? <PasswordManager /> : <Navigate to="/login" />} // Protect route
        />
      </Routes>
    </Router>
  );
}

export default App;
