// frontend/src/pages/Orders.jsx
import React, { useContext, useEffect } from 'react'; // Added useEffect
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
// import { assets } from '../assets/assets'; // May not need assets if status comes from data

const Orders = () => {
    // Get orders state, fetch function, token, and currency from context
    const { orders, fetchOrders, token, currency } = useContext(ShopContext);

    // Fetch orders when component mounts or token changes
    useEffect(() => {
        if (token) { // Only fetch if logged in
            fetchOrders();
        }
        // If token becomes null/empty (logout), orders state will be cleared by logout function in context
    }, [token]); // Dependency array includes token

    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className='pt-16 border-t min-h-[60vh]'> {/* Added min-h */}
            <div className='text-2xl'>
                <Title text1={'YOUR'} text2={'ORDERS'} />
            </div>
            <div className='mt-5'> {/* Added margin top */}
                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div key={index} className='flex flex-col gap-4 py-4 mb-6 text-gray-700 border rounded-md shadow-sm md:flex-row md:items-center md:justify-between px-4'> {/* Added styling */}
                            {/* Left side: Order Items */}
                             <div className='flex-grow'>
                                <p className='mb-2 text-xs text-gray-500'>Order ID: {order._id}</p>
                                {order.items.map((item, itemIndex) => (
                                     <div key={itemIndex} className='flex items-start gap-3 mb-2 text-sm border-b last:border-b-0 pb-2'>
                                         {/* You might need to fetch product image based on item.productId if not stored in order */}
                                         {/* <img className='w-12 h-12 object-cover' src={item.image || placeholder_image} alt={item.name} /> */}
                                        <div>
                                            <p className='font-medium sm:text-base'>{item.name}</p>
                                            <div className='flex items-center gap-3 mt-1 text-xs text-gray-600'>
                                                <p>{currency}{item.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <p>Qty: {item.quantity}</p>
                                                <p>Size: {item.size}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>

                            {/* Right side: Order Details & Status */}
                            <div className='flex flex-col items-start flex-shrink-0 gap-2 text-sm md:items-end md:gap-3'>
                                <p>Date: <span className='font-medium'>{formatDate(order.date)}</span></p>
                                <p>Total: <span className='font-semibold'>{currency}{order.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                                <p>Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                <div className='flex items-center gap-2 mt-2'>
                                    {/* Simple status display */}
                                    <p className={`h-2 w-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : order.status === 'Shipped' ? 'bg-blue-500' : 'bg-yellow-500'}`}></p>
                                    <p className='text-xs font-medium md:text-sm'>{order.status}</p>
                                </div>
                                 {/* Optional: Add Track Order button - functionality needs to be added */}
                                {/* <button className='px-3 py-1 mt-2 text-xs font-medium border rounded-sm hover:bg-gray-100'>TRACK ORDER</button> */}
                            </div>
                        </div>
                    ))
                ) : (
                    // Show message if no orders found
                    <p className='mt-10 text-center text-gray-500'>You have no orders yet.</p>
                )}
            </div>
        </div>
    );
};

export default Orders;