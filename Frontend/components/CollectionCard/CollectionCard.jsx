"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleLeft,
} from "react-icons/fa";
import { getImageUrl } from "../../lib/image.helper";

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
      prev === 0 ? collections.length - VISIBLE_CARDS : prev - 1,
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + VISIBLE_CARDS >= collections.length ? 0 : prev + 1,
    );
  };

  const visibleItems = collections.slice(
    startIndex,
    startIndex + VISIBLE_CARDS,
  );

  const slidesToShow =
    visibleItems.length < VISIBLE_CARDS
      ? [
          ...visibleItems,
          ...collections.slice(0, VISIBLE_CARDS - visibleItems.length),
        ]
      : visibleItems;

  return (
    <div className="relative px-4 sm:px-6 py-5 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full transition-all duration-500">
        {slidesToShow.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start justify-start gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 w-full"
          >
            <Link
              href={
                item.productId
                  ? `/users/Productdisplay/${item.productId}`
                  : "/users/Products"
              }
              className="w-full"
            >
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden cursor-pointer bg-gray-50">
                <Image
                  fill
                  src={getImageUrl(item.img)}
                  alt={item.title || "Collection Image"}
                  loading="lazy"
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                />
              </div>
            </Link>

            <div className="text-left text-black space-y-2 w-full">
              <Link
                href={
                  item.productId
                    ? `/users/Productdisplay/${item.productId}`
                    : "/users/Products"
                }
              >
                <h3 className="text-lg sm:text-xl font-bold uppercase hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">{item.title}</h3>
              </Link>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                {item.description}
              </p>

              {/* Price and Discount */}
              {item.price && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600 text-base sm:text-lg">
                    {typeof item.price === "string"
                      ? item.price
                      : `₹${item.price}`}
                  </span>
                  {item.discount > 0 && (
                    <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium">
                      {Math.round(item.discount)}% off
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Link
                  href={
                    item.productId
                      ? `/users/Productdisplay/${item.productId}`
                      : "/users/Products"
                  }
                >
                  <button className="text-xs sm:text-sm font-bold tracking-wider uppercase bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-sm">
                    DISCOVER NOW
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {collections.length > VISIBLE_CARDS && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-2 md:left-6 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all z-10 active:scale-90"
            aria-label="Previous"
          >
            <span className="text-xl">←</span>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-2 md:right-6 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all z-10 active:scale-90"
            aria-label="Next"
          >
            <span className="text-xl">→</span>
          </button>
        </>
      )}
    </div>
  );
};

export default CollectionCard;
