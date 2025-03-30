import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/app/_utils/firebase";
import { useUserAuth } from "@/app/_utils/auth-context";
import "@/app/globals.css";

export default function FilterWindow({
  windowVisibility,
  onClose,
  onApplyFilters,
  categories,
  pageType,
}) {
  const { user } = useUserAuth();
  const [selectedFilters, setSelectedFilters] = useState({
    Categories: [],
    Colors: [],
    Clients: [],
    "Sort by": "", // Default opened
  });
  const [colors, setColors] = useState([]);
  const [clients, setClients] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(""); // Default opened

  const filters =
    pageType === "material"
      ? {
          "Sort by": [
            "Category",
            "Name Descending",
            "Name Ascending",
            "ID Ascending",
            "ID Descending",
          ],
          Categories: categories,
          Colors: colors,
        }
      : pageType === "product"
      ? {
          "Sort by": [
            "Category",
            "Name Descending",
            "Name Ascending",
            "ID Ascending",
            "ID Descending",
          ],
          Categories: categories,
        }
      : {
          "Sort by": [
            "Category",
            "Name Descending",
            "Name Ascending",
            "Earliest Deadline",
            "Latest Deadline",
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
    if (category === "Categories") {
      setSelectedFilters((prev) => {
        const newCategories = prev.Categories.includes(filter)
          ? prev.Categories.filter((item) => item !== filter)
          : [...prev.Categories, filter];
        return { ...prev, Categories: newCategories };
      });
    } else if (category === "Colors") {
      setSelectedFilters((prev) => {
        const newColors = prev.Colors.includes(filter)
          ? prev.Colors.filter((item) => item !== filter)
          : [...prev.Colors, filter];
        return { ...prev, Colors: newColors };
      });
    } else if (category === "Sort by") {
      setSelectedFilters((prev) => ({
        ...prev,
        "Sort by": filter,
      }));
    } else if (category === "Clients") {
      setSelectedFilters((prev) => {
        const newClients = prev.Clients.includes(filter)
          ? prev.Clients.filter((item) => item !== filter)
          : [...prev.Clients, filter];
        return { ...prev, Clients: newClients };
      });
    }
  };

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(selectedFilters);
    }
    onClose();
  };

  const toggleDropdown = (category) => {
    setOpenDropdown(openDropdown === category ? "" : category);
  };

  // Reusable dropdown rendering
  const renderDropdown = (category) => {
    return (
      <div
        className="mb-4 transition-all duration-300 ease-in-out"
        key={category}
      >
        <div
          className="flex justify-between items-center cursor-pointer border-b border-darkBeige pb-2"
          onClick={() => toggleDropdown(category)}
          data-id={
            category === "Sort by"
              ? "sort-by-option"
              : category === "Colors"
              ? "color-option"
              : category === "Clients"
              ? "client-option"
              : ""
          }
        >
          <h3 className="text-lg font-semibold">{category}</h3>
          <img
            src={
              openDropdown === category
                ? "/angle-small-up.png"
                : "/angle-small-down.png"
            }
            className="w-6 h-6 transition-transform duration-300"
            alt="Toggle dropdown"
          />
        </div>

        <div
          className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${
                openDropdown === category
                  ? "max-h-96 opacity-100 mt-3"
                  : "max-h-0 opacity-0 mt-0"
              }
            `}
        >
          <div className="flex flex-wrap gap-2">
            {filters[category]?.map((item, index) => (
              <span
                key={`${category}-${item}-${index}`}
                onClick={() => handleFilterClick(item, category)}
                className={`
                    px-4 py-2 rounded-full border border-darkBeige cursor-pointer 
                    transition-all duration-200 ease-in-out
                    hover:bg-darkBeige hover:scale-105
                    ${
                      (category === "Categories" &&
                        selectedFilters.Categories.includes(item)) ||
                      (category === "Colors" &&
                        selectedFilters.Colors.includes(item)) ||
                      (category === "Sort by" &&
                        selectedFilters["Sort by"] === item) ||
                      (category === "Clients" &&
                        selectedFilters.Clients.includes(item))
                        ? "!bg-darkBeige text-white"
                        : "bg-lightBeige"
                    }
                  `}
                data-id={
                  category === "Sort by"
                    ? "sort-by"
                    : category === "Categories"
                    ? "category-filter"
                    : category === "Colors"
                    ? "color-filter"
                    : category === "Clients"
                    ? "client-filter"
                    : ""
                }
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Early return if not visible
  if (!windowVisibility) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-20"
      data-id="filter-window"
    >
      <div className="w-[420px] bg-beige border border-darkBeige rounded-lg shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center bg-darkBeige px-4 py-3">
          <h2 className="text-xl font-bold">Filters</h2>
          <button
            data-id="close-button"
            onClick={onClose}
            className="text-lg font-bold hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 bg-beige max-h-[60vh] overflow-y-auto">
          {/* Dynamically render dropdowns in new order */}
          {Object.keys(filters).map((category) => renderDropdown(category))}

          {/* Apply Filters Button */}
          <div className="mt-8 flex justify-end">
            <button
              className="
                px-6 py-2 bg-green rounded-md 
                hover:bg-darkGreen 
                transition-all duration-200 
                ease-in-out 
                transform hover:scale-105
                font-semibold
              "
              onClick={handleApplyFilters}
              data-id="apply-filters"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
