import React from "react";
import { useState } from "react";

/*
  SearchBar - component with input and filter toggle

  props:
  - onOpenFilters - function to show FilterWIndow component
*/

export default function SearchBar({ onOpenFilters, onSearch, filterOn }) {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  if (filterOn){
  return (
    <div className="flex flex-row mx-4 gap-2 items-center justify-between">
      {/* Filter Button */}
      <button onClick={onOpenFilters} className="w-8 h-8">
        <img src="/Filter.png" alt="Filter" />
      </button>

      {/* Search Input */}
      <div className="relative flex-grow">
        <input
          className="w-full h-10 border rounded-xl px-3 pr-10"
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
else {
  return (
    <div className="flex flex-row mx-4 gap-2 items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-grow">
        <input
          className="w-full h-10 border rounded-xl px-3 pr-10"
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
}
