import React from 'react'

const ServiceCard = ({ logo: Logo, title, description }) => {
    return (
      <div className="flex flex-col items-center gap-4 p-4 border rounded shadow-sm text-center w-[40%] py-3 hover:scale-95">
        <div className="text-4xl text-primary">
          <Logo /> 
        </div>
        <div className="text flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    )
  }
  

export default ServiceCard
