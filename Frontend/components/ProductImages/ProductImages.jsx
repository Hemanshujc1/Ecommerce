"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const ProductImages = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Update selected image when product image changes (variant change)
  useEffect(() => {
    setSelectedImage(product.image);
    setImageError(false);
    setRetryCount(0);
  }, [product.image]);

  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src);
    setImageError(true);

    // Try alternative URL construction if first attempt fails
    if (retryCount === 0 && e.target.src.includes("/upload/")) {
      setRetryCount(1);
      const altUrl = e.target.src.replace("/upload/", "/");
      console.log("Trying alternative URL:", altUrl);
      e.target.src = altUrl;
      return;
    }

    // Fallback to placeholder
    e.target.src = "/images/product-placeholder.jpg";
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md mx-auto lg:mx-0">
      <div className="relative w-full aspect-square sm:aspect-[4/5] md:aspect-square bg-gray-50 rounded-xl overflow-hidden border">
        {imageError && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded z-10">
            Image loading failed
          </div>
        )}
        <Image
          src={selectedImage || "/images/product-placeholder.jpg"}
          alt={product.name || "Product"}
          fill
          unoptimized
          className="object-contain"
          onError={handleImageError}
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {product.relatedImages &&
          product.relatedImages.length > 0 &&
          product.relatedImages.map((img, index) => (
            <div
              key={index}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                selectedImage === img
                  ? "border-red-500 shadow-sm"
                  : "border-gray-100 hover:border-gray-300"
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img || "/images/product-placeholder.jpg"}
                alt={`Thumbnail ${index}`}
                fill
                unoptimized
                className="object-fit"
                onError={(e) => {
                  e.target.src = "/images/product-placeholder.jpg";
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProductImages;
