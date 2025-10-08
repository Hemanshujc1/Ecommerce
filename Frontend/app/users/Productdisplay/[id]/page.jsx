"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// API functions
import {
  fetchProductById,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  addToWishlist,
  removeFromWishlist,
  getUserCart,
  getUserWishlist,
} from "@/lib/api";

// Components
import ProductImages from "@/components/ProductImages/ProductImages";
import ProductDetailHeader from "@/components/ProductDetailHeader/ProductDetailHeader";
import ProductCard from "@/components/ProductCard/ProductCard";
import NewsLetter from "@/components/NewsLetter/NewsLetter";
import BlogPost from "@/components/BlogPost/BlogPost";

// Auth
import { getUserId, isAuthenticated } from "@/lib/auth";

// Utilities
import toast from "react-hot-toast";

const ProductDisplayPage = () => {
  const { id: productId } = useParams();

  // Product & UI States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedSections, setRelatedSections] = useState([]);

  const [wishlist, setWishlist] = useState({});
  const [cartQuantities, setCartQuantities] = useState({});
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);

  /**
   * Load product details from API
   */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await fetchProductById(productId);

        if (!res?.success || !res.product) {
          throw new Error("Product not found");
        }

        const prod = res.product;
        const defaultVariant = prod.variants?.[0];

        const transformed = {
          id: prod.id,
          name: prod.product_name,
          brand: prod.brand || "Brand",
          rating: defaultVariant?.rating || 4,
          ratingsCount: defaultVariant?.rating_count || 0,
          originalPrice: parseFloat(defaultVariant?.price || 0),
          discountPercent: parseFloat(defaultVariant?.discount || 0),

          image: getImageUrl(defaultVariant?.main_image),
          relatedImages: getRelatedImages(defaultVariant),
          shortDescription:
            prod.short_description || "No description available",
          colorOptions: prod.variants?.map((v) => v.color) || [],
          sizeOptions: defaultVariant?.sizes?.map((s) => s.size) || [],
          selectedSize: defaultVariant?.sizes?.[0]?.size || "One Size",

          allVariants: prod.variants || [],
          allSections: prod.sections || [],
        };

        setProduct(transformed);
        setSelectedColor(transformed.colorOptions[0]);
        setSelectedSize(transformed.sizeOptions[0]);
      } catch (err) {
        console.error(err);
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) loadProduct();
  }, [productId]);

  // Load user data: cart and wishlist
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated()) return;

      const userId = getUserId();

      try {
        const [cartRes, wishRes] = await Promise.all([
          getUserCart(userId),
          getUserWishlist(userId),
        ]);

        if (cartRes?.success) {
          const cartMap = {};
          cartRes.cart.forEach((item) => {
            cartMap[item.productId] = item.quantity;
          });
          setCartQuantities(cartMap);
        }

        if (wishRes?.success) {
          const wishMap = {};
          wishRes.wishlist.forEach((item) => {
            wishMap[item.productId] = true;
          });
          setWishlist(wishMap);
        }
      } catch (err) {
        console.error("User data load failed:", err);
      }
    };

    loadUserData();
  }, [productId, product]);

  // Load related sections (optional)
  useEffect(() => {
    const fetchRelatedSections = async () => {
      try {
        const res = await fetch("http://localhost:4001/home-products");
        const data = await res.json();

        const transformed = (data.sections || []).map((section) => ({
          title: section.sectionTitle,
          items: section.products,
        }));

        setRelatedSections(transformed);
      } catch (err) {
        console.error("Failed loading related products:", err);
      }
    };

    fetchRelatedSections();
  }, []);

  // Update stock and available sizes when color/size changes
  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const stock = getCurrentStock();
      setCurrentStock(stock);
    }
  }, [product, selectedColor, selectedSize]);

  // Utilities to process image URLs
  const getImageUrl = (path) => {
    if (!path) return "/images/product-placeholder.jpg";
    return path.startsWith("http")
      ? path
      : `http://localhost:4001/upload${path}`;
  };

  const getRelatedImages = (variant) => {
    const related = [];
    if (variant?.main_image) related.push(getImageUrl(variant.main_image));
    if (variant?.relatedImages?.length) {
      variant.relatedImages.forEach((img) => related.push(getImageUrl(img)));
    }
    return related.length > 0 ? related : ["/images/product-placeholder.jpg"];
  };

  // Get current stock based on selected color and size
  const getCurrentStock = () => {
    if (!product || !selectedColor || !selectedSize) return 0;

    const currentVariant = product.allVariants.find(
      (v) => v.color === selectedColor
    );
    if (!currentVariant || !currentVariant.sizes) return 0;

    const currentSizeData = currentVariant.sizes.find(
      (s) => s.size === selectedSize
    );
    return currentSizeData ? currentSizeData.stock : 0;
  };

  // Get available sizes for selected color
  const getAvailableSizes = () => {
    if (!product || !selectedColor) return [];

    const currentVariant = product.allVariants.find(
      (v) => v.color === selectedColor
    );
    return currentVariant?.sizes?.map((s) => s.size) || [];
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to add to cart");
      return;
    }

    const userId = getUserId();

    try {
      const res = await addToCart(userId, product.id, quantity);
      if (res.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [product.id]: (prev[product.id] || 0) + quantity,
        }));
        toast.success("Item added to cart");
      }
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleRemoveFromCart = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    const userId = getUserId();

    try {
      const res = await removeFromCart(userId, product.id);
      if (res.success) {
        setCartQuantities((prev) => {
          const updated = { ...prev };
          delete updated[product.id];
          return updated;
        });
        toast.success("Removed from cart");
      }
    } catch (err) {
      toast.error("Failed to remove from cart");
    }
  };

  const handleIncreaseQuantity = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    const userId = getUserId();

    try {
      const res = await addToCart(userId, product.id, 1);
      if (res.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [product.id]: (prev[product.id] || 0) + 1,
        }));
        toast.success("Quantity increased");
      }
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  const handleDecreaseQuantity = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to manage cart");
      return;
    }

    const userId = getUserId();
    const currentQuantity = cartQuantities[product.id] || 0;

    if (currentQuantity <= 1) {
      handleRemoveFromCart();
      return;
    }

    try {
      const res = await updateCartQuantity(
        userId,
        product.id,
        currentQuantity - 1
      );
      if (res.success) {
        setCartQuantities((prev) => ({
          ...prev,
          [product.id]: currentQuantity - 1,
        }));
        toast.success("Quantity decreased");
      }
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to use wishlist");
      return;
    }

    const userId = getUserId();

    try {
      if (wishlist[product.id]) {
        const res = await removeFromWishlist(userId, product.id);
        if (res.success) {
          setWishlist((prev) => {
            const updated = { ...prev };
            delete updated[product.id];
            return updated;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist(userId, product.id);
        if (res.success) {
          setWishlist((prev) => ({ ...prev, [product.id]: true }));
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      toast.error("Wishlist action failed");
    }
  };

  const calculateFinalPrice = (price, discount, coupon = 0) => {
    const discounted = price - (price * discount) / 100;
    const afterCoupon = discounted - (discounted * coupon) / 100;
    return Math.max(0, afterCoupon);
  };

  useEffect(() => {
    if (product) {
      const couponDiscount = selectedCoupon?.discount || 0;
      const final = calculateFinalPrice(
        product.originalPrice,
        product.discountPercent,
        couponDiscount
      );
      setFinalPrice(final);
    }
  }, [product, selectedCoupon]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin border-b-2 h-14 w-14 border-red-600 rounded-full" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p>{error}</p>
      </div>
    );

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-sm breadcrumbs">
        <ul className="flex gap-2 text-gray-500">
          <li>
            <a href="/users/Products" className="hover:text-red-600">
              Products
            </a>
          </li>
          <li className="before:content-['/'] before:mx-2">{product.brand}</li>
          <li className="before:content-['/'] before:mx-2 text-red-600">
            {product.name}
          </li>
        </ul>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images and videos */}
        <div className="space-y-6">
          <ProductImages product={product} />

          {/* Product Videos - Show if available */}
          {product.allVariants &&
            product.allVariants.some(
              (v) =>
                v.color === selectedColor && v.videos && v.videos.length > 0
            ) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">🎥 Product Videos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {product.allVariants
                    .find((v) => v.color === selectedColor)
                    ?.videos.map((videoPath, index) => {
                      const videoUrl = videoPath.startsWith("http")
                        ? videoPath
                        : `http://localhost:4001/upload${videoPath}`;
                      return (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden border shadow-sm"
                        >
                          <video
                            controls
                            className="w-full h-auto max-h-96"
                            poster={product.image}
                            preload="metadata"
                          >
                            <source src={videoUrl} type="video/mp4" />
                            <source src={videoUrl} type="video/webm" />
                            <source src={videoUrl} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
        </div>

        {/* Info & Actions */}
        <div className="space-y-6">
          <ProductDetailHeader product={product} />

          {/* Short Description */}
          {product.shortDescription && (
            <div>
              <p className="text-gray-700 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="space-y-4">
            {/* Price Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-red-600">
                  ₹{(parseFloat(finalPrice) || 0).toFixed(2)}
                </span>
                {(parseFloat(product.discountPercent) || 0) > 0 && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{(parseFloat(product.originalPrice) || 0).toFixed(2)}
                  </span>
                )}
                {((parseFloat(product.discountPercent) || 0) > 0 ||
                  selectedCoupon) && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                    {Math.round(
                      (parseFloat(product.discountPercent) || 0) +
                        (selectedCoupon
                          ? parseFloat(selectedCoupon.discount) || 0
                          : 0)
                    )}
                    % OFF
                  </span>
                )}
              </div>

              {/* Savings breakdown */}
              {((parseFloat(product.discountPercent) || 0) > 0 ||
                selectedCoupon) && (
                <div className="text-sm text-gray-600 space-y-1 bg-white p-3 rounded border-l-4 border-green-500">
                  <div className="font-medium text-green-700 mb-2">
                    💰 Your Savings Breakdown:
                  </div>
                  {(parseFloat(product.discountPercent) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>
                        Product Discount (
                        {(parseFloat(product.discountPercent) || 0).toFixed(1)}
                        %):
                      </span>
                      <span className="text-green-600 font-medium">
                        -₹
                        {(
                          ((parseFloat(product.originalPrice) || 0) *
                            (parseFloat(product.discountPercent) || 0)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedCoupon && (
                    <div className="flex justify-between">
                      <span>
                        Coupon Discount ({selectedCoupon.name} -{" "}
                        {(parseFloat(selectedCoupon.discount) || 0).toFixed(1)}
                        %):
                      </span>
                      <span className="text-green-600 font-medium">
                        -₹
                        {(
                          (((parseFloat(product.originalPrice) || 0) -
                            ((parseFloat(product.originalPrice) || 0) *
                              (parseFloat(product.discountPercent) || 0)) /
                              100) *
                            (parseFloat(selectedCoupon.discount) || 0)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                    <span>Total Savings:</span>
                    <span>
                      ₹
                      {(
                        (parseFloat(product.originalPrice) || 0) -
                        (parseFloat(finalPrice) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Display available coupons if any */}
            {product.allVariants &&
              product.allVariants.find((v) => v.color === selectedColor)
                ?.coupons &&
              product.allVariants.find((v) => v.color === selectedColor)
                ?.coupons.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
                    🎟️ Available Coupons (Choose one to save more):
                  </h4>
                  <div className="space-y-3">
                    {/* Option to remove coupon */}
                    <label className="flex items-center cursor-pointer p-2 rounded hover:bg-white/50 transition-colors">
                      <input
                        type="radio"
                        name="coupon"
                        checked={!selectedCoupon}
                        onChange={() => setSelectedCoupon(null)}
                        className="mr-3 w-4 h-4 text-red-600"
                      />
                      <span className="text-sm font-medium">
                        No coupon applied
                      </span>
                    </label>

                    {/* Coupon options */}
                    {product.allVariants
                      .find((v) => v.color === selectedColor)
                      ?.coupons.map((coupon, idx) => (
                        <label
                          key={idx}
                          className="flex items-center cursor-pointer p-2 rounded hover:bg-white/50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="coupon"
                            checked={selectedCoupon?.name === coupon.name}
                            onChange={() => setSelectedCoupon(coupon)}
                            className="mr-3 w-4 h-4 text-red-600"
                          />
                          <div className="flex items-center gap-2">
                            <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                              {coupon.name}
                            </span>
                            <span className="text-sm font-medium">
                              Save {coupon.discount}% extra
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              (₹
                              {(
                                (((parseFloat(product.originalPrice) || 0) -
                                  ((parseFloat(product.originalPrice) || 0) *
                                    (parseFloat(product.discountPercent) ||
                                      0)) /
                                    100) *
                                  (parseFloat(coupon.discount) || 0)) /
                                100
                              ).toFixed(2)}{" "}
                              off)
                            </span>
                          </div>
                        </label>
                      ))}
                  </div>
                  {selectedCoupon && (
                    <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                      ✅ <strong>{selectedCoupon.name}</strong> coupon applied!
                      You're saving an extra ₹
                      {(
                        (((parseFloat(product.originalPrice) || 0) -
                          ((parseFloat(product.originalPrice) || 0) *
                            (parseFloat(product.discountPercent) || 0)) /
                            100) *
                          (parseFloat(selectedCoupon.discount) || 0)) /
                        100
                      ).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {currentStock > 0 ? (
              <div>
                <p className="text-green-600 font-medium flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  In Stock ({currentStock} available)
                </p>
                {currentStock < 10 && (
                  <p className="text-orange-500 text-sm mt-1">
                    Only {currentStock} left - order soon!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-red-600 font-medium flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Out of Stock
              </p>
            )}
          </div>

          {/* Color Options */}
          <div>
            <h4 className="font-medium text-sm mb-1">Color</h4>
            <div className="flex gap-2">
              {product.colorOptions.map((color) => (
                <button
                  key={color}
                  className={`px-3 py-1 border rounded ${
                    selectedColor === color
                      ? "bg-red-100 border-red-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedColor(color);
                    // Update available sizes and reset selected size
                    const availableSizes =
                      product.allVariants
                        .find((v) => v.color === color)
                        ?.sizes?.map((s) => s.size) || [];
                    if (availableSizes.length > 0) {
                      setSelectedSize(availableSizes[0]);
                    }
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Options */}
          <div>
            <h4 className="font-medium text-sm mb-1">Size</h4>
            <div className="flex gap-2 flex-wrap">
              {getAvailableSizes().map((size) => {
                const sizeStock =
                  product.allVariants
                    .find((v) => v.color === selectedColor)
                    ?.sizes?.find((s) => s.size === size)?.stock || 0;

                return (
                  <button
                    key={size}
                    className={`px-3 py-1 border rounded relative ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : sizeStock === 0
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => sizeStock > 0 && setSelectedSize(size)}
                    disabled={sizeStock === 0}
                  >
                    {size}
                    {sizeStock === 0 && (
                      <span className="absolute -top-1 -right-1 text-xs text-red-500">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex flex-col gap-3">
            {/* Show quantity selector only when not in cart */}
            {!cartQuantities[product.id] && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity:</span>
                <button
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                >
                  -
                </button>
                <div className="px-4 py-1 border rounded min-w-[50px] text-center">
                  {quantity}
                </div>
                <button
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                  onClick={() =>
                    quantity < currentStock && setQuantity((q) => q + 1)
                  }
                >
                  +
                </button>
                <span className="text-sm text-gray-600">
                  ({currentStock} in stock)
                </span>
              </div>
            )}

            {/* Cart Button or Quantity Controls */}
            {cartQuantities[product.id] > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">In Cart:</span>
                <button
                  onClick={handleDecreaseQuantity}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-bold"
                >
                  -
                </button>
                <span className="font-semibold text-lg px-3">
                  {cartQuantities[product.id]}
                </span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-bold"
                >
                  +
                </button>
                <button
                  onClick={handleRemoveFromCart}
                  className="ml-auto px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
                >
                  Remove All
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0}
                className={`w-full py-3 rounded font-medium transition ${
                  currentStock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            )}

            <button
              onClick={handleAddToWishlist}
              className="w-full border border-red-500 text-red-600 rounded py-2 hover:bg-red-50 transition"
            >
              {wishlist[product.id]
                ? "♥ Remove from Wishlist"
                : "♡ Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Product Sections */}
      {product && product.allSections && product.allSections.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Product Details</h2>
          <div className="space-y-8">
            {product.allSections.map((section, index) => (
              <div
                key={section.id || index}
                className="bg-white border rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {section.title ||
                    section.section_title ||
                    `Section ${index + 1}`}
                </h3>

                {/* Section Description - Multiple field names support */}
                {section.content && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                )}

                {/* Fallback for other description fields */}
                {!section.content &&
                  (section.description ||
                    section.section_description ||
                    section.section_content) && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {section.description ||
                          section.section_description ||
                          section.section_content}
                      </p>
                    </div>
                  )}

                {/* Section Images - Multiple field names support */}
                {(() => {
                  const images =
                    section.images ||
                    section.section_images ||
                    section.image ||
                    section.section_image ||
                    [];

                  // Handle single image as string
                  const imageArray = Array.isArray(images)
                    ? images
                    : images
                    ? [images]
                    : [];

                  return (
                    imageArray.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {imageArray.map((imagePath, imgIndex) => {
                          const imageUrl = imagePath.startsWith("http")
                            ? imagePath
                            : `http://localhost:4001/upload${imagePath}`;
                          return (
                            <div
                              key={imgIndex}
                              className="rounded-lg overflow-hidden border"
                            >
                              <img
                                src={imageUrl}
                                alt={`${
                                  section.title || section.section_title
                                } - Image ${imgIndex + 1}`}
                                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedSections.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedSections[0]?.items?.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* Enhancements */}
      <div className="mt-16">
        <BlogPost />
        <NewsLetter />
      </div>
    </div>
  );
};

export default ProductDisplayPage;
