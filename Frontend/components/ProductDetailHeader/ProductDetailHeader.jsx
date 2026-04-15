import React from 'react'

const ProductDetailHeader = ({product}) => {
  return (
    <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
          <p className="text-gray-500">
            Brand: <span className="text-black font-medium">{product.brand}</span>
          </p>
          <div className="flex items-center text-yellow-600 font-semibold">
            ⭐ {product.rating} 
            <span className="text-gray-400 font-normal ml-1">
              ({product.ratingsCount} ratings)
            </span>
          </div>
        </div>
    </div>
  )
}

export default ProductDetailHeader
