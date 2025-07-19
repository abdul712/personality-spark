// Web-compatible components that properly handle className for React Native Web
import React from 'react';
import { View as RNView, Text as RNText, ScrollView as RNScrollView, ViewProps, TextProps, ScrollViewProps, Platform } from 'react-native';

// Helper to process className for web
const processWebClassName = (className?: string, style?: any) => {
  if (Platform.OS === 'web' && className) {
    // For web, we need to apply the className as a DOM attribute
    return {
      style,
      // @ts-ignore - React Native Web accepts these web-specific props
      className,
    };
  }
  return { style };
};

interface WebViewProps extends ViewProps {
  className?: string;
}

interface WebTextProps extends TextProps {
  className?: string;
}

interface WebScrollViewProps extends ScrollViewProps {
  className?: string;
}

export const View = React.forwardRef<RNView, WebViewProps>(
  ({ className, style, ...props }, ref) => {
    return <RNView ref={ref} {...processWebClassName(className, style)} {...props} />;
  }
);

export const Text = React.forwardRef<RNText, WebTextProps>(
  ({ className, style, ...props }, ref) => {
    return <RNText ref={ref} {...processWebClassName(className, style)} {...props} />;
  }
);

export const ScrollView = React.forwardRef<RNScrollView, WebScrollViewProps>(
  ({ className, style, ...props }, ref) => {
    return <RNScrollView ref={ref} {...processWebClassName(className, style)} {...props} />;
  }
);

View.displayName = 'View';
Text.displayName = 'Text';
ScrollView.displayName = 'ScrollView';