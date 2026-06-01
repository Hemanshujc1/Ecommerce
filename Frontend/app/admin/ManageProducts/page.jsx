"use client";
import React, { useState, useEffect } from "react";
import { fetchAllProducts, deleteProduct } from "@/lib/api";
import EditProductModal from "../../../components/EditProductModal/EditProductModal";
import Image from "next/image";
import { getImageUrl } from "@/lib/image.helper";
import Link from "next/link";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag
} from "lucide-react";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, filterCategory, filterBrand, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchAllProducts();
      if (response && (response.success || response.data)) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Brand filter
    if (filterBrand) {
      filtered = filtered.filter(product => product.brand === filterBrand);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Get unique categories and brands for filter dropdowns
  const getUniqueValues = (key) => {
    return [...new Set(products.map(product => product[key]).filter(Boolean))];
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        loadProducts(); // Reload products after deletion
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    loadProducts(); // Reload products after edit
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterBrand("");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-slate-500 font-semibold text-sm">Loading product catalog...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-600" />
              Manage Products
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View, edit, search, filter, and delete active inventory items.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Volume</span>
              <span className="text-sm font-extrabold text-slate-700">{products.length} Products</span>
            </div>
            <Link
              href="/admin/AddProducts"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-1.5 transition text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search and Filters Hub */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <SlidersHorizontal className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Search & Filter Hub</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search name, brand, desc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-sm text-slate-800 transition"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-sm text-slate-700 bg-white transition"
              >
                <option value="">All Categories</option>
                {getUniqueValues('category').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-sm text-slate-700 bg-white transition"
              >
                <option value="">All Brands</option>
                {getUniqueValues('brand').map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-sm text-slate-700 bg-white transition"
              >
                <option value="created_at">Date Created</option>
                <option value="product_name">Product Name</option>
                <option value="brand">Brand</option>
                <option value="category">Category</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 border border-slate-200 hover:bg-slate-50 rounded-xl transition text-slate-500"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              Clear Filters
            </button>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </div>

        {/* Empty State */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <Package className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Products Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              There are no products listed matching your current query parameters or database files.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative"
                >
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-3.5 right-3.5 flex gap-2 z-10">
                    <button
                      onClick={() => handleEdit(product)}
                      title="Edit Product"
                      className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-2 rounded-xl shadow-md border border-slate-100 transition duration-200"
                    >
                      <Edit className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      title="Delete Product"
                      className="bg-white hover:bg-red-600 hover:text-white text-red-600 p-2 rounded-xl shadow-md border border-slate-100 transition duration-200"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Thumbnail Image Container */}
                  <div className="relative w-full h-48 bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
                    <Image 
                      src={getImageUrl(product.variants?.[0]?.main_image || product.image)} 
                      alt={product.product_name} 
                      fill 
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* Discount Badge */}
                    {product.variants?.[0]?.discount > 0 && (
                      <div className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                        <Tag className="h-3 w-3" />
                        -{product.variants[0].discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {product.brand && (
                          <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            {product.brand}
                          </span>
                        )}
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          {product.category || product.main_category}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.product_name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.short_description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                      {product.variants?.[0]?.price && (
                        <span className="text-sm font-black text-slate-800">
                          ₹{parseFloat(product.variants[0].price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs text-slate-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    const showPage = page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2);
                    
                    if (!showPage) {
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="px-2 text-slate-400">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                            : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default ManageProducts;
