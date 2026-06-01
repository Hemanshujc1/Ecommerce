"use client";

import React, { useEffect, useState } from "react";
import CollectionCard from "../CollectionCard/CollectionCard";
import { API_BASE_URL } from "@/lib/api.config";

const LandingPage = () => {
  const [landing, setLanding] = useState({ title: "", description: "", collections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/landing?t=${Date.now()}`, {
          cache: "no-store"
        });
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        const processedCollections = (data.collections || []).map((c) => {
          let imagePath = c.img || c.main_image || "";
          // If it's just a filename (no slash), it's likely a collection image that needs the prefix
          if (imagePath && !imagePath.includes("/") && !imagePath.startsWith("http")) {
            imagePath = `collection/${imagePath}`;
          }
          return {
            ...c,
            img: imagePath,
            title: c.title || c.product_name || "Collection",
            description: c.description || c.short_description || "Explore our collection",
          };
        });
        setLanding({ ...data, collections: processedCollections });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col text-center items-center justify-center gap-6 px-4 sm:px-6 py-6 sm:py-8">
      {loading ? (
        <div className="py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-600">Failed to load landing page</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Try Again</button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 px-4 py-6">
            <h1 className="font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-gray-900 bg-gradient-to-r from-gray-900 via-gray-850 to-indigo-955 bg-clip-text text-transparent uppercase">
              {landing.title}
            </h1>
            <p className="text-sm sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {landing.description}
            </p>
          </div>
          <CollectionCard collections={landing.collections || []} className="w-full" />
        </>
      )}
    </div>
  );
};

export default LandingPage;
