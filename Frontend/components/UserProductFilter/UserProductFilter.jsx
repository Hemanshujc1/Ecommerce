"use client";

import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';

const UserProductFilter = ({
  searchTerm,
  onSearchChange,
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  onCategoryChange,
  onBrandChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  onClearFilters,
  totalProducts,
  filteredProducts
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' },
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices', min: 0, max: Infinity },
    { value: '0-500', label: 'Under ₹500', min: 0, max: 500 },
    { value: '500-1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
    { value: '1000-2000', label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
    { value: '2000-5000', label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
    { value: '5000+', label: 'Above ₹5,000', min: 5000, max: Infinity },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 lg:top-[80px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        {/* Mobile Search Bar */}
        <div className="relative mb-3 sm:mb-4 lg:hidden">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Toggle and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium shadow-sm active:scale-95"
            >
              <FaFilter className="w-3 h-3" />
              <span>Filters</span>
              <FaChevronDown
                className={`w-3 h-3 transition-transform duration-300 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className="text-xs sm:text-sm text-gray-500 font-medium ml-1">
              <span className="text-gray-900">{filteredProducts}</span> /{" "}
              {totalProducts} products
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium text-gray-700 min-w-[140px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory || selectedBrand || priceRange !== "all") && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">
              Active:
            </span>
            {selectedCategory && (
              <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
                {selectedCategory}
                <button
                  onClick={() => onCategoryChange("")}
                  className="hover:bg-red-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {selectedBrand && (
              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
                {selectedBrand}
                <button
                  onClick={() => onBrandChange("")}
                  className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {priceRange !== "all" && (
              <span className="bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
                {priceRange}
                <button
                  onClick={() => onPriceRangeChange("all")}
                  className="hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={onClearFilters}
              className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase underline ml-auto py-1"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => onBrandChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => onPriceRangeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProductFilter;