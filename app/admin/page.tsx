"use client"
import Image from "next/image";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // Mapbox GL JS for map functionality
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { Pause, Play } from "lucide-react";


const alerts = [1, 2, 3, 4, 5, 6, 7, 8]

type distress = {
  _id: string,
  user: {
      _id: string,
      fullName: string,
      email: string,
      password: string,
      phoneNumber: string,
      homeAddress: string,
      emergencyContacts: [
          {
              firstName: string,
              emails: [],
              phoneNumbers: [
                  {
                      number: string,
                      digits: string,
                      countryCode: string,
                      _id: string
                  }
              ],
              _id: string
          }
      ],
      role: string,
      createdAt: string,
      updatedAt: string,
      __v: number
  },
  message: string,
  location: [
      {
          coords: {
              accuracy: number,
              altitude: number,
              altitudeAccuracy: number,
              heading: number,
              latitude: number,
              longitude: number,
              speed: number
          },
          timestamp: number,
          _id: string
      }
  ],
  escalated: {
      status: boolean,
      by: null,
      _id: string
  },
  droneDeployed: boolean,
  resolved: boolean,
  additionalDetails: [
      {
          batteryLevel: string,
          _id: string,
          timeAdded: string
      }
  ],
  audioRecordings: [
      {
          url: string,
          _id: string,
          timeAdded: string
      }
  ],
  createdAt: string,
  updatedAt: string,
  __v: number
}

export default function Admin() {
  // Refs and state management
  const mapContainer = useRef<any>(null)
  const map = useRef<mapboxgl.Map | any>(null);
  const [selectedDistress, setSelectedDistress] = useState<distress>();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reverseGeocodedAlerts, setReverseGeocodedAlerts] = useState<any[]>([]);
  const token = useAppSelector((state)=>state.user.token)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [play, setPlay] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Effect to validate authentication token
  useEffect(() => {
    console.log(token, 'admin')
    const validateToken = async () => {
      try {
        const response = await axios.get('https://distress-server.onrender.com/api/auth/token/validate', {headers: {Authorization: `Bearer ${token}` }});
        // Trial and error: Token validation logic
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

  // Initialize Mapbox with access token
  mapboxgl.accessToken = 'pk.eyJ1Ijoib2xvd29hIiwiYSI6ImNsZjNyMndhcTBnNm8zcm50cmFkZzI1NXAifQ.sUHuNAw9DIe1ATZcaV_ETg';
  console.log(alerts)

  // Effect to fetch distress alerts and initialize map
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

    // Initialize Mapbox map
    map.current = new mapboxgl.Map({
      container: mapContainer.current, // container ID
      style: 'mapbox://styles/olowoa/cm9igyzv100rr01s84bmmhc6f', // style URL
      center: [-1.1398, 52.6369], // starting position [lng, lat]
      zoom: 15, // starting zoom
    });
  }, []);

  // Effect to reverse geocode alert locations
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

  // Function to deploy drone for a distress alert
  const deploy = async (distressId:string) => {
    try {
      const response = await axios.post('https://distress-server.onrender.com/deploy', {distressId}, {headers: {Authorization: `Bearer ${token}`}});
      console.log(response.data);
    } catch (error: any) {
      console.log(error.data);
    }
  };

  // Function to handle distress selection and show route
  const selectDistress = async (data: any) => {
    setSelectedDistress(data);
    requestDirection(data);
  };

  // Effect to handle audio recording playback
  useEffect(()=> {
    if (videoRef.current && selectedDistress && selectedDistress?.audioRecordings?.length > 0) {
      videoRef.current.src = selectedDistress?.audioRecordings?.[0].url
      videoRef.current.load()
    }
  }, [selectedDistress])

  // Function to request and display route to selected distress location
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

      // Update or add route layer on map
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

      // Fly to selected location
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

  // Utility function to format time ago
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

  // Function to reverse geocode coordinates to address
  const reverseGeocode = async (longitude: string, latitude: string) => {
    try {
      const response = await axios.get(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=pk.eyJ1Ijoib2xvd29hIiwiYSI6ImNsZjNyMndhcTBnNm8zcm50cmFkZzI1NXAifQ.sUHuNAw9DIe1ATZcaV_ETg`)
      console.log(response.data)
      return response.data.features[0].properties.full_address
    } catch (error) {
      console.log(error)
    }
  }

  // Audio playback control functions
  const playVideo = () => {
    setPlay(true)
    videoRef.current?.play()
  }

  const pauseVideo = () => {
    setPlay(false)
    videoRef.current?.pause()
  }

  // Effect to handle video ended event
  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    const handleEnded = () => {
      setPlay(false)
    }

    video.addEventListener('ended', handleEnded)

    return () => video.removeEventListener('ended', handleEnded)
  } ,[videoRef.current])

  return (
    <div className="relative" id="map">
      <div className="w-dvw h-dvh relative" ref={mapContainer}>
        {/* <div className="absolute w-full h-full items-center justify-end flex px-8"> */}

        {selectedDistress && selectedDistress?.audioRecordings?.length > 0 ? <div className="absolute left-8 bottom-8 w-1/6 h-1/6 z-50 rounded-2xl flex items-center justify-center bg-[#000000BF] cursor-pointer">
        <video ref={videoRef} controls className="hidden">
          <source type="audio/x-m4a" />
        </video>
        {!play ? <Play onClick={()=>playVideo()} />
        :
        <Pause onClick={()=>pauseVideo()} />}
        </div> : null}

        {/* Alerts sidebar */}
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
                {data?.escalated?.status ? <div onClick={()=>deploy(data._id)} className="bg-[#C60000] px-4 py-1 rounded-2xl cursor-pointer">
                  <p>Deploy</p>
                </div>: <div></div>}
                <p className="text-[#7A7A7A] underline">View Feedback</p>
              </div>
            </div>
          )}) : <p className="text-[#E9E9E9] px-6">No alerts available</p>}
        </div>
        {/* </div> */}
      </div>

    </div>
  );
}
