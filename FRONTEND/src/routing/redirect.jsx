import { createRoute, createRootRoute } from '@tanstack/react-router'
import { getApiBaseUrl } from '../utils/axiosInstance.js'

// Component that handles the redirect
const RedirectComponent = () => {
  console.log('🎯 RedirectComponent rendered!')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
        <p className="text-sm text-gray-500 mt-2">Route is working!</p>
      </div>
    </div>
  )
}

// This will be set by the routeTree.js file
let parentRoute = null;

export const setParentRoute = (route) => {
  parentRoute = route;
};

export const redirectRoute = createRoute({
  getParentRoute: () => parentRoute,
  path: '/r/$shortCode',
  component: RedirectComponent,
  beforeLoad: async ({ params }) => {
    try {
      const { shortCode } = params

      console.log('🔍 Redirect route triggered with params:', params)
      console.log('🔍 Short code:', shortCode)

      if (!shortCode) {
        throw new Error('Short code not found')
      }

      console.log('🚀 Attempting to redirect short code:', shortCode)

      // Make API call to get the original URL
      const baseUrl = getApiBaseUrl()
      const apiUrl = baseUrl ? `${baseUrl}/api/redirect/${shortCode}` : `/api/redirect/${shortCode}`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Short URL not found')
        } else if (response.status === 410) {
          throw new Error('Short URL has expired')
        } else {
          throw new Error('Failed to resolve short URL')
        }
      }

      const data = await response.json()
      
      if (data.success && data.url) {
        // Redirect to the original URL
        window.location.href = data.url
        return
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Redirect error:', error)
      // Redirect to home page with error
      window.location.href = `/?error=${encodeURIComponent(error.message)}`
    }
  }
})
