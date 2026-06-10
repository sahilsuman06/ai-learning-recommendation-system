import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import ChatTutor from './pages/ChatTutor';

// Layout that wraps navbar around protected page views
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/tutor" element={<ChatTutor />} />
          </Route>
        </Route>

        {/* Catch-all redirects to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
