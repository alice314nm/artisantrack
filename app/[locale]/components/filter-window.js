import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/app/[locale]/_utils/firebase";
import { useUserAuth } from "@/app/[locale]/_utils/auth-context";
import { useTranslations } from "next-intl";
import "@/app/globals.css";

export default function FilterWindow({
  windowVisibility,
  onClose,
  onApplyFilters,
  categories,
  pageType,
}) {
  const t = useTranslations("FilterWindow");
  const { user } = useUserAuth();
  const [selectedFilters, setSelectedFilters] = useState({
    Categories: [],
    Colors: [],
    Clients: [],
    "Sort by": "",
  });
  const [colors, setColors] = useState([]);
  const [clients, setClients] = useState([]);
  const [openDropdown, setOpenDropdown] = useState("");

  const filters =
    pageType === "material"
      ? {
        "Sort by": [
          t("sort.category"),
          t("sort.nameDesc"),
          t("sort.nameAsc"),
          t("sort.idAsc"),
          t("sort.idDesc"),
        ],
        Categories: categories,
        Colors: colors,
      }
      : pageType === "product"
        ? {
          "Sort by": [
            t("sort.category"),
            t("sort.nameDesc"),
            t("sort.nameAsc"),
            t("sort.idAsc"),
            t("sort.idDesc"),
          ],
          Categories: categories,
        }
        : {
          "Sort by": [
            t("sort.category"),
            t("sort.nameDesc"),
            t("sort.nameAsc"),
            t("sort.earliestDeadline"),
            t("sort.latestDeadline"),
          ],
          Categories: categories,
          Clients: clients,
        };

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const db = getFirestore(app);
        const colorSnapshot = await getDocs(
          collection(db, `users/${user.uid}/colors`)
        );
        const colorList = colorSnapshot.docs.map((doc) => doc.data().name);
        setColors(colorList);
      } catch (error) {
        console.error("Error fetching colors: ", error);
      }
    };

    fetchColors();
  }, [user]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const db = getFirestore(app);
        const clientsCollection = collection(db, `users/${user.uid}/customers`);
        const clientsSnapshot = await getDocs(clientsCollection);
        const clientsData = clientsSnapshot.docs.map((doc) => doc.data().name);
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients: ", error);
      }
    };

    if (user) {
      fetchClients();
    }
  }, [user]);

  const handleFilterClick = (filter, category) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (category === "Sort by") {
        updated[category] = filter;
      } else {
        updated[category] = prev[category].includes(filter)
          ? prev[category].filter((item) => item !== filter)
          : [...prev[category], filter];
      }
      return updated;
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters?.(selectedFilters);
    onClose();
  };

  const toggleDropdown = (category) => {
    setOpenDropdown(openDropdown === category ? "" : category);
  };

  const renderDropdown = (category) => (
    <div className="mb-4 transition-all duration-300 ease-in-out" key={category}>
      <div
        className="flex justify-between items-center cursor-pointer border-b border-darkBeige pb-2"
        onClick={() => toggleDropdown(category)}
      >
        <h3 className="text-lg font-semibold">{t(`categories.${category}`)}</h3>
        <img
          src={openDropdown === category ? "/angle-small-up.png" : "/angle-small-down.png"}
          className="w-6 h-6 transition-transform duration-300"
          alt={t("toggleDropdown")}
        />
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdown === category ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
          }`}
      >
        <div className="flex flex-wrap gap-2">
          {filters[category]?.map((item, index) => (
            <span
              key={`${category}-${item}-${index}`}
              onClick={() => handleFilterClick(item, category)}
              className={`px-4 py-2 rounded-full border border-darkBeige cursor-pointer 
                transition-all duration-200 ease-in-out
                hover:bg-darkBeige hover:scale-105
                ${selectedFilters[category]?.includes(item) || selectedFilters["Sort by"] === item
                  ? "!bg-darkBeige text-white"
                  : "bg-lightBeige"
                }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (!windowVisibility) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-20">
      <div className="w-[420px] bg-beige border border-darkBeige rounded-lg shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center bg-darkBeige px-4 py-3">
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <button
            onClick={onClose}
            className="text-lg font-bold hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-beige max-h-[60vh] overflow-y-auto">
          {Object.keys(filters).map((category) => renderDropdown(category))}
          <div className="mt-8 flex justify-end">
            <button
              className="px-6 py-2 bg-green rounded-md hover:bg-darkGreen transition-all duration-200 ease-in-out transform hover:scale-105 font-semibold"
              onClick={handleApplyFilters}
            >
              {t("apply")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

