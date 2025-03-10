import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import API_URL from '../config/api';
import BackButton from '../components/BackButton';

// Debug logging
console.log('Environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL);

const Workouts = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(location.state?.showAddForm || false);
  const [newWorkout, setNewWorkout] = useState({
    type: 'gym',
    bodyParts: [],
    duration: 0,
    exercises: [],
    notes: ''
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching workouts from:', `${API_URL}/api/workouts`);
      const response = await fetch(`${API_URL}/api/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      } else {
        console.error('Failed to fetch workouts:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = () => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: 0, reps: 0, weight: 0 }]
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { 
          ...exercise, 
          [field]: field === 'name' ? value : (value === '' ? 0 : Number(value))
        } : exercise
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data before submission
      const workoutToSubmit = {
        ...newWorkout,
        duration: Number(newWorkout.duration) || 0,
        exercises: newWorkout.exercises.map(exercise => ({
          ...exercise,
          sets: Number(exercise.sets) || 0,
          reps: Number(exercise.reps) || 0,
          weight: Number(exercise.weight) || 0
        }))
      };

      const token = localStorage.getItem('token');
      console.log('Submitting workout to:', `${API_URL}/api/workouts`);
      const response = await fetch(`${API_URL}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(workoutToSubmit)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add workout');
      }

      const data = await response.json();
      setWorkouts(prev => [data, ...prev]);
      setShowAddForm(false);
      setNewWorkout({
        type: 'gym',
        bodyParts: [],
        duration: 0,
        exercises: [],
        notes: ''
      });
    } catch (error) {
      console.error('Error adding workout:', error);
      // You might want to show this error to the user in the UI
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
        <h1 className="text-3xl font-bold text-gray-900 ml-4">Workouts</h1>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {showAddForm ? 'Cancel' : 'Add Workout'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                >
                  <option value="gym">Gym</option>
                  <option value="cardio">Cardio</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {newWorkout.type === 'gym' && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Body Parts</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full-body'].map((part) => (
                      <label key={part} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={newWorkout.bodyParts.includes(part)}
                          onChange={(e) => {
                            setNewWorkout(prev => ({
                              ...prev,
                              bodyParts: e.target.checked
                                ? [...prev.bodyParts, part]
                                : prev.bodyParts.filter(p => p !== part)
                            }));
                          }}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-5 w-5"
                        />
                        <span className="ml-2 text-base text-gray-700 capitalize">{part}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-base font-medium text-gray-700">Exercises</label>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="text-base text-indigo-600 hover:text-indigo-800"
                  >
                    Add Exercise
                  </button>
                </div>
                <div className="mt-2 space-y-4">
                  {newWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="number"
                          placeholder="Sets"
                          value={exercise.sets || ''}
                          onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                        />
                        <input
                          type="number"
                          placeholder="Reps"
                          value={exercise.reps || ''}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                        />
                        <input
                          type="number"
                          placeholder="Weight (kg)"
                          value={exercise.weight || ''}
                          onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newWorkout.notes}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Workout
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {workouts.map((workout) => (
            <div key={workout._id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{workout.type}</h3>
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

              {workout.exercises && workout.exercises.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Exercises</h4>
                  <div className="mt-2 space-y-2">
                    {workout.exercises.map((exercise, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {exercise.name} - {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight} kg
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workout.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                  <p className="mt-1 text-sm text-gray-600">{workout.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workouts; 