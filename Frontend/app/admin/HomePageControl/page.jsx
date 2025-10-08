"use client";

import React, { useState, useEffect } from "react";

const page = () => {
  const [sections, setSections] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(null); // {sectionIndex: number}

  // Save API
  const saveSections = async (updatedSections, showMessage = true) => {
    try {
      const res = await fetch("http://localhost:4001/home-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      });

      if (!res.ok) throw new Error("Save failed");

      if (showMessage) {
        setSaveMessage("✅ All changes saved!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error saving:", err.message);
      setSaveMessage("❌ Failed to save changes!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // Add new section
  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      sectionTitle: "New Section",
      products: [],
    };
    const updated = [...sections, newSection];
    setSections(updated);
    setSaveMessage("✅ Added New Section!");
    setTimeout(() => setSaveMessage(""), 3000);
    saveSections(updated, false); // auto-save, no second toast
  };

  // Section title update
  const handleSectionTitleChange = (index, value) => {
    const updated = [...sections];
    updated[index].sectionTitle = value;
    setSections(updated);
  };

  // Add selected product to section
  const handleAddSelectedProduct = (sectionIndex, product) => {
    const updated = [...sections];
    if (updated[sectionIndex].products.length < 10) {
      // Transform database product to section product format
      const sectionProduct = {
        id: product.id,
        img: product.main_image || "",
        productname: product.product_name || "",
        price: product.price ? `₹${product.price}` : "",
        discount: product.discount || 0,
        rating: product.rating || 0,
      };
      
      // Check if product is already in this section
      const isAlreadyAdded = updated[sectionIndex].products.some(p => p.id === product.id);
      if (!isAlreadyAdded) {
        updated[sectionIndex].products.push(sectionProduct);
        setSections(updated);
        setSaveMessage("✅ Product added to section!");
        setTimeout(() => setSaveMessage(""), 2000);
      } else {
        alert("This product is already in this section!");
      }
    } else {
      alert("You can only add up to 10 products per section.");
    }
  };

  // Remove product from section
  const handleRemoveProduct = (sectionIndex, productIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this product from the section?"
    );
    if (!confirmed) return;

    const updated = [...sections];
    updated[sectionIndex].products.splice(productIndex, 1);
    setSections(updated);
    saveSections(updated);
  };

  // Open product selector
  const openProductSelector = (sectionIndex) => {
    setShowProductSelector({ sectionIndex });
    setFilteredProducts(availableProducts); // Reset filter when opening
  };

  // Close product selector
  const closeProductSelector = () => {
    setShowProductSelector(null);
  };

  // Delete section
  const handleDeleteSection = (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this section?"
    );
    if (!confirmed) return;

    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
    saveSections(updated);
  };

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

  // Initial load
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch("http://localhost:4001/home-products");
        const data = await res.json();
        const parsed =
          typeof data.sections === "string"
            ? JSON.parse(data.sections)
            : Array.isArray(data.sections)
            ? data.sections
            : [];
        setSections(parsed);
      } catch (err) {
        console.error("Failed to fetch product sections", err);
      }
    };
    
    fetchSections();
    fetchAvailableProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Homepage Content Management</h1>

      {/* Confirmation Message */}
      {saveMessage && (
        <div className="mb-4 p-3 text-green-900 rounded">
          {saveMessage}
        </div>
      )}

      <div className="flex gap-3">
        {/* Add Section Button */}
        <button
          onClick={handleAddSection}
          className="mb-6 bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
        >
          + Add New Section
        </button>
        {/* Save All Changes Button */}
        <button
          onClick={() => saveSections(sections)}
          className="mb-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Save All Changes
        </button>
      </div>

      {/* Sections */}
      {sections.map((section, sIndex) => (
        <div
          key={section.id || sIndex}
          className="bg-white p-6 rounded-xl shadow space-y-4 mb-10"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Section {sIndex + 1}: Product Showcase
            </h2>
            <button
              onClick={() => handleDeleteSection(sIndex)}
              className="bg-red-600 text-white text-sm px-4 py-1 rounded hover:bg-red-700"
            >
              Delete Section
            </button>
          </div>

          <input
            type="text"
            value={section.sectionTitle}
            onChange={(e) => handleSectionTitleChange(sIndex, e.target.value)}
            placeholder="Section Title"
            className="w-full p-2 border rounded"
          />

          {/* Selected Products Display */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Selected Products ({section.products.length}/10)
              </h3>
              <button
                onClick={() => openProductSelector(sIndex)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                + Select Products
              </button>
            </div>

            {section.products.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
                No products selected. Click "Select Products" to add products to this section.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.products.map((product, pIndex) => (
                  <div
                    key={pIndex}
                    className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Product Image */}
                      {product.img && (
                        <div className="w-full h-32 bg-white rounded overflow-hidden">
                          <img
                            src={`http://localhost:4001/upload${product.img.startsWith('/') ? '' : '/'}${product.img}`}
                            alt={product.productname}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 line-clamp-2">
                          {product.productname}
                        </h4>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {product.price}
                        </p>
                        {product.discount > 0 && (
                          <span className="text-sm text-orange-600">
                            {product.discount}% off
                          </span>
                        )}
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm text-gray-600">{product.rating}/5</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveProduct(sIndex, pIndex)}
                        className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Select Products for Section {showProductSelector.sectionIndex + 1}
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
                const isAlreadySelected = sections[showProductSelector.sectionIndex]?.products.some(p => p.id === product.id);
                
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
                          handleAddSelectedProduct(showProductSelector.sectionIndex, product);
                        }
                      }}
                      disabled={isAlreadySelected}
                      className={`w-full py-2 px-4 rounded text-sm font-medium transition ${
                        isAlreadySelected
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isAlreadySelected ? '✓ Selected' : 'Add to Section'}
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

export default page;
