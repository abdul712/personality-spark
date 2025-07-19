import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from './App';
import './styles/globals.css';
import './setupNativeWind';

AppRegistry.registerComponent('PersonalitySpark', () => App);

const rootTag = document.getElementById('root');
if (rootTag) {
  const root = createRoot(rootTag);
  root.render(<App />);
}