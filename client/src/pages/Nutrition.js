import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import API_URL from '../config/api';
import BackButton from '../components/BackButton';

const Nutrition = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(location.state?.showAddForm || false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newNutrition, setNewNutrition] = useState({
    meals: [],
    totalDailyCalories: 0,
    waterIntake: 0,
    notes: ''
  });

  useEffect(() => {
    fetchNutritionData();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  const handleAddMeal = () => {
    setNewNutrition(prev => ({
      ...prev,
      meals: [...prev.meals, {
        type: 'breakfast',
        foods: [],
        totalCalories: 0
      }]
    }));
  };

  const handleAddFood = (mealIndex) => {
    setNewNutrition(prev => ({
      ...prev,
      meals: prev.meals.map((meal, index) =>
        index === mealIndex
          ? {
              ...meal,
              foods: [...meal.foods, { name: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]
            }
          : meal
      )
    }));
  };

  const handleFoodChange = (mealIndex, foodIndex, field, value) => {
    setNewNutrition(prev => ({
      ...prev,
      meals: prev.meals.map((meal, mIndex) =>
        mIndex === mealIndex
          ? {
              ...meal,
              foods: meal.foods.map((food, fIndex) =>
                fIndex === foodIndex
                  ? { ...food, [field]: value }
                  : food
              )
            }
          : meal
      )
    }));
  };

  const calculateMealCalories = (meal) => {
    return meal.foods.reduce((total, food) => total + (food.calories || 0), 0);
  };

  const calculateTotalCalories = () => {
    return newNutrition.meals.reduce((total, meal) => total + calculateMealCalories(meal), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const nutritionToSubmit = {
        ...newNutrition,
        date: new Date().toISOString(),
        totalDailyCalories: calculateTotalCalories(),
        waterIntake: newNutrition.waterIntake // This is now in glasses
      };

      const response = await fetch(`${API_URL}/api/nutrition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(nutritionToSubmit)
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new data at the beginning of the array
        setNutritionData(prev => [data, ...prev]);
        setShowAddForm(false);
        setNewNutrition({
          meals: [],
          totalDailyCalories: 0,
          waterIntake: 0,
          notes: ''
        });
        setSuccessMessage('Nutrition log added successfully!');
      }
    } catch (error) {
      console.error('Error adding nutrition data:', error);
    }
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

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nutrition</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {showAddForm ? 'Cancel' : 'Add Nutrition Log'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-base font-medium text-gray-700">Meals</label>
                  <button
                    type="button"
                    onClick={handleAddMeal}
                    className="text-base text-indigo-600 hover:text-indigo-800"
                  >
                    Add Meal
                  </button>
                </div>
                <div className="mt-4 space-y-6">
                  {newNutrition.meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <select
                          value={meal.type}
                          onChange={(e) => {
                            setNewNutrition(prev => ({
                              ...prev,
                              meals: prev.meals.map((m, index) =>
                                index === mealIndex ? { ...m, type: e.target.value } : m
                              )
                            }));
                          }}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddFood(mealIndex)}
                          className="text-base text-indigo-600 hover:text-indigo-800"
                        >
                          Add Food
                        </button>
                      </div>
                      <div className="space-y-4">
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Food Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Chicken Breast, Brown Rice"
                                value={food.name}
                                onChange={(e) => handleFoodChange(mealIndex, foodIndex, 'name', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Calories
                                  <span className="text-xs text-gray-500 ml-1">(kcal)</span>
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g., 165"
                                  value={food.calories}
                                  onChange={(e) => handleFoodChange(mealIndex, foodIndex, 'calories', parseInt(e.target.value))}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Protein
                                  <span className="text-xs text-gray-500 ml-1">(grams)</span>
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g., 31"
                                  value={food.protein}
                                  onChange={(e) => handleFoodChange(mealIndex, foodIndex, 'protein', parseFloat(e.target.value))}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Carbohydrates
                                  <span className="text-xs text-gray-500 ml-1">(grams)</span>
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g., 0"
                                  value={food.carbs}
                                  onChange={(e) => handleFoodChange(mealIndex, foodIndex, 'carbs', parseFloat(e.target.value))}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Fats
                                  <span className="text-xs text-gray-500 ml-1">(grams)</span>
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g., 3.6"
                                  value={food.fats}
                                  onChange={(e) => handleFoodChange(mealIndex, foodIndex, 'fats', parseFloat(e.target.value))}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Tip: For packaged foods, you can find these values on the nutrition label
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-base text-gray-500">
                        Total calories for this meal: {calculateMealCalories(meal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-700">
                  Water Intake
                  <span className="text-sm text-gray-500 ml-2">(glasses, 1 glass ≈ 250ml)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g., 8 (recommended daily intake)"
                  value={newNutrition.waterIntake}
                  onChange={(e) => setNewNutrition(prev => ({ ...prev, waterIntake: parseFloat(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                />
                <p className="text-xs text-gray-500">
                  Tip: The recommended daily water intake is about 8 glasses (2 liters) for most adults
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-700">
                  Notes
                  <span className="text-sm text-gray-500 ml-2">(optional)</span>
                </label>
                <textarea
                  placeholder="e.g., Felt energetic today, stayed within calorie goals"
                  value={newNutrition.notes}
                  onChange={(e) => setNewNutrition(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                  rows="3"
                />
              </div>

              <div className="text-base text-gray-500">
                Total daily calories: {calculateTotalCalories()}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Nutrition Log
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
                <div className="text-sm text-gray-500">
                  <div>Total calories: {day.totalDailyCalories}</div>
                  <div>Water: {day.waterIntake} glasses ({(day.waterIntake * 250).toFixed(0)} ml)</div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {day.meals.map((meal, index) => (
                  <div key={index} className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 capitalize">{meal.type}</h4>
                    <div className="mt-2 space-y-2">
                      {meal.foods.map((food, foodIndex) => (
                        <div key={foodIndex} className="text-sm text-gray-600">
                          {food.name} - {food.calories} kcal
                          <span className="text-gray-500">
                            (P: {food.protein}g, C: {food.carbs}g, F: {food.fats}g)
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Total: {calculateMealCalories(meal)} kcal
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
      </div>
    </div>
  );
};

export default Nutrition; 