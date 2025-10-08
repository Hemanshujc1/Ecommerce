"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const ProductImages = ({product}) => {
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
    console.log('Image failed to load:', e.target.src);
    setImageError(true);
    
    // Try alternative URL construction if first attempt fails
    if (retryCount === 0 && e.target.src.includes('/upload/')) {
      setRetryCount(1);
      const altUrl = e.target.src.replace('/upload/', '/');
      console.log('Trying alternative URL:', altUrl);
      e.target.src = altUrl;
      return;
    }
    
    // Fallback to placeholder
    e.target.src = "/images/product-placeholder.jpg";
  };
    
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        {imageError && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded z-10">
            Image loading failed
          </div>
        )}
        <Image
          src={selectedImage || "/images/product-placeholder.jpg"}
          alt={product.name || "Product"}
          width={500}
          height={500}
          className="rounded-xl border w-full h-auto"
          onError={handleImageError}
          priority
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {product.relatedImages && product.relatedImages.length > 0 && product.relatedImages.map((img, index) => (
          <Image
            key={index}
            src={img || "/images/product-placeholder.jpg"}
            alt={`Thumbnail ${index}`}
            width={80}
            height={80}
            className={`cursor-pointer border rounded flex-shrink-0 ${
              selectedImage === img ? "border-red-500 border-2" : "border-gray-300"
            }`}
            onClick={() => setSelectedImage(img)}
            onError={(e) => {
              console.log('Thumbnail failed to load:', e.target.src);
              e.target.src = "/images/product-placeholder.jpg";
            }}
          />
        ))}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          <div>Selected: {selectedImage}</div>
          <div>Available: {product.relatedImages?.length || 0} images</div>
        </div>
      )}
    </div>
  );
};

export default ProductImages;
