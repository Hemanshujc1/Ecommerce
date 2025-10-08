import React from "react";
import Image from "next/image";

const ImageContainer = () => {
  return (
    <div className="flex flex-col items-center h-auto">
      {/* Image row */}
      <div className="flex w-full h-[30vh] overflow-hidden">
        {[
          "insta-item1.jpg",
          "insta-item2.jpg",
          "insta-item3.jpg",
          "insta-item4.jpg",
          "insta-item5.jpg",
          "insta-item6.jpg",
        ].map((img, index) => (
          <div
            key={index}
            className="relative w-[16.67%] h-full overflow-hidden"
          >
            <Image
            width={300}
            height={200}
              src={`/images/${img}`}
              alt={`brandlogo-${index}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageContainer;
