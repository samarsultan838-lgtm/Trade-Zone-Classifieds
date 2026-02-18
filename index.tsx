import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Dynamic Google Maps Loader
const loadGoogleMaps = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Google Maps API Key not detected in environment.");
    return;
  }
  
  if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  loadGoogleMaps();
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical error during application mount:", error);
}