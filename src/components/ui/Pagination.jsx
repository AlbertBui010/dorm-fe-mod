import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Current active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback function when page changes
 * @param {string} className - Additional CSS classes
 * @param {boolean} showInfo - Show page info (default: true)
 * @param {boolean} showQuickJump - Show quick jump to first/last page (default: true)
 * @param {number} maxButtons - Maximum number of page buttons to show (default: 5)
 * 
 * @example
 * // Basic usage
 * <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
 * 
 * @example
 * // With custom options
 * <Pagination 
 *   currentPage={currentPage} 
 *   totalPages={totalPages} 
 *   onPageChange={handlePageChange}
 *   className="border-t-2"
 *   showInfo={false}
 *   maxButtons={3}
 * />
 * 
 * @example
 * // Standalone usage for card grids, lists, etc.
 * const [currentPage, setCurrentPage] = useState(1);
 * const itemsPerPage = 10;
 * const totalPages = Math.ceil(data.length / itemsPerPage);
 * const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 */

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className,
  showInfo = true,
  showQuickJump = true,
  maxButtons = 5
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = Math.min(maxButtons, totalPages);
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= Math.ceil(maxVisible / 2)) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      for (let i = currentPage - half; i <= currentPage + half; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    onPageChange(1);
  };

  const handleLast = () => {
    onPageChange(totalPages);
  };

  return (
    <div className={cn("bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6", className)}>
      {/* Mobile view */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {showInfo && (
          <div>
            <p className="text-sm text-gray-700">
              Trang <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
            </p>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          {/* Quick jump buttons */}
          {showQuickJump && currentPage > 3 && (
            <>
              <button
                onClick={handleFirst}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md"
              >
                1
              </button>
              {currentPage > 4 && (
                <span className="text-gray-500 px-2">...</span>
              )}
            </>
          )}

          {/* Navigation */}
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pageNumber === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </nav>

          {/* Quick jump to end */}
          {showQuickJump && currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="text-gray-500 px-2">...</span>
              )}
              <button
                onClick={handleLast}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
