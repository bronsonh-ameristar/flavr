// client/src/components/layout/Navigation/Navigation.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ChefHat, Calendar, ShoppingCart, SearchCheck, LogIn, LogOut, User } from 'lucide-react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import useAuthStore from '../../../store/useAuthStore';
import './Navigation.css';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <ChefHat size={24} />
        <span className="brand-text">Meal Tracker</span>
      </div>

      {isAuthenticated && (
        <div className="nav-center">
          <div className="nav-links">
            <NavLink to="/dashboard" className="nav-link">
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/search" className="nav-link">
              <SearchCheck size={20} />
              <span>Search</span>
            </NavLink>

            <NavLink to="/meals" className="nav-link">
              <ChefHat size={20} />
              <span>My Recipes</span>
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
      )}

      <div className="nav-actions">
        <ThemeToggle />

        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-greeting">
              <User size={18} />
              <span className="user-name">{user?.username}</span>
            </span>
            <button onClick={handleLogout} className="logout-button" title="Sign out">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="login-button">
            <LogIn size={18} />
            <span>Sign In</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navigation;