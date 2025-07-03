import React, { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import { Outlet } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'
import { setUser } from './store/slices/authSlice'
import { getCurrentUser } from './api/user.api'
import ErrorBoundary from './components/ErrorBoundary'

const RootLayout = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = async () => {
      try {
        const response = await getCurrentUser()
        if (response.user) {
          dispatch(setUser(response.user))
        }
      } catch (error) {
        // User is not authenticated, which is fine
        console.log('User not authenticated:', error.response?.status)
      }
    }

    checkAuthStatus()
  }, [dispatch])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default RootLayout
