import React, { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import ScrollProgressBar from './components/ScrollProgressBar.jsx'
import { Outlet, useLocation } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'
import { setUser } from './store/slices/authSlice'
import { getCurrentUser } from './api/user.api'
import ErrorBoundary from './components/ErrorBoundary'
import { getApiBaseUrl } from './utils/axiosInstance.js'

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

  // Handle short URL redirects
  useEffect(() => {
    console.log('🔍 RouteLayout useEffect triggered')
    const handleRedirect = async () => {
      const path = location.pathname

      console.log('🔍 RouteLayout checking path:', path)

      // Check if this looks like a short URL (single path segment, no known routes)
      const pathSegments = path.split('/').filter(Boolean)
      const knownRoutes = ['auth', 'register', 'dashboard', 'analytics-demo', 'test-route', 'r']

      console.log('🔍 Path segments:', pathSegments)
      console.log('🔍 Known routes:', knownRoutes)

      if (pathSegments.length === 1 && !knownRoutes.includes(pathSegments[0])) {
        const shortCode = pathSegments[0]
        console.log('🔍 Potential short URL detected:', shortCode)

        try {
          const baseUrl = getApiBaseUrl()
          const apiUrl = baseUrl ? `${baseUrl}/api/redirect/${shortCode}` : `/api/redirect/${shortCode}`

          console.log('🚀 Making redirect API call to:', apiUrl)

          const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include',
          })

          if (response.ok) {
            const data = await response.json()

            if (data.success && data.url) {
              console.log('✅ Redirecting to:', data.url)
              window.location.href = data.url
              return
            }
          } else if (response.status === 404) {
            console.log('❌ Short URL not found:', shortCode)
            // Let the normal routing handle this (will show 404)
          } else if (response.status === 410) {
            console.log('⏰ Short URL expired:', shortCode)
            // Redirect to home with error
            window.location.href = `/?error=${encodeURIComponent('This short URL has expired')}`
            return
          }
        } catch (error) {
          console.error('❌ Redirect error:', error)
          // Let normal routing handle this
        }
      }
    }

    handleRedirect()
  }, [location.pathname])

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
