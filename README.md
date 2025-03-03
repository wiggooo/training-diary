# Training Diary

A modern web application for tracking your workouts and nutrition. Built with React, Node.js, and MongoDB.

## Features

- Track daily workouts with detailed exercise information
- Log nutrition and meals
- View statistics and graphs for your progress
- Responsive design for both desktop and mobile
- User authentication and personal goals

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

## Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   npm run client
   ```

3. Or run both simultaneously:
   ```bash
   npm run dev:full
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Technologies Used

- Frontend:
  - React
  - Tailwind CSS
  - Chart.js for statistics
  - React Router for navigation

- Backend:
  - Node.js
  - Express
  - MongoDB with Mongoose
  - JWT for authentication

## License

MIT 