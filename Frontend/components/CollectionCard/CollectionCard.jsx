"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleLeft,
} from "react-icons/fa";

const CollectionCard = ({ collections = [] }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const VISIBLE_CARDS = 3;

  useEffect(() => {
    // Set loading to false after collections are loaded
    setIsLoading(false);
    
    // Reset startIndex when collections change
    setStartIndex(0);
  }, [collections]);

  if (isLoading && (!collections || collections.length === 0)) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading collections...</p>
      </div>
    );
  }

  if (!Array.isArray(collections) || collections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg font-medium">No collections available.</p>
        <p className="text-sm mt-2">Check back soon for new collections!</p>
      </div>
    );
  }

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev === 0 ? collections.length - VISIBLE_CARDS : prev - 1
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + VISIBLE_CARDS >= collections.length ? 0 : prev + 1
    );
  };

  const visibleItems = collections.slice(
    startIndex,
    startIndex + VISIBLE_CARDS
  );

  const slidesToShow =
    visibleItems.length < VISIBLE_CARDS
      ? [
          ...visibleItems,
          ...collections.slice(0, VISIBLE_CARDS - visibleItems.length),
        ]
      : visibleItems;

  return (
    <div className="relative px-6 py-5 w-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full px-10 transition-all duration-500">
        {slidesToShow.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start justify-start gap-4 h-[70vh]"
          >
            <div className="relative w-full h-[85%] rounded-2xl overflow-hidden shadow-md hover:scale-[0.98] transition-transform duration-300">
              <Image
                width={300}
                height={200}
                src={`http://localhost:4001/upload${item.img?.startsWith('/') ? '' : '/'}${item.img}`}
                alt={item.title || "Collection Image"}
                loading="lazy"
                className="object-cover w-full h-full"
              />
            </div>

            <div className="text-left text-black space-y-2">
              <h3 className="text-xl font-semibold uppercase">{item.title}</h3>
              <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
              
              {/* Price and Discount */}
              {item.price && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{typeof item.price === 'string' ? item.price : `₹${item.price}`}</span>
                  {item.discount > 0 && (
                    <span className="text-sm text-red-600">({item.discount}% off)</span>
                  )}
                </div>
              )}
              
              <Link href={item.productId ? `/users/Products/${item.productId}` : "/users/Products"}>
                <button className="text-sm font-semibold hover:underline hover:scale-105 hover:opacity-80 transition">
                  DISCOVER NOW
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-800 hover:text-blue-600 text-4xl z-10"
        aria-label="Previous"
      >
        <FaRegArrowAltCircleLeft />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-800 hover:text-blue-600 text-4xl z-10"
        aria-label="Next"
      >
        <FaRegArrowAltCircleRight />
      </button>
    </div>
  );
};

export default CollectionCard;
