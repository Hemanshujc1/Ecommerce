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
        if (cartResponse && cartResponse.success) {
          const cartData = {};
          cartResponse.cart.forEach((item) => {
            cartData[item.productId] = item.quantity;
          });
          setCartQuantities(cartData);
        }

        // Load user's wishlist
        const wishlistResponse = await getUserWishlist(userId);
        if (wishlistResponse && wishlistResponse.success) {
          const wishlistData = {};
          wishlistResponse.wishlist.forEach((item) => {
            wishlistData[item.productId] = true;
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
      if (response && response.success) {
        setProducts(response.products || []);
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

      <div className="px-10">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {currentProducts.map((product) => {
            const id = product.id || product._id;
            const quantity = cartQuantities[id] || 0;
            const inWishlist = wishlist[id] || false;

            const imageUrl =
              product.main_image && typeof product.main_image === "string"
                ? product.main_image.startsWith("http")
                  ? product.main_image
                  : `http://localhost:4001/upload/${product.main_image}`
                : "/placeholder-image.jpg";

            return (
              <div
                key={id}
                className="bg-[whitesmoke] border border-gray-100 rounded-md shadow-md hover:scale-105 transition duration-200"
              >
                <Link href={`/users/Productdisplay/${id}`} className="block">
                  <div className="relative w-full h-[300px] overflow-hidden rounded-t-md">
                    <Image
                      width={500}
                      height={500}
                      src={imageUrl}
                      alt={product.product_name || "Product"}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-5 flex flex-col gap-2 text-black">
                  <Link href={`/users/Productdisplay/${id}`}>
                    <h2 className="text-lg text-gray-700 font-semibold hover:underline cursor-pointer">
                      {(product.product_name || "Product").slice(0, 50)}
                      {product.product_name?.length > 50 ? "..." : ""}
                    </h2>
                  </Link>

                  <p className="text-sm text-gray-700">
                    {product.price
                      ? `₹${product.price}`
                      : "Price not available"}
                  </p>
                  {product.discount && (
                    <p className="text-xs text-green-600">
                      {product.discount}% off
                    </p>
                  )}
                  {product.rating && (
                    <p className="text-xs text-yellow-600">
                      ⭐ {product.rating}/5
                    </p>
                  )}

                  {quantity > 0 ? (
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecreaseQuantity(id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded min-w-[40px] text-center font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
                          disabled={quantity >= (product.total_stock || 0)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(id)}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                        title="Remove from cart"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(id)}
                      className="mt-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-400 transition uppercase text-sm tracking-wide"
                    >
                      Add to Cart
                    </button>
                  )}

                  {/* Wishlist Logic */}
                  <button
                    onClick={() => toggleWishlist(id)}
                    className={`mt-2 px-4 py-2 rounded transition uppercase text-sm tracking-wide ${
                      inWishlist
                        ? "bg-red-500 text-white"
                        : "bg-black text-white hover:bg-gray-400"
                    }`}
                  >
                    {inWishlist ? "❤️ Added to Wishlist" : "Add to Wishlist"}
                  </button>
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
