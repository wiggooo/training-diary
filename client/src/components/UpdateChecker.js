import React, { useState, useEffect } from 'react';
import { APP_VERSION, UPDATE_CHECK_INTERVAL } from '../config/version';

const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);

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

  const handleUpdate = () => {
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    // Reload the page
    window.location.reload(true);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="text-xs text-gray-500 mb-1 text-right">
        Version {APP_VERSION}
      </div>
      {updateAvailable ? (
        <button
          onClick={handleUpdate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-indigo-700 transition-colors"
        >
          Update Available!
        </button>
      ) : (
        <button
          onClick={checkForUpdates}
          disabled={checking}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md shadow hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Check for Updates'}
        </button>
      )}
    </div>
  );
};

export default UpdateChecker; 