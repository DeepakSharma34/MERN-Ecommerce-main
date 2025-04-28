// frontend/src/context/ShopContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;
// --- LOG 1: Check if backendUrl is loaded ---
// console.log("[ShopContext] Backend URL loaded:", backendUrl); // Keep logs if needed

const ShopContextProvider = (props) => {
    // --- LOG 2: Check if Provider is rendering ---
    // console.log("[ShopContext] Provider rendering..."); // Keep logs if needed

    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [token, setTokenState] = useState(localStorage.getItem("token") || "");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]); // State for user orders
    const navigate = useNavigate();

    const currency = "$";
    const delivery_fee = 10;

    // --- Helper function to set token ---
    const setToken = (newToken) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem("token", newToken);
        } else {
            localStorage.removeItem("token");
        }
    };

    // --- Fetch Products ---
    const fetchProductList = async () => {
        // console.log("[ShopContext] Inside fetchProductList..."); // Keep logs if needed
        if (!backendUrl) {
            console.error("[ShopContext] fetchProductList Error: backendUrl is not defined!");
            toast.error("Backend URL is not configured correctly.");
            return;
        }
        try {
            const response = await axios.get(backendUrl + "/api/product/list");
            // console.log("[ShopContext] fetchProductList response:", response); // Keep logs if needed
            if (response.data.success) {
                setProducts(response.data.products);
                // console.log("[ShopContext] Products state updated."); // Keep logs if needed
            } else {
                console.error("[ShopContext] Failed to fetch products:", response.data.message);
                toast.error("Could not load products.");
            }
        } catch (error) {
            console.error("[ShopContext] Error fetching products (axios catch):", error);
            if (error.response) {
                console.error("[ShopContext] Axios Error Response:", error.response.data, error.response.status);
            } else if (error.request) {
                console.error("[ShopContext] Axios Error Request:", error.request);
            } else {
                console.error('[ShopContext] Axios Error Message:', error.message);
            }
            toast.error("Network error while fetching products.");
        }
    };

    // --- Load Cart Data ---
    const loadCartData = async (currentToken) => {
        // console.log("[ShopContext] Inside loadCartData..."); // Keep logs if needed
        if (!currentToken || !backendUrl) {
            // console.log("[ShopContext] loadCartData skipped (no token or backendUrl)"); // Keep logs if needed
            return;
        };
        try {
            const response = await axios.post(backendUrl + "/api/user/cart/get", {}, { headers: { token: currentToken } });
            // console.log("[ShopContext] loadCartData response:", response); // Keep logs if needed
            if (response.data.success) {
                setCartItems(response.data.cartData);
                // console.log("[ShopContext] CartItems state updated."); // Keep logs if needed
            } else {
                console.error("[ShopContext] Failed to load cart:", response.data.message);
            }
        } catch (error) {
            console.error("[ShopContext] Error loading cart data (axios catch):", error);
            if (error.response) {
                console.error("[ShopContext] Axios Cart Error Response:", error.response.data, error.response.status);
                if (error.response?.status === 401) {
                    logout();
                }
            } else if (error.request) {
                console.error("[ShopContext] Axios Cart Error Request:", error.request);
            } else {
                console.error('[ShopContext] Axios Cart Error Message:', error.message);
            }
        }
    };

    // --- Logout ---
    const logout = () => {
        setToken(""); // Clear token state
        localStorage.removeItem("token"); // Clear token from storage
        setCartItems({});
        setOrders([]); // Clear orders on logout
        toast.info("Logged out successfully.");
        // Optional: redirect if needed navigate('/login');
    };


    // --- Fetch User Orders ---
    // ***** MAKE SURE THIS FUNCTION DEFINITION EXISTS *****
    const fetchOrders = async () => {
        console.log("[ShopContext] Fetching orders..."); // Add log
        if (!token || !backendUrl) {
            console.log("[ShopContext] fetchOrders skipped (no token or backendUrl)");
            return;
        };
        try {
            const response = await axios.get(backendUrl + "/api/order/list", { headers: { token } });
            console.log("[ShopContext] fetchOrders response:", response); // Add log
            if (response.data.success) {
                setOrders(response.data.data);
                console.log("[ShopContext] Orders state updated."); // Add log
            } else {
                toast.error("Failed to fetch orders.");
                console.error("Fetch Orders Error:", response.data.message);
                 if (response.data.message.includes("Authorization") || response.data.message.includes("expired")) {
                    logout(); // Logout on auth errors
                }
            }
        } catch (error) {
            toast.error("Error fetching orders.");
            console.error("Error fetching orders (catch):", error);
            if (error.response) {
                console.error("[ShopContext] Axios Orders Error Response:", error.response.data, error.response.status);
                 if(error.response?.status === 401) { // Check specifically for 401
                   logout();
                }
            } else if (error.request) {
                 console.error("[ShopContext] Axios Orders Error Request:", error.request);
            } else {
                 console.error('[ShopContext] Axios Orders Error Message:', error.message);
            }
        }
     };

     // --- Place Order ---
     // ***** MAKE SURE THIS FUNCTION DEFINITION EXISTS *****
     const placeOrder = async (orderDataPayload) => { // Renamed param for clarity
        console.log("[ShopContext] Placing order..."); // You see this log

        // --- ADDED LOG ---
        console.log("[ShopContext] Payload to be sent:", orderDataPayload);
        // --- ADDED LOG ---
        console.log("[ShopContext] Backend URL for place order:", backendUrl + "/api/order/place");
        // --- ADDED LOG ---
        console.log("[ShopContext] Token being sent:", token);

        if (!token || !backendUrl) {
            console.error("[ShopContext] Missing token or backendUrl inside placeOrder!");
            toast.error("Authentication or configuration error. Please log in again.");
            if (!token) navigate('/login');
            return;
        }

        try {
            // --- ADDED LOG ---
            console.log("[ShopContext] Attempting axios.post...");

            const response = await axios.post(backendUrl + "/api/order/place", orderDataPayload, { headers: { token } });

            // --- ADDED LOG ---
            console.log("[ShopContext] axios.post finished. Response:", response); // Log after successful request initiation

            if (response.data.success) {
                toast.success("Order placed successfully!");
                setCartItems({}); // Clear local cart state after successful order
                // Fetch orders again to update the list immediately (optional but good UX)
                await fetchOrders(); // Fetch orders right after placing one
                navigate('/orders'); // Navigate to orders page
            } else {
                toast.error(response.data.message || "Failed to place order.");
                 // Check if backend indicates auth error
                if (response.data.message.includes("Authorization") || response.data.message.includes("expired")) {
                    logout(); // Logout on auth errors
                }
            }
        } catch (error) {
            // --- ADDED LOG ---
            console.error("[ShopContext] CATCH block in placeOrder triggered:", error);
             // Log detailed Axios error info
             if (error.response) {
                console.error("[ShopContext] Axios Place Order Error Response:", error.response.data, error.response.status);
                 if(error.response?.status === 401) { // Check specifically for 401
                   logout();
                }
            } else if (error.request) {
                 console.error("[ShopContext] Axios Place Order Error Request:", error.request); // Could be network issue, CORS, etc.
                 toast.error("Network error: Could not reach server to place order.");
            } else {
                 console.error('[ShopContext] Axios Place Order Error Message:', error.message); // General JS error before/during request setup
                 toast.error("An unexpected error occurred while placing the order.");
            }
            // General toast for the catch block (can be refined based on specific errors)
            // toast.error("Error placing order. Please try again."); // This might be redundant now
        }
     };


    // --- Initial Load useEffect ---
    useEffect(() => {
        // console.log("[ShopContext] useEffect[] (mount) running..."); // Keep logs if needed
        fetchProductList();

        async function loadData() {
            const currentToken = localStorage.getItem("token");
            if (currentToken) {
                setTokenState(currentToken); // Set state from storage initially
                await loadCartData(currentToken);
                // Removed initial fetchOrders here, let Orders page trigger it
            }
        }
        loadData();
    }, []); // Empty dependency array ensures this runs only once on mount


    // --- useEffect to monitor products state (Optional for debugging) ---
    // useEffect(() => {
    //     console.log("[ShopContext] Products state CHANGED:", products);
    // }, [products]);


    // --- Cart Management Functions ---
    const addToCart = async (itemId, size) => {
        // ... keep existing addToCart ...
        if (!token) {
        toast.info("Please login to add items to the cart.");
        navigate('/login');
        return;
        }
        if (!size) {
        toast.error("Please Select a Size");
        return;
        }
        setCartItems((prev) => {
        const newCart = structuredClone(prev);
        if (!newCart[itemId]) newCart[itemId] = {};
        newCart[itemId][size] = (newCart[itemId][size] || 0) + 1;
        return newCart;
        });
        try {
        const response = await axios.post(backendUrl + "/api/user/cart/add", { itemId, size }, { headers: { token } });
        if (response.data.success) {
            toast.success("Item Added To The Cart");
        } else {
            toast.error(response.data.message || "Failed to add item");
            // Revert local state if backend fails
             loadCartData(token); // Reload cart from backend to ensure consistency
             if (response.data.message.includes("Authorization") || response.data.message.includes("expired")) {
                    logout(); // Logout on auth errors
             }
        }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Could not add item to cart.");
            // Revert local state on error
            loadCartData(token); // Reload cart from backend to ensure consistency
            if(error.response?.status === 401) { // Check specifically for 401
               logout();
            }
        }
    };

    const updateQuantity = async (itemId, size, quantity) => {
        // ... keep existing updateQuantity ...
        if (!token) return;
        const originalQuantity = cartItems[itemId]?.[size]; // Store original before optimistic update
        setCartItems((prev) => {
        const newCart = structuredClone(prev);
        if (!newCart[itemId] || newCart[itemId][size] === undefined) return prev; // Item/size not in cart
        if (quantity <= 0) {
            delete newCart[itemId][size];
            if (Object.keys(newCart[itemId]).length === 0) {
                delete newCart[itemId];
            }
            toast.success("Item Removed From The Cart"); // Optimistic UI update
        } else {
            newCart[itemId][size] = quantity;
        }
        return newCart;
        });
        try {
            const response = await axios.post(backendUrl + "/api/user/cart/update", { itemId, size, quantity }, { headers: { token } });
            if (!response.data.success) {
                toast.error(response.data.message || "Failed to update cart");
                 // Revert local state if backend fails
                loadCartData(token); // Reload cart from backend
                 if (response.data.message.includes("Authorization") || response.data.message.includes("expired")) {
                    logout(); // Logout on auth errors
                 }
            }
             // No else needed, optimistic update already happened
        } catch (error) {
            console.error("Error updating cart:", error);
            toast.error("Could not update cart.");
            // Revert local state on error
            loadCartData(token); // Reload cart from backend
            if(error.response?.status === 401) { // Check specifically for 401
               logout();
            }
        }
    };

    // --- Calculation Functions ---
    const getCartCount = () => {
        // ... keep existing getCartCount ...
        let totalCount = 0;
        for (const items in cartItems) {
        if (cartItems[items]) {
            for (const size in cartItems[items]) {
            if (cartItems[items][size] > 0) {
                totalCount += cartItems[items][size];
            }
            }
        }
        }
        return totalCount;
    };

    const getCartAmount = () => {
        // ... keep existing getCartAmount ...
        let totalAmount = 0;
        for (const itemId in cartItems) {
        // Ensure products array is populated before calculating
        if (products && products.length > 0) {
            let itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo && cartItems[itemId]) {
                for (const size in cartItems[itemId]) {
                    if (cartItems[itemId][size] > 0) {
                    totalAmount += itemInfo.price * cartItems[itemId][size];
                    }
                }
                }
        } else {
            // Handle case where products are not yet loaded, maybe return 0 or show loading state elsewhere
             // console.warn("[ShopContext] getCartAmount called before products loaded.");
             return 0; // Return 0 temporarily if products aren't ready
        }
        }
        return totalAmount;
    };

    // --- Context Value Object ---
    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        token,
        setToken,
        logout,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        orders,      // Ensure this is included
        fetchOrders, // Ensure this is included
        placeOrder   // Ensure this is included
    };

    // console.log("[ShopContext] Context Value Object:", value); // Keep log if needed

    return (
        <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
    );
};

export default ShopContextProvider;