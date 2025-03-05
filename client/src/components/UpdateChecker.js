import React, { useState, useEffect } from 'react';
import { APP_VERSION, UPDATE_CHECK_INTERVAL } from '../config/version';

const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [oldVersion, setOldVersion] = useState(null);

  const checkForUpdates = async () => {
    setChecking(true);
    try {
      // Clear cache to get fresh manifest
      const cache = await caches.open('app-cache');
      await cache.delete('/manifest.json');
      
      // Fetch fresh manifest
      const manifestResponse = await fetch('/manifest.json');
      const manifest = await manifestResponse.json();
      
      // Compare versions
      if (manifest.version && manifest.version !== APP_VERSION) {
        setOldVersion(APP_VERSION);
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  // Check for updates periodically
  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    // Clear all caches
    if ('caches' in window) {
      await caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)));
      });
    }
    setShowSuccess(true);
    setTimeout(() => {
      // Reload the page
      window.location.reload(true);
    }, 1500); // Give time to show success message
  };

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const isMobile = window.innerWidth < 768;

  return (
    <>
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-lg z-50">
          Update successful! Reloading...
        </div>
      )}
      <div className={`flex items-center justify-end space-x-2 text-sm ${!isMobile && 'fixed bottom-24 right-4 z-50'}`}>
        <span className="text-gray-500">
          v{APP_VERSION}
        </span>
        {updateAvailable ? (
          <button
            onClick={handleUpdate}
            className={`${isMobile ? 'text-indigo-600 hover:text-indigo-800 font-medium' : 'bg-indigo-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-indigo-700 transition-colors'}`}
          >
            Update to v{oldVersion}!
          </button>
        ) : (
          <button
            onClick={checkForUpdates}
            disabled={checking}
            className={`${isMobile ? 'text-gray-500 hover:text-gray-700 disabled:opacity-50' : 'bg-gray-100 text-gray-600 px-4 py-2 rounded-md shadow hover:bg-gray-200 transition-colors disabled:opacity-50'}`}
          >
            {checking ? 'Checking...' : 'Check for Updates'}
          </button>
        )}
      </div>
    </>
  );
};

export default UpdateChecker; 