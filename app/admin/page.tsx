"use client"
import Image from "next/image";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";


const alerts = [1, 2, 3, 4, 5, 6, 7, 8]


export default function Admin() {
  const mapContainer = useRef<any>(null)
  const map = useRef<mapboxgl.Map | any>(null);
  const [selectedDistress, setSelectedDistress] = useState();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reverseGeocodedAlerts, setReverseGeocodedAlerts] = useState<any[]>([]);
  const token = useAppSelector((state)=>state.user.token)
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    console.log(token, 'admin')
    const validateToken = async () => {
      try {
        const response = await axios.get('https://distress-server.onrender.com/api/auth/token/validate', {headers: {Authorization: `Bearer ${token}` }});
        // if (!response.data.valid) {
        //   router.push('/login');
        // }
      } catch (error) {
        console.error('Error validating token:', error);
        router.push('/login');
      }
    };

    if (token) {
      validateToken();
    } else {
      router.push('/login');
    }
  }, [token, router]);

  mapboxgl.accessToken = 'pk.eyJ1Ijoib2xvd29hIiwiYSI6ImNsZjNyMndhcTBnNm8zcm50cmFkZzI1NXAifQ.sUHuNAw9DIe1ATZcaV_ETg';
  console.log(alerts)
  useEffect(() => {
    const fetchDistressAlerts = async () => {
      try {
        const response = await axios.get('https://distress-server.onrender.com/api/distress', {headers: {Authorization: `Bearer ${token}`}});
        console.log(response)
        setAlerts(response.data);
      } catch (error) {
        console.log("Error fetching distress alerts:", error);
      }
    }

    fetchDistressAlerts();

    map.current = new mapboxgl.Map({
      container: mapContainer.current, // container ID
      style: 'mapbox://styles/olowoa/cm9igyzv100rr01s84bmmhc6f', // style URL
      center: [-1.1398, 52.6369], // starting position [lng, lat]
      zoom: 15, // starting zoom
    });
  }, []);

  useEffect(() => {
    const reverseGeocodeAlerts = async () => {
      const geocodedAlerts = await Promise.all(alerts.map(async (alert) => {
        const address = await reverseGeocode(alert?.location?.[0]?.coords?.longitude, alert?.location?.[0]?.coords?.latitude);
        return { ...alert, full_address: address };
      }));
      setReverseGeocodedAlerts(geocodedAlerts);
    };

    reverseGeocodeAlerts();
  }, [alerts]);

  const deploy = async (distressId:string) => {
    try {
      const response = await axios.post('https://distress-server.onrender.com/deploy', {distressId}, {headers: {Authorization: `Bearer ${token}`}});
      console.log(response.data);
    } catch (error: any) {
      console.log(error.data);
    }
  };

  const selectDistress = async (data: any) => {
    setSelectedDistress(data);
    requestDirection(data);
  };

  const requestDirection = async (alert: any) => {
    try {
      const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/-1.1337703,52.6391378;${alert?.location?.[0]?.coords?.longitude},${alert?.location?.[0]?.coords?.latitude}?geometries=geojson&access_token=pk.eyJ1Ijoib2xvd29hIiwiYSI6ImNsZjNyMndhcTBnNm8zcm50cmFkZzI1NXAifQ.sUHuNAw9DIe1ATZcaV_ETg`);
      console.log(response.data);
      const data = response.data;
      const route = data.routes[0];
      const geometry = route.geometry;
      const geojson = {
        'type': 'Feature',
        'properties': {},
        'geometry': geometry
      };

      if (map.current.getSource('route')) {
        // if the route already exists on the map, reset it using setData
        map.current.getSource('route').setData(geojson);
      } else {
        // otherwise, add a new layer using this data
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
        center: [alert?.location?.[0]?.coords?.longitude,alert?.location?.[0]?.coords?.latitude],
        zoom: 15,
        speed: 1,
        curve: 1,
        easing(t: number) {
            return t;
        }
      });

    } catch (error) {
      console.log(error);
    }
  };

  function getTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    console.log(seconds)
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " mins ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  const reverseGeocode = async (longitude: string, latitude: string) => {
    try {
      const response = await axios.get(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=pk.eyJ1Ijoib2xvd29hIiwiYSI6ImNsZjNyMndhcTBnNm8zcm50cmFkZzI1NXAifQ.sUHuNAw9DIe1ATZcaV_ETg`)
      console.log(response.data)
      return response.data.features[0].properties.full_address
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
          {reverseGeocodedAlerts.length > 0 ? reverseGeocodedAlerts.map((data, index) => 
          {
            console.log(data.createdAt)
            return(
            
            <div key={index} onClick={() => selectDistress(data)} className={selectedDistress == data ? "flex-col flex gap-2 bg-[#7a7a7a50] px-6" : "flex-col flex gap-2 px-6"}>
              <div className="flex justify-between items-center">
                <p className="font-medium text-[16px] text-[#C60000]">{data.user.fullName.split(" ")[0]} IN DISTRESS</p>
                <div className="w-4 h-4 rounded-4xl bg-[#C60000]"></div>
              </div>
              <div className="flex gap-4">
                <p className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[#E9E9E9]">From “{data.full_address}” </p>
                {/* 
                  function getTimeAgo(date: Date) {
                    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
                    let interval = seconds / 31536000;
                    if (interval > 1) {
                      return Math.floor(interval) + " years ago";
                    }
                    interval = seconds / 2592000;
                    if (interval > 1) {
                      return Math.floor(interval) + " months ago";
                    }
                    interval = seconds / 86400;
                    if (interval > 1) {
                      return Math.floor(interval) + " days ago";
                    }
                    interval = seconds / 3600;
                    if (interval > 1) {
                      return Math.floor(interval) + " hours ago";
                    }
                    interval = seconds / 60;
                    if (interval > 1) {
                      return Math.floor(interval) + " mins ago";
                    }
                    return Math.floor(seconds) + " seconds ago";
                  }
                */}
                <p className="text-[#E9E9E9] font-medium">{getTimeAgo(new Date(data.createdAt))}</p>
              </div>
              <div className="flex justify-between items-center">
                {!data.droneDeployed ? <div onClick={()=>deploy(data._id)} className="bg-[#C60000] px-4 py-1 rounded-2xl cursor-pointer">
                  <p>Deploy</p>
                </div>: <div></div>}
                <p className="text-[#7A7A7A] underline">View Feedback</p>
              </div>
            </div>
          )}) : <p className="text-[#E9E9E9] px-6">No alerts available</p>}

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
