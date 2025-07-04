"use client"
import Image from "next/image";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // Mapbox GL JS for map functionality
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Home() {
  // State management for form inputs and UI
  const [email, setEmail] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [id, setId] = useState<string>()

  // Effect to extract and set ID from URL parameters on component mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    if (id) {
      setId(id)
      console.log(`ID from URL param: ${id}`);
    } else {
      console.log('No ID found in URL param');
    }
  }, []);

  // Email validation function using regex pattern
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Function to handle distress escalation
  const Escalate = async (id: string) => {
    setIsLoading(true)
    if (!validateEmail(email)) {
      toast.error('Invalid email format', {
        style: {
          background: '#111827',
          color: '#f87171'
      }
      })
      setIsLoading(false)
      return
    };
    console.log(email, 'email')
    console.log(additionalInfo, 'add')
    try {
      // API call to escalate distress
      const res = await axios.post(`https://distress-server.onrender.com/api/distress/escalate/${id}`, {email, phoneNumber: null, additionalInfo: additionalInfo})
      console.log(res.data)
      setIsLoading(false)
      toast.success('Distress successfully escalated', {
        style: {
          background: '#111827',
          color: '#f87171'
      }
      })
    } catch (error: any) {
      console.log(error.response.status, error.response.status === 404)
      if (error.response && error.response.status === 404) {
        console.log(error)
        setIsLoading(false)
        toast.error(error.response.data.message, {
          style: {
            background: '#111827',
            color: '#f87171'
          }
        })
      } else {
        console.log(error)
        setIsLoading(false)
        toast.error('Something went wrong', {
          style: {
            background: '#111827',
            color: '#f87171'
          }
        })
      }
    }
  }
  return (
    // Main container with background map image
    <div className="min-h-screen bg-[url('/background-map.jpg')] bg-cover bg-center flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      {/* Form container with glassmorphism effect */}
      <div className="z-10 w-full max-w-md p-8 rounded-2xl shadow-lg backdrop-blur-md border border-red-700 text-white">
        <h2 className="text-2xl font-bold mb-2">Distress Escalation</h2>
        <p className="text-gray-400 mb-6">Need assistance with this Distress?</p>
        {/* Email input field */}
        <input
          type="text"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-lg bg-black border border-red-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Additional information textarea */}
        <textarea value={additionalInfo} onChange={(e)=>setAdditionalInfo(e.target.value)} draggable='false' placeholder="Additional info (Optional)" className="w-full resize-none mb-2 p-3 rounded-lg bg-black border border-red-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"/>
        <div className="text-red-500 text-xs mb-2">{emailError}</div>
        {/* Escalate button with loading state */}
        <button className="w-full cursor-pointer flex items-center justify-center py-3 mb-4 bg-red-700 hover:bg-red-800 rounded-lg font-semibold text-white" onClick={() => Escalate(id ?? '')}>
        {isLoading ? (
                // Loading spinner SVG
                <svg 
                className='animate-spin h-5 w-5 text-white'
                xmlns='https://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                >
                    <circle
                    className='opacity-25'
                    cx={'12'}
                    cy={'12'}
                    r={'10'}
                    stroke='currentColor'
                    strokeWidth={'4'}
                    ></circle>
                    <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                    ></path>
                </svg>
                // Trial and error: Alternative loading spinner implementation
                // <span className='loader border-white border-t-transparent border-2 w-5 h-5 rounded-full animate-spin'></span>
            ) : (
            'Escalate Distress'
          )} </button>

        {/* Version information footer */}
        <div className="absolute bottom-4 right-4 text-gray-500 text-xs">
          distress.local | v1.0.0
        </div>
      </div>
    </div>
  );
}
