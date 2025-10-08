"use client";
import React, { useState } from "react";

const ColorSelection = ({product}) => {
      const [selectedColor, setSelectedColor] = useState(product.colorOptions[0]);
    
  return (
    <div className="space-y-1">
    <h3 className="font-semibold">Colour:</h3>
    <div className="flex gap-2">
      {product.colorOptions.map((color) => (
        <button
          key={color}
          className={`px-3 py-1 border rounded-md text-sm ${selectedColor === color ? "bg-blue-100 border-blue-500" : "bg-white"}`}
          onClick={() => setSelectedColor(color)}
        >
          {color}
        </button>
      ))}
    </div>
  </div>
  )
}

export default ColorSelection
