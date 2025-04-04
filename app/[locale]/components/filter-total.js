import { useTranslations } from "next-intl";

export default function FilterTotal({ onOpenFilters, total }) {
  const t = useTranslations("FilterTotal");

  return (
    <div className="flex flex-row mx-4 gap-4 items-center justify-between">
      {/* Total */}
      <p className="font-bold">{t("total")}: {total}</p>

      {/* Filter Button */}
      <button
        onClick={onOpenFilters}
        className="font-bold flex items-center gap-1"
        data-id="filter-button"
      >
        <img src="/Filter.png" alt={t("filterAlt")} className="w-5 h-5" />
        <p className="text-sm">{t("filterAndSort")}</p>
      </button>
    </div>
  );
}
