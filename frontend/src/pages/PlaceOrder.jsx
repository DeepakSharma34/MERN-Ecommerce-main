// frontend/src/pages/PlaceOrder.jsx
import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const { products, cartItems, getCartAmount, currency, delivery_fee, placeOrder, navigate } = useContext(ShopContext);
    const [method, setMethod] = useState('cod');
    const [data, setData] = useState({ /* ... */ });

    const onChangeHandler = (event) => { /* ... */ };

    useEffect(() => { /* ... cart empty check ... */ }, [getCartAmount, navigate]);

    // Handle placing the order
    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        // --- LOG 1 ---
        console.log("[PlaceOrder] handlePlaceOrder started.");

        // Basic validation
        for (const key in data) {
            if (data[key] === "") {
                toast.error(`Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                // --- LOG 2 (Validation Fail) ---
                console.log(`[PlaceOrder] Validation failed: Missing ${key}`);
                return; // Stop execution
            }
        }
        // --- LOG 3 ---
        console.log("[PlaceOrder] Validation passed.");

        // Prepare order items array
        let orderItems = [];
        try {
            // --- LOG 4 ---
            console.log("[PlaceOrder] Preparing order items. Cart Items:", JSON.stringify(cartItems)); // Log cart items (stringified)
            // --- LOG 5 ---
            console.log("[PlaceOrder] Products available:", products); // Log products

            if (products.length === 0) {
                 // --- LOG 6 (Products Not Loaded) ---
                 console.warn("[PlaceOrder] Products array is empty. Cannot prepare order items.");
                 toast.error("Product details haven't loaded yet. Please wait and try again.");
                 return; // Stop if products aren't loaded
            }

            for (const itemId in cartItems) {
                let itemInfo = products.find((product) => product._id === itemId);
                // --- LOG 7 (Inside Loop) ---
                console.log(`[PlaceOrder] Finding product for ID: ${itemId}`, itemInfo ? 'FOUND' : 'NOT FOUND');

                if (itemInfo && cartItems[itemId]) {
                    for (const size in cartItems[itemId]) {
                        if (cartItems[itemId][size] > 0) {
                            orderItems.push({
                                productId: itemId,
                                name: itemInfo.name,
                                price: itemInfo.price,
                                quantity: cartItems[itemId][size],
                                size: size
                            });
                        }
                    }
                } else if (!itemInfo) {
                     // --- LOG 8 (Item Not Found) ---
                     console.warn(`[PlaceOrder] Product info NOT found for item ID: ${itemId} while preparing order.`);
                     // Decide how to handle: skip item or fail order? For now, it skips.
                }
            }
             // --- LOG 9 ---
            console.log("[PlaceOrder] Prepared order items:", orderItems);
        } catch (error) {
             // --- LOG 10 (Error Preparing Items) ---
            console.error("[PlaceOrder] Error preparing order items:", error);
            toast.error("An error occurred while preparing your order items.");
            return; // Stop execution
        }

        // --- Add a check here: If no valid items were found, don't proceed ---
        if (orderItems.length === 0) {
             // --- LOG 11 (No Items) ---
             console.log("[PlaceOrder] No valid order items could be prepared. Aborting.");
             toast.error("Could not prepare items for the order. Please check your cart or try again later.");
             return;
        }

        // Prepare final order data object
        const orderDataPayload = {
            items: orderItems,
            amount: getCartAmount() + delivery_fee,
            address: data,
        };
         // --- LOG 12 ---
        console.log("[PlaceOrder] Prepared orderDataPayload:", orderDataPayload);

        // Call the context function to place the order
         // --- LOG 13 ---
        console.log("[PlaceOrder] Calling context placeOrder function...");
        try {
             await placeOrder(orderDataPayload); // Ensure placeOrder exists and is called
             // --- LOG 14 (After Call) ---
             console.log("[PlaceOrder] Context placeOrder function finished (or threw error).");
        } catch(contextError) {
             // --- LOG 15 (Error from Context Call) ---
             console.error("[PlaceOrder] Error occurred during context placeOrder call:", contextError);
             // Toast message is likely handled inside the context's catch block already
        }
    };

    // --- Return JSX (keep as is) ---
    return (
        <div className='flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t'>
           {/* Form */}
           <form onSubmit={handlePlaceOrder} className='flex flex-col w-full gap-4 sm:max-w-[480px]'>
              {/* ... form inputs ... */}
           </form>
           {/* Cart Total / Payment / Button */}
           <div className='mt-8'>
                {/* ... cart total / payment methods ... */}
                 <div className='w-full mt-8 text-end'>
                     <button onClick={handlePlaceOrder} className='px-16 py-3 text-sm text-white bg-black active:bg-gray-800'>PLACE ORDER</button>
                 </div>
           </div>
        </div>
    );
}

export default PlaceOrder;