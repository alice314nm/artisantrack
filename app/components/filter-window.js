import React, { useState } from "react";

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
  const [selectedCategory, setSelectedCategory] = useState("Categories");
  const [selectedFilters, setSelectedFilters] = useState({
    Categories: [],
    "Sort by": "",
  });

  const filters = {
    Categories: categories,
    "Sort by": ["Category", "Name Descending", "Name Ascending", "Color", "ID Ascending",
      "ID Descending"],
  };

  const handleFilterClick = (filter, category) => {
    if (category === "Categories") {
      setSelectedFilters((prev) => {
        const newCategories = prev.Categories.includes(filter)
          ? prev.Categories.filter((item) => item !== filter)
          : [...prev.Categories, filter];
        return { ...prev, Categories: newCategories };
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
      className={`fixed flex h-screen w-screen items-center justify-center bg-opacity-20 bg-black z-10 ${windowVisibility ? "" : "hidden"
        }`}
      data-id="filter-window"
    >
      <div className="w-[380px] fixed bg-beige border border-darkBeige rounded-lg shadow-lg">
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
                className={`py-4 px-2 text-left text-dark border-b border-b-darkBeige hover:bg-beige ${selectedCategory === category ? "bg-beige" : ""
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 bg-beige">
            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {filters[selectedCategory]?.map((item, index) => (
                <span
                  key={`${selectedCategory}-${item}-${index}`}
                  onClick={() => handleFilterClick(item, selectedCategory)}
                  className={`px-4 py-2 bg-[#FFF8E8] rounded-full border border-darkBeige cursor-pointer hover:bg-darkBeige ${selectedCategory === "Categories" &&
                    selectedFilters.Categories.includes(item)
                    ? "bg-[#DED2AE]"
                    : ""
                    } ${selectedCategory === "Sort by" &&
                      selectedFilters["Sort by"] === item
                      ? "bg-[#DED2AE]"
                      : ""
                    }`}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-end">
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