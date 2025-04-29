"use client"
import Image from "next/image";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";


const alerts = [1, 2, 3, 4, 5, 6, 7, 8]


export default function Home() {
  const mapContainer = useRef<any>(null)
  const map = useRef<mapboxgl.Map | any>(null);
  const [selectedDistress, setSelectedDistress] = useState()
  mapboxgl.accessToken = 'pk.eyJ1Ijoib2xvd29hIiwiYSI6ImNsZjNyMndhcTBnNm8zcm50cmFkZzI1NXAifQ.sUHuNAw9DIe1ATZcaV_ETg';
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current, // container ID
      style: 'mapbox://styles/olowoa/cm9igyzv100rr01s84bmmhc6f', // style URL
      center: [-1.1398, 52.6369], // starting position [lng, lat]
      zoom: 15, // starting zoom
    });
  }, [])

  const deploy = async () => {
    try {
      const response = await axios.post('https://rarely-tight-burro.ngrok-free.app/deploy')
      console.log(response.data)
    } catch (error: any) {
      console.log(error.data)
    }
  }

  const selectDistress = async (data: any) => {
    setSelectedDistress(data)
    requestDirection()
  }

  const requestDirection = async () => {
    try {
      const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/cycling/-84.518641,39.134270;-84.512023,39.102779?geometries=geojson&access_token=pk.eyJ1Ijoib2xvd29hIiwiYSI6ImNsZjNyMndhcTBnNm8zcm50cmFkZzI1NXAifQ.sUHuNAw9DIe1ATZcaV_ETg`)
      console.log(response.data)
      const data = response.data
      const route = data.routes[0]
      const geometry = route.geometry
      const geojson = {
        'type': 'Feature',
        'properties': {},
        'geometry': geometry
      };

      if (map.current.getSource('route')) {
        // if the route already exists on the map, reset it using setData
        map.current.getSource('route').setData(geojson);
      }

      // otherwise, add a new layer using this data
      else {
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#C60000',
            'line-width': 5,
            'line-opacity': 1
          }
        });
      }
      // new mapboxgl.Map({}).flyTo()
      map.current.flyTo({
        center: [-84.518641,39.134270],
        zoom: 15,
        speed: 1,
        curve: 1,
        easing(t: number) {
            return t;
        }
    })

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="relative" id="map">
      <div className="w-dvw h-dvh relative" ref={mapContainer}>
        {/* <div className="absolute w-full h-full items-center justify-end flex px-8"> */}

        <div className="absolute right-8 top-1/2 -translate-y-1/2 h-11/12 w-1/4 z-50 rounded-3xl bg-[#000000BF] py-6 overflow-y-scroll [&::-webkit-scrollbar]:w-0 gap-6 flex flex-col">
          <p className="font-bold text-[24px] px-6">Alerts</p>
          {alerts.map((data, index) => (
            <div key={index} onClick={() => selectDistress(data)} className={selectedDistress == data ? "flex-col flex gap-2 bg-[#7a7a7a50] px-6" : "flex-col flex gap-2 px-6"}>
              <div className="flex justify-between items-center">
                <p className="font-medium text-[16px] text-[#C60000]">TYRONE IN DISTRESS</p>
                <div className="w-4 h-4 rounded-4xl bg-[#C60000]"></div>
              </div>
              <div className="flex gap-4">
                <p className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[#E9E9E9]">From “Stark Tower, Sentinel street, 3rd district” </p>
                <p className="text-[#E9E9E9] font-medium">2 mins ago</p>
              </div>
              <div className="flex justify-between items-center">
                <div onClick={deploy} className="bg-[#C60000] px-4 py-1 rounded-2xl cursor-pointer">
                  <p>Deploy</p>
                </div>
                <p className="text-[#7A7A7A] underline">View Feedback</p>
              </div>
            </div>
          ))}

        </div>
        {/* </div> */}
      </div>
      {/* <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div> */}
    </div>
  );
}
