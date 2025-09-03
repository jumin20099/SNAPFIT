import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { MusinsaStyles } from './musinsa-design-system';

interface MusinsaBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export const MusinsaBadge = forwardRef<HTMLSpanElement, MusinsaBadgeProps>(
  ({ 
    className, 
    variant = 'secondary', 
    size = 'md',
    rounded = true,
    icon,
    removable = false,
    onRemove,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium';
    
    const variantClasses = {
      primary: MusinsaStyles.badge.primary,
      secondary: MusinsaStyles.badge.secondary,
      success: MusinsaStyles.badge.success,
      warning: MusinsaStyles.badge.warning,
      error: MusinsaStyles.badge.error,
      info: MusinsaStyles.badge.info,
    };
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };
    
    const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
    
    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
    };
    
    const iconSpacingClasses = {
      sm: 'mr-1',
      md: 'mr-1.5',
      lg: 'mr-2',
    };
    
    return (
      <span
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          roundedClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <span className={cn(iconSizeClasses[size], iconSpacingClasses[size])}>
            {icon}
          </span>
        )}
        
        {children}
        
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'ml-1.5 inline-flex items-center justify-center rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200',
              iconSizeClasses[size]
            )}
          >
            <svg
              className="w-2 h-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

MusinsaBadge.displayName = 'MusinsaBadge';
