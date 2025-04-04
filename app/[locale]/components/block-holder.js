import React from "react";
import { useTranslations } from "next-intl";

/*
    BlockHolder - component to hold information about an item to show in the list

    props:
    - id - ID of the item
    - title - Title of the item
    - category - One of the categories of the item
    - total - Cost of the item
    - imageSource - Link for the image of the item
    - type - Type of the Block Holder

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
  const t = useTranslations("BlockHolder");

  const commonImageClasses =
    "rounded-md h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 object-cover";

  const cardBaseClasses =
    "flex flex-col gap-2 w-full h-full transition-transform duration-300 ease-in-out";

  const textBaseClasses = "truncate max-w-[180px] text-darkerBeige";
  const headerTextClasses =
    "truncate max-w-[180px] font-semibold text-lg text-gray-800";
  const costClasses = "truncate max-w-[180px] italic";
  const deadlineClasses =
    "truncate max-w-[180px] font-semibold text-sm leading-tight";

  if (type === "product") {
    return (
      <div className={cardBaseClasses}>
        <div className="relative">
          <img src={imageSource} className={commonImageClasses} alt={t("productImageAlt")} />
        </div>

        <div className="flex flex-col">
          <div>
            <p className={`${textBaseClasses} text-xs`}>{t("productId")}: #{id}</p>
            <p className={`${headerTextClasses}`} data-id="product-title">
              {title}
            </p>
          </div>
          <p className={textBaseClasses}>{t("category")}: {category}</p>
          <p className={costClasses}>
            {total} {currency}
          </p>
        </div>
      </div>
    );
  } else if (type === "order") {
    return (
      <div className={cardBaseClasses}>
        <div className="relative">
          <img src={imageSource} className={commonImageClasses} alt={t("orderImageAlt")} />
        </div>

        <div className="flex flex-col">
          <div>
            <p className={`${textBaseClasses} text-xs`}>{t("orderId")}: #{id}</p>
            <p className={`${headerTextClasses}`} data-id="order-title">
              {title}
            </p>
          </div>
          <p className={deadlineClasses}>
            <span className="text-red">{t("deadline")}: {deadline[0]}</span>
          </p>
          <p className={deadlineClasses}>{deadline[2]}</p>
          <p className={costClasses}>
            {t("total")}: {total} {currency}
          </p>
        </div>
      </div>
    );
  } else if (type === "material") {
    return (
      <div className={cardBaseClasses}>
        <div className="relative">
          <img src={imageSource} className={commonImageClasses} alt={t("materialImageAlt")} />
        </div>

        <div className="flex flex-col">
          <div>
            <p className={`${textBaseClasses} text-xs`}>{t("materialId")}: #{id}</p>
            <p className={`${headerTextClasses}`} data-id="material-title">
              {title}
            </p>
          </div>
          <p className={textBaseClasses}>{t("quantity")}: {quantity}</p>
          <p className={textBaseClasses}>{t("category")}: {category}</p>
          <p className={textBaseClasses}>{t("color")}: {color}</p>
          <p className={costClasses}>
            {total} {currency}
          </p>
        </div>
      </div>
    );
  }
}