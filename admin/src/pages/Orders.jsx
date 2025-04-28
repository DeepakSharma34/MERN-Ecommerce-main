// admin/src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'; // Assuming assets are needed for icons later
import { backendUrl, currency } from '../App'; // Import backendUrl and currency formatter

const Orders = ({ token }) => { // Receive token as prop
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    const fetchAllOrders = async () => {
        setLoading(true);
        if (!token) {
            toast.error("Authentication token is missing.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(backendUrl + "/api/order/listall", {
                headers: { token } // Send admin token in headers
            });
            if (response.data.success) {
                setOrders(response.data.data);
                console.log("Fetched all orders:", response.data.data);
            } else {
                toast.error("Error fetching orders: " + response.data.message);
            }
        } catch (error) {
            console.error("Error fetching all orders:", error);
            toast.error("Failed to fetch orders. " + (error.response?.data?.message || "Check network connection."));
            // Handle potential 401 Unauthorized error if token is invalid/expired
            if (error.response?.status === 401) {
                 // Optionally trigger logout state in Admin App.jsx if needed
                 toast.error("Session expired or invalid. Please log in again.");
            }
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    // Fetch orders when component mounts or token changes
    useEffect(() => {
        fetchAllOrders();
    }, [token]); // Re-fetch if token changes (e.g., on login)

     // Helper function to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // --- TODO: Implement Order Status Update ---
    const statusHandler = async (event, orderId) => {
        const newStatus = event.target.value;
        // Make API call to backend to update order status
        console.log(`Updating order ${orderId} status to ${newStatus}`);
        // Example API call structure:
        /*
        try {
            const response = await axios.post(backendUrl + "/api/order/updatestatus",
                { orderId, status: newStatus },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success("Order status updated!");
                await fetchAllOrders(); // Refresh the list
            } else {
                toast.error("Failed to update status: " + response.data.message);
            }
        } catch(error) {
             toast.error("Error updating status.");
             console.error("Update Status Error:", error);
        }
        */
       toast.info("Status update functionality not yet implemented."); // Placeholder
    }


    if (loading) {
        return <div className="text-center mt-10">Loading orders...</div>;
    }

    return (
        <div className="order-list">
            <h2 className="text-xl font-semibold mb-4">All Customer Orders</h2>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="p-4 border rounded-lg shadow-sm bg-white grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                            {/* Column 1: Items */}
                            <div className="md:col-span-2">
                                <p className='text-xs text-gray-500 mb-1'>Order ID: {order._id}</p>
                                {order.items?.map((item, index) => (
                                    <p key={index} className="text-sm text-gray-700 mb-1 last:mb-0">
                                        {item.name} ({item.size}) x {item.quantity}
                                    </p>
                                ))}
                             </div>

                             {/* Column 2: Address & Contact */}
                             <div className='text-sm'>
                                 <p className='font-medium mb-1'>{order.address.firstName} {order.address.lastName}</p>
                                 <p>{order.address.street}</p>
                                 <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                                 <p>{order.address.country}</p>
                                 <p className='mt-1'>{order.address.phone}</p>
                             </div>

                             {/* Column 3: Details & Status */}
                             <div className='text-sm md:text-right'>
                                 <p className='mb-1'>Items: {order.items?.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                 <p className='mb-1 font-semibold'>{currency(order.amount)}</p>
                                 <p className='mb-2 text-xs text-gray-500'>{formatDate(order.date)}</p>
                                 <select
                                     onChange={(event) => statusHandler(event, order._id)}
                                     value={order.status}
                                     className="p-1 border border-gray-300 rounded text-xs w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500"
                                 >
                                     <option value="Order Processing">Order Processing</option>
                                     <option value="Shipped">Shipped</option>
                                     <option value="Delivered">Delivered</option>
                                     <option value="Cancelled">Cancelled</option>
                                 </select>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-10">No orders found.</p>
            )}
        </div>
    );
};

export default Orders;