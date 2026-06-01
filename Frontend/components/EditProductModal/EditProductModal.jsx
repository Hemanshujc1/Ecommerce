"use client";
import React, { useState, useEffect } from "react";
import { fetchProductById, updateProduct } from "../../lib/api";
import { getImageUrl } from "../../lib/image.helper";
import {
  Package,
  Layers,
  Plus,
  Trash2,
  Check,
  Upload,
  X,
  Info,
  Sparkles,
  FileText,
  Video,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";

const EditProductModal = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [copyStates, setCopyStates] = useState({}); // track copy state per variant

  const [formData, setFormData] = useState({
    product_name: "",
    brand: "",
    category: "",
    main_category: "",
    short_description: "",
    sections: [],
    variants: [],
  });
  const [newFiles, setNewFiles] = useState({});

  // Word limit helper functions
  const countWords = (text) => {
    if (!text) return 0;
    const clean = text.trim().replace(/\s+/g, " ");
    return clean ? clean.split(" ").length : 0;
  };

  const enforceWordLimit = (value, limit) => {
    const wordCount = countWords(value);
    if (wordCount > limit) {
      const words = value.split(/\s+/);
      return words.slice(0, limit).join(" ");
    }
    return value;
  };

  useEffect(() => {
    loadProductDetails();
  }, [product.id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchProductById(product.id);
      if (response && response.success) {
        const productDetails = response.data;
        setProductData(productDetails);
        setFormData({
          product_name: productDetails.product_name || "",
          brand: productDetails.brand || "",
          category: productDetails.category || "",
          main_category: productDetails.main_category || "",
          short_description: productDetails.short_description || "",
          sections: productDetails.sections || [],
          variants: (productDetails.variants || []).map((v) => ({
            ...v,
            mainImage: v.main_image || v.mainImage || "",
            relatedImages: v.related_images || v.relatedImages || [],
            color: v.color || "",
            price: v.price || 0,
            discount: v.discount || 0,
            features: v.features || "",
            sizes: v.sizes || [],
            coupons: v.coupons || [],
            videos: v.videos || [],
          })),
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
    let finalValue = value;
    if (name === "short_description") {
      finalValue = enforceWordLimit(value, 100);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSectionChange = (index, field, value) => {
    let finalValue = value;
    if (field === "content") {
      finalValue = enforceWordLimit(value, 200);
    }
    const updatedSections = [...formData.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: finalValue,
    };
    setFormData((prev) => ({
      ...prev,
      sections: updatedSections,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    let finalValue = value;
    if (field === "features") {
      finalValue = enforceWordLimit(value, 150);
    }

    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: finalValue,
    };

    // Propagate changes to copies
    if (index === 0) {
      for (let targetIdx = 1; targetIdx < updatedVariants.length; targetIdx++) {
        if (field === "price" || field === "discount") {
          if (copyStates[`${targetIdx}_price_discount`]) {
            updatedVariants[targetIdx][field] = finalValue;
          }
        } else if (field === "features") {
          if (copyStates[`${targetIdx}_features`]) {
            updatedVariants[targetIdx].features = finalValue;
          }
        }
      }
    } else {
      if (field === "price" || field === "discount") {
        setCopyStates((prev) => ({
          ...prev,
          [`${index}_price_discount`]: false,
        }));
      } else if (field === "features") {
        setCopyStates((prev) => ({ ...prev, [`${index}_features`]: false }));
      }
    }

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
    value,
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

    // Propagate changes to copies
    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updatedVariants.length; targetIdx++) {
        if (field === "sizes" && copyStates[`${targetIdx}_sizes`]) {
          updatedVariants[targetIdx].sizes = JSON.parse(
            JSON.stringify(updatedVariants[0].sizes || []),
          );
        } else if (field === "coupons" && copyStates[`${targetIdx}_coupons`]) {
          updatedVariants[targetIdx].coupons = JSON.parse(
            JSON.stringify(updatedVariants[0].coupons || []),
          );
        }
      }
    } else {
      setCopyStates((prev) => ({
        ...prev,
        [`${variantIndex}_${field}`]: false,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const addSection = () => {
    if (formData.sections.length < 5) {
      setFormData((prev) => ({
        ...prev,
        sections: [...prev.sections, { title: "", content: "" }],
      }));
    } else {
      alert("Maximum 5 sections allowed");
    }
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
          price: 0,
          discount: 0,
          features: "",
          mainImage: "",
          sizes: [],
          coupons: [],
          videos: [],
          relatedImages: [],
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length === 1) {
      alert("At least one variant is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    // clean up copy state mapping
    const newCopyStates = {};
    Object.keys(copyStates).forEach((key) => {
      const [vIdx, field] = key.split("_");
      if (parseInt(vIdx) !== index) {
        const adjustedIdx = parseInt(vIdx) > index ? parseInt(vIdx) - 1 : vIdx;
        newCopyStates[`${adjustedIdx}_${field}`] = copyStates[key];
      }
    });
    setCopyStates(newCopyStates);
  };

  const addSize = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    if ((updatedVariants[variantIndex].sizes || []).length >= 5) {
      alert("Maximum 5 sizes allowed per variant.");
      return;
    }
    updatedVariants[variantIndex].sizes = [
      ...(updatedVariants[variantIndex].sizes || []),
      { size: "", stock: 0 },
    ];

    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updatedVariants.length; targetIdx++) {
        if (copyStates[`${targetIdx}_sizes`]) {
          updatedVariants[targetIdx].sizes = JSON.parse(
            JSON.stringify(updatedVariants[0].sizes || []),
          );
        }
      }
    } else {
      setCopyStates((prev) => ({ ...prev, [`${variantIndex}_sizes`]: false }));
    }

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

    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updatedVariants.length; targetIdx++) {
        if (copyStates[`${targetIdx}_sizes`]) {
          updatedVariants[targetIdx].sizes = JSON.parse(
            JSON.stringify(updatedVariants[0].sizes || []),
          );
        }
      }
    } else {
      setCopyStates((prev) => ({ ...prev, [`${variantIndex}_sizes`]: false }));
    }

    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const addCoupon = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    if ((updatedVariants[variantIndex].coupons || []).length >= 2) {
      alert("Maximum 2 coupons allowed per variant.");
      return;
    }
    updatedVariants[variantIndex].coupons = [
      ...(updatedVariants[variantIndex].coupons || []),
      { name: "", discount: 0 },
    ];

    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updatedVariants.length; targetIdx++) {
        if (copyStates[`${targetIdx}_coupons`]) {
          updatedVariants[targetIdx].coupons = JSON.parse(
            JSON.stringify(updatedVariants[0].coupons || []),
          );
        }
      }
    } else {
      setCopyStates((prev) => ({
        ...prev,
        [`${variantIndex}_coupons`]: false,
      }));
    }

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

    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updatedVariants.length; targetIdx++) {
        if (copyStates[`${targetIdx}_coupons`]) {
          updatedVariants[targetIdx].coupons = JSON.parse(
            JSON.stringify(updatedVariants[0].coupons || []),
          );
        }
      }
    } else {
      setCopyStates((prev) => ({
        ...prev,
        [`${variantIndex}_coupons`]: false,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const handleCopyToggle = (vIdx, field, checked) => {
    setCopyStates((prev) => ({ ...prev, [`${vIdx}_${field}`]: checked }));
    if (checked) {
      const updatedVariants = [...formData.variants];
      if (field === "price_discount") {
        updatedVariants[vIdx].price = updatedVariants[0].price;
        updatedVariants[vIdx].discount = updatedVariants[0].discount;
      } else if (field === "sizes") {
        updatedVariants[vIdx].sizes = JSON.parse(
          JSON.stringify(updatedVariants[0].sizes || []),
        );
      } else if (field === "coupons") {
        updatedVariants[vIdx].coupons = JSON.parse(
          JSON.stringify(updatedVariants[0].coupons || []),
        );
      } else if (field === "features") {
        updatedVariants[vIdx].features = updatedVariants[0].features;
      }
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    }
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

  // Helper getters for previews (instantly shows local selected file before submission)
  const getMainImagePreview = (variantIndex, mainImage) => {
    const key = `variant_${variantIndex}_mainImage`;
    if (newFiles[key]) {
      return URL.createObjectURL(newFiles[key]);
    }
    return getImageUrl(mainImage);
  };

  const getRelatedImagePreview = (variantIndex, imageIndex, image) => {
    const key = `variant_${variantIndex}_relatedImage_${imageIndex}`;
    if (newFiles[key]) {
      return URL.createObjectURL(newFiles[key]);
    }
    return getImageUrl(image);
  };

  const getVideoPreview = (variantIndex, videoIndex, video) => {
    const key = `variant_${variantIndex}_video_${videoIndex}`;
    if (newFiles[key]) {
      return URL.createObjectURL(newFiles[key]);
    }
    return getImageUrl(video);
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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-semibold text-sm">
            Loading product details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              Edit Product Info
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify database configurations, variants, and custom sections.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Sticky */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "basic"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sections"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Custom Sections
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variants")}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "variants"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Variants ({formData.variants.length})
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
        >
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Sub Category (Category)
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Main Category
                  </label>
                  <input
                    type="text"
                    name="main_category"
                    value={formData.main_category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Short Description
                  </label>
                  <span
                    className={`text-[10px] font-semibold ${countWords(formData.short_description) >= 100 ? "text-red-500" : "text-slate-400"}`}
                  >
                    {countWords(formData.short_description)} / 100 words
                  </span>
                </div>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition resize-none text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM SECTIONS */}
          {activeTab === "sections" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Custom Tabs & Info Sections
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specifications, warranty info, user guidelines, etc. (Max 5)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                {formData.sections.map((section, index) => (
                  <div
                    key={index}
                    className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                    <div className="space-y-3 pr-8">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Care Instructions"
                          value={section.title || ""}
                          onChange={(e) =>
                            handleSectionChange(index, "title", e.target.value)
                          }
                          className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold transition"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Content
                          </label>
                          <span
                            className={`text-[10px] font-semibold ${countWords(section.content) >= 200 ? "text-red-500" : "text-slate-400"}`}
                          >
                            {countWords(section.content)} / 200 words
                          </span>
                        </div>
                        <textarea
                          placeholder="Write section details here..."
                          value={section.content || ""}
                          onChange={(e) =>
                            handleSectionChange(
                              index,
                              "content",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none text-sm transition resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS */}
          {activeTab === "variants" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Configure Product Variants
                  </h3>
                  <p className="text-xs text-slate-400">
                    Edit price, stock, color styles, size parameters, coupons,
                    and media.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Variant
                </button>
              </div>

              <div className="space-y-6">
                {formData.variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    className="p-6 border border-slate-200/80 rounded-2xl bg-white space-y-6 relative shadow-sm"
                  >
                    {/* Variant Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                        <span className="h-5 w-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">
                          {variantIndex + 1}
                        </span>
                        Variant Options{" "}
                        {variant.color ? `— ${variant.color}` : ""}
                      </h4>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(variantIndex)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Variant
                        </button>
                      )}
                    </div>

                    {/* Copy Control Panel (for variant > 1) */}
                    {variantIndex > 0 && (
                      <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-3">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span>Quick Setup: Copy/Sync from Variant 1</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                            <input
                              type="checkbox"
                              checked={
                                !!copyStates[`${variantIndex}_price_discount`]
                              }
                              onChange={(e) =>
                                handleCopyToggle(
                                  variantIndex,
                                  "price_discount",
                                  e.target.checked,
                                )
                              }
                              className="accent-blue-600 h-4 w-4 rounded"
                            />
                            <span className="text-[10px] font-bold text-slate-700">
                              Price & Discount
                            </span>
                          </label>
                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                            <input
                              type="checkbox"
                              checked={!!copyStates[`${variantIndex}_sizes`]}
                              onChange={(e) =>
                                handleCopyToggle(
                                  variantIndex,
                                  "sizes",
                                  e.target.checked,
                                )
                              }
                              className="accent-blue-600 h-4 w-4 rounded"
                            />
                            <span className="text-[10px] font-bold text-slate-700">
                              Sizes ({(formData.variants[0].sizes || []).length}
                              )
                            </span>
                          </label>
                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                            <input
                              type="checkbox"
                              checked={!!copyStates[`${variantIndex}_coupons`]}
                              onChange={(e) =>
                                handleCopyToggle(
                                  variantIndex,
                                  "coupons",
                                  e.target.checked,
                                )
                              }
                              className="accent-blue-600 h-4 w-4 rounded"
                            />
                            <span className="text-[10px] font-bold text-slate-700">
                              Coupons (
                              {(formData.variants[0].coupons || []).length})
                            </span>
                          </label>
                          <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                            <input
                              type="checkbox"
                              checked={!!copyStates[`${variantIndex}_features`]}
                              onChange={(e) =>
                                handleCopyToggle(
                                  variantIndex,
                                  "features",
                                  e.target.checked,
                                )
                              }
                              className="accent-blue-600 h-4 w-4 rounded"
                            />
                            <span className="text-[10px] font-bold text-slate-700">
                              Features
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Variant Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Color
                        </label>
                        <input
                          type="text"
                          value={variant.color || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "color",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Price (INR)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-slate-400 font-semibold">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price || ""}
                            onChange={(e) =>
                              handleVariantChange(
                                variantIndex,
                                "price",
                                e.target.value,
                              )
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          Discount %
                        </label>
                        <input
                          type="number"
                          value={variant.discount || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "discount",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                        />
                      </div>
                    </div>

                    {/* Sizes (Limit 5) */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">
                            Sizes & Stock
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Maximum 5 sizes allowed per variant
                          </p>
                        </div>
                        {(variant.sizes || []).length < 5 ? (
                          <button
                            type="button"
                            onClick={() => addSize(variantIndex)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 border border-dashed border-blue-200"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Size
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                            <Info className="h-3 w-3" /> Size limit reached
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {(variant.sizes || []).map((size, sizeIndex) => (
                          <div
                            key={sizeIndex}
                            className="flex gap-3 bg-slate-50/50 p-2 rounded-xl border"
                          >
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
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-3 py-2 bg-white rounded-lg border text-sm focus:outline-none"
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
                                  e.target.value,
                                )
                              }
                              className="w-28 px-3 py-2 bg-white rounded-lg border text-sm focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeSize(variantIndex, sizeIndex)
                              }
                              className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coupons (Limit 2) */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">
                            Coupons
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Maximum 2 coupon promo codes per variant
                          </p>
                        </div>
                        {(variant.coupons || []).length < 2 ? (
                          <button
                            type="button"
                            onClick={() => addCoupon(variantIndex)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 border border-dashed border-blue-200"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Coupon
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                            <Info className="h-3 w-3" /> Coupon limit reached
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {(variant.coupons || []).map((coupon, couponIndex) => (
                          <div
                            key={couponIndex}
                            className="flex gap-3 bg-slate-50/50 p-2 rounded-xl border"
                          >
                            <input
                              type="text"
                              placeholder="Coupon Code"
                              value={coupon.name || ""}
                              onChange={(e) =>
                                handleVariantNestedChange(
                                  variantIndex,
                                  "coupons",
                                  couponIndex,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-3 py-2 bg-white rounded-lg border text-sm focus:outline-none"
                            />
                            <div className="relative w-28">
                              <span className="absolute right-3 top-2 text-slate-400 text-xs font-semibold">
                                %
                              </span>
                              <input
                                type="number"
                                placeholder="Discount"
                                value={coupon.discount || ""}
                                onChange={(e) =>
                                  handleVariantNestedChange(
                                    variantIndex,
                                    "coupons",
                                    couponIndex,
                                    "discount",
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-3 pr-8 py-2 bg-white rounded-lg border text-sm focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeCoupon(variantIndex, couponIndex)
                              }
                              className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features description */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Features
                        </label>
                        <span
                          className={`text-[10px] font-semibold ${countWords(variant.features) >= 150 ? "text-red-500" : "text-slate-400"}`}
                        >
                          {countWords(variant.features)} / 150 words
                        </span>
                      </div>
                      <textarea
                        value={variant.features || ""}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "features",
                            e.target.value,
                          )
                        }
                        rows={3}
                        placeholder="Bullets points listing the main variant benefits..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition resize-none text-sm"
                      />
                    </div>

                    {/* Media Files */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h5 className="text-xs font-bold text-slate-800">
                        Media Files
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Image */}
                        <div className="p-4 bg-slate-50/50 rounded-2xl border space-y-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Main Display Image
                          </span>
                          {getMainImagePreview(
                            variantIndex,
                            variant.mainImage,
                          ) ? (
                            <div className="relative h-24 w-24 mx-auto rounded-xl overflow-hidden border shadow-sm bg-white">
                              <img
                                src={getMainImagePreview(
                                  variantIndex,
                                  variant.mainImage,
                                )}
                                alt="Main Preview"
                                className="h-full w-full object-fit"
                              />
                            </div>
                          ) : null}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileChange(
                                variantIndex,
                                "mainImage",
                                undefined,
                                e.target.files[0],
                              )
                            }
                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
                          />
                        </div>

                        {/* Related Images (4 Slots) */}
                        <div className="p-4 bg-slate-50/50 rounded-2xl border space-y-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Related Images (Max 4)
                          </span>

                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {(variant.relatedImages || []).map(
                              (image, imageIndex) => (
                                <div
                                  key={imageIndex}
                                  className="relative h-10 rounded-lg overflow-hidden border bg-white"
                                >
                                  <img
                                    src={getRelatedImagePreview(
                                      variantIndex,
                                      imageIndex,
                                      image,
                                    )}
                                    alt="Related"
                                    className="h-full w-full object-fit"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImage(variantIndex, imageIndex)
                                    }
                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700 transition"
                                  >
                                    <X className="h-2 w-2" />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>

                          <div className="space-y-1.5">
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
                                    e.target.files[0],
                                  )
                                }
                                className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 transition cursor-pointer"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Videos (2 Slots) */}
                        <div className="p-4 bg-slate-50/50 rounded-2xl border space-y-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Product Videos (Max 2)
                          </span>

                          <div className="space-y-2 mb-2 max-h-16 overflow-y-auto pr-1">
                            {(variant.videos || []).map((video, videoIndex) => (
                              <div
                                key={videoIndex}
                                className="flex justify-between items-center bg-white p-1 px-2 rounded-lg border text-[10px] text-slate-600 font-medium"
                              >
                                <span className="truncate max-w-[80%]">
                                  Video {videoIndex + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeVideo(variantIndex, videoIndex)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1.5">
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
                                    e.target.files[0],
                                  )
                                }
                                className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 transition cursor-pointer"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Sticky Footer Actions */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/10 transition disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
