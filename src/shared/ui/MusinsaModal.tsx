import { HTMLAttributes, forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { MusinsaStyles } from './musinsa-design-system';

interface MusinsaModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const MusinsaModal = forwardRef<HTMLDivElement, MusinsaModalProps>(
  ({ 
    className,
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    children,
    ...props 
  }, ref) => {
    useEffect(() => {
      if (!isOpen) return;
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, closeOnEscape, onClose]);
    
    if (!isOpen) return null;
    
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };
    
    const modalContent = (
      <div className={MusinsaStyles.modal.overlay}>
        <div
          className={cn(
            MusinsaStyles.modal.content,
            sizeClasses[size],
            className
          )}
          ref={ref}
          {...props}
        >
          {(title || showCloseButton) && (
            <div className={MusinsaStyles.modal.header}>
              <div>
                {title && (
                  <h2 className={MusinsaStyles.modal.title}>{title}</h2>
                )}
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={MusinsaStyles.modal.close}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    );
    
    return createPortal(modalContent, document.body);
  }
);

MusinsaModal.displayName = 'MusinsaModal';

// 모달 헤더 컴포넌트
interface MusinsaModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

export const MusinsaModalHeader = forwardRef<HTMLDivElement, MusinsaModalHeaderProps>(
  ({ className, title, description, onClose, children, ...props }, ref) => {
    return (
      <div
        className={cn(MusinsaStyles.modal.header, className)}
        ref={ref}
        {...props}
      >
        <div>
          {title && (
            <h2 className={MusinsaStyles.modal.title}>{title}</h2>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={MusinsaStyles.modal.close}
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    );
  }
);

MusinsaModalHeader.displayName = 'MusinsaModalHeader';

// 모달 콘텐츠 컴포넌트
interface MusinsaModalContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MusinsaModalContent = forwardRef<HTMLDivElement, MusinsaModalContentProps>(
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

MusinsaModalContent.displayName = 'MusinsaModalContent';

// 모달 푸터 컴포넌트
interface MusinsaModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const MusinsaModalFooter = forwardRef<HTMLDivElement, MusinsaModalFooterProps>(
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

MusinsaModalFooter.displayName = 'MusinsaModalFooter';
