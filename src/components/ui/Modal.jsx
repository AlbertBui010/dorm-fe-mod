import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className,
  ...props 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div 
          className={cn(
            'inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:p-6',
            sizes[size],
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className, ...props }) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

const ModalContent = ({ children, className, ...props }) => (
  <div className={cn("py-4", className)} {...props}>
    {children}
  </div>
);

const ModalFooter = ({ children, className, ...props }) => (
  <div className={cn("flex items-center justify-end space-x-2 pt-4 border-t", className)} {...props}>
    {children}
  </div>
);

export default Modal;
export { Modal, ModalHeader, ModalContent, ModalFooter };
