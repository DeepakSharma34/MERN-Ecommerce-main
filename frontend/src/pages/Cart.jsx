// frontend/src/pages/Cart.jsx
import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets'; // Keep assets import
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item],
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  const isCartEmpty = cartData.length === 0;

  // Conditionally render based on whether products have loaded
  if (products.length === 0 && !isCartEmpty) {
      // Optional: Show a loading indicator while products are loading but cart isn't empty
      return <div className='border-t pt-14 text-center'>Loading product details...</div>;
  }


  return (
    <div className='border-t pt-14'>
      <div className='mb-3 text-2xl'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>
      <div>
        {cartData.map((item, index) => {
          // Find product data
          const productData = products.find((product) => product._id === item._id);

          // ***** ADD THIS CHECK HERE *****
          if (!productData) {
            // Optionally log or handle this missing product case
            console.warn(`Product with ID ${item._id} not found in products list.`);
            return null; // Skip rendering this item if product data is missing
          }
          // *******************************

          // If productData exists, proceed to render
          return (
            <div key={item._id + '-' + item.size || index} className='grid py-4 text-gray-700 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'> {/* Use more stable key */}
              <div className='flex items-start gap-6'>
                 {/* Use optional chaining and fallback for image */}
                <img className='w-16 h-16 object-cover sm:w-20 sm:h-20' src={productData.image?.[0] || assets.logo /* fallback */} alt="Product" />
                <div>
                  <p className='text-sm font-medium sm:text-lg'>{productData.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>
                       {/* Use optional chaining and fallback for price */}
                      {currency} {(productData.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className='px-2 border sm:px-3 sm:py-1 bg-slate-50'>{item.size}</p>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))}
                className='w-16 px-1 py-1 text-center border sm:w-20 sm:px-2' // Adjusted width and added text-center
                type="number"
                min={1}
                value={item.quantity} // Make it controlled by value
              />
              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                className='w-4 mr-4 cursor-pointer sm:w-5 justify-self-end' // Added justify-self-end
                src={assets.bin_icon}
                alt="Remove"
              />
            </div>
          );
        })}
        {/* Show message if cart is truly empty */}
        {isCartEmpty && (
             <p className='mt-10 text-center text-gray-500'>Your cart is empty.</p>
        )}
      </div>
      {/* Cart Total and Checkout Button */}
      <div className={`flex justify-end my-20 ${isCartEmpty ? 'opacity-50 pointer-events-none' : ''}`}> {/* Disable section if cart empty */}
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className='w-full text-end'>
            <button
              onClick={() => navigate('/place-order')}
              className={`px-8 py-3 my-8 text-sm text-white bg-black active:bg-gray-700 ${isCartEmpty ? 'cursor-not-allowed' : ''}`}
              disabled={isCartEmpty} // Disable button directly
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;