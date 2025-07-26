import { createRoute } from '@tanstack/react-router'
import { getApiBaseUrl } from '../utils/axiosInstance.js'

// This will be set by the routeTree.js file
let parentRoute = null;

export const setParentRoute = (route) => {
  parentRoute = route;
};

// Component that handles unknown routes (potential short URLs)
const CatchAllComponent = () => {
  console.log('🎯 CatchAll component rendered!')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Checking URL...</p>
      </div>
    </div>
  )
}

export const catchAllRoute = createRoute({
  getParentRoute: () => parentRoute,
  path: '/$shortCode',
  component: CatchAllComponent,
  beforeLoad: async ({ params, location }) => {
    try {
      const { shortCode } = params

      console.log('🔍 CatchAll route triggered with params:', params)
      console.log('🔍 Short code:', shortCode)

      if (!shortCode) {
        throw new Error('No short code provided')
      }
        console.log('🚀 Attempting to redirect short code:', shortCode)

        // Make API call to get the original URL
        const baseUrl = getApiBaseUrl()
        const apiUrl = baseUrl ? `${baseUrl}/api/redirect/${shortCode}` : `/api/redirect/${shortCode}`
        
        console.log('🌐 Making API call to:', apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.success && data.url) {
            console.log('✅ Redirecting to:', data.url)
            // Redirect to the original URL
            window.location.href = data.url
            return
          }
        } else if (response.status === 404) {
          console.log('❌ Short URL not found:', shortCode)
          throw new Error('Short URL not found')
        } else if (response.status === 410) {
          console.log('⏰ Short URL expired:', shortCode)
          throw new Error('Short URL has expired')
        } else {
          throw new Error('Failed to resolve short URL')
        }
    } catch (error) {
      console.error('❌ CatchAll error:', error)
      // Redirect to home page with error
      window.location.href = `/?error=${encodeURIComponent(error.message)}`
    }
  }
})
