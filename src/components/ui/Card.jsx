import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, title, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
