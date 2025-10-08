import React from "react";

const AdditionalInfoCard = ({product}) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mt-6 mb-2">
        Additional Information
      </h3>
      <ul className="text-sm space-y-1">
        <li>
          <strong>Manufacturer:</strong> {product.additionalInfo.manufacturer}
        </li>
        <li>
          <strong>Packer:</strong> {product.additionalInfo.packer}
        </li>
        <li>
          <strong>Importer:</strong> {product.additionalInfo.importer}
        </li>
        <li>
          <strong>Item Weight:</strong> {product.additionalInfo.weight}
        </li>
        <li>
          <strong>Item Dimensions LxWxH:</strong>{" "}
          {product.additionalInfo.dimensions}
        </li>
        <li>
          <strong>Net Quantity:</strong> {product.additionalInfo.quantity}
        </li>
        <li>
          <strong>Generic Name:</strong> {product.additionalInfo.genericName}
        </li>
      </ul>
    </div>
  );
};

export default AdditionalInfoCard;
