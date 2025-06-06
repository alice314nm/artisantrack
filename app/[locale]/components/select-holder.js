import { useTranslations } from "next-intl";

export default function SelectHolder({
  type,
  imageSource,
  name,
  id,
  quantity,
  selected,
  cost,
  currency,
  index,
  onClick,
  onQuantityChange,
  selectedQuantity,
}) {
  const t = useTranslations("SelectHolder");

  if (type === "product") {
    return (
      <div className="flex flex-col gap-2 w-full h-full">
        <div>
          <img
            src={imageSource}
            className="h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 rounded-lg object-cover"
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="truncate max-w-[180px]">
            #{id} | {name}
          </p>
          <p className="truncate max-w-[180px]">
            {t("averageCost")}: {`${cost}${currency}`}
          </p>
          <button
            data-id="select-product-holder-button"
            type="button"
            onClick={onClick}
            className={
              selected
                ? "rounded-full bg-darkGreen text-white w-full"
                : "rounded-full bg-green w-full"
            }
          >
            {selected ? t("selected") : t("select")}
          </button>
        </div>
      </div>
    );
  } else if (type === "material") {
    return (
      <div className="flex flex-col gap-2 w-full h-full">
        <div>
          <img
            src={imageSource}
            className="h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 rounded-lg object-cover"
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="truncate max-w-[180px]">
            #{id} | {name}
          </p>
          <p className="truncate max-w-[180px]">
            {t("totalCost")}: {cost}
            {currency}
          </p>
          <p className="truncate max-w-[180px]">
            {t("quantity")}: {quantity}
          </p>
          <div className="flex flex-col gap-2">
          {selected && (
              <div>
                <label>{ t("qty")}</label>
                <input
                  data-id="selected-material-quantity"
                  type="number"
                  placeholder="0"
                  min="0"
                  className="h-8 rounded-lg border p-2 w-full focus:outline-none focus:ring-2 focus:ring-green"
                  value={selectedQuantity === 0 ? "" : selectedQuantity}
                  onChange={(e) =>
                    onQuantityChange(
                      e.target.value ? Number(e.target.value) : 0
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            )}
            <button
              data-id="select-material-holder-button"
              type="button"
              onClick={onClick}
              className={
                selected
                  ? "h-8 rounded-full bg-darkGreen text-white w-full"
                  : "h-8 rounded-full bg-green w-full"
              }
            >
              {selected ? t("selected") : t("select")}
            </button>
            {/* {selected && (
              <input
                data-id="selected-material-quantity"
                type="number"
                placeholder="0"
                min="0"
                className="h-8 rounded-lg border p-2 w-[60%] focus:outline-none focus:ring-2 focus:ring-green"
                value={selectedQuantity === 0 ? "" : selectedQuantity}
                onChange={(e) =>
                  onQuantityChange(
                    id,
                    e.target.value ? Number(e.target.value) : 0
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
              />
            )} */}
          </div>
        </div>
      </div>
    );
  }
}
