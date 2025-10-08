"use client";
import React, { useState } from "react";


const AddProductPage = () => {
  const [currentTab, setCurrentTab] = useState(1);
  // step 1 const
  const [generalData, setGeneralData] = useState({
    product_name: "",
    brand: "",
    category: "",
    main_category: "",
    sub_category: "",
    short_description: "",
  });
  const [sections, setSections] = useState([{ title: "", content: "" }]);
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralData((prev) => ({
      ...prev,
      [name]: name === "category" ? value.toLowerCase() : value,
      [name]: name === "main_category" ? value.toLowerCase() : value,
      [name]: name === "sub_category" ? value.toLowerCase() : value,
    }));
  };
  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
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

  //step 2 const
  const [variants, setVariants] = useState([
    {
      color: "",
      sizes: [{ size: "", stock: "" }],
      rating: "",
      ratingCount: "",
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
    updated[index][field] = value;
    setVariants(updated);
  };
  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updated = [...variants];
    updated[variantIndex].sizes[sizeIndex][field] = value;
    setVariants(updated);
  };
  const addSize = (variantIndex) => {
    const updated = [...variants];
    updated[variantIndex].sizes.push({ size: "", stock: "" });
    setVariants(updated);
  };
  const removeSize = (variantIndex, sizeIndex) => {
    const updated = [...variants];
    updated[variantIndex].sizes.splice(sizeIndex, 1);
    setVariants(updated);
  };
  const addCoupon = (variantIndex) => {
    const updated = [...variants];
    updated[variantIndex].coupons.push({ name: "", discount: "" });
    setVariants(updated);
  };
  const removeCoupon = (variantIndex, couponIndex) => {
    const updated = [...variants];
    updated[variantIndex].coupons.splice(couponIndex, 1);
    setVariants(updated);
  };
  const handleCouponChange = (variantIndex, couponIndex, field, value) => {
    const updated = [...variants];
    updated[variantIndex].coupons[couponIndex][field] = value;
    setVariants(updated);
  };
  const handleFileChange = (variantIndex, field, file) => {
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
        rating: "",
        ratingCount: "",
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
    setVariants(variants.filter((_, i) => i !== index));
  };
  // on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (const key in generalData) {
      formData.append(key, generalData[key]);
    }

    formData.append("sections", JSON.stringify(sections));

    const plainVariants = variants.map((v, index) => {
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
        formData.append(`variant_${i}_relatedImage_${j}`, img)
      );
      v.videos.forEach((vid, j) =>
        formData.append(`variant_${i}_video_${j}`, vid)
      );
    });

    try {
      const res = await fetch("http://localhost:4001/products/add", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message || "Product added successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Products</h1>
      {/* Tabs */}
      <div className="flex mb-6 space-x-2">
        <button
          onClick={() => setCurrentTab(1)}
          className={`px-4 py-2 border ${
            currentTab === 1 ? "bg-blue-600 text-white" : ""
          }`}
        >
          Step 1: General Info
        </button>
        <button
          onClick={() => setCurrentTab(2)}
          className={`px-4 py-2 border ${
            currentTab === 2 ? "bg-blue-600 text-white" : ""
          }`}
        >
          Step 2: Variants
        </button>
      </div>

      {/* STEP 1 */}
      {currentTab === 1 && (
        <form className="space-y-4">
          {Object.entries(generalData).map(([key, val]) => (
            <input
              key={key}
              type="text"
              name={key}
              value={val}
              onChange={handleGeneralChange}
              placeholder={key.replace(/_/g, " ")}
              className="border p-2 w-full"
            />
          ))}

          <div>
            <h2 className="font-bold mb-2">Custom Sections (Max 5)</h2>
            {sections.map((sec, idx) => (
              <div key={idx} className="mb-2">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={sec.title}
                  onChange={(e) =>
                    handleSectionChange(idx, "title", e.target.value)
                  }
                  className="border p-2 w-full mb-1"
                />
                <textarea
                  placeholder="Section Content"
                  value={sec.content}
                  onChange={(e) =>
                    handleSectionChange(idx, "content", e.target.value)
                  }
                  className="border p-2 w-full"
                />
                
                <button
                  type="button"
                  className="text-red-600 text-sm mt-1"
                  onClick={() => removeSection(idx)}
                >
                  Remove Section
                </button>
              </div>
            ))}
            {sections.length < 5 && (
              <button
                type="button"
                className="text-blue-600 mt-2"
                onClick={addSection}
              >
                + Add Section
              </button>
            )}
          </div>

          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setCurrentTab(2)}
          >
            Next ➝
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {currentTab === 2 && (
        <form onSubmit={handleSubmit}>
          {variants.map((v, i) => (
            <div key={i} className="border p-4 mb-6 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Variant {i + 1}</h2>
                <button
                  type="button"
                  className="text-red-600 text-sm"
                  onClick={() => removeVariant(i)}
                >
                  🗑️ Delete Variant
                </button>
              </div>

              <input
                type="text"
                value={v.color}
                placeholder="Color"
                onChange={(e) =>
                  handleVariantChange(i, "color", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />

              {v.sizes.map((s, sIdx) => (
                <div key={sIdx} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Size"
                    value={s.size}
                    onChange={(e) =>
                      handleSizeChange(i, sIdx, "size", e.target.value)
                    }
                    className="border p-2 w-1/2"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={s.stock}
                    onChange={(e) =>
                      handleSizeChange(i, sIdx, "stock", e.target.value)
                    }
                    className="border p-2 w-1/2"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(i, sIdx)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600 mb-2"
                onClick={() => addSize(i)}
              >
                + Add Size
              </button>

              <input
                type="number"
                placeholder="Rating"
                value={v.rating}
                onChange={(e) =>
                  handleVariantChange(i, "rating", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />
              <input
                type="number"
                placeholder="Rating Count"
                value={v.ratingCount}
                onChange={(e) =>
                  handleVariantChange(i, "ratingCount", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={v.price}
                onChange={(e) =>
                  handleVariantChange(i, "price", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />
              <input
                type="number"
                placeholder="Discount %"
                value={v.discount}
                onChange={(e) =>
                  handleVariantChange(i, "discount", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />

              {/* Coupons */}
              {v.coupons.map((c, cIdx) => (
                <div key={cIdx} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Coupon Name"
                    value={c.name}
                    onChange={(e) =>
                      handleCouponChange(i, cIdx, "name", e.target.value)
                    }
                    className="border p-2 w-1/2"
                  />
                  <input
                    type="number"
                    placeholder="Discount %"
                    value={c.discount}
                    onChange={(e) =>
                      handleCouponChange(i, cIdx, "discount", e.target.value)
                    }
                    className="border p-2 w-1/2"
                  />
                  <button
                    type="button"
                    onClick={() => removeCoupon(i, cIdx)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCoupon(i)}
                className="text-blue-600 mb-2"
              >
                + Add Coupon
              </button>

              <textarea
                placeholder="Offers & Features"
                value={v.features}
                onChange={(e) =>
                  handleVariantChange(i, "features", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />

              <div className="mb-2">
                <label>Main Image:</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(i, "mainImage", e.target.files[0])
                  }
                  className="border p-2 w-full"
                />
              </div>

              <div className="mb-2">
                <label>Related Images:</label>
                {v.relatedImages.map((img, imgIdx) => (
                  <div
                    key={imgIdx}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{img.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i, "relatedImages", imgIdx)}
                      className="text-red-600"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                {v.relatedImages.length < 4 && (
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(i, "relatedImages", e.target.files[0])
                    }
                    className="border p-2 w-full mt-2"
                  />
                )}
              </div>

              <div className="mb-2">
                <label>Videos:</label>
                {v.videos.map((vid, vidIdx) => (
                  <div
                    key={vidIdx}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{vid.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i, "videos", vidIdx)}
                      className="text-red-600"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                {v.videos.length < 2 && (
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(i, "videos", e.target.files[0])
                    }
                    className="border p-2 w-full mt-2"
                  />
                )}
              </div>
            </div>
          ))}
<div className="flex gap-5">
          <button
            type="button"
            onClick={addVariant}
            className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          >
            + Add Variant
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            Submit Product
          </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProductPage;
