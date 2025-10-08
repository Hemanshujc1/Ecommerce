"use client"
import React,{useState} from "react";

const PriceCard = ({product}) => {
const [couponApplied, setCouponApplied] = useState(false);
  const calculateDiscountedPrice = () => {
    let priceAfterDiscount =
      product.originalPrice * (1 - product.discountPercent / 100);
    if (couponApplied) {
      priceAfterDiscount *= 1 - product.couponDiscountPercent / 100;
    }
    return Math.round(priceAfterDiscount);
  };
  const price = calculateDiscountedPrice();
  return (
    <div>
    <div className="flex items-center gap-4 text-xl">
      <span className="font-bold text-red-600">₹{price}</span>
      <span className="line-through text-gray-400 text-base">
        ₹{product.originalPrice}
      </span>
      <span className="text-green-600 font-semibold text-sm">
        -{product.discountPercent}%
      </span>
    </div>
     <div className="text-sm">
     <p
       className="text-orange-600 cursor-pointer"
       onClick={() => setCouponApplied(!couponApplied)}
     >
       Coupon: Apply {product.couponDiscountPercent}% coupon{" "}
       {couponApplied ? "✔️" : ""}
     </p>
   </div>
   </div>
  );
};

export default PriceCard;
