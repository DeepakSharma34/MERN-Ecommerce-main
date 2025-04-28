// frontend/src/components/NavBar.jsx
import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const NavBar = () => {
    const [visible, setVisible] = useState(false);
    // Get token and logout function from context
    const { setShowSearch, getCartCount, token, logout, navigate } = useContext(ShopContext);

    const handleLogout = () => {
        logout(); // Call logout from context
        // Optional: Redirect after logout
        navigate('/');
    };

    return (
        <div className='flex items-center justify-between py-5 font-medium'>
            <Link to='/'>
                <img src={assets.logo} className='w-36' alt="Trendify" />
            </Link>
            <ul className='hidden gap-5 text-sm text-gray-700 sm:flex'>
                {/* NavLinks remain the same */}
                 <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>HOME</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>COLLECTION</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>ABOUT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>CONTACT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
            </ul>
            <div className='flex items-center gap-6'>
                <img
                    onClick={() => setShowSearch(true)}
                    src={assets.search_icon}
                    className='w-5 cursor-pointer'
                    alt="Search Products"
                />
                 {/* Profile Icon Logic */}
                 {token ? (
                     <div className='relative group'>
                         <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="Your Profile" />
                         <div className='absolute right-0 z-10 hidden pt-4 group-hover:block dropdown-menu'>
                             <div className='flex flex-col gap-2 px-5 py-3 text-gray-500 bg-gray-100 rounded shadow-md w-36'>
                                 {/* Link to Orders Page */}
                                 <Link to='/orders' className='cursor-pointer hover:text-black'>Orders</Link>
                                 <hr/>
                                 {/* Logout Button */}
                                 <p onClick={handleLogout} className='cursor-pointer hover:text-black'>Logout</p>
                             </div>
                         </div>
                     </div>
                 ) : (
                     // Show Login Link if not logged in
                     <Link to='/login'>
                          <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="Login/Signup" />
                     </Link>
                 )}
                <Link to='/cart' className='relative'>
                    <img src={assets.cart_icon} className='w-5 min-w-5' alt="Cart" />
                     {/* Display cart count only if logged in */}
                    {token && <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>}
                </Link>
                <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="Menu Icon" />
            </div>

             {/* Sidebar remains the same */}
             <div className={`absolute top-0 right-0 bottom-0 z-20 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img src={assets.dropdown_icon} className='h-4 rotate-180' alt="Dropdown" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                </div>
            </div>
        </div>
    )
}

export default NavBar;