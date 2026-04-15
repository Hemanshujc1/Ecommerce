import React from 'react'

const ServiceCard = ({ logo: Logo, title, description }) => {
  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded shadow-sm text-center w-full sm:w-[45%] lg:w-[22%] py-3 hover:scale-95 transition">
      <div className="text-4xl text-primary">
        <Logo />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

export default ServiceCard
