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
        const res = await fetch(`${API_BASE_URL}/landing`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        const processedCollections = (data.collections || []).map((c) => ({
          ...c,
          img: c.img || c.main_image || "",
          title: c.title || c.product_name || "Collection",
          description: c.description || c.short_description || "Explore our collection",
        }));
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
    <div className="flex flex-col text-center items-center justify-center gap-6 px-4 sm:px-6 py-10 sm:py-12">
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
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 px-2">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">{landing.title}</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">{landing.description}</p>
          </div>
          <CollectionCard collections={landing.collections || []} className="w-full" />
        </>
      )}
    </div>
  );
};

export default LandingPage;
