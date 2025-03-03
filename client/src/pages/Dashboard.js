import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Use the same API URL configuration as AuthContext
const PRODUCTION_URL = 'https://training-diary-backend.onrender.com';
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : PRODUCTION_URL;

const Dashboard = () => {
  const { user } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [recentNutrition, setRecentNutrition] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [workoutsResponse, nutritionResponse] = await Promise.all([
          fetch(`${API_URL}/api/workouts/recent`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
          }),
          fetch(`${API_URL}/api/nutrition/recent`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
          })
        ]);

        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json();
          setRecentWorkouts(workoutsData);
        }

        if (nutritionResponse.ok) {
          const nutritionData = await nutritionResponse.json();
          setRecentNutrition(nutritionData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome back, {user.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-900">Weekly Goal</h3>
            <p className="text-2xl font-bold text-indigo-600">{user.goals?.weeklyWorkouts || 0} workouts</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Daily Calories</h3>
            <p className="text-2xl font-bold text-green-600">{user.goals?.dailyCalories || 0} kcal</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">Water Intake</h3>
            <p className="text-2xl font-bold text-blue-600">{user.goals?.dailyWater || 0} ml</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent Workouts</h3>
            <Link to="/workouts" className="text-indigo-600 hover:text-indigo-800">
              View all
            </Link>
          </div>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div key={workout._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{workout.type}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{workout.duration} min</span>
                  </div>
                  {workout.bodyParts && workout.bodyParts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {workout.bodyParts.map((part) => (
                        <span
                          key={part}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent workouts</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent Nutrition</h3>
            <Link to="/nutrition" className="text-indigo-600 hover:text-indigo-800">
              View all
            </Link>
          </div>
          {recentNutrition.length > 0 ? (
            <div className="space-y-4">
              {recentNutrition.map((day) => (
                <div key={day._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString()}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {day.meals.length} meals
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{day.totalDailyCalories} kcal</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                      {day.waterIntake} ml water
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent nutrition data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 