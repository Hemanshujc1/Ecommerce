"use client";
import React, { useState, useEffect } from "react";
import { fetchProductById, updateProduct } from "../../lib/api";

const EditProductModal = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    product_name: "",
    brand: "",
    category: "",
    main_category: "",
    sub_category: "",
    short_description: "",
    sections: [],
    variants: [],
  });
  const [newFiles, setNewFiles] = useState({});

  useEffect(() => {
    loadProductDetails();
  }, [product.id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchProductById(product.id);
      if (response && response.success) {
        const productDetails = response.product;
        setProductData(productDetails);
        setFormData({
          product_name: productDetails.product_name || "",
          brand: productDetails.brand || "",
          category: productDetails.category || "",
          main_category: productDetails.main_category || "",
          sub_category: productDetails.sub_category || "",
          short_description: productDetails.short_description || "",
          sections: productDetails.sections || [],
          variants: productDetails.variants || [],
        });
      }
    } catch (error) {
      console.error("Error loading product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      sections: updatedSections,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const handleVariantNestedChange = (
    variantIndex,
    field,
    itemIndex,
    subField,
    value
  ) => {
    const updatedVariants = [...formData.variants];
    const updatedItems = [...(updatedVariants[variantIndex][field] || [])];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [subField]: value,
    };
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      [field]: updatedItems,
    };
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "", content: "" }],
    }));
  };

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: "",
          rating: 0,
          ratingCount: 0,
          price: 0,
          discount: 0,
          features: "",
          mainImage: "",
          sizes: [],
          coupons: [],
          relatedImages: [],
          videos: [],
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const addSize = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes = [
      ...(updatedVariants[variantIndex].sizes || []),
      { size: "", stock: 0 },
    ];
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const removeSize = (variantIndex, sizeIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes = updatedVariants[
      variantIndex
    ].sizes.filter((_, i) => i !== sizeIndex);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const addCoupon = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].coupons = [
      ...(updatedVariants[variantIndex].coupons || []),
      { name: "", discount: 0 },
    ];
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const removeCoupon = (variantIndex, couponIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].coupons = updatedVariants[
      variantIndex
    ].coupons.filter((_, i) => i !== couponIndex);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const handleFileChange = (variantIndex, fileType, fileIndex, file) => {
    const fileKey = `variant_${variantIndex}_${fileType}${
      fileIndex !== undefined ? `_${fileIndex}` : ""
    }`;
    setNewFiles((prev) => ({
      ...prev,
      [fileKey]: file,
    }));
  };

  const removeImage = (variantIndex, imageIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].relatedImages = updatedVariants[
      variantIndex
    ].relatedImages.filter((_, i) => i !== imageIndex);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const removeVideo = (variantIndex, videoIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].videos = updatedVariants[
      variantIndex
    ].videos.filter((_, i) => i !== videoIndex);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const submitData = new FormData();

      // Add basic product data
      Object.keys(formData).forEach((key) => {
        if (key !== "sections" && key !== "variants") {
          submitData.append(key, formData[key]);
        }
      });

      // Add sections and variants as JSON
      submitData.append("sections", JSON.stringify(formData.sections));
      submitData.append("variants", JSON.stringify(formData.variants));

      // Add new files
      Object.keys(newFiles).forEach((key) => {
        if (newFiles[key]) {
          submitData.append(key, newFiles[key]);
        }
      });

      await updateProduct(product.id, submitData);
      alert("Product updated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">Loading product details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "basic", label: "Basic Info" },
                { id: "sections", label: "Sections" },
                { id: "variants", label: "Variants" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Product Information Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Category
                    </label>
                    <input
                      type="text"
                      name="main_category"
                      value={formData.main_category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category
                    </label>
                    <input
                      type="text"
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sections Tab */}
            {activeTab === "sections" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Product Sections</h3>
                  <button
                    type="button"
                    onClick={addSection}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Section
                  </button>
                </div>

                {formData.sections.map((section, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-md p-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Section {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={section.title || ""}
                          onChange={(e) =>
                            handleSectionChange(index, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={section.content || ""}
                          onChange={(e) =>
                            handleSectionChange(
                              index,
                              "content",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Variants Tab */}
            {activeTab === "variants" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Product Variants</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Variant
                  </button>
                </div>

                {formData.variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    className="border border-gray-200 rounded-md p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-lg">
                        Variant {variantIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(variantIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove Variant
                      </button>
                    </div>

                    {/* Basic Variant Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={variant.color || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "color",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "price",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          value={variant.discount || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "discount",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={variant.rating || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "rating",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating Count
                        </label>
                        <input
                          type="number"
                          value={variant.ratingCount || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "ratingCount",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Features
                      </label>
                      <textarea
                        value={variant.features || ""}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "features",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Main Image */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Image
                      </label>
                      {variant.mainImage && (
                        <div className="mb-2">
                          <img
                            src={`http://localhost:5000${variant.mainImage}`}
                            alt="Main"
                            className="w-20 h-20 object-cover rounded"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(
                            variantIndex,
                            "mainImage",
                            undefined,
                            e.target.files[0]
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Sizes */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Sizes & Stock
                        </label>
                        <button
                          type="button"
                          onClick={() => addSize(variantIndex)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Add Size
                        </button>
                      </div>
                      {(variant.sizes || []).map((size, sizeIndex) => (
                        <div key={sizeIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Size"
                            value={size.size || ""}
                            onChange={(e) =>
                              handleVariantNestedChange(
                                variantIndex,
                                "sizes",
                                sizeIndex,
                                "size",
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Stock"
                            value={size.stock || ""}
                            onChange={(e) =>
                              handleVariantNestedChange(
                                variantIndex,
                                "sizes",
                                sizeIndex,
                                "stock",
                                e.target.value
                              )
                            }
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSize(variantIndex, sizeIndex)}
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Coupons */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Coupons
                        </label>
                        <button
                          type="button"
                          onClick={() => addCoupon(variantIndex)}
                          className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                        >
                          Add Coupon
                        </button>
                      </div>
                      {(variant.coupons || []).map((coupon, couponIndex) => (
                        <div key={couponIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Coupon Name"
                            value={coupon.name || ""}
                            onChange={(e) =>
                              handleVariantNestedChange(
                                variantIndex,
                                "coupons",
                                couponIndex,
                                "name",
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Discount %"
                            value={coupon.discount || ""}
                            onChange={(e) =>
                              handleVariantNestedChange(
                                variantIndex,
                                "coupons",
                                couponIndex,
                                "discount",
                                e.target.value
                              )
                            }
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeCoupon(variantIndex, couponIndex)
                            }
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Related Images */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Related Images
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {(variant.relatedImages || []).map(
                          (image, imageIndex) => (
                            <div key={imageIndex} className="relative">
                              <img
                                src={`http://localhost:5000${image}`}
                                alt={`Related ${imageIndex}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeImage(variantIndex, imageIndex)
                                }
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={index}
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileChange(
                                variantIndex,
                                "relatedImage",
                                index,
                                e.target.files[0]
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Videos */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Videos
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {(variant.videos || []).map((video, videoIndex) => (
                          <div key={videoIndex} className="relative">
                            <video
                              src={`http://localhost:5000${video}`}
                              className="w-full h-24 object-cover rounded"
                              controls
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeVideo(variantIndex, videoIndex)
                              }
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1].map((index) => (
                          <input
                            key={index}
                            type="file"
                            accept="video/*"
                            onChange={(e) =>
                              handleFileChange(
                                variantIndex,
                                "video",
                                index,
                                e.target.files[0]
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
