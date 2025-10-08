import React from "react";

const AboutItemCard = ({product}) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">About this item</h3>
      <ul className="list-disc pl-5 space-y-1">
        {product.about.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
};

export default AboutItemCard;
