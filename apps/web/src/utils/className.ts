// Helper to handle className prop for React Native Web
// This ensures Tailwind classes work properly

import { Platform } from 'react-native';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// For React Native Web, we need to ensure the className prop is properly handled
export function webClassName(className?: string) {
  if (Platform.OS === 'web' && className) {
    return { className };
  }
  return {};
}

// Create a higher-order component that adds web className support
export function withWebClassName<T extends { className?: string }>(Component: React.ComponentType<T>) {
  return (props: T) => {
    if (Platform.OS === 'web' && props.className) {
      // For web, pass through the className
      return Component(props);
    }
    // For native, remove className to avoid warnings
    const { className, ...restProps } = props;
    return Component(restProps as T);
  };
}