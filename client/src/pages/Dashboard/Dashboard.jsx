// client/src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChefHat, ShoppingCart, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = {
    mealsThisWeek: 12,
    recipesTotal: 45,
    groceryItems: 8,
    plannedDays: 5
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Your Meal Tracker</h1>
        <p>Plan your meals, organize your recipes, and streamline your grocery shopping.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Calendar className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.plannedDays}</h3>
            <p>Days Planned This Week</p>
          </div>
        </div>
        
        <div className="stat-card">
          <ChefHat className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.recipesTotal}</h3>
            <p>Total Recipes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <ShoppingCart className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.groceryItems}</h3>
            <p>Items on Grocery List</p>
          </div>
        </div>
        
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.mealsThisWeek}</h3>
            <p>Meals This Week</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/meals" className="action-card">
            <ChefHat size={24} />
            <h3>Manage Recipes</h3>
            <p>Add, edit, or browse your meal recipes</p>
          </Link>
          
          <Link to="/planning" className="action-card">
            <Calendar size={24} />
            <h3>Plan Your Week</h3>
            <p>Organize meals for the upcoming week</p>
          </Link>
          
          <Link to="/grocery" className="action-card">
            <ShoppingCart size={24} />
            <h3>Grocery List</h3>
            <p>View and manage your shopping list</p>
          </Link>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <ChefHat size={16} />
            <span>Added "Chicken Stir Fry" recipe</span>
            <time>2 hours ago</time>
          </div>
          <div className="activity-item">
            <Calendar size={16} />
            <span>Planned meals for Monday-Wednesday</span>
            <time>1 day ago</time>
          </div>
          <div className="activity-item">
            <ShoppingCart size={16} />
            <span>Completed grocery shopping</span>
            <time>2 days ago</time>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;