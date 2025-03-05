import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 500); // Wait for fade out animation to complete
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src={logo}
        alt="App Logo"
        className="w-64 h-64 object-cover rounded-lg shadow-2xl animate-pulse"
      />
    </div>
  );
};

export default SplashScreen; 