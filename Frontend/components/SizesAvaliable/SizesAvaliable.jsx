"use client";

import React, { useState } from "react";

const SizesAvaliable = ({product}) => {
      const [selectedSize, setSelectedSize] = useState(product.selectedSize);
    
  return (
    <div className="space-y-1">
    <h3 className="font-semibold">Size:</h3>
    <div className="flex gap-2 flex-wrap">
      {product.sizeOptions.map((size) => (
        <button
          key={size}
          className={`px-4 py-2 border rounded-md text-sm ${selectedSize === size ? "bg-yellow-100 border-yellow-600" : "bg-white"}`}
          onClick={() => setSelectedSize(size)}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
  )
}

export default SizesAvaliable
