import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { MusinsaStyles } from './musinsa-design-system';

interface MusinsaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const MusinsaButton = forwardRef<HTMLButtonElement, MusinsaButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200';
    
    const variantClasses = {
      primary: MusinsaStyles.button.primary,
      secondary: MusinsaStyles.button.secondary,
      outline: MusinsaStyles.button.outline,
      ghost: MusinsaStyles.button.ghost,
      destructive: MusinsaStyles.button.destructive,
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };
    
    const iconSpacingClasses = {
      sm: 'mr-1.5',
      md: 'mr-2',
      lg: 'mr-2',
    };
    
    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizeClasses[size], iconPosition === 'left' ? 'mr-2' : 'ml-2')} />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className={cn(iconSizeClasses[size], iconSpacingClasses[size])}>
            {icon}
          </span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={cn(iconSizeClasses[size], 'ml-2')}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

MusinsaButton.displayName = 'MusinsaButton';
