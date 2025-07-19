import React from 'react';
import { createRoot } from 'react-dom/client';
import PureReactApp from './PureReactApp';
import './styles/globals.css';

console.log('Pure React index loading...');

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PureReactApp />);
  console.log('Pure React app mounted');
} else {
  console.error('No root container found');
}