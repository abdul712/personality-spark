import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple test component
const TestApp = () => {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>React is working!</h1>
      <p>If you can see this, React has mounted successfully.</p>
    </div>
  );
};

// Mount the app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<TestApp />);
  console.log('Test app mounted successfully');
} else {
  console.error('Could not find root element');
}