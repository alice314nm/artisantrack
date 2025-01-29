import React, { useState } from "react";

/*
  FilterWindow - component of the filter window to choose filters and sort options

  props:
  - windowVisibility - state for its visibility on the page
  - onClose - function to close the window on the page
  
*/

export default function FilterWindow({ windowVisibility, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState("Categories");

  const filters = {
    Categories: ["Scarf", "Top", "Vest", "Sweater"],
    "Sort by": ["category", "name descending", "name ascending"],
  };

  return (
    <div
      className={`fixed flex h-screen w-screen items-center justify-center bg-opacity-20 bg-black z-10 ${
        windowVisibility ? "" : "hidden"
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
                className={`py-4 px-2 text-left text-dark border-b border-b-darkBeige hover:bg-beige ${
                  selectedCategory === category ? "bg-beige" : ""
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
              {filters[selectedCategory]?.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 bg-lightBeige rounded-full border border-darkBeige cursor-pointer hover:bg-darkBeige"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-end">
              <button
                className="px-5 py-2 bg-green rounded-lg hover:bg-darkGreen"
                onClick={onClose}
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
