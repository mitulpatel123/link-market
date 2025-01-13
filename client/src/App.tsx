import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import DiaryAuth from './components/DiaryAuth';
import Dashboard from './components/Dashboard';
import HeadingsPage from './components/HeadingsPage';
import DiaryPage from './components/DiaryPage';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Diary Protected Route component
const DiaryProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const diaryToken = localStorage.getItem('diaryToken');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (!diaryToken) {
    return <Navigate to="/diary-auth" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const token = localStorage.getItem('token');
  const diaryToken = localStorage.getItem('diaryToken');

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
        />
        <Route
          path="/diary-auth"
          element={
            <ProtectedRoute>
              <DiaryAuth />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/headings"
          element={
            <ProtectedRoute>
              <HeadingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <DiaryProtectedRoute>
              <DiaryPage />
            </DiaryProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
