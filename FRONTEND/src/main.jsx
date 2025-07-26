import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/performance.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routing/routeTree.js'
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { getApiBaseUrl } from './utils/axiosInstance.js'

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    store
  },
  notFoundRoute: {
    component: () => {
      console.log('🔍 Not found route triggered')
      return <div>Not Found</div>
    }
  }
})

// Handle short URL redirects before router initialization
const handleShortUrlRedirect = async () => {
  const path = window.location.pathname
  const pathSegments = path.split('/').filter(Boolean)
  const knownRoutes = ['auth', 'register', 'dashboard', 'analytics-demo', 'test-route', 'r']

  console.log('🔍 Checking path for redirect:', path)
  console.log('🔍 Path segments:', pathSegments)

  // Check if this looks like a short URL (single path segment, no known routes)
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
          return true // Indicate that redirect happened
        }
      } else if (response.status === 404) {
        console.log('❌ Short URL not found:', shortCode)
        // Redirect to home with error
        window.location.href = `/?error=${encodeURIComponent('Short URL not found')}`
        return true
      } else if (response.status === 410) {
        console.log('⏰ Short URL expired:', shortCode)
        // Redirect to home with error
        window.location.href = `/?error=${encodeURIComponent('This short URL has expired')}`
        return true
      }
    } catch (error) {
      console.error('❌ Redirect error:', error)
      // Redirect to home with error
      window.location.href = `/?error=${encodeURIComponent('Failed to resolve short URL')}`
      return true
    }
  }

  return false // No redirect happened
}

// Initialize the app
const initializeApp = async () => {
  // Check for short URL redirect first
  const redirected = await handleShortUrlRedirect()

  // Only render the app if no redirect happened
  if (!redirected) {
    // Performance optimization: Enable concurrent features
    const root = createRoot(document.getElementById('root'))

    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </Provider>
      </React.StrictMode>
    )
  }
}

// Start the app
initializeApp()
