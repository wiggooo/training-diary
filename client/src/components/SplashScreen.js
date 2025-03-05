import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Make sure the image is loaded before starting the timer
    const img = new Image();
    img.src = logo;
    
    img.onload = () => {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(onFinish, 500); // Wait for fade out animation to complete
      }, 2000);

      return () => clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src={logo}
        alt="App Logo"
        className="w-64 h-64 object-cover rounded-lg shadow-2xl animate-pulse"
      />
      <div className="mt-8 text-xl font-semibold text-gray-800">
        Training Diary
      </div>
      <div className="mt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  );
};

export default SplashScreen; 