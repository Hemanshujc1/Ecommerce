"use client";
import React, { useEffect, useState } from "react";
import { fetchAllProducts } from "../../lib/api";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import UserProductFilter from "../UserProductFilter/UserProductFilter";
import UserPagination from "../UserPagination/UserPagination";
import {
  addToWishlist,
  removeFromWishlist,
  addToCart,
  removeFromCart,
  getUserCart,
  getUserWishlist,
  updateCartQuantity,
  trackUserInteraction,
  updateWishlistInteraction,
  updateCartInteraction,
} from "../../lib/api";
import { getUserId, isAuthenticated } from "../../lib/auth";
import { getImageUrl } from "../../lib/image.helper";
import toast from "react-hot-toast";

const DisplayProduct = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartQuantities, setCartQuantities] = useState({});
  const [wishlist, setWishlist] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    loadProducts();
    loadUserData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  useEffect(() => {
    // Update search term from URL params
    const urlSearchTerm = searchParams?.get('search') || '';
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const priceRanges = {
        '0-500': { min: 0, max: 500 },
        '500-1000': { min: 500, max: 1000 },
        '1000-2000': { min: 1000, max: 2000 },
        '2000-5000': { min: 2000, max: 5000 },
        '5000+': { min: 5000, max: Infinity },
      };
      
      const range = priceRanges[priceRange];
      if (range) {
        filtered = filtered.filter(product => {
          const price = parseFloat(product.price) || 0;
          return price >= range.min && price <= range.max;
        });
      }
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'name-asc':
          return (a.product_name || '').localeCompare(b.product_name || '');
        case 'name-desc':
          return (b.product_name || '').localeCompare(a.product_name || '');
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'relevance':
        default:
          // If there's a search term, prioritize products with search term in name
          if (searchTerm) {
            const aRelevance = (a.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
            const bRelevance = (b.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
            return bRelevance - aRelevance;
          }
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Get unique categories and brands for filter dropdowns
  const getUniqueCategories = () => {
    return [...new Set(products.map(product => product.category).filter(Boolean))];
  };

  const getUniqueBrands = () => {
    return [...new Set(products.map(product => product.brand).filter(Boolean))];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange('all');
    setSortBy('relevance');
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadUserData = async () => {
    if (isAuthenticated()) {
      const userId = getUserId();
      try {
        // Load user's cart
        const cartResponse = await getUserCart(userId);
        if (cartResponse && cartResponse.statusCode === 200) {
          const cartData = {};
          const cartList = Array.isArray(cartResponse.data) ? cartResponse.data : [];
          cartList.forEach((item) => {
            cartData[item.productId || item.product_id] = item.quantity;
          });
          setCartQuantities(cartData);
        }

        // Load user's wishlist
        const wishlistResponse = await getUserWishlist(userId);
        if (wishlistResponse && wishlistResponse.statusCode === 200) {
          const wishlistData = {};
          const wishlistList = Array.isArray(wishlistResponse.data) ? wishlistResponse.data : [];
          wishlistList.forEach((item) => {
            wishlistData[item.productId || item.product_id] = true;
          });
          setWishlist(wishlistData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAllProducts();
      if (response && (response.statusCode === 200 || response.data)) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      } else {
        setError("Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Error loading products. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleAddToCart = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to add items to cart");
      return;
    }

    const userId = getUserId();
    const quantity = 1;
    try {
      const response = await addToCart(userId, productId, quantity);
      if (response.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + quantity,
        }));
        
        // Track interaction
        await updateCartInteraction(userId, productId, true);
        
        toast.success("Added to cart!");
      }
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    const userId = getUserId();
    try {
      const response = await removeFromCart(userId, productId);
      if (response.success) {
        setCartQuantities((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
        toast.success("Removed from cart!");
      }
    } catch (err) {
      toast.error("Failed to remove from cart.");
    }
  };

  const handleIncreaseQuantity = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    const product = products.find((p) => (p.id || p._id) === productId);
    const currentQuantity = cartQuantities[productId] || 0;
    const stock = product?.total_stock || 0;

    if (currentQuantity >= stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }

    const userId = getUserId();
    try {
      const response = await addToCart(userId, productId, 1);
      if (response.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1,
        }));
        toast.success("Quantity increased");
      } else {
        toast.error(response.message || "Failed to update cart");
      }
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  const handleDecreaseQuantity = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    const currentQuantity = cartQuantities[productId] || 0;
    if (currentQuantity <= 1) {
      handleRemoveFromCart(productId);
      return;
    }

    const userId = getUserId();
    try {
      const newQuantity = currentQuantity - 1;
      const response = await updateCartQuantity(userId, productId, newQuantity);
      if (response.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: newQuantity,
        }));
        toast.success("Quantity decreased");
      } else {
        toast.error(response.message || "Failed to update cart");
      }
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage wishlist");
      return;
    }

    const userId = getUserId();
    try {
      if (wishlist[productId]) {
        const response = await removeFromWishlist(userId, productId);
        if (response.success) {
          setWishlist((prev) => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
          
          // Track interaction
          await updateWishlistInteraction(userId, productId, false);
          
          toast.success("Removed from wishlist.");
        }
      } else {
        const response = await addToWishlist(userId, productId);
        if (response.success) {
          setWishlist((prev) => ({ ...prev, [productId]: true }));
          
          // Track interaction
          await updateWishlistInteraction(userId, productId, true);
          
          toast.success("Added to wishlist.");
        }
      }
    } catch (err) {
      toast.error("Failed to update wishlist.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="text-lg text-red-600">{error}</div>
          <button
            onClick={loadProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Component */}
      <UserProductFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={getUniqueCategories()}
        brands={getUniqueBrands()}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        onCategoryChange={setSelectedCategory}
        onBrandChange={setSelectedBrand}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={clearFilters}
        totalProducts={products.length}
        filteredProducts={filteredProducts.length}
      />

      <div className="px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {products.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            No products available.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {currentProducts.map((product) => {
                const id = product.id || product._id;
                const quantity = cartQuantities[id] || 0;
                const inWishlist = wishlist[id] || false;

                const imageUrl = getImageUrl(
                  product.main_image || product.mainImage || product.image
                );

                return (
                  <div
                    key={id}
                    className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative"
                  >
                    <Link href={`/users/Productdisplay/${id}`} className="block relative">
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                        <Image
                          fill
                          src={imageUrl}
                          unoptimized
                          alt={product.product_name || product.name || "Product"}
                          className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      {product.discount > 0 && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm z-10">
                          -{Math.round(product.discount)}%
                        </div>
                      )}
                    </Link>
                    
                    <div className="p-5 flex flex-col flex-grow gap-2 text-black mt-1">
                      <div className="min-h-[3rem]">
                        <Link href={`/users/Productdisplay/${id}`}>
                          <h2 className="text-sm sm:text-base font-bold text-gray-800 hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                            {product.product_name || product.name || "Product"}
                          </h2>
                        </Link>
                        <p className="text-xs text-gray-400 mt-1.5 uppercase tracking-wider font-semibold">
                          {product.brand || "Brand"}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-2 mt-auto">
                        <span className="text-lg sm:text-xl font-extrabold text-red-600">
                          ₹{product.price}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                        {quantity > 0 ? (
                          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 border">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDecreaseQuantity(id)}
                                className="w-8 h-8 flex items-center justify-center bg-white border text-gray-600 rounded-md hover:bg-gray-100 transition shadow-sm font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-800">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(id)}
                                className="w-8 h-8 flex items-center justify-center bg-white border text-gray-600 rounded-md hover:bg-gray-100 transition shadow-sm font-bold"
                                disabled={quantity >= (product.total_stock || 0)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(id)}
                              className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 border rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                              title="Remove"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(id)}
                            className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition-all font-bold text-xs uppercase tracking-wider active:scale-[0.98] shadow-sm"
                          >
                            Add to Cart
                          </button>
                        )}

                        <button
                          onClick={() => toggleWishlist(id)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            inWishlist
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {inWishlist ? "❤️ Saved" : "♡ Save to Wishlist"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DisplayProduct;
