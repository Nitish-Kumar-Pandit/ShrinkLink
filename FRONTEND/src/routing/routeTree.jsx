import { createRootRoute, createRoute, useParams, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import RootLayout from './../RouteLayout.jsx';
import HomePage from '../pages/HomePage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import AnalyticsDemoPage from '../pages/AnalyticsDemoPage.jsx'
import { getCurrentUser } from '../api/user.api.js'
import { setUser } from '../store/slices/authSlice.js'
import { redirect } from '@tanstack/react-router'

// Not found component that handles short URL redirects
const NotFoundComponent = () => {
  const location = useLocation()

  useEffect(() => {
    const handleRedirect = async () => {
      const path = location.pathname

      console.log('🔍 NotFound component checking path:', path)

      // Check if this looks like a short URL (single path segment, no known routes)
      const pathSegments = path.split('/').filter(Boolean)
      const knownRoutes = ['auth', 'register', 'dashboard', 'analytics-demo', 'test-redirect']

      console.log('🔍 Path segments:', pathSegments)
      console.log('🔍 Known routes:', knownRoutes)

      if (pathSegments.length === 1 && !knownRoutes.includes(pathSegments[0])) {
        const shortCode = pathSegments[0]
        console.log('🔍 Potential short URL detected:', shortCode)

        try {
          const baseUrl = 'http://localhost:3000' // Use backend URL directly for development
          const apiUrl = `${baseUrl}/api/redirect/${shortCode}`

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
          // Redirect to home with error
          window.location.href = `/?error=${encodeURIComponent('Failed to resolve short URL')}`
          return
        }
      }
    }

    handleRedirect()
  }, [location.pathname])

  return <div>Page Not Found</div>
}

export const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundComponent
})

// Define routes directly without circular dependencies
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
})

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage
})

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage
})

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
  beforeLoad: async ({ context }) => {
    try {
      const { store } = context;

      // Check if user is already in store
      const state = store.getState();
      if (state.auth.user) {
        return;
      }

      // Try to get current user
      const response = await getCurrentUser();
      if (response.user) {
        store.dispatch(setUser(response.user));
      } else {
        throw redirect({
          to: '/auth',
          search: {
            redirect: '/dashboard'
          }
        });
      }
    } catch (error) {
      console.error('Dashboard auth check failed:', error);
      throw redirect({
        to: '/auth',
        search: {
          redirect: '/dashboard'
        }
      });
    }
  }
})

export const analyticsDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics-demo',
  component: AnalyticsDemoPage
})

// Test route to verify routing is working
export const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test-redirect',
  component: () => {
    console.log('🔍 Test route component rendered')
    return <div>Test Route Works!</div>
  }
})



// Short URL redirect component
const ShortUrlRedirect = () => {
  const { shortCode } = useParams()

  useEffect(() => {
    const handleRedirect = async () => {
      console.log('🔍 ShortUrlRedirect component - shortCode:', shortCode)

      if (!shortCode) {
        console.log('❌ No short code found')
        return
      }

      try {
        const baseUrl = 'http://localhost:3000' // Use backend URL directly for development
        const apiUrl = `${baseUrl}/api/redirect/${shortCode}`

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
          window.location.href = `/?error=${encodeURIComponent('Short URL not found')}`
          return
        } else if (response.status === 410) {
          console.log('⏰ Short URL expired:', shortCode)
          window.location.href = `/?error=${encodeURIComponent('This short URL has expired')}`
          return
        }
      } catch (error) {
        console.error('❌ Redirect error:', error)
        window.location.href = `/?error=${encodeURIComponent('Failed to resolve short URL')}`
      }
    }

    handleRedirect()
  }, [shortCode])

  return <div>Redirecting...</div>
}

// Catch-all route for short URLs - using a more specific pattern
export const shortUrlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$shortCode',
  component: ShortUrlRedirect
})

export const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    registerRoute,
    dashboardRoute,
    analyticsDemoRoute,
    testRoute
])