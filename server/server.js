const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth');
const workoutsRouter = require('./routes/workouts');
const workoutPlansRouter = require('./routes/workoutPlans');
const nutritionRouter = require('./routes/nutrition');
const savedFoodsRouter = require('./routes/savedFoods');

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://wiggos-workout-tracker.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/workout-plans', workoutPlansRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/saved-foods', savedFoodsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler - return JSON for all routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 