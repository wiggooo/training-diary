import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import API_URL from '../config/api';
import BackButton from '../components/BackButton';

const Nutrition = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [nutritionData, setNutritionData] = useState([]);
  const [savedFoods, setSavedFoods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(location.state?.showAddForm || false);
  const [showSaveFoodForm, setShowSaveFoodForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [newNutrition, setNewNutrition] = useState({
    meals: [],
    totalDailyCalories: 0,
    waterIntake: 0,
    notes: ''
  });
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
    servingUnit: 'g'
  });
  const [newSavedFood, setNewSavedFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
    servingUnit: 'g'
  });
  const [saveFoodError, setSaveFoodError] = useState('');
  const [saveFoodSuccess, setSaveFoodSuccess] = useState('');

  useEffect(() => {
    fetchNutritionData();
    fetchSavedFoods();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (newNutrition.successMessage) {
      const timer = setTimeout(() => {
        setNewNutrition(prev => ({ ...prev, successMessage: '' }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newNutrition.successMessage]);

  const fetchNutritionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/nutrition`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by date, newest first
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNutritionData(sortedData);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedFoods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/saved-foods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setSavedFoods(data);
      }
    } catch (error) {
      console.error('Error fetching saved foods:', error);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/nutrition`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          meals: [{
            name: newMeal.name,
            calories: Number(newMeal.calories),
            protein: Number(newMeal.protein),
            carbs: Number(newMeal.carbs),
            fat: Number(newMeal.fat),
            servingSize: Number(newMeal.servingSize),
            servingUnit: newMeal.servingUnit
          }]
        })
      });

      if (response.ok) {
        fetchNutritionData();
        setNewMeal({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          servingSize: '',
          servingUnit: 'g'
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    setSaveFoodError('');
    setSaveFoodSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSaveFoodError('You must be logged in to save foods');
        return;
      }

      console.log('Attempting to save food to:', `${API_URL}/api/saved-foods`);
      const response = await fetch(`${API_URL}/api/saved-foods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(newSavedFood)
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSaveFoodError('Server not found. Please check if the backend is running.');
          return;
        }
        if (response.status === 401) {
          setSaveFoodError('Your session has expired. Please log in again.');
          return;
        }
        const data = await response.json();
        setSaveFoodError(data.message || 'Failed to save food');
        if (data.details) {
          console.error('Validation errors:', data.details);
        }
        return;
      }

      const data = await response.json();
      fetchSavedFoods();
      setNewSavedFood({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        servingSize: '',
        servingUnit: 'g'
      });
      setShowSaveFoodForm(false);
      setSaveFoodSuccess('Food saved successfully!');
    } catch (error) {
      console.error('Error saving food:', error);
      if (error.message.includes('Failed to fetch')) {
        setSaveFoodError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setSaveFoodError('Failed to save food. Please try again.');
      }
    }
  };

  const handleDeleteSavedFood = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/saved-foods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        fetchSavedFoods();
      }
    } catch (error) {
      console.error('Error deleting saved food:', error);
    }
  };

  const handleDeleteMeal = async (dayId, mealIndex) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/nutrition/${dayId}/meals/${mealIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        fetchNutritionData();
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleDeleteNutritionLog = async (dayId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/nutrition/${dayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        fetchNutritionData();
      }
    } catch (error) {
      console.error('Error deleting nutrition log:', error);
    }
  };

  const filteredSavedFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateMealCalories = (meal) => {
    if (!meal || !meal.foods) return 0;
    return meal.foods.reduce((total, food) => total + (food.calories || 0), 0);
  };

  const calculateTotalCalories = () => {
    if (!newNutrition.meals) return 0;
    return newNutrition.meals.reduce((total, meal) => total + calculateMealCalories(meal), 0);
  };

  const scaleNutritionValues = (food, newWeight) => {
    const scaleFactor = newWeight / food.servingSize;
    return {
      ...food,
      servingSize: newWeight,
      calories: Math.round(food.calories * scaleFactor),
      protein: Math.round(food.protein * scaleFactor * 10) / 10,
      carbs: Math.round(food.carbs * scaleFactor * 10) / 10,
      fat: Math.round(food.fat * scaleFactor * 10) / 10
    };
  };

  const handleServingSizeChange = (food, newSize) => {
    const scaledFood = scaleNutritionValues(food, parseFloat(newSize));
    setNewMeal({
      ...newMeal,
      calories: scaledFood.calories,
      protein: scaledFood.protein,
      carbs: scaledFood.carbs,
      fat: scaledFood.fat,
      servingSize: scaledFood.servingSize
    });
  };

  const handleSavedFoodClick = (food) => {
    setNewMeal({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 ml-4">Nutrition</h1>
      </div>

      {newNutrition.successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {newNutrition.successMessage}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nutrition</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSaveFoodForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save New Food
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {showAddForm ? 'Cancel' : 'Add Nutrition Log'}
            </button>
          </div>
        </div>

        {showSaveFoodForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Save New Food</h3>
            {saveFoodError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {saveFoodError}
              </div>
            )}
            {saveFoodSuccess && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                {saveFoodSuccess}
              </div>
            )}
            <form onSubmit={handleSaveFood} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newSavedFood.name}
                    onChange={(e) => setNewSavedFood({ ...newSavedFood, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calories</label>
                  <input
                    type="number"
                    value={newSavedFood.calories}
                    onChange={(e) => setNewSavedFood({ ...newSavedFood, calories: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                  <input
                    type="number"
                    value={newSavedFood.protein}
                    onChange={(e) => setNewSavedFood({ ...newSavedFood, protein: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                  <input
                    type="number"
                    value={newSavedFood.carbs}
                    onChange={(e) => setNewSavedFood({ ...newSavedFood, carbs: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
                  <input
                    type="number"
                    value={newSavedFood.fat}
                    onChange={(e) => setNewSavedFood({ ...newSavedFood, fat: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Serving Size</label>
                    <input
                      type="number"
                      value={newSavedFood.servingSize}
                      onChange={(e) => setNewSavedFood({ ...newSavedFood, servingSize: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                      value={newSavedFood.servingUnit}
                      onChange={(e) => setNewSavedFood({ ...newSavedFood, servingUnit: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="piece">piece</option>
                      <option value="portion">portion</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSaveFoodForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        )}

        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Meal</h3>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calories</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                  <input
                    type="number"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                  <input
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
                  <input
                    type="number"
                    value={newMeal.fat}
                    onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Serving Size</label>
                    <input
                      type="number"
                      value={newMeal.servingSize}
                      onChange={(e) => handleServingSizeChange(newMeal, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                      value={newMeal.servingUnit}
                      onChange={(e) => setNewMeal({ ...newMeal, servingUnit: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="piece">piece</option>
                      <option value="portion">portion</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Meal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {nutritionData.map((day) => (
            <div key={day._id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {new Date(day.date).toLocaleDateString()}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    <div>Total calories: {day.totalDailyCalories}</div>
                    <div>Water: {day.waterIntake} glasses ({(day.waterIntake * 250).toFixed(0)} ml)</div>
                  </div>
                  <button
                    onClick={() => handleDeleteNutritionLog(day._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete nutrition log"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {day.meals.map((meal, index) => (
                  <div key={index} className="border-t pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 capitalize">{meal.name}</h4>
                        <div className="mt-2 space-y-2">
                          <div className="text-sm text-gray-600">
                            {meal.calories} kcal
                          </div>
                          <div className="text-sm text-gray-600">
                            P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                          </div>
                          <div className="text-sm text-gray-600">
                            Serving: {meal.servingSize}{meal.servingUnit}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(day._id, index)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete meal"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {day.notes && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                  <p className="mt-1 text-sm text-gray-600">{day.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Saved Foods</h3>
            <input
              type="text"
              placeholder="Search saved foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSavedFoods.map((food) => (
              <div key={food._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{food.name}</h4>
                  <button
                    onClick={() => handleDeleteSavedFood(food._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>{food.calories} kcal</p>
                  <p>Protein: {food.protein}g</p>
                  <p>Carbs: {food.carbs}g</p>
                  <p>Fat: {food.fat}g</p>
                  <p>Serving: {food.servingSize}{food.servingUnit}</p>
                </div>
                <button
                  onClick={() => handleSavedFoodClick(food)}
                  className="mt-3 w-full bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  Add to Today's Meals
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Meals</h3>
          <div className="space-y-4">
            {nutritionData.map((day) => (
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
        </div>
      </div>
    </div>
  );
};

export default Nutrition; 