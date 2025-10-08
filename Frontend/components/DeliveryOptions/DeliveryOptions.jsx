import React from 'react'

const DeliveryOptions = ({product}) => {
  return (
    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
    {product.offers.map((offer, i) => (
      <div key={i} className="flex items-center gap-2">
        <span>🔹</span>
        <span>{offer}</span>
      </div>
    ))}
  </div>
  )
}

export default DeliveryOptions
