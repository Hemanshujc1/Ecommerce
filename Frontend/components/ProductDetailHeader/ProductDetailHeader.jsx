import React from 'react'

const ProductDetailHeader = ({product}) => {
  return (
    <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-500 text-sm">Brand: {product.brand}</p>
        <p className="text-yellow-600 font-medium">
        ⭐ {product.rating} ({product.ratingsCount} ratings)
      </p>
      <div>
        <p>{product.short_description}</p>
      </div>
    </div>
  )
}

export default ProductDetailHeader
