import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Calendar, ShoppingCart, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import { useMeals } from '../../hooks/useMeals';
import { consolidateIngredients } from '../../utils/unitConverter';
import './Dashboard.css';

const Dashboard = () => {
  // Get current week dates for meal planning context
  const getWeekDates = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    return {
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = getWeekDates();

  // Hooks for data
  const { meals, totalCount: totalRecipes, fetchMeals } = useMeals();
  const {
    mealPlans,
    fetchMealPlans,
    generateGroceryList,
    groceryList
  } = useMealPlanning(startDate, endDate);

  // Initial data fetch
  useEffect(() => {
    fetchMeals();
    fetchMealPlans();
    generateGroceryList();
  }, [fetchMeals, fetchMealPlans, generateGroceryList]);

  // Calculate metrics
  const metrics = useMemo(() => {
    // Days Planned (future dates with meals)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futurePlans = Object.values(mealPlans).filter(plan => {
      const planDate = new Date(plan.date);
      return planDate >= today;
    });

    const uniqueDaysPlanned = new Set(futurePlans.map(p => p.date)).size;

    // Meals this week
    const mealsThisWeek = Object.values(mealPlans).length;

    // Grocery Items (total unchecked items with consolidation)
    let groceryItemCount = 0;
    if (groceryList && groceryList.groceryList) {
      Object.values(groceryList.groceryList).forEach(store => {
        const allStoreItems = [];
        Object.values(store).forEach(category => {
          allStoreItems.push(...category);
        });
        // Consolidate items per store and count
        const consolidatedItems = consolidateIngredients(allStoreItems);
        groceryItemCount += consolidatedItems.length;
      });
    }

    return {
      daysPlanned: uniqueDaysPlanned,
      mealsThisWeek,
      groceryItems: groceryItemCount
    };
  }, [mealPlans, groceryList]);

  // Get today's meal plan
  const todaysMeals = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPlans = Object.values(mealPlans).filter(plan => plan.date === todayStr);

    // Sort by meal type order
    const order = { breakfast: 1, lunch: 2, dinner: 3 };
    return todayPlans.sort((a, b) => order[a.mealType] - order[b.mealType]);
  }, [mealPlans]);

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
            <h3>{metrics.daysPlanned}</h3>
            <p>Days Planned</p>
          </div>
        </div>

        <div className="stat-card">
          <ChefHat className="stat-icon" />
          <div className="stat-content">
            <h3>{totalRecipes}</h3>
            <p>Total Recipes</p>
          </div>
        </div>

        <div className="stat-card">
          <ShoppingCart className="stat-icon" />
          <div className="stat-content">
            <h3>{metrics.groceryItems}</h3>
            <p>Items on Grocery List</p>
          </div>
        </div>

        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <h3>{metrics.mealsThisWeek}</h3>
            <p>Meals This Week</p>
          </div>
        </div>
      </div>

      {/* Plan for Today Section */}
      <div className="today-plan-section">
        <div className="section-header">
          <h2>Plan for Today</h2>
          <span className="date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {todaysMeals.length > 0 ? (
          <div className="today-meals-grid">
            {todaysMeals.map(plan => (
              <div key={plan.id} className="today-meal-card">
                <div className="meal-type-badge">{plan.mealType}</div>
                <div className="meal-info">
                  <img
                    src={plan.meal.imageUrl || `https://via.placeholder.com/100?text=${plan.meal.name}`}
                    alt={plan.meal.name}
                    className="meal-thumb"
                  />
                  <div className="meal-details">
                    <h4>{plan.meal.name}</h4>
                    <div className="meal-meta-mini">
                      <Clock size={14} />
                      <span>{plan.meal.totalTime || (plan.meal.prepTime + plan.meal.cookTime) || 0}m</span>
                    </div>
                  </div>
                </div >
                <Link to={`/meals`} className="view-btn">
                  <ArrowRight size={16} />
                </Link>
              </div >
            ))}
          </div >
        ) : (
          <div className="empty-today-state">
            <p>No meals planned for today.</p>
            <Link to="/planning" className="btn-text">Go to Planner</Link>
          </div>
        )}
      </div >

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