import React from 'react';
import { createRoot } from 'react-dom/client';
// import App from './App';
// import App from './SimpleApp'; // Using simple app for testing
import App from './PureReactApp'; // Using pure React for testing
import './styles/globals.css';

// Debug logging
console.log('=== React App Initialization ===');
console.log('index.tsx loaded at:', new Date().toISOString());
console.log('React version:', React.version);
console.log('React available:', !!React);
console.log('ReactDOM.createRoot available:', !!createRoot);
console.log('Document ready state:', document.readyState);

// Mount app function
const mountApp = () => {
  console.log('Attempting to mount app...');
  const rootTag = document.getElementById('root');
  
  if (!rootTag) {
    console.error('ERROR: Root element not found!');
    // Create a fallback message
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>';
    return;
  }

  console.log('Root element found:', rootTag);
  console.log('Root element ID:', rootTag.id);
  console.log('Root element HTML:', rootTag.outerHTML);

  try {
    const root = createRoot(rootTag);
    console.log('Root created successfully');
    
    // Render the app
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('App render called - check if component renders');
  } catch (error) {
    console.error('ERROR rendering app:', error);
    console.error('Error stack:', (error as Error).stack);
    
    // Show error on page
    rootTag.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h2>Error rendering app</h2>
        <pre>${(error as Error).message}</pre>
      </div>
    `;
  }
};

// Ensure DOM is loaded before mounting
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    mountApp();
  });
} else {
  console.log('DOM already loaded, mounting immediately');
  mountApp();
}

// Add debugging info to window
if (typeof window !== 'undefined') {
  (window as any).__REACT_APP_DEBUG__ = {
    React,
    ReactDOM: { createRoot },
    mounted: false,
    error: null
  };
  console.log('Debug info added to window.__REACT_APP_DEBUG__');
}