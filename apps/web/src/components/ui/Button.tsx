import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-press',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-600',
        outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        link: 'text-primary-600 underline-offset-4 hover:underline',
        gradient: 'gradient-primary text-white hover:opacity-90',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps extends TouchableOpacityProps, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  ({ 
    children, 
    variant, 
    size, 
    fullWidth,
    loading = false,
    icon,
    iconPosition = 'left',
    className = '',
    disabled,
    style,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <TouchableOpacity
        ref={ref}
        disabled={isDisabled}
        className={buttonVariants({ variant, size, fullWidth, className })}
        style={style}
        {...props}
      >
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'}
              className="mr-2"
            />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <View className="mr-2">{icon}</View>
              )}
              <Text className={`
                font-medium
                ${variant === 'outline' || variant === 'ghost' || variant === 'link' 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-white'
                }
                ${size === 'sm' && 'text-sm'}
                ${size === 'md' && 'text-base'}
                ${size === 'lg' && 'text-lg'}
                ${size === 'xl' && 'text-xl'}
              `}>
                {children}
              </Text>
              {icon && iconPosition === 'right' && (
                <View className="ml-2">{icon}</View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';