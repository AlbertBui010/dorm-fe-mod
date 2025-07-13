import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, title, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {title && (
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        </div>
      )}
      <div className={title ? "px-6 pb-6" : ""}>
        {children}
      </div>
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn('p-6 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent };
export default Card;
