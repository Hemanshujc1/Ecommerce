"use client";

import React from 'react';

const UserPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  startIndex,
  endIndex 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-12 mb-8 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm gap-4">
      <div className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
        Showing <span className="text-gray-900">{startIndex + 1}</span> - <span className="text-gray-900">{Math.min(endIndex, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-10 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        >
          Prev
        </button>
        
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="w-8 text-center text-gray-400 font-bold">
                  ...
                </span>
              );
            }
            
            const isCurrentPage = page === currentPage;
            
            // On mobile, hide middle pages if there are too many
            const shouldHideOnMobile = typeof page === 'number' && 
              Math.abs(page - currentPage) > 1 && 
              page !== 1 && 
              page !== totalPages;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`h-10 w-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all active:scale-95 shadow-sm ${
                  isCurrentPage
                    ? 'bg-red-600 text-white border-none'
                    : `bg-white text-gray-600 border border-gray-200 hover:border-red-600 hover:text-red-600 ${shouldHideOnMobile ? 'hidden sm:flex' : 'flex'}`
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-10 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserPagination;