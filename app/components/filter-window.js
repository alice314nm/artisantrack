import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/app/_utils/firebase";
import { useUserAuth } from "@/app/_utils/auth-context";
import "@/app/globals.css";

/*
  FilterWindow - component for selecting filters and sort options.

  props:
  - windowVisibility - state for visibility on the page
  - onClose - function to close the window
  - onApplyFilters - function to apply the selected filters
  - categories - list of categories to display (depends on the page)
*/

export default function FilterWindow({
  windowVisibility,
  onClose,
  onApplyFilters,
  categories,
}) {
  const { user } = useUserAuth();
  const [selectedCategory, setSelectedCategory] = useState("Categories");
  const [selectedFilters, setSelectedFilters] = useState({
    Categories: [],
    Colors: [],
    "Sort by": "",
  });
  const [colors, setColors] = useState([]);

  const filters = {
    Categories: categories,
    Colors: colors,
    "Sort by": [
      "Category",
      "Name Descending",
      "Name Ascending",
      "ID Ascending",
      "ID Descending",
    ],
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
        "Sort by": prev["Sort by"] === filter ? "" : filter,
      }));
    }
  };

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(selectedFilters);
    }
    onClose();
  };

  return (
    <div
      className={`fixed flex h-screen w-screen items-center justify-center bg-opacity-20 bg-black z-10 ${
        windowVisibility ? "" : "hidden"
      }`}
      data-id="filter-window"
    >
      <div className="w-[380px] fixed bg-beige border border-darkBeige shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center bg-darkBeige px-4 py-2">
          <p className="text-lg font-bold">Filters</p>
          {/* Close Button */}
          <button
            data-id="close-button"
            onClick={onClose}
            className="text-dark font-bold text-lg"
          >
            X
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="flex flex-col bg-lightBeige w-32 border-r border-darkBeige">
            {Object.keys(filters).map((category) => (
              <button
                key={category}
                data-id={
                  category === "Categories"
                    ? "categories-button"
                    : "sort-by-button"
                }
                onClick={() => setSelectedCategory(category)}
                className={`py-4 px-2 text-left text-dark border-b border-b-darkBeige hover:bg-beige ${
                  selectedCategory === category ? "bg-beige" : ""
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 bg-beige overflow-x-scroll scrollbar">
            {/* Filter Chips Container */}
            <div className="flex flex-col gap-2 mb-4 whitespace-nowrap">
              {/* First Row of Filter Chips */}
              <div className="flex gap-2">
                {filters[selectedCategory]
                  ?.slice(0, Math.ceil(filters[selectedCategory].length / 2))
                  .map((item, index) => (
                    <span
                      key={`${selectedCategory}-${item}-${index}`}
                      onClick={() => handleFilterClick(item, selectedCategory)}
                      className={`px-4 py-2 rounded-full border border-darkBeige cursor-pointer hover:bg-darkBeige ${
                        selectedCategory === "Categories" &&
                        selectedFilters.Categories.includes(item)
                          ? "!bg-darkBeige"
                          : "bg-lightBeige"
                      } ${
                        selectedCategory === "Colors" &&
                        selectedFilters.Colors.includes(item)
                          ? "!bg-darkBeige"
                          : "bg-lightBeige"
                      } ${
                        selectedCategory === "Sort by" &&
                        selectedFilters["Sort by"] === item
                          ? "!bg-darkBeige"
                          : "bg-lightBeige"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
              </div>

              {/* Second Row of Filter Chips */}
              <div className="flex gap-2">
                {filters[selectedCategory]
                  ?.slice(Math.ceil(filters[selectedCategory].length / 2))
                  .map((item, index) => (
                    <span
                      key={`${selectedCategory}-${item}-${index}`}
                      onClick={() => handleFilterClick(item, selectedCategory)}
                      className={`px-4 py-2 rounded-full border border-darkBeige cursor-pointer hover:bg-darkBeige ${
                        selectedCategory === "Categories" &&
                        selectedFilters.Categories.includes(item)
                          ? "!bg-darkBeige"
                          : "bg-lightBeige"
                      } ${
                        selectedCategory === "Colors" &&
                        selectedFilters.Colors.includes(item)
                          ? "!bg-darkBeige"
                          : "bg-lightBeige"
                      } ${
                        selectedCategory === "Sort by" &&
                        selectedFilters["Sort by"] === item
                          ? "!bg-darkBeige"
                          : "bg-lightBeige"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="sticky bottom-0 left-0 mt-16 flex justify-end">
              <button
                className="px-5 py-2 bg-green rounded-lg hover:bg-darkGreen"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
