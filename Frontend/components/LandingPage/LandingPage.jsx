"use client";

import React, { useEffect, useState } from "react";
import CollectionCard from "../CollectionCard/CollectionCard";

const LandingPage = () => {
  const [landing, setLanding] = useState({
    title: "",
    description: "",
    collections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:4001/landing");

        if (!res.ok) {
          throw new Error(`Failed to fetch landing data: ${res.status}`);
        }

        const data = await res.json();

        // Process collections to ensure they have the right format
        const processedCollections = (data.collections || []).map(
          (collection) => ({
            ...collection,
            // Ensure image path is correct
            img: collection.img || collection.main_image || "",
            // Ensure title is available
            title: collection.title || collection.product_name || "Collection",
            // Ensure description is available
            description:
              collection.description ||
              collection.short_description ||
              "Explore our collection",
          })
        );

        setLanding({
          ...data,
          collections: processedCollections,
        });
      } catch (err) {
        console.error("Error fetching landing data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col text-center items-center justify-center gap-5 px-6 py-12">
      {loading ? (
        <div className="py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Loading landing page...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-600 text-lg">Failed to load landing page</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="w-[90vw] md:w-[70vw] lg:w-[60vw] m-auto flex flex-col gap-5">
            <h1 className="font-bold text-4xl md:text-5xl lg:text-7xl">
              {landing.title}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl">
              {landing.description}
            </p>
          </div>
          <CollectionCard
            collections={landing.collections || []}
            className="w-screen"
          />
        </>
      )}
    </div>
  );
};

export default LandingPage;
