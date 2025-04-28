import React, { useState, useContext } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext'; // Import context

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  // Use setToken and navigate from context
  const { setToken, navigate } = useContext(ShopContext);

  const [currentState, setCurrentState] = useState("Sign Up");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    let url;
    let payload;
    const endpoint = currentState === "Login" ? "login" : "register";
    url = `${backendUrl}/api/user/${endpoint}`;

    if (currentState === "Login") {
      payload = { email: data.email, password: data.password };
    } else {
      payload = { name: data.name, email: data.email, password: data.password };
    }

    try {
      const response = await axios.post(url, payload);

      if (response.data.success) {
        // Use setToken from context instead of localStorage directly
        setToken(response.data.token);

        toast.success(`${currentState} successful!`);
        navigate('/'); // Navigate home after successful login/signup

      } else {
        toast.error(response.data.message || `Failed to ${currentState}`);
      }
    } catch (error) {
      console.error("API call error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  // Reset form fields when switching between Login and Sign Up
  const switchState = (newState) => {
      setCurrentState(newState);
      setData({ name: "", email: "", password: "" }); // Clear fields
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 mb-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mt-10 mb-2">
        <p className="text-3xl prata-regular">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "Sign Up" && (
        <input
          name="name"
          onChange={onChangeHandler}
          value={data.name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800 rounded-sm outline-none"
          placeholder="Your Name"
          required
        />
      )}
      <input
        name="email"
        onChange={onChangeHandler}
        value={data.email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800 rounded-sm outline-none"
        placeholder="your@email.com"
        required
      />
      <input
        name="password"
        onChange={onChangeHandler}
        value={data.password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800 rounded-sm outline-none"
        placeholder="Password (min 8 characters)"
        required
      />
      <div className="flex justify-end w-full text-sm mt-[-8px]">
        {/* <p className="cursor-pointer">Forgot your password?</p> */}
        {currentState === "Login" ? (
          <p
            onClick={() => switchState("Sign Up")} // Use switchState
            className="cursor-pointer hover:underline"
          >
            Create a new account
          </p>
        ) : (
          <p
            onClick={() => switchState("Login")} // Use switchState
            className="cursor-pointer hover:underline"
          >
            Already have an account? Login here
          </p>
        )}
      </div>
       {/* Terms and Conditions Checkbox */}
       {currentState === "Sign Up" && (
         <div className='flex items-start w-full gap-2 mt-2 text-xs'>
             <input type="checkbox" name='agree' id='agree' required className='mt-1'/>
             <label htmlFor='agree'>By continuing, I agree to the terms of use & privacy policy.</label>
         </div>
        )}
      <button type="submit" className="px-8 py-2 mt-4 font-light text-white bg-black rounded-sm active:bg-gray-700">
        {currentState === "Login" ? "SIGN IN" : "SIGN UP"}
      </button>
    </form>
  );
};

export default Login;