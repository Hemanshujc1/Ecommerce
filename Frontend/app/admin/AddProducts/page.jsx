"use client";
import React, { useState } from "react";
import { API_BASE_URL } from "@/lib/api.config";
import { 
  Package, 
  Layers, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  X, 
  ChevronRight, 
  Info, 
  Sparkles,
  Percent,
  Coins,
  ChevronLeft,
  FileText
} from "lucide-react";

const AddProductPage = () => {
  const [currentTab, setCurrentTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copyStates, setCopyStates] = useState({}); // tracking copy checkbox status per variant

  // Word limit helper functions
  const countWords = (text) => {
    if (!text) return 0;
    const clean = text.trim().replace(/\s+/g, ' ');
    return clean ? clean.split(' ').length : 0;
  };

  const enforceWordLimit = (value, limit) => {
    const wordCount = countWords(value);
    if (wordCount > limit) {
      const words = value.split(/\s+/);
      return words.slice(0, limit).join(" ");
    }
    return value;
  };

  // step 1 state
  const [generalData, setGeneralData] = useState({
    product_name: "",
    brand: "",
    category: "",
    main_category: "",
    short_description: "",
  });
  const [sections, setSections] = useState([{ title: "", content: "" }]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "short_description") {
      finalValue = enforceWordLimit(value, 100);
    }
    setGeneralData((prev) => ({
      ...prev,
      [name]: ["category", "main_category"].includes(name)
        ? finalValue.toLowerCase()
        : finalValue,
    }));
  };

  const handleSectionChange = (index, field, value) => {
    let finalValue = value;
    if (field === "content") {
      finalValue = enforceWordLimit(value, 200);
    }
    const updated = [...sections];
    updated[index][field] = finalValue;
    setSections(updated);
  };

  const addSection = () => {
    if (sections.length < 5) {
      setSections([...sections, { title: "", content: "" }]);
    } else {
      alert("Maximum 5 sections allowed.");
    }
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // step 2 state
  const [variants, setVariants] = useState([
    {
      color: "",
      sizes: [{ size: "", stock: "" }],
      price: "",
      discount: "",
      coupons: [{ name: "", discount: "" }],
      features: "",
      mainImage: null,
      relatedImages: [],
      videos: [],
    },
  ]);

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    let finalValue = value;
    if (field === "features") {
      finalValue = enforceWordLimit(value, 150);
    }
    updated[index][field] = finalValue;

    // If Variant 1 (index 0) changes, propagate to other variants that have copy state active
    if (index === 0) {
      for (let targetIdx = 1; targetIdx < updated.length; targetIdx++) {
        if (field === "price" || field === "discount") {
          if (copyStates[`${targetIdx}_price_discount`]) {
            updated[targetIdx][field] = finalValue;
          }
        } else if (field === "features") {
          if (copyStates[`${targetIdx}_features`]) {
            updated[targetIdx].features = finalValue;
          }
        }
      }
    } else {
      // If a non-first variant is modified manually, uncheck copy state
      if (field === "price" || field === "discount") {
        setCopyStates(prev => ({ ...prev, [`${index}_price_discount`]: false }));
      } else if (field === "features") {
        setCopyStates(prev => ({ ...prev, [`${index}_features`]: false }));
      }
    }

    setVariants(updated);
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updated = [...variants];
    updated[variantIndex].sizes[sizeIndex][field] = value;

    // If Variant 1 (index 0) sizes change, propagate to copies
    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updated.length; targetIdx++) {
        if (copyStates[`${targetIdx}_sizes`]) {
          updated[targetIdx].sizes = JSON.parse(JSON.stringify(updated[0].sizes));
        }
      }
    } else {
      setCopyStates(prev => ({ ...prev, [`${variantIndex}_sizes`]: false }));
    }

    setVariants(updated);
  };

  const addSize = (variantIndex) => {
    const updated = [...variants];
    if (updated[variantIndex].sizes.length >= 5) {
      alert("Maximum 5 sizes allowed per variant.");
      return;
    }
    updated[variantIndex].sizes.push({ size: "", stock: "" });

    // Propagate addition if copying is enabled
    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updated.length; targetIdx++) {
        if (copyStates[`${targetIdx}_sizes`]) {
          updated[targetIdx].sizes = JSON.parse(JSON.stringify(updated[0].sizes));
        }
      }
    } else {
      setCopyStates(prev => ({ ...prev, [`${variantIndex}_sizes`]: false }));
    }

    setVariants(updated);
  };

  const removeSize = (variantIndex, sizeIndex) => {
    const updated = [...variants];
    updated[variantIndex].sizes.splice(sizeIndex, 1);

    // Propagate removal if copying is enabled
    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updated.length; targetIdx++) {
        if (copyStates[`${targetIdx}_sizes`]) {
          updated[targetIdx].sizes = JSON.parse(JSON.stringify(updated[0].sizes));
        }
      }
    } else {
      setCopyStates(prev => ({ ...prev, [`${variantIndex}_sizes`]: false }));
    }

    setVariants(updated);
  };

  const addCoupon = (variantIndex) => {
    const updated = [...variants];
    if (updated[variantIndex].coupons.length >= 2) {
      alert("Maximum 2 coupons allowed per variant.");
      return;
    }
    updated[variantIndex].coupons.push({ name: "", discount: "" });

    // Propagate addition if copying is enabled
    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updated.length; targetIdx++) {
        if (copyStates[`${targetIdx}_coupons`]) {
          updated[targetIdx].coupons = JSON.parse(JSON.stringify(updated[0].coupons));
        }
      }
    } else {
      setCopyStates(prev => ({ ...prev, [`${variantIndex}_coupons`]: false }));
    }

    setVariants(updated);
  };

  const removeCoupon = (variantIndex, couponIndex) => {
    const updated = [...variants];
    updated[variantIndex].coupons.splice(couponIndex, 1);

    // Propagate removal if copying is enabled
    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updated.length; targetIdx++) {
        if (copyStates[`${targetIdx}_coupons`]) {
          updated[targetIdx].coupons = JSON.parse(JSON.stringify(updated[0].coupons));
        }
      }
    } else {
      setCopyStates(prev => ({ ...prev, [`${variantIndex}_coupons`]: false }));
    }

    setVariants(updated);
  };

  const handleCouponChange = (variantIndex, couponIndex, field, value) => {
    const updated = [...variants];
    updated[variantIndex].coupons[couponIndex][field] = value;

    // Propagate update if copying is enabled
    if (variantIndex === 0) {
      for (let targetIdx = 1; targetIdx < updated.length; targetIdx++) {
        if (copyStates[`${targetIdx}_coupons`]) {
          updated[targetIdx].coupons = JSON.parse(JSON.stringify(updated[0].coupons));
        }
      }
    } else {
      setCopyStates(prev => ({ ...prev, [`${variantIndex}_coupons`]: false }));
    }

    setVariants(updated);
  };

  // Copying helper
  const handleCopyToggle = (vIdx, field, checked) => {
    setCopyStates(prev => ({ ...prev, [`${vIdx}_${field}`]: checked }));
    if (checked) {
      const updated = [...variants];
      if (field === "price_discount") {
        updated[vIdx].price = updated[0].price;
        updated[vIdx].discount = updated[0].discount;
      } else if (field === "sizes") {
        updated[vIdx].sizes = JSON.parse(JSON.stringify(updated[0].sizes));
      } else if (field === "coupons") {
        updated[vIdx].coupons = JSON.parse(JSON.stringify(updated[0].coupons));
      } else if (field === "features") {
        updated[vIdx].features = updated[0].features;
      }
      setVariants(updated);
    }
  };

  const handleFileChange = (variantIndex, field, file) => {
    if (!file) return;
    const updated = [...variants];
    if (field === "relatedImages") {
      if (updated[variantIndex].relatedImages.length >= 4) {
        alert("Maximum 4 related images allowed");
        return;
      }
      updated[variantIndex].relatedImages.push(file);
    } else if (field === "videos") {
      if (updated[variantIndex].videos.length >= 2) {
        alert("Maximum 2 videos allowed");
        return;
      }
      updated[variantIndex].videos.push(file);
    } else {
      updated[variantIndex][field] = file;
    }
    setVariants(updated);
  };

  const removeFile = (variantIndex, field, index) => {
    const updated = [...variants];
    updated[variantIndex][field].splice(index, 1);
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        color: "",
        sizes: [{ size: "", stock: "" }],
        price: "",
        discount: "",
        coupons: [{ name: "", discount: "" }],
        features: "",
        mainImage: null,
        relatedImages: [],
        videos: [],
      },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      alert("At least one variant is required");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
    // Clean up copy states for this index
    const newCopyStates = {};
    Object.keys(copyStates).forEach(key => {
      const [vIdx, field] = key.split("_");
      if (parseInt(vIdx) !== index) {
        const adjustedIdx = parseInt(vIdx) > index ? parseInt(vIdx) - 1 : vIdx;
        newCopyStates[`${adjustedIdx}_${field}`] = copyStates[key];
      }
    });
    setCopyStates(newCopyStates);
  };

  // on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    for (const key in generalData) {
      formData.append(key, generalData[key]);
    }

    formData.append("sections", JSON.stringify(sections));

    const plainVariants = variants.map((v) => {
      return {
        ...v,
        mainImage: null,
        relatedImages: [],
        videos: [],
      };
    });

    formData.append("variants", JSON.stringify(plainVariants));

    variants.forEach((v, i) => {
      if (v.mainImage) formData.append(`variant_${i}_mainImage`, v.mainImage);
      v.relatedImages.forEach((img, j) =>
        formData.append(`variant_${i}_relatedImage_${j}`, img),
      );
      v.videos.forEach((vid, j) =>
        formData.append(`variant_${i}_video_${j}`, vid),
      );
    });

    try {
      const res = await fetch(`${API_BASE_URL}/products/add`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message || "Product added successfully");
      if (res.ok) {
        window.location.href = "/admin/ManageProducts";
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-600" />
              Product Creation Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add a new product with multiple variants, custom sections, prices, and media.
            </p>
          </div>
        </div>

        {/* Stepper / Tab Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 mb-8 flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentTab(1)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 1
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Layers className="h-4 w-4" />
            Step 1: General Info
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab(2)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 2
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Step 2: Product Variants
          </button>
        </div>

        {/* STEP 1: General Info */}
        {currentTab === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Product Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={generalData.product_name}
                    onChange={handleGeneralChange}
                    placeholder="e.g. Premium Leather Jacket"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={generalData.brand}
                    onChange={handleGeneralChange}
                    placeholder="e.g. Rogue Apparel"
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
                    value={generalData.main_category}
                    onChange={handleGeneralChange}
                    placeholder="e.g. Men"
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
                    value={generalData.category}
                    onChange={handleGeneralChange}
                    placeholder="e.g. Jackets"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Short Description
                  </label>
                  <span className={`text-[10px] font-semibold ${countWords(generalData.short_description) >= 100 ? "text-red-500" : "text-slate-400"}`}>
                    {countWords(generalData.short_description)} / 100 words
                  </span>
                </div>
                <textarea
                  name="short_description"
                  value={generalData.short_description}
                  onChange={handleGeneralChange}
                  placeholder="Give a brief description highlighting the main selling points..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition resize-none"
                />
              </div>
            </div>

            {/* Custom Sections */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/85 p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Custom Sections</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Add custom descriptive tabs like Specifications, Care Info, etc. (Max 5)</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {sections.length} / 5
                </span>
              </div>

              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 relative group">
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <div className="space-y-3 pr-8">
                      <input
                        type="text"
                        placeholder="Section Title (e.g. Care Instructions)"
                        value={sec.title}
                        onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                        className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm font-semibold transition"
                      />
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-400">Content (Max 200 words)</span>
                          <span className={`text-[10px] font-semibold ${countWords(sec.content) >= 200 ? "text-red-500" : "text-slate-400"}`}>
                            {countWords(sec.content)} / 200 words
                          </span>
                        </div>
                        <textarea
                          placeholder="Section Content..."
                          value={sec.content}
                          onChange={(e) => handleSectionChange(idx, "content", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm transition resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sections.length < 5 && (
                <button
                  type="button"
                  onClick={addSection}
                  className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all hover:bg-blue-50/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Section
                </button>
              )}
            </div>

            {/* Navigation Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentTab(2)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-500/10 flex items-center gap-2 transition"
              >
                Proceed to Variants
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Variants */}
        {currentTab === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {variants.map((v, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/85 p-6 md:p-8 space-y-6 relative">
                  {/* Variant Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                          {i + 1}
                        </span>
                        Variant Options {v.color ? `— ${v.color}` : ""}
                      </h3>
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 px-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition self-end md:self-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Variant
                      </button>
                    )}
                  </div>

                  {/* Copy Control Panel (for variant > 1) */}
                  {i > 0 && (
                    <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-4 md:p-5">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-3">
                        <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                        <span>Quick Setup: Copy/Sync from Variant 1</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                          <input
                            type="checkbox"
                            checked={!!copyStates[`${i}_price_discount`]}
                            onChange={(e) => handleCopyToggle(i, "price_discount", e.target.checked)}
                            className="accent-blue-600 h-4 w-4 rounded"
                          />
                          <span className="text-xs font-semibold text-slate-700">Price & Discount</span>
                        </label>
                        <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                          <input
                            type="checkbox"
                            checked={!!copyStates[`${i}_sizes`]}
                            onChange={(e) => handleCopyToggle(i, "sizes", e.target.checked)}
                            className="accent-blue-600 h-4 w-4 rounded"
                          />
                          <span className="text-xs font-semibold text-slate-700">Sizes ({variants[0].sizes.length})</span>
                        </label>
                        <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                          <input
                            type="checkbox"
                            checked={!!copyStates[`${i}_coupons`]}
                            onChange={(e) => handleCopyToggle(i, "coupons", e.target.checked)}
                            className="accent-blue-600 h-4 w-4 rounded"
                          />
                          <span className="text-xs font-semibold text-slate-700">Coupons ({variants[0].coupons.length})</span>
                        </label>
                        <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-blue-50/20 transition">
                          <input
                            type="checkbox"
                            checked={!!copyStates[`${i}_features`]}
                            onChange={(e) => handleCopyToggle(i, "features", e.target.checked)}
                            className="accent-blue-600 h-4 w-4 rounded"
                          />
                          <span className="text-xs font-semibold text-slate-700">Features</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Core details row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Color / style
                      </label>
                      <input
                        type="text"
                        value={v.color}
                        placeholder="e.g. Jet Black"
                        onChange={(e) => handleVariantChange(i, "color", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Price (INR)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-slate-400 font-semibold">₹</span>
                        <input
                          type="number"
                          value={v.price}
                          placeholder="0.00"
                          onChange={(e) => handleVariantChange(i, "price", e.target.value)}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Discount %
                      </label>
                      <div className="relative">
                        <span className="absolute right-4 top-3 text-slate-400 font-semibold">%</span>
                        <input
                          type="number"
                          value={v.discount}
                          placeholder="0"
                          onChange={(e) => handleVariantChange(i, "discount", e.target.value)}
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sizes (Limit 5) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Sizes & Stock</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Define available sizes and current stock inventory (Max 5)</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {v.sizes.length} / 5
                      </span>
                    </div>

                    <div className="space-y-3">
                      {v.sizes.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                          <input
                            type="text"
                            placeholder="Size (e.g. M, L, 10, 42)"
                            value={s.size}
                            onChange={(e) => handleSizeChange(i, sIdx, "size", e.target.value)}
                            className="w-1/2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none text-sm transition"
                          />
                          <input
                            type="number"
                            placeholder="Stock quantity"
                            value={s.stock}
                            onChange={(e) => handleSizeChange(i, sIdx, "stock", e.target.value)}
                            className="w-1/2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none text-sm transition"
                          />
                          {v.sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSize(i, sIdx)}
                              className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition"
                            >
                              <X className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {v.sizes.length < 5 ? (
                      <button
                        type="button"
                        onClick={() => addSize(i)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-dashed border-blue-200 bg-blue-50/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Size
                      </button>
                    ) : (
                      <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" /> Size limit reached (Max 5 sizes per variant)
                      </p>
                    )}
                  </div>

                  {/* Coupons (Limit 2) */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Coupons & Offers</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Attach variant-specific discount promo codes (Max 2)</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {v.coupons.length} / 2
                      </span>
                    </div>

                    <div className="space-y-3">
                      {v.coupons.map((c, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                          <input
                            type="text"
                            placeholder="Promo Code (e.g. SUMMERSALE)"
                            value={c.name}
                            onChange={(e) => handleCouponChange(i, cIdx, "name", e.target.value)}
                            className="w-1/2 px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none text-sm transition"
                          />
                          <div className="relative w-1/2">
                            <span className="absolute right-3 top-2 text-slate-400 text-xs font-semibold">%</span>
                            <input
                              type="number"
                              placeholder="Coupon Discount"
                              value={c.discount}
                              onChange={(e) => handleCouponChange(i, cIdx, "discount", e.target.value)}
                              className="w-full pl-3 pr-8 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none text-sm transition"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCoupon(i, cIdx)}
                            className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {v.coupons.length < 2 ? (
                      <button
                        type="button"
                        onClick={() => addCoupon(i)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-dashed border-blue-200 bg-blue-50/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Coupon Code
                      </button>
                    ) : (
                      <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" /> Coupon limit reached (Max 2 coupons per variant)
                      </p>
                    )}
                  </div>

                  {/* Offers & Features Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Features / Bullet points description
                      </label>
                      <span className={`text-[10px] font-semibold ${countWords(v.features) >= 150 ? "text-red-500" : "text-slate-400"}`}>
                        {countWords(v.features)} / 150 words
                      </span>
                    </div>
                    <textarea
                      placeholder="Add key features, specifications, or bullet points unique to this variant..."
                      value={v.features}
                      onChange={(e) => handleVariantChange(i, "features", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-slate-800 transition resize-none text-sm"
                    />
                  </div>

                  {/* Media Upload (Images & Videos) */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800">Media Files</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Main Image */}
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-3">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Main Display Image</span>
                        
                        {v.mainImage ? (
                          <div className="relative h-28 w-28 mx-auto rounded-xl overflow-hidden shadow-sm border bg-white">
                            <img
                              src={URL.createObjectURL(v.mainImage)}
                              alt="Main Preview"
                              className="h-full w-full object-fit"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...variants];
                                updated[i].mainImage = null;
                                setVariants(updated);
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-28 border border-dashed border-slate-200 bg-white rounded-xl cursor-pointer hover:bg-slate-50 transition p-2">
                            <Upload className="h-6 w-6 text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500 font-medium text-center">Click to upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(i, "mainImage", e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Related Images (Max 4) */}
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Related Images</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">
                            {v.relatedImages.length} / 4
                          </span>
                        </div>

                        {v.relatedImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {v.relatedImages.map((img, imgIdx) => (
                              <div key={imgIdx} className="relative h-12 rounded-lg overflow-hidden border bg-white">
                                <img
                                  src={URL.createObjectURL(img)}
                                  alt="Related Preview"
                                  className="h-full w-full object-fit"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeFile(i, "relatedImages", imgIdx)}
                                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700 transition"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {v.relatedImages.length < 4 && (
                          <label className="flex flex-col items-center justify-center h-14 border border-dashed border-slate-200 bg-white rounded-xl cursor-pointer hover:bg-slate-50 transition p-1">
                            <Plus className="h-5 w-5 text-slate-400" />
                            <span className="text-[9px] text-slate-500 font-medium">Add related</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(i, "relatedImages", e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Videos (Max 2) */}
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Product Videos</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">
                            {v.videos.length} / 2
                          </span>
                        </div>

                        {v.videos.length > 0 && (
                          <div className="space-y-1 max-h-16 overflow-y-auto pr-1">
                            {v.videos.map((vid, vidIdx) => (
                              <div key={vidIdx} className="flex justify-between items-center bg-white p-1 px-2 rounded-lg border text-[10px] text-slate-600 font-medium">
                                <span className="truncate max-w-[80%]">{vid?.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(i, "videos", vidIdx)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {v.videos.length < 2 && (
                          <label className="flex flex-col items-center justify-center h-14 border border-dashed border-slate-200 bg-white rounded-xl cursor-pointer hover:bg-slate-50 transition p-1">
                            <Plus className="h-5 w-5 text-slate-400" />
                            <span className="text-[9px] text-slate-500 font-medium">Add video</span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleFileChange(i, "videos", e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 2 Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-t border-slate-200 pt-6 mt-8">
              <button
                type="button"
                onClick={() => setCurrentTab(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Step 1
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={addVariant}
                  className="bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 font-bold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Variant
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-500/10 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Product..." : "Submit Product Info"}
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProductPage;
