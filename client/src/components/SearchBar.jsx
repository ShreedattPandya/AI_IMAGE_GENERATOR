import { useState, useEffect, useRef } from "react";
import { MODEL_OPTIONS } from "../constants";

export default function SearchBar({ onSearch, initialSearch = "", initialModel = "", initialSort = "newest" }) {
  const [search, setSearch] = useState(initialSearch);
  const [model, setModel] = useState(initialModel);
  const [sort, setSort] = useState(initialSort);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch({ search, model, sort });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, model, sort]);

  return (
    <div className="gallery-search">
      <div className="gallery-search-main">
        <span className="gallery-search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          id="explore-search"
          type="search"
          aria-label="Search gallery"
          placeholder="Search gallery…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="gallery-search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="gallery-search-filters">
        <div className="filter-pill">
          <label htmlFor="explore-model-filter" className="sr-only">
            Filter by model
          </label>
          <select
            id="explore-model-filter"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="">All models</option>
            {MODEL_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-pill">
          <label htmlFor="explore-sort" className="sr-only">
            Sort by
          </label>
          <select id="explore-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="popular">Most liked</option>
            <option value="downloads">Most downloaded</option>
          </select>
        </div>
      </div>
    </div>
  );
}
