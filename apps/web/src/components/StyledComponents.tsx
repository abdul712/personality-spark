import React from 'react';
import { View as RNView, Text as RNText, ScrollView as RNScrollView, ViewProps, TextProps, ScrollViewProps } from 'react-native';

// Temporary solution for className support on React Native Web
// This maps Tailwind classes to inline styles for critical classes

const mapClassName = (className?: string): any => {
  if (!className) return {};
  
  const styles: any = {};
  const classes = className.split(' ').filter(Boolean);
  
  classes.forEach(cls => {
    // Background colors
    if (cls === 'bg-white') styles.backgroundColor = '#ffffff';
    else if (cls === 'bg-gray-900' || cls === 'dark:bg-gray-900') styles.backgroundColor = '#111827';
    else if (cls === 'bg-purple-500/30') styles.backgroundColor = 'rgba(168, 85, 247, 0.3)';
    else if (cls === 'bg-pink-500/20') styles.backgroundColor = 'rgba(236, 72, 153, 0.2)';
    else if (cls === 'bg-blue-500/20') styles.backgroundColor = 'rgba(59, 130, 246, 0.2)';
    
    // Layout
    else if (cls === 'flex-1') styles.flex = 1;
    else if (cls === 'relative') styles.position = 'relative';
    else if (cls === 'absolute') styles.position = 'absolute';
    else if (cls === 'inset-0') {
      styles.position = 'absolute';
      styles.top = 0;
      styles.left = 0;
      styles.right = 0;
      styles.bottom = 0;
    }
    
    // Positioning
    else if (cls === 'top-0') styles.top = 0;
    else if (cls === 'left-0') styles.left = 0;
    else if (cls === 'right-0') styles.right = 0;
    else if (cls === 'bottom-0') styles.bottom = 0;
    else if (cls === 'top-20') styles.top = 80;
    else if (cls === 'left-1/2') styles.left = '50%';
    
    // Sizing
    else if (cls === 'w-96') styles.width = 384;
    else if (cls === 'h-96') styles.height = 384;
    else if (cls === 'w-80') styles.width = 320;
    else if (cls === 'h-80') styles.height = 320;
    else if (cls === 'w-full') styles.width = '100%';
    else if (cls === 'h-full') styles.height = '100%';
    
    // Overflow
    else if (cls === 'overflow-hidden') styles.overflow = 'hidden';
    
    // Border radius
    else if (cls === 'rounded-full') styles.borderRadius = 9999;
    else if (cls === 'rounded-lg') styles.borderRadius = 8;
    
    // Effects (approximate)
    else if (cls === 'blur-3xl') {
      // React Native doesn't support blur directly, we'll use opacity
      styles.opacity = 0.3;
    }
    
    // Pointer events
    else if (cls === 'pointer-events-none') styles.pointerEvents = 'none';
    
    // Padding/Margin
    else if (cls === 'px-6') { styles.paddingHorizontal = 24; }
    else if (cls === 'py-16') { styles.paddingVertical = 64; }
    else if (cls === 'py-24') { styles.paddingVertical = 96; }
    else if (cls === 'mb-12') { styles.marginBottom = 48; }
    else if (cls === 'mb-6') { styles.marginBottom = 24; }
    else if (cls === 'ml-1') { styles.marginLeft = 4; }
    
    // Text
    else if (cls === 'text-center') styles.textAlign = 'center';
    else if (cls === 'text-purple-600') styles.color = '#9333ea';
    else if (cls === 'text-purple-400') styles.color = '#c084fc';
    else if (cls === 'font-semibold') styles.fontWeight = '600';
    else if (cls === 'font-bold') styles.fontWeight = 'bold';
    else if (cls === 'text-5xl') styles.fontSize = 48;
    else if (cls === 'text-7xl') styles.fontSize = 72;
    
    // Flexbox
    else if (cls === 'inline-flex') {
      styles.display = 'flex';
      styles.flexDirection = 'row';
    }
    else if (cls === 'items-center') styles.alignItems = 'center';
    else if (cls === 'justify-center') styles.justifyContent = 'center';
    
    // Max width
    else if (cls === 'max-w-6xl') styles.maxWidth = 1152;
    else if (cls === 'mx-auto') {
      styles.marginHorizontal = 'auto';
    }
  });
  
  return styles;
};

interface StyledViewProps extends ViewProps {
  className?: string;
}

interface StyledTextProps extends TextProps {
  className?: string;
}

interface StyledScrollViewProps extends ScrollViewProps {
  className?: string;
}

export const View: React.FC<StyledViewProps> = ({ className, style, ...props }) => {
  const mappedStyles = mapClassName(className);
  return <RNView style={[mappedStyles, style]} {...props} />;
};

export const Text: React.FC<StyledTextProps> = ({ className, style, ...props }) => {
  const mappedStyles = mapClassName(className);
  return <RNText style={[mappedStyles, style]} {...props} />;
};

export const ScrollView: React.FC<StyledScrollViewProps> = ({ className, style, ...props }) => {
  const mappedStyles = mapClassName(className);
  return <RNScrollView style={[mappedStyles, style]} {...props} />;
};