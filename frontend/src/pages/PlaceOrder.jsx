// frontend/src/pages/PlaceOrder.jsx
import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    // Get necessary context values
    const { products, cartItems, getCartAmount, currency, delivery_fee, placeOrder, navigate, token } = useContext(ShopContext); // Added token

    // State for payment method (though not fully implemented for processing yet)
    const [method, setMethod] = useState('cod'); // Default to Cash on Delivery

    // State for delivery address form data
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        phone: ""
    });

    // Handler for form input changes
    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    // Redirect if cart is empty or user is not logged in
    useEffect(() => {
        if (!token) {
            toast.info("Please login to place an order.");
            navigate('/login'); // Redirect to login if not logged in
        } else if (getCartAmount() === 0) {
            toast.info("Your cart is empty.");
            navigate('/'); // Redirect home if cart is empty
        }
    }, [token, getCartAmount, navigate]); // Dependencies include token and getCartAmount

    // Handle placing the order
    const handlePlaceOrder = async (event) => {
        event.preventDefault(); // Prevent default form submission if using form tag

        // Basic validation: Check if any field is empty
        for (const key in data) {
            if (data[key] === "") {
                toast.error(`Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                return; // Stop execution if any field is empty
            }
        }
         // Validate email format
        if (!/\S+@\S+\.\S+/.test(data.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        // Validate phone number format (simple check for digits, adjust as needed)
        if (!/^\d{10,}$/.test(data.phone)) { // Example: At least 10 digits
            toast.error("Please enter a valid phone number.");
            return;
        }


        // Prepare order items array
        let orderItems = [];
        if (products.length === 0) {
            toast.error("Product details haven't loaded yet. Please wait and try again.");
            return; // Stop if products aren't loaded
        }

        for (const itemId in cartItems) {
            let itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo && cartItems[itemId]) {
                for (const size in cartItems[itemId]) {
                    if (cartItems[itemId][size] > 0) {
                        orderItems.push({
                            productId: itemId, // Keep product ID for reference
                            name: itemInfo.name,
                            price: itemInfo.price,
                            quantity: cartItems[itemId][size],
                            size: size // Include the size
                        });
                    }
                }
            } else {
                console.warn(`Product info not found for item ID: ${itemId} while preparing order.`);
                // Optionally notify user or skip item silently
            }
        }

         // Add a check here: If no valid items were found, don't proceed
        if (orderItems.length === 0) {
            toast.error("Could not prepare items for the order. Please check your cart or try again later.");
            return;
        }


        // Prepare final order data object
        const orderDataPayload = {
            items: orderItems,
            amount: getCartAmount() + delivery_fee,
            address: data,
        };

        // Call the context function to place the order
        await placeOrder(orderDataPayload); // placeOrder handles navigation on success/failure
    };


    // Calculate total amount for display
    const totalAmount = getCartAmount() + delivery_fee;

    return (
        <div className='flex flex-col justify-between gap-8 pt-10 pb-20 border-t sm:flex-row sm:gap-20 sm:pt-14'>
            {/* Left Side: Delivery Information Form */}
            <form onSubmit={handlePlaceOrder} className='flex flex-col w-full gap-4 sm:w-1/2'>
                <div className='text-2xl'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex flex-col gap-4 sm:flex-row'>
                    <input onChange={onChangeHandler} name='firstName' value={data.firstName} className='w-full p-2 border outline-gray-500' type="text" placeholder='First Name' required />
                    <input onChange={onChangeHandler} name='lastName' value={data.lastName} className='w-full p-2 border outline-gray-500' type="text" placeholder='Last Name' required />
                </div>
                <input onChange={onChangeHandler} name='email' value={data.email} className='w-full p-2 border outline-gray-500' type="email" placeholder='Email Address' required />
                <input onChange={onChangeHandler} name='street' value={data.street} className='w-full p-2 border outline-gray-500' type="text" placeholder='Street Address' required />
                <div className='flex flex-col gap-4 sm:flex-row'>
                    <input onChange={onChangeHandler} name='city' value={data.city} className='w-full p-2 border outline-gray-500' type="text" placeholder='City' required />
                    <input onChange={onChangeHandler} name='state' value={data.state} className='w-full p-2 border outline-gray-500' type="text" placeholder='State' required />
                </div>
                <div className='flex flex-col gap-4 sm:flex-row'>
                    <input onChange={onChangeHandler} name='zip' value={data.zip} className='w-full p-2 border outline-gray-500' type="text" placeholder='Zip Code' required />
                    <input onChange={onChangeHandler} name='country' value={data.country} className='w-full p-2 border outline-gray-500' type="text" placeholder='Country' required />
                </div>
                <input onChange={onChangeHandler} name='phone' value={data.phone} className='w-full p-2 border outline-gray-500' type="tel" placeholder='Phone Number' required />
            </form>

            {/* Right Side: Cart Total and Payment */}
            <div className='flex flex-col w-full gap-8 sm:w-1/2 md:w-[40%]'>
                <CartTotal />
                {/* Payment Method (Example) */}
                <div>
                    <div className='text-2xl'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                    </div>
                    <div className='flex flex-col gap-3 mt-2'>
                        <label className='flex items-center gap-2'>
                            <input type="radio" name="payment" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                            Cash on Delivery (COD)
                        </label>
                        <label className='flex items-center gap-2 opacity-50 cursor-not-allowed'> {/* Example: Disable card payment */}
                            <input type="radio" name="payment" value="card" disabled checked={method === 'card'} onChange={() => setMethod('card')} />
                            <img src={assets.stripe_logo} className='w-20' alt="Stripe" /> (Unavailable)
                        </label>
                    </div>
                </div>
                <div className='w-full mt-auto text-end'> {/* Use mt-auto to push button down */}
                    <button type="button" onClick={handlePlaceOrder} className='px-8 py-3 mt-4 text-sm text-white bg-black sm:px-16 active:bg-gray-800 disabled:opacity-50' disabled={getCartAmount() === 0 || !token}> {/* Disable if cart empty or not logged in */}
                        PLACE ORDER
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlaceOrder;