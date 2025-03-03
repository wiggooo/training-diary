import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Use the same API URL configuration as AuthContext
const PRODUCTION_URL = 'https://training-diary-backend.onrender.com';
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : PRODUCTION_URL;

const Statistics = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [nutritionData, setNutritionData] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [workoutsResponse, nutritionResponse] = await Promise.all([
        fetch(`${API_URL}/api/workouts?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        }),
        fetch(`${API_URL}/api/nutrition?timeRange=${timeRange}`, {
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
        setWorkouts(workoutsData);
      }

      if (nutritionResponse.ok) {
        const nutritionData = await nutritionResponse.json();
        setNutritionData(nutritionData);
      }
    } catch (error) {
      console.error('Error fetching statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabels = () => {
    const labels = [];
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const currentDate = new Date();
    while (startDate <= currentDate) {
      labels.push(startDate.toLocaleDateString());
      startDate.setDate(startDate.getDate() + 1);
    }

    return labels;
  };

  const getWorkoutData = () => {
    const labels = getDateLabels();
    const data = labels.map(date => {
      const workout = workouts.find(w => new Date(w.date).toLocaleDateString() === date);
      return workout ? workout.duration : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Workout Duration (minutes)',
          data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.1
        }
      ]
    };
  };

  const getCaloriesData = () => {
    const labels = getDateLabels();
    const data = labels.map(date => {
      const day = nutritionData.find(n => new Date(n.date).toLocaleDateString() === date);
      return day ? day.totalDailyCalories : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Daily Calories',
          data,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          tension: 0.1
        }
      ]
    };
  };

  const getBodyPartsData = () => {
    const bodyPartsCount = {};
    workouts.forEach(workout => {
      workout.bodyParts.forEach(part => {
        bodyPartsCount[part] = (bodyPartsCount[part] || 0) + 1;
      });
    });

    return {
      labels: Object.keys(bodyPartsCount),
      datasets: [
        {
          data: Object.values(bodyPartsCount),
          backgroundColor: [
            'rgba(99, 102, 241, 0.5)',
            'rgba(34, 197, 94, 0.5)',
            'rgba(234, 179, 8, 0.5)',
            'rgba(239, 68, 68, 0.5)',
            'rgba(168, 85, 247, 0.5)',
            'rgba(236, 72, 153, 0.5)',
            'rgba(6, 182, 212, 0.5)',
            'rgba(245, 158, 11, 0.5)'
          ]
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === 'year'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Workout Duration</h2>
          <Line data={getWorkoutData()} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Calories</h2>
          <Line data={getCaloriesData()} />
        </div>

        <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Body Parts Distribution</h2>
          <div className="h-96">
            <Doughnut data={getBodyPartsData()} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-indigo-900">Total Workouts</h3>
            <p className="text-2xl font-bold text-indigo-600">{workouts.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-900">Average Daily Calories</h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(
                nutritionData.reduce((acc, day) => acc + day.totalDailyCalories, 0) /
                (nutritionData.length || 1)
              )}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Average Workout Duration</h3>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(
                workouts.reduce((acc, workout) => acc + workout.duration, 0) /
                (workouts.length || 1)
              )} min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 