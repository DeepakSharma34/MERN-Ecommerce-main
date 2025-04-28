// frontend/src/pages/Orders.jsx
import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
// You might not need assets if status styling is handled directly
// import { assets } from '../assets/assets';

const Orders = () => {
    const { orders, fetchOrders, token, currency } = useContext(ShopContext);

    // Fetch orders when component mounts or token changes
    useEffect(() => {
        if (token) { // Only fetch if logged in
            fetchOrders();
        }
        // If token becomes null/empty (logout), orders state will be cleared by logout function in context
    }, [token, fetchOrders]); // Added fetchOrders as dependency for correctness if it could change

    // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', // Use full month name
            day: 'numeric'
        });
    };

    // Helper function to get status color (Tailwind classes)
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-500';
            case 'shipped':
                return 'bg-blue-500';
            case 'cancelled':
                return 'bg-red-500';
            case 'order processing':
            default:
                return 'bg-yellow-500';
        }
    };

     // Helper function to get status text color (Tailwind classes)
     const getStatusTextColor = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'text-green-700';
            case 'shipped':
                return 'text-blue-700';
            case 'cancelled':
                return 'text-red-700';
            case 'order processing':
            default:
                return 'text-yellow-700';
        }
    };


    return (
        <div className='pt-16 border-t min-h-[70vh] mb-10'> {/* Added more min-h and mb */}
            <div className='mb-8 text-2xl'> {/* Increased margin bottom */}
                <Title text1={'YOUR'} text2={'ORDERS'} />
            </div>
            <div className='space-y-6'> {/* Use space-y for consistent gap between order cards */}
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order._id} className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'> {/* Card container */}

                            {/* Order Header: ID, Date, Status */}
                            <div className='bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200'>
                                <div>
                                    <p className='text-sm font-medium text-gray-800'>Order ID: <span className='font-normal text-gray-600'>{order._id}</span></p>
                                    <p className='text-xs text-gray-500 mt-1'>Placed on: {formatDate(order.date)}</p>
                                </div>
                                <div className='flex items-center gap-2 mt-2 sm:mt-0'>
                                    <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(order.status)}`}></span>
                                    <p className={`text-xs sm:text-sm font-semibold ${getStatusTextColor(order.status)}`}>{order.status}</p>
                                </div>
                            </div>

                            {/* Order Body: Items and Summary */}
                            <div className='px-4 py-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6'> {/* Grid for items and summary */}

                                {/* Items Section */}
                                <div className='md:col-span-2 space-y-3'>
                                     <p className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</p>
                                    {order.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className='flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0'>
                                            {/* Placeholder for image - Add if available */}
                                            {/* <img className='w-14 h-14 object-cover rounded' src={item.imageUrl || '/placeholder.png'} alt={item.name} /> */}
                                            <div className='flex-grow'>
                                                <p className='text-sm font-medium text-gray-900'>{item.name}</p>
                                                <div className='flex justify-between items-center mt-1'>
                                                    <p className='text-xs text-gray-500'>
                                                        Size: {item.size} | Qty: {item.quantity}
                                                    </p>
                                                    <p className='text-sm font-medium text-gray-800'>
                                                        {currency}{item.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping & Total Section */}
                                <div className='md:col-span-1 space-y-4'>
                                    <div>
                                         <p className="text-sm font-medium text-gray-700 mb-1">Shipping Address</p>
                                         <div className='text-xs text-gray-600 leading-snug'>
                                             <p>{order.address.firstName} {order.address.lastName}</p>
                                             <p>{order.address.street}</p>
                                             <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                                             <p>{order.address.country}</p>
                                             <p className='mt-1'>Phone: {order.address.phone}</p>
                                         </div>
                                    </div>
                                    <div>
                                         <p className="text-sm font-medium text-gray-700 mb-1">Order Total</p>
                                         <p className='text-lg font-semibold text-gray-900'>
                                            {currency}{order.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                         </p>
                                         <p className='text-xs text-gray-500'>(Includes Shipping Fee)</p>
                                    </div>

                                     {/* Optional: Add Track Order button - functionality needs to be added */}
                                     {/* <button className='w-full px-3 py-2 mt-2 text-xs font-medium text-center border rounded hover:bg-gray-100 transition-colors'>TRACK ORDER</button> */}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Show message if no orders found
                    <div className='flex flex-col items-center justify-center text-center text-gray-500 py-16 border rounded-lg bg-gray-50'>
                        {/* Optional: Add an icon */}
                        {/* <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> */}
                        <p className='text-lg font-medium'>You haven't placed any orders yet.</p>
                        <p className='mt-2 text-sm'>Start shopping to see your orders here!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;