// API Configuration
const PRODUCTION_URL = 'https://training-diary-backend.onrender.com';
const API_URL = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_URL
  : 'http://localhost:5000';

// Debug logging
console.log('Environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL);

export default API_URL; 