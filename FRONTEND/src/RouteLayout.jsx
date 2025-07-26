import React, { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import ScrollProgressBar from './components/ScrollProgressBar.jsx'
import { Outlet, useLocation } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'
import { setUser } from './store/slices/authSlice'
import { getCurrentUser } from './api/user.api'
import ErrorBoundary from './components/ErrorBoundary'

const RootLayout = () => {
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = async () => {
      try {
        console.log('Checking auth status...');
        console.log('Token in localStorage:', localStorage.getItem('accessToken'));
        const response = await getCurrentUser()
        console.log('getCurrentUser response:', response);
        if (response.user) {
          dispatch(setUser(response.user))
          console.log('User set in Redux store:', response.user);
        }
      } catch (error) {
        // User is not authenticated, which is fine
        console.log('User not authenticated:', error);
        if (process.env.NODE_ENV === 'development') {
          console.log('User not authenticated:', error.response?.status)
        }
      }
    }

    checkAuthStatus()
  }, [dispatch])

  // Smooth scroll to top when route changes
  useEffect(() => {
    // Only scroll if user is not already at the top
    if (window.scrollY > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [location.pathname])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Navbar />
        <main className="pt-16">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <ScrollProgressBar />
      </div>
    </ErrorBoundary>
  )
}

export default RootLayout
