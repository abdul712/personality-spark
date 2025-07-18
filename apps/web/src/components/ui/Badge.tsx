import React from 'react';
import { View, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
        secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-300',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
        error: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
        outline: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant, 
  size, 
  className = '',
  icon 
}) => {
  return (
    <View className={badgeVariants({ variant, size, className })}>
      {icon && <View className="mr-1">{icon}</View>}
      <Text className="font-medium">{children}</Text>
    </View>
  );
};