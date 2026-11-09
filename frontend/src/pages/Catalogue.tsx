import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, RotateCcw, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { Costume, CategoryInfo } from "../types";
import { api } from "../api/client";
import { CostumeCard } from "../components/CostumeCard";
import { useLanguage } from "../context/LanguageContext";

export const Catalogue: React.FC = () => {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [characterTypes, setCharacterTypes] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters from URL params or defaults
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const characterType = searchParams.get("character_type") || "all";
  const rentalMode = searchParams.get("rental_mode") || "all";
  const availableFrom = searchParams.get("available_from") || "";
  const availableTo = searchParams.get("available_to") || "";
  const slot = searchParams.get("slot") || "full_day";
  const sort = searchParams.get("sort") || "popular";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local search input
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    api.costumes.getCategories().then((res) => {
      setCategories(res.categories || []);
      setCharacterTypes(res.character_types || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    api.costumes
      .list({
        q,
        category: category !== "all" ? category : undefined,
        character_type: characterType !== "all" ? characterType : undefined,
        rental_mode: rentalMode !== "all" ? rentalMode : undefined,
        available_from: availableFrom || undefined,
        available_to: availableTo || undefined,
        slot: availableFrom ? slot : undefined,
        sort,
        page,
        limit: 12,
      })
      .then((res) => {
        setCostumes(res.items || []);
        setTotalItems(res.total || 0);
        setTotalPages(res.total_pages || 1);
      })
      .catch((err) => console.error("Error fetching costumes:", err))
      .finally(() => setLoading(false));
  }, [q, category, characterType, rentalMode, availableFrom, availableTo, slot, sort, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchInput.trim());
  };

  const resetAllFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = q || category !== "all" || characterType !== "all" || rentalMode !== "all" || availableFrom || availableTo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yakshagana Wardrobe Catalogue</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            {lang === "kn" ? "ಯಕ್ಷಗಾನ ವೇಷಭೂಷಣಗಳ ಸಂಗ್ರಹ" : "Explore Authentic Costumes"}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Showing {totalItems} costumes ready for performance rental across Karnataka
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs text-stone-500 font-medium">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="text-xs font-semibold bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-500 shadow-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="price_asc">Rental: Low to High</option>
            <option value="price_desc">Rental: High to Low</option>
            <option value="name_asc">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Search & Date Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by costume name, character, tags, or Kannada..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 text-stone-900 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-red-900"
            />
          </div>

          {/* Date availability filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="date"
                value={availableFrom}
                onChange={(e) => updateParam("available_from", e.target.value)}
                className="pl-9 pr-3 py-2.5 bg-stone-50 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-red-900"
                title="From date"
              />
            </div>
            <span className="text-xs text-stone-400">to</span>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="date"
                value={availableTo}
                onChange={(e) => updateParam("available_to", e.target.value)}
                className="pl-9 pr-3 py-2.5 bg-stone-50 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-red-900"
                title="To date"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-red-900 hover:bg-red-800 text-amber-100 font-semibold text-xs tracking-wider uppercase rounded-xl transition-colors shadow-sm shrink-0"
          >
            Search
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3 py-2.5 text-stone-600 hover:text-red-900 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-stone-200 hover:bg-stone-50"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </form>

        {/* Category Filter Chips */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 uppercase tracking-wider">
            <span>Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = (category === "all" && c.id === "all") || category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => updateParam("category", c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? "bg-red-900 text-amber-200 border border-red-950 shadow-sm"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  {c.label} {c.count > 0 && `(${c.count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Character Role Filter Chips */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 uppercase tracking-wider">
            <span>Character Role</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {characterTypes.map((ch) => {
              const active = (characterType === "all" && ch.id === "all") || characterType === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => updateParam("character_type", ch.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    active
                      ? "bg-amber-600 text-white border border-amber-700 shadow-sm"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Costume Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-stone-200 animate-pulse" />
          ))}
        </div>
      ) : costumes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-red-900 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">No Costumes Matched Your Filters</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Try adjusting your search query, clearing date constraints, or switching categories.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-6 py-2.5 bg-red-900 text-amber-100 text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-red-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {costumes.map((costume) => (
            <CostumeCard key={costume.id} costume={costume} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-8 pb-4">
          <button
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
            className="p-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold text-stone-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => updateParam("page", String(page + 1))}
            className="p-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
