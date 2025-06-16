"use client"
import { login } from '@/lib/features/user/userSlice';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function LoginScreen() {
  // State management for form inputs and UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const token = useAppSelector((state) => state.user.token);
  const dispatch = useAppDispatch();

  // Effect to validate token and handle authentication state
  useEffect(() => {
    const validateToken = async () => {
        try {
          const response = await axios.get('https://distress-server.onrender.com/api/auth/token/validate', {headers: {Authorization: `Bearer ${token}` }});
          // Trial and error: Token validation logic
          // if (!response.data.valid) {
          //   router.push('/login');
          // }
          router.push('/admin')
        } catch (error) {
          console.error('Error validating token:', error);
        //   router.push('/login');
        }
      };
  
    if (token) {
        validateToken()
    }
  }, [token, router]);

  // Email validation using regex pattern
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Trial and error: Password validation function
  // const validatePassword = (password: string) => {
  //   if (password.length < 8) {
  //     setPasswordError('Password must be at least 8 characters');
  //     return false;
  //   }
  //   setPasswordError('');
  //   return true;
  // };

  // Login function to handle authentication
  const LogIn = async () => {
    setIsLoading(true);
    if (!validateEmail(email)) {
      toast.error(emailError, {
        style: {
          background: '#111827',
          color: '#f87171'
      }
      })
      return
    };
    try {
        // API call to authenticate user
        const response = await axios.post('https://distress-server.onrender.com/api/auth/admin/login', {email, password})
        const token = response.data.token; // Get the token from the response
        // Trial and error: Setting default authorization header
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log(token, 'on login')
        dispatch(login(token))
        setIsLoading(false)
        toast.success('Signed in successfully!', {
            style: {
                background: '#111827',
                color: '#f87171'
            }
        })
        router.push('/admin'); // Redirect to admin dashboard after successful login
    } catch (error) {
      setIsLoading(false);
      toast.error('Invalid credentials', {
        style: {
          background: '#111827',
          color: '#f87171'
        }
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container with background map image
    <div className="min-h-screen bg-[url('/background-map.jpg')] bg-cover bg-center flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      {/* Login form container with glassmorphism effect */}
      <div className="z-10 w-full max-w-md p-8 rounded-2xl shadow-lg backdrop-blur-md border border-red-700 text-white">
        <h2 className="text-2xl font-bold mb-2">Access Control</h2>
        <p className="text-gray-400 mb-6">Enter your credentials to proceed</p>
        {/* Email input field */}
        <input
          type="text"
          placeholder="Email or username"
          className="w-full mb-4 p-3 rounded-lg bg-black border border-red-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="text-red-500 text-xs mb-2">{emailError}</div>
        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded-lg bg-black border border-red-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-red-500 text-xs mb-2">{passwordError}</div>
        {/* Login button with loading state */}
        <button disabled={isLoading} className="w-full py-3 mb-4 bg-red-700 hover:bg-red-800 rounded-lg font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" onClick={LogIn}>
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
            'Sign In'
          )}
        </button>

        {/* Trial and error: Remember me and forgot password functionality */}
        {/* <div className="flex items-center justify-between mb-4">
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-red-600" />
            <span className="ml-2 text-sm text-gray-400">Remember me</span>
          </label>
          <a href="#" className="text-sm text-red-500 hover:underline">Forgot password?</a>
        </div> */}

        {/* Trial and error: Social login options */}
        {/* <div className="text-center text-gray-500 text-sm mb-4">OR</div>

        <button className="w-full flex items-center justify-center gap-2 py-3 mb-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
          <FaGoogle className="text-lg" /> Sign in with Google
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
          <FaGithub className="text-lg" /> Sign in with GitHub
        </button> */}

        {/* Version information footer */}
        <div className="absolute bottom-4 right-4 text-gray-500 text-xs">
          distress.local | v1.2.8
        </div>
      </div>
    </div>
  );
}