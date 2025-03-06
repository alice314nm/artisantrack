import React from "react";

/*
    BLockHolder - component to hold information about item to show it in the list

    props:
    - id - id of the item
    - title - title of the item
    - category - one of the categories of the item
    - total - cost of the item
    - imageSource - link for the image of the item
    - type - type of the Block Holder

    type:
    - product
    - order
    - material
*/

export default function BlockHolder({
  id,
  title,
  category,
  client,
  deadline,
  quantity,
  currency,
  color,
  total,
  imageSource,
  type,
}) {
  const commonImageClasses = "rounded-md h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 object-cover";
  
  const cardBaseClasses = "flex flex-col gap-2 w-full h-full transition-transform duration-300 ease-in-out";

  const textBaseClasses = "truncate max-w-[180px] text-darkerBeige";
  const headerTextClasses = "truncate max-w-[180px] font-semibold text-lg text-gray-800";
  const costClasses = "truncate max-w-[180px] italic"
  const deadlineClasses = "truncate max-w-[180px] font-semibold text-sm leading-tight";


  if (type === "product") {
    return (
      <div className={cardBaseClasses}>
        <div className="relative">
          <img src={imageSource} className={commonImageClasses} />
        </div>

        <div className="flex flex-col">
          <div>
            <p className={`${textBaseClasses} text-xs`}>product id: #{id}</p>
            <p className={`${headerTextClasses}`}>{title}</p>
          </div>
          <p className={textBaseClasses}>category: {category}</p>
          <p className={costClasses}>{total} {currency}</p>
        </div>
      </div>
    );
  } else if (type === "order") {
    return (
      <div className={cardBaseClasses}>
        <div className="relative">
          <img src={imageSource} className={commonImageClasses} />
        </div>

        <div className="flex flex-col">
          <div>
            <p className={`${textBaseClasses} text-xs`}>order id: #{id}</p>
            <p className={`${headerTextClasses}`}>{title}</p>
          </div>          
          <p className={deadlineClasses}><span className="text-red">Deadline: {deadline[0]}</span></p>
          <p className={deadlineClasses}>{deadline[2]}</p>
          <p className={costClasses}>
            Total: {total} {currency}
          </p>
        </div>
      </div>
    );
  } else if (type === "material") {
    return (
      <div className={cardBaseClasses}>
        <div className="relative">
          <img src={imageSource} className={commonImageClasses} />
        </div>

        <div className="flex flex-col">
          <div>
            <p className={`${textBaseClasses} text-xs`}>material id: #{id}</p>
            <p className={`${headerTextClasses}`}>{title}</p>
          </div>          <p className={textBaseClasses}>Quantity: {quantity}</p>
          <p className={textBaseClasses}>Category: {category}</p>
          <p className={textBaseClasses}>Color: {color}</p>
          <p className={costClasses}>
            {total} {currency}
          </p>
        </div>
      </div>
    );
  }
}
