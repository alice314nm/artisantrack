import { useTranslations } from "next-intl";

export default function SelectedHolder({
  type,
  imageSrc,
  name,
  id,
  index,
  quantity,
  onRemove,
}) {
  const t = useTranslations("SelectedHolder");

  if (type === "product") {
    return (
      <div className="flex flex-row items-center w-full">
        <img
          className="object-contain relative w-20 h-24 rounded-lg"
          src={imageSrc}
        />
        <p className="mx-4">
          #{id} | {name}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="bg-red text-white h-8 rounded-lg px-3 ml-auto"
        >
          {t("remove")}
        </button>
      </div>
    );
  } else if (type === "material") {
    return (
      <div className="flex flex-row w-full items-center gap-2 justify-between">
        <div className="flex flex-row gap-2 items-center">
          <div className="pt-[1px] pr-[1px] bg-lightBeige border-2 border-blackBeige rounded-xl w-6 h-6 flex justify-center items-center">
            <p>{index}</p>
          </div>
          <img
            className="object-cover relative w-20 h-24 rounded-lg"
            src={imageSrc}
          />
          <div>
            <p>
              #{id} | {name}
            </p>
            <p>{t("quantity")}: {quantity}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="bg-red text-white h-8 rounded-lg px-3"
        >
          {t("remove")}
        </button>
      </div>
    );
  }
}
