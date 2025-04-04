export default function FilterTotal({onOpenFilters, total, totalInProgress, totalCompleted}) {
    return (
        <div className="flex flex-row mx-4 gap-4 items-center justify-between">
            {/* Total */}
            <p className="font-bold">Total: {total}</p>
            
            {/* Filter Button */}
            <button
              onClick={onOpenFilters}
              className="font-bold flex items-center gap-1"
              data-id="filter-button"
            >
              <img src="/Filter.png" alt="Filter" className="w-5 h-5" />
              <p className="text-sm">Filter and Sort</p>
            </button>           
        </div>
    );
}
