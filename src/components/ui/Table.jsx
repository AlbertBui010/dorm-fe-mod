import React from 'react';
import { cn } from '../../utils/cn';

const Table = ({ 
  columns, 
  data, 
  className, 
  loading, 
  emptyMessage,
  ...props 
}) => {
  if (loading) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">{emptyMessage || 'Không có dữ liệu'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)} {...props}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title || column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? 
                    column.render(row[column.key], row) : 
                    (row[column.key] ?? 'N/A')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
