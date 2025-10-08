"use client";
import React, { useState, useEffect } from "react";

const Page = () => {
  const [landingTitle, setLandingTitle] = useState("");
  const [landingDescription, setLandingDescription] = useState("");
  const [collections, setCollections] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch available products
  const fetchAvailableProducts = async () => {
    try {
      const res = await fetch("http://localhost:4001/products");
      const data = await res.json();
      if (data.success) {
        setAvailableProducts(data.products || []);
        setFilteredProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // Add selected product as collection
  const handleAddSelectedProduct = (product) => {
    if (collections.length >= 10) {
      alert("Maximum 10 collections allowed");
      return;
    }

    // Check if product is already added
    const isAlreadyAdded = collections.some(col => col.productId === product.id);
    if (isAlreadyAdded) {
      alert("This product is already added as a collection!");
      return;
    }

    // Transform product to collection format
    const newCollection = {
      productId: product.id,
      title: product.product_name || "",
      description: product.short_description || `Discover our amazing ${product.product_name} collection`,
      img: product.main_image || "",
      price: product.price || 0,
      discount: product.discount || 0,
    };

    setCollections([...collections, newCollection]);
    setSaveMessage("✅ Product added as collection!");
    setTimeout(() => setSaveMessage(""), 2000);
    setShowProductSelector(null);
  };

  // Remove collection
  const handleRemoveCollection = (index) => {
    const confirmed = window.confirm("Are you sure you want to remove this collection?");
    if (!confirmed) return;

    const updated = collections.filter((_, i) => i !== index);
    setCollections(updated);
    setSaveMessage("✅ Collection removed!");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // Update collection details
  const handleCollectionChange = (index, field, value) => {
    const updated = [...collections];
    updated[index][field] = value;
    setCollections(updated);
  };

  // Open product selector
  const openProductSelector = () => {
    setShowProductSelector(true);
    setFilteredProducts(availableProducts);
  };

  // Close product selector
  const closeProductSelector = () => {
    setShowProductSelector(null);
  };

  const handleSave = async () => {
    try {
      setSaveMessage("Saving changes...");
      
      const res = await fetch("http://localhost:4001/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: landingTitle,
          description: landingDescription,
          collections,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaveMessage("✅ Landing page updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Error saving:", err);
      setSaveMessage("❌ Error saving: " + err.message);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4001/landing");
        const data = await res.json();
        setLandingTitle(data.title || "");
        setLandingDescription(data.description || "");
        setCollections(data.collections || []);
      } catch (err) {
        console.error("Failed to fetch landing page data", err);
      }
    };
    
    fetchData();
    fetchAvailableProducts();
  }, []);
  
  
  

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Landing Page</h1>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <input
          type="text"
          value={landingTitle}
          onChange={(e) => setLandingTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Landing Page Title"
        />
        <textarea
          value={landingDescription}
          onChange={(e) => setLandingDescription(e.target.value)}
          rows={4}
          className="w-full p-2 border rounded"
          placeholder="Landing Description"
        />
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {saveMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Collection Cards ({collections.length}/10)</h2>
          <button
            onClick={openProductSelector}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Product Collection
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
            No collections added yet. Click "Add Product Collection" to select products.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((col, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition"
              >
                {/* Product Image */}
                {col.img && (
                  <div className="w-full h-48 bg-gray-100 rounded overflow-hidden mb-4">
                    <img
                      src={`http://localhost:4001/upload${col.img.startsWith('/') ? '' : '/'}${col.img}`}
                      alt={col.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  {/* Collection Title */}
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) =>
                      handleCollectionChange(index, "title", e.target.value)
                    }
                    placeholder="Collection Title"
                    className="w-full p-2 border rounded"
                  />
                  
                  {/* Collection Description */}
                  <textarea
                    value={col.description}
                    onChange={(e) =>
                      handleCollectionChange(index, "description", e.target.value)
                    }
                    placeholder="Collection Description"
                    rows={3}
                    className="w-full p-2 border rounded"
                  />
                  
                  {/* Price Info */}
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-green-600">
                      ₹{col.price}
                    </div>
                    {col.discount > 0 && (
                      <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {col.discount}% off
                      </span>
                    )}
                  </div>
                  
                  {/* Product ID Reference */}
                  <div className="text-xs text-gray-500">
                    Product ID: {col.productId}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveCollection(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-fit"
                  >
                    Remove Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Save All Changes
      </button>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Select a Product for Collection
              </h3>
              <button
                onClick={closeProductSelector}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered = availableProducts.filter(product =>
                    product.product_name?.toLowerCase().includes(searchTerm) ||
                    product.brand?.toLowerCase().includes(searchTerm)
                  );
                  setFilteredProducts(filtered);
                }}
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {(filteredProducts.length > 0 ? filteredProducts : availableProducts).map((product) => {
                const isAlreadySelected = collections.some(col => col.productId === product.id);
                
                return (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-4 transition ${
                      isAlreadySelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {/* Product Image */}
                    <div className="w-full h-32 bg-gray-100 rounded overflow-hidden mb-3">
                      {product.main_image ? (
                        <img
                          src={`http://localhost:4001/upload${product.main_image.startsWith('/') ? '' : '/'}${product.main_image}`}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                        {product.product_name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{product.price}
                      </p>
                      {product.discount > 0 && (
                        <span className="text-xs text-orange-600">
                          {product.discount}% off
                        </span>
                      )}
                    </div>

                    {/* Add/Selected Button */}
                    <button
                      onClick={() => {
                        if (!isAlreadySelected) {
                          handleAddSelectedProduct(product);
                        }
                      }}
                      disabled={isAlreadySelected}
                      className={`w-full py-2 px-4 rounded text-sm font-medium transition ${
                        isAlreadySelected
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isAlreadySelected ? '✓ Already Added' : 'Add as Collection'}
                    </button>
                  </div>
                );
              })}
            </div>

            {availableProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products available. Please add products first.
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeProductSelector}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
