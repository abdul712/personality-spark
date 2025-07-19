// Setup NativeWind for React Native Web
import { Platform } from 'react-native';

// For React Native Web, we need to ensure className prop works
if (Platform.OS === 'web') {
  // Import the CSS
  require('./styles/globals.css');
}

// Export a no-op for now
export default {};