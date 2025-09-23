// client/src/components/layout/Navigation/Navigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ChefHat, Calendar, ShoppingCart } from 'lucide-react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <ChefHat size={24} />
        <span className="brand-text">Meal Tracker</span>
      </div>
      
      <div className="nav-center">
        <div className="nav-links">
          <NavLink to="/dashboard" className="nav-link">
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/meals" className="nav-link">
            <ChefHat size={20} />
            <span>Recipes</span>
          </NavLink>
          
          <NavLink to="/planning" className="nav-link">
            <Calendar size={20} />
            <span>Planning</span>
          </NavLink>
          
          <NavLink to="/grocery" className="nav-link">
            <ShoppingCart size={20} />
            <span>Grocery</span>
          </NavLink>
        </div>
      </div>
      
      <div className="nav-actions">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navigation;