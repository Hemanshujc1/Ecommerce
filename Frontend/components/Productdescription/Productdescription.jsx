import React from "react";
import Image from "next/image";

const Productdescription = ({ img, productname, productprice, productintro, productdetails }) => {
  return (
    <div>
      <div className="flex flex-col item-center md:flex-row gap-10 py-10 px-8">
        <div className="relative w-full md:w-1/2 h-[70vh]">
          <Image
          width={300}
          height={200}
            src={`/images/${img}`}
            alt="Product"
            className="object-cover w-full h-full rounded-md hover:scale-95 transition"
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center gap-4 text-black">
          <h1 className="text-3xl font-semibold">{productname}</h1>
          <p className="text-lg text-gray-700">Rs {productprice}</p>
          <p className="text-sm text-gray-800">{productintro}</p>
          <div className="flex gap-5">
            <button className="bg-black text-white py-2 px-6 w-fit uppercase hover:bg-gray-700 transition">
              Add to Cart
            </button>
            <button className="bg-black text-white py-2 px-6 w-fit uppercase hover:bg-gray-700 transition">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white text-black p-8 rounded-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Product Details</h2>
        <ul className="list-disc pl-5 space-y-2">
          {productdetails.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Productdescription;
