// Web-specific style utilities for React Native Web
// This provides a workaround for className support

import React from 'react';
import { Platform } from 'react-native';

// Enable className support for web platform
export function enableWebStyles() {
  if (Platform.OS === 'web') {
    // Patch React Native Web components to support className
    const rnwModules = require('react-native-web/dist/index');
    
    // List of components that need className support
    const componentsToPath = ['View', 'Text', 'ScrollView', 'TouchableOpacity'];
    
    componentsToPath.forEach(componentName => {
      const OriginalComponent = rnwModules[componentName];
      if (OriginalComponent) {
        const PatchedComponent = React.forwardRef((props: any, ref: any) => {
          const { className, style, ...rest } = props;
          
          // For web, apply className directly
          if (className) {
            return React.createElement(OriginalComponent, {
              ...rest,
              style,
              className,
              ref
            });
          }
          
          return React.createElement(OriginalComponent, {
            ...rest,
            style,
            ref
          });
        });
        
        PatchedComponent.displayName = componentName;
        
        // Replace the export
        rnwModules[componentName] = PatchedComponent;
      }
    });
  }
}

// Call this in your app initialization
enableWebStyles();