import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Page");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
