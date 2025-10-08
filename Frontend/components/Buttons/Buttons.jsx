import React from "react";

const Buttons = () => {
  return (
    <div className="flex gap-4 mt-4">
      <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow">
        Add to Cart
      </button>
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow">
        Buy Now
      </button>
    </div>
  );
};

export default Buttons;
