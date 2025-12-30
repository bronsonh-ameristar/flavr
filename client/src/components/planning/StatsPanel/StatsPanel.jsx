import React from 'react';
import { Clock, Users, TrendingUp, PieChart, Flame } from 'lucide-react';
import './StatsPanel.css';

const StatsPanel = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="stats-panel">
        <h3>Week Overview</h3>
        <p className="no-stats">Plan some meals to see statistics</p>
      </div>
    );
  }

  const {
    totalMeals = 0,
    totalTime = 0,
    totalCookTime = 0,
    totalPrepTime = 0,
    averageServings = 0,
    categoryCounts = {},
    difficultyCounts = {},
    // Nutrition stats
    totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFat = 0,
    avgCalories = 0,
    avgProtein = 0,
    avgCarbs = 0,
    avgFat = 0,
    mealsWithNutrition = 0
  } = stats;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getMostCommonCategory = () => {
    const categories = Object.entries(categoryCounts);
    if (categories.length === 0) return 'None';
    return categories.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getDifficultyDistribution = () => {
    const total = Object.values(difficultyCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return {};
    
    return Object.entries(difficultyCounts).reduce((acc, [difficulty, count]) => {
      acc[difficulty] = Math.round((count / total) * 100);
      return acc;
    }, {});
  };

  const difficultyPercentages = getDifficultyDistribution();

  return (
    <div className="stats-panel">
      <h3>Week Overview</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">
            <PieChart size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{totalMeals}</span>
            <span className="stat-label">Meals Planned</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{formatTime(totalTime)}</span>
            <span className="stat-label">Total Cook Time</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{averageServings}</span>
            <span className="stat-label">Avg Servings</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{getMostCommonCategory()}</span>
            <span className="stat-label">Top Category</span>
          </div>
        </div>
      </div>

      {Object.keys(difficultyCounts).length > 0 && (
        <div className="difficulty-breakdown">
          <h4>Difficulty Distribution</h4>
          <div className="difficulty-bars">
            {Object.entries(difficultyPercentages).map(([difficulty, percentage]) => (
              <div key={difficulty} className="difficulty-bar">
                <div className="bar-label">
                  <span className={`difficulty-badge ${difficulty}`}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="bar-track">
                  <div 
                    className={`bar-fill ${difficulty}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="time-breakdown">
        <h4>Time Breakdown</h4>
        <div className="time-items">
          <div className="time-item">
            <span>Prep Time:</span>
            <span>{formatTime(totalPrepTime)}</span>
          </div>
          <div className="time-item">
            <span>Cook Time:</span>
            <span>{formatTime(totalCookTime)}</span>
          </div>
        </div>
      </div>

      {mealsWithNutrition > 0 && (
        <div className="nutrition-breakdown">
          <h4>
            <Flame size={16} />
            Nutrition Summary
          </h4>
          <div className="nutrition-stats">
            <div className="nutrition-stat-row">
              <div className="nutrition-stat">
                <span className="nutrition-stat-value">{totalCalories}</span>
                <span className="nutrition-stat-label">Total Calories</span>
              </div>
              <div className="nutrition-stat">
                <span className="nutrition-stat-value">{avgCalories}</span>
                <span className="nutrition-stat-label">Avg/Meal</span>
              </div>
            </div>
            <div className="macro-grid">
              <div className="macro-item protein">
                <span className="macro-value">{totalProtein}g</span>
                <span className="macro-label">Protein</span>
                <span className="macro-avg">~{avgProtein}g/meal</span>
              </div>
              <div className="macro-item carbs">
                <span className="macro-value">{totalCarbs}g</span>
                <span className="macro-label">Carbs</span>
                <span className="macro-avg">~{avgCarbs}g/meal</span>
              </div>
              <div className="macro-item fat">
                <span className="macro-value">{totalFat}g</span>
                <span className="macro-label">Fat</span>
                <span className="macro-avg">~{avgFat}g/meal</span>
              </div>
            </div>
            <p className="nutrition-note">Based on {mealsWithNutrition} meal{mealsWithNutrition !== 1 ? 's' : ''} with nutrition data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;