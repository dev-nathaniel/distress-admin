"use client"
import axios from 'axios';
import { useState } from 'react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const LogIn = async () => {
    if (!validateEmail(email) || !validatePassword(password)) return;
    try {
        const response = await axios.post('https://distress-server.onrender.com/api/login', {email, password})
    } catch (error) {
        console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-[url('/background-map.jpg')] bg-cover bg-center flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      <div className="z-10 w-full max-w-md p-8 rounded-2xl shadow-lg backdrop-blur-md border border-red-700 text-white">
        <h2 className="text-2xl font-bold mb-2">Access Control</h2>
        <p className="text-gray-400 mb-6">Enter your credentials to proceed</p>
        <input
          type="text"
          placeholder="Email or username"
          className="w-full mb-4 p-3 rounded-lg bg-black border border-red-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="text-red-500 text-xs mb-2">{emailError}</div>
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded-lg bg-black border border-red-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-red-500 text-xs mb-2">{passwordError}</div>
        <button className="w-full py-3 mb-4 bg-red-700 hover:bg-red-800 rounded-lg font-semibold text-white" onClick={LogIn}>Sign In</button>

        {/* <div className="flex items-center justify-between mb-4">
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-red-600" />
            <span className="ml-2 text-sm text-gray-400">Remember me</span>
          </label>
          <a href="#" className="text-sm text-red-500 hover:underline">Forgot password?</a>
        </div> */}

        {/* <div className="text-center text-gray-500 text-sm mb-4">OR</div>

        <button className="w-full flex items-center justify-center gap-2 py-3 mb-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
          <FaGoogle className="text-lg" /> Sign in with Google
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
          <FaGithub className="text-lg" /> Sign in with GitHub
        </button> */}

        <div className="absolute bottom-4 right-4 text-gray-500 text-xs">
          distress.local | v1.2.8
        </div>
      </div>
    </div>
  );
}