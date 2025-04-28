import React, { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  // State for UI elements
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  // --- Filter/Toggle Functions ---
  const toggleCategory = (e) => {
    // ... same as before ...
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    // ... same as before ...
     if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const clearFilters = () => {
    // ... same as before ...
    setCategory([]);
    setSubCategory([]);
  };

  // --- DERIVE the final list using useMemo ---
  const sortedAndFilteredProducts = useMemo(() => {
    console.log("[Collection useMemo] Running. Products count:", products.length); // Log start

    // 1. Filter based on context and state
    let filtered = products // Start directly with products from context
      .filter((item) => {
        // Search Filter
        const searchMatch = !showSearch || !search || item.name.toLowerCase().includes(search.toLowerCase());
        // Category Filter
        const categoryMatch = category.length === 0 || category.includes(item.category);
        // SubCategory Filter
        const subCategoryMatch = subCategory.length === 0 || subCategory.includes(item.subCategory);
        return searchMatch && categoryMatch && subCategoryMatch;
      });

    console.log("[Collection useMemo] After filtering count:", filtered.length); // Log after filtering

    // 2. Sort the filtered list (create a copy to avoid mutating the filtered ref)
    let sorted = [...filtered];
    switch (sortType) {
      case "low-high":
        console.log("[Collection useMemo] Sorting low-high");
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        console.log("[Collection useMemo] Sorting high-low");
        sorted.sort((a, b) => b.price - a.price);
        break;
      default: // relevant
        console.log("[Collection useMemo] Sorting relevant (no change)");
        break;
    }

     console.log("[Collection useMemo] Final sorted list:", sorted); // Log final list
    return sorted;

  }, [products, category, subCategory, search, showSearch, sortType]); // Dependencies

  // Log products directly in the render body for comparison
  console.log("[Collection Render] Products from context:", products);

  // --- Component Render ---
  return (
    <div className="flex flex-col gap-1 pt-10 border-t sm:flex-row sm:gap-10">
      {/* Filter Options */}
      <div className="min-w-60">
       {/* ... Filter UI ... */}
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 my-2 text-xl cursor-pointer"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="Dropdown"
          />
        </p>
        {/* Category Filters */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <label className="flex gap-2 cursor-pointer">
              <input
                className="w-3"
                type="checkbox"
                value={"Men"}
                onChange={toggleCategory}
                checked={category.includes("Men")}
              />
              Men
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input
                className="w-3"
                type="checkbox"
                value={"Women"}
                onChange={toggleCategory}
                checked={category.includes("Women")}
              />
              Women
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input
                className="w-3"
                type="checkbox"
                value={"Kids"}
                onChange={toggleCategory}
                checked={category.includes("Kids")}
              />
              Kids
            </label>
          </div>
        </div>
        {/* Sub Category Filters */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <label className="flex gap-2 cursor-pointer">
              <input
                className="w-3"
                type="checkbox"
                value={"Topwear"}
                onChange={toggleSubCategory}
                checked={subCategory.includes("Topwear")}
              />
              Topwear
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input
                className="w-3"
                type="checkbox"
                value={"Bottomwear"}
                onChange={toggleSubCategory}
                checked={subCategory.includes("Bottomwear")}
              />
              Bottomwear
            </label>
            <label className="flex gap-2 cursor-pointer">
              <input
                className="w-3"
                type="checkbox"
                value={"Winterwear"}
                onChange={toggleSubCategory}
                checked={subCategory.includes("Winterwear")}
              />
              Winterwear
            </label>
          </div>
        </div>
        {/* Clear Filters Button */}
        <button
          className={`px-4 py-2 mt-1 text-white bg-black rounded hover:bg-gray-900 ${
            showFilter ? "block" : "hidden"
          } sm:block`}
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* View Product Items */}
      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          {/* Product Sort */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 text-sm border-2 border-gray-300 rounded"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        {/* Map Products */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
          {/* Check based on the source array length before filtering */}
          {products.length === 0 ? (
             <p className="col-span-full text-center text-gray-500 mt-10">Loading products...</p> // Loading state
          ) : sortedAndFilteredProducts.length > 0 ? (
             sortedAndFilteredProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                name={item.name}
                image={item.image}
                price={item.price}
              />
            ))
          ) : (
             <p className="col-span-full text-center text-gray-500 mt-10">
                No products found matching your criteria.
             </p> // No results state
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;