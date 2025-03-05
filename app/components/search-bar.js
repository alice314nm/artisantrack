import React from "react";
import { useState } from "react";

export default function SearchBar({ onOpenFilters, onSearch, filterOn }) {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="flex flex-row mx-4 gap-2 items-center justify-between">
      <div className="relative flex-grow" data-id="search-bar">
        <input
          className="w-full h-10 border rounded-md px-3 pr-10 
            focus:outline-none 
            focus:ring-2 
            focus:ring-green
            focus:border-green
            transition-all 
            duration-200 
            ease-in-out"
          type="text"
          value={search}
          placeholder="Search..."
          onChange={handleSearch}
        />
        <img
          src="/Search.png"
          alt="Search"
          className="w-5 h-5 absolute top-1/2 transform -translate-y-1/2 right-3"
        />
      </div>
    </div>
  );
}