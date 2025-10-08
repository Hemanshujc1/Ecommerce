import React from "react";
import Image from "next/image";

const CategoryCard = ({ image, category }) => {
  return (
    <div className="flex flex-col justify-center h-[75vh] w-[30vw] text-black text-left p-4">
      <div className="w-full h-[80%] relative rounded-md overflow-hidden hover:scale-95 transition-transform">
        <Image
        width={300}
        height={200}
          src={image}
          alt={category}
          
          className="object-cover w-full h-full"
        />
      </div>
      <h3 className="font-semibold text-xl mt-4">{category}</h3>
    </div>
  );
};

export default CategoryCard;
