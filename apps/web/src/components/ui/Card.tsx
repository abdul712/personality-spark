import React from 'react';
import { ViewProps } from 'react-native';
import { View, Text } from '../WebView';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-800 shadow-lg',
        glass: 'glass-effect',
        gradient: 'gradient-primary text-white',
        outline: 'border-2 border-gray-200 dark:border-gray-700',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        true: 'card-hover cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
    },
  }
);

export interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ children, variant, padding, hover, className = '', style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cardVariants({ variant, padding, hover, className })}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <View ref={ref} className={`mb-4 ${className}`} {...props}>
        {children}
      </View>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <Text className={`text-2xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </Text>
  );
};

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return (
    <Text className={`text-gray-600 dark:text-gray-400 mt-2 ${className}`}>
      {children}
    </Text>
  );
};

export interface CardContentProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = React.forwardRef<View, CardContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <View ref={ref} className={className} {...props}>
        {children}
      </View>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <View ref={ref} className={`mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
        {children}
      </View>
    );
  }
);

CardFooter.displayName = 'CardFooter';