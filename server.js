const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://gleaming-entremet-2fbfde.netlify.app',
    'https://training-diary.netlify.app'
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/training-diary', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/users', require('./routes/users'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 