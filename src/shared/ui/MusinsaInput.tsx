import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { MusinsaStyles } from './musinsa-design-system';

interface MusinsaInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  variant?: 'default' | 'search';
}

export const MusinsaInput = forwardRef<HTMLInputElement, MusinsaInputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    clearable = false,
    onClear,
    variant = 'default',
    value,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');
    
    const isPassword = type === 'password';
    const isSearch = variant === 'search';
    const hasValue = internalValue || value;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };
    
    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };
    
    const inputType = isPassword && showPassword ? 'text' : type;
    
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
    
    const stateClasses = error 
      ? MusinsaStyles.input.error
      : success 
      ? MusinsaStyles.input.success
      : MusinsaStyles.input.base;
    
    const iconClasses = {
      left: 'pl-10',
      right: 'pr-10',
      both: 'px-10',
    };
    
    const hasLeftIcon = leftIcon || isSearch;
    const hasRightIcon = rightIcon || isPassword || (clearable && hasValue);
    
    const paddingClasses = cn(
      hasLeftIcon && hasRightIcon ? iconClasses.both :
      hasLeftIcon ? iconClasses.left :
      hasRightIcon ? iconClasses.right :
      ''
    );
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {hasLeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearch ? (
                <Search className="h-4 w-4 text-gray-400" />
              ) : (
                leftIcon
              )}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              baseClasses,
              stateClasses,
              paddingClasses,
              className
            )}
            value={value || internalValue}
            onChange={handleChange}
            ref={ref}
            {...props}
          />
          
          {hasRightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {clearable && hasValue ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {(error || success || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

MusinsaInput.displayName = 'MusinsaInput';
