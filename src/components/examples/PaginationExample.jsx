import React, { useState } from 'react';
import Card from '../ui/Card';
import Pagination from '../ui/Pagination';

/**
 * Example component demonstrating standalone Pagination usage
 * This shows how to use Pagination component outside of Table component
 */
const PaginationExample = () => {
  // Sample data
  const sampleData = Array.from({ length: 87 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
    category: ['Category A', 'Category B', 'Category C'][i % 3],
    status: ['Active', 'Inactive', 'Pending'][i % 3]
  }));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(sampleData.length / itemsPerPage);

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sampleData.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Pagination Example - Card Grid
        </h2>
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, sampleData.length)} of {sampleData.length} items
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentData.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {item.category}
                </span>
                <span className={`px-2 py-1 rounded ${
                  item.status === 'Active' ? 'bg-green-100 text-green-800' :
                  item.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Standalone Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="border-t border-gray-200"
      />
    </div>
  );
};

/**
 * Example component for list-style pagination
 */
export const PaginationListExample = () => {
  const sampleItems = Array.from({ length: 156 }, (_, i) => ({
    id: i + 1,
    title: `List Item ${i + 1}`,
    subtitle: `Subtitle for item ${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('vi-VN')
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sampleItems.length / itemsPerPage);

  const currentItems = sampleItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">List with Pagination</h3>
      
      {/* List Items */}
      <div className="space-y-3 mb-4">
        {currentItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div>
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.subtitle}</p>
            </div>
            <div className="text-sm text-gray-500">
              {item.timestamp}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination with custom options */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showInfo={true}
        showQuickJump={true}
        maxButtons={7}
      />
    </Card>
  );
};

export default PaginationExample;
