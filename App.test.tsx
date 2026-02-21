import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Simple test component
const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test Page</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
};

export default TestApp;
