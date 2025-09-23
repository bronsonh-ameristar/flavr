// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/layout/Navigation/Navigation';
import Dashboard from './pages/Dashboard/Dashboard';
import MealsPage from './pages/MealsPage/MealsPage';
import PlanningPage from './pages/PlanningPage/PlanningPage';
import GroceryPage from './pages/GroceryPage/GroceryPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/grocery" element={<GroceryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;