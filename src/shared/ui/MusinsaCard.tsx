import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { MusinsaStyles } from './musinsa-design-system';

interface MusinsaCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const MusinsaCard = forwardRef<HTMLDivElement, MusinsaCardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    shadow = 'sm',
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'bg-white rounded-lg border border-gray-200 overflow-hidden';
    
    const variantClasses = {
      default: '',
      hover: MusinsaStyles.card.hover,
      interactive: MusinsaStyles.card.interactive,
    };
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };
    
    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          shadowClasses[shadow],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MusinsaCard.displayName = 'MusinsaCard';

// 카드 헤더 컴포넌트
interface MusinsaCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const MusinsaCardHeader = forwardRef<HTMLDivElement, MusinsaCardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        className={cn('flex items-center justify-between mb-4', className)}
        ref={ref}
        {...props}
      >
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
        {children}
      </div>
    );
  }
);

MusinsaCardHeader.displayName = 'MusinsaCardHeader';

// 카드 콘텐츠 컴포넌트
interface MusinsaCardContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MusinsaCardContent = forwardRef<HTMLDivElement, MusinsaCardContentProps>(
  ({ className, padding = 'md', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };
    
    return (
      <div
        className={cn(paddingClasses[padding], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MusinsaCardContent.displayName = 'MusinsaCardContent';

// 카드 푸터 컴포넌트
interface MusinsaCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const MusinsaCardFooter = forwardRef<HTMLDivElement, MusinsaCardFooterProps>(
  ({ className, justify = 'end', children, ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };
    
    return (
      <div
        className={cn('flex items-center gap-2 p-4 border-t border-gray-200', justifyClasses[justify], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MusinsaCardFooter.displayName = 'MusinsaCardFooter';
