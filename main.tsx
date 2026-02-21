import React from 'react';
import ReactDOM from 'react-dom/client';
import TestApp from './App.test'; // Use test app first
// import App from './App'; // Comment out original
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
