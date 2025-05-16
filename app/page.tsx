"use client"
import Image from "next/image";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";

export default function Home() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [id, setId] = useState<string>()

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

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const Escalate = async (id: string) => {
    if (!validateEmail(email)) return;
    try {
      const res = await axios.post(`https://distress-server.onrender.com/api/distress/escalate/${id}`, {email, phoneNumber: null})
      console.log(res.data)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="min-h-screen bg-[url('/background-map.jpg')] bg-cover bg-center flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      <div className="z-10 w-full max-w-md p-8 rounded-2xl shadow-lg backdrop-blur-md border border-red-700 text-white">
        <h2 className="text-2xl font-bold mb-2">Distress Escalation</h2>
        <p className="text-gray-400 mb-6">Need assistance with this Distress?</p>
        <input
          type="text"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-lg bg-black border border-red-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="text-red-500 text-xs mb-2">{emailError}</div>

        <button className="w-full py-3 mb-4 bg-red-700 hover:bg-red-800 rounded-lg font-semibold text-white" onClick={() => id && Escalate(id)}>Escalate Distress</button>

        <div className="absolute bottom-4 right-4 text-gray-500 text-xs">
          distress.local | v1.2.8
        </div>
      </div>
    </div>
  );
}
