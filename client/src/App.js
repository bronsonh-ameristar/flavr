// client/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/layout/Navigation/Navigation';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import MealsPage from './pages/MealsPage/MealsPage';
import SearchPage from './pages/SearchMealsPage/SearchMealsPage'
import GroceryPage from './pages/GroceryPage/GroceryPage';
import EnhancedPlanningPage from './pages/PlanningPage/EnhancedPlanningPage';
import { Login, Register } from './pages/Auth';
import useAuthStore from './store/useAuthStore';
import './App.css';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading FLAVR...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals"
              element={
                <ProtectedRoute>
                  <MealsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planning"
              element={
                <ProtectedRoute>
                  <EnhancedPlanningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grocery"
              element={
                <ProtectedRoute>
                  <GroceryPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
