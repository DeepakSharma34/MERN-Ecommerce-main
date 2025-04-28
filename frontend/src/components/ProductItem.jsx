// frontend/src/components/ProductItem.jsx
import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { assets } from '../assets/assets'; // Assuming you might want icons later

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  // Use the first image, provide a fallback if image array is empty or undefined
  const displayImage = image?.[0] || ''; // Use optional chaining and provide empty string as fallback

  return (
    // Link component itself is the grid item, add group for hover effects
    <Link className="flex flex-col text-gray-700 cursor-pointer group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300" to={`/product/${id}`}>

      {/* Image Container: Force aspect ratio, relative positioning for potential overlays */}
      <div className="relative w-full overflow-hidden aspect-square bg-gray-100">
        <img
          className="w-full h-full object-cover transition duration-300 ease-in-out group-hover:scale-105" // Slightly less zoom
          src={displayImage}
          alt={name || "Product Image"}
          loading="lazy"
        />
         {/* Optional: Add a subtle overlay or icon on hover if desired later */}
         {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
             <img src={assets.search_icon} alt="View" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 invert brightness-0 filter" />
         </div> */}
      </div>

      {/* Text & Price/Button Container */}
      <div className="p-3 flex flex-col flex-grow"> {/* Use flex-grow to push button down */}
        {/* Product Name: Improved styling and overflow handling */}
        <h3 className="text-sm font-medium text-gray-800 h-10 line-clamp-2 mb-2 group-hover:text-black transition-colors"> {/* Adjusted height/margin */}
          {name}
        </h3>

        {/* Price Button - Pushed to the bottom */}
        <div className="mt-auto pt-2"> {/* mt-auto pushes this down, pt-2 adds space */}
          <div className="inline-block w-full text-center px-4 py-2 bg-gray-800 text-white text-xs font-semibold rounded hover:bg-black transition-colors duration-200">
            {currency} 
            {price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
           {/* Or if you want an actual button feel (requires handling click separately if needed):
           <button className="w-full px-4 py-2 bg-gray-800 text-white text-xs font-semibold rounded hover:bg-black transition-colors duration-200">
               {currency} 
               {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
           </button>
           */}
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;