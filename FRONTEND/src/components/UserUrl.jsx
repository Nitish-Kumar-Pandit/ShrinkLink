import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUserUrls, updateUrlStats, toggleFavorite, clearError } from '../store/slices/urlSlice'
import { getTimeRemaining, formatExpirationDate, formatDate } from '../utils/timeUtils'
import { CardSkeleton } from './LoadingSpinner'
import FavoriteUrls from './FavoriteUrls'

const UserUrl = () => {
  const dispatch = useDispatch()
  const { urls, isLoading, error, stats } = useSelector((state) => state.url)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [copiedId, setCopiedId] = useState(null)
  const [clickedId, setClickedId] = useState(null)
  const [testLink, setTestLink] = useState(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(clearError()) // Clear any previous errors
      dispatch(getUserUrls())
    }
  }, [dispatch, isAuthenticated])

  const handleCopy = async (shortUrl, id) => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }



  const formatClicks = (count) => {
    return count === 1 ? '1 click' : `${count} clicks`
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"

    switch (status) {
      case 'expired':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
            Expired
          </span>
        )
      case 'expiring_soon':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800 animate-pulse`}
                style={{ animationDuration: '2s' }}>
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></span>
            Expiring Soon
          </span>
        )
      case 'active':
      default:
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
            Active
          </span>
        )
    }
  }



  const handleUrlClick = async (urlData) => {
    // Check if URL is expired
    if (urlData.status === 'expired') {
      // Show visual feedback for expired URL
      setClickedId(urlData.id)
      setTimeout(() => setClickedId(null), 1000)

      // Show alert or notification that URL is expired
      alert('This URL has expired and cannot be accessed.')
      return
    }

    // Show visual feedback
    setClickedId(urlData.id)
    setTimeout(() => setClickedId(null), 1000)

    // Immediately update the click count in Redux for instant UI feedback
    dispatch(updateUrlStats({
      urlId: urlData.id,
      clicks: urlData.clicks + 1
    }))

    // Open the URL
    window.open(urlData.shortUrl, '_blank', 'noopener,noreferrer')

    // Send click tracking to backend (optional - for analytics)
    try {
      await fetch(urlData.shortUrl, {
        method: 'HEAD', // Just trigger the redirect endpoint to count the click
        mode: 'no-cors' // Avoid CORS issues
      })
    } catch {
      // Ignore errors - the main purpose is opening the URL
      console.log('Click tracking request completed')
    }
  }

  const handleToggleFavorite = async (urlId) => {
    try {
      await dispatch(toggleFavorite(urlId)).unwrap()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleCreateTestLink = async () => {
    setTestLoading(true)
    try {
      const response = await fetch('http://localhost:3001/test-link', {
        method: 'GET',
      })
      const data = await response.json()

      if (response.ok) {
        setTestLink(data)
        // Refresh URLs to show the new test link
        if (isAuthenticated) {
          dispatch(getUserUrls())
        }
      } else {
        console.error('Failed to create test link:', data.message)
      }
    } catch (error) {
      console.error('Error creating test link:', error)
    } finally {
      setTestLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500">Please log in to view your shortened URLs.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading URLs</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My URLs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total URLs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUrls || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalClicks || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URLs List */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : urls.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No URLs yet</h3>
          <p className="text-gray-500">Start by creating your first shortened URL!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {urls.map((url) => (
            <div key={url.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl hover:bg-white/90 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Short URL with Status Badge */}
                  <div className="mb-2 flex items-center space-x-3">
                    <button
                      onClick={() => handleUrlClick(url)}
                      disabled={url.status === 'expired'}
                      className={`text-lg font-medium transition-colors duration-200 truncate ${
                        url.status === 'expired'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                      title={url.status === 'expired' ? "URL has expired" : `Click to visit: ${url.shortUrl}`}
                    >
                      {url.shortUrl}
                    </button>
                    {/* Status Badge positioned right after the URL */}
                    <div className="flex-shrink-0">
                      {getStatusBadge(url.status)}
                    </div>
                  </div>

                  {/* Original URL */}
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 truncate" title={url.full_url}>
                      {url.full_url}
                    </p>
                  </div>

                  {/* Created Date and Expiration Date */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {formatDate(url.createdAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Expires {formatExpirationDate(url.expiresAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> */}
                      </svg>
                      {getTimeRemaining(url.expiresAt)}
                    </div>
                  </div>
                </div>

                {/* Right side - Clicks and Actions */}
                <div className="flex items-center space-x-4 ml-6">
                  {/* Clicks Counter */}
                  <div className="text-center">
                    <div className={`flex items-center text-sm transition-all duration-300 ${
                      clickedId === url.id
                        ? 'text-green-600 scale-110'
                        : 'text-gray-600'
                    }`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatClicks(url.clicks)}
                      {clickedId === url.id && (
                        <span className="ml-1 text-green-600 animate-pulse">+1</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Visit Button */}
                    <button
                      onClick={() => handleUrlClick(url)}
                      disabled={url.status === 'expired'}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                        url.status === 'expired'
                          ? 'bg-gray-300/20 text-gray-400 border border-gray-300/30 cursor-not-allowed'
                          : 'bg-blue-500/20 text-blue-700 border border-blue-300/30 hover:bg-blue-500/30'
                      }`}
                      title={url.status === 'expired' ? "URL has expired" : "Visit URL"}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>

                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(url.id)}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                        url.isFavorite
                          ? 'bg-red-500/20 text-red-700 border border-red-300/30 hover:bg-red-500/30'
                          : 'bg-gray-500/20 text-gray-700 border border-gray-300/30 hover:bg-gray-500/30'
                      }`}
                      title={url.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg className="w-5 h-5" fill={url.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(url.shortUrl, url.id)}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                        copiedId === url.id
                          ? 'bg-green-500/20 text-green-700 border border-green-300/30 hover:bg-green-500/30'
                          : 'bg-white/50 text-gray-700 border border-gray-300/30 hover:bg-white/70'
                      }`}
                      title="Copy URL"
                    >
                      {copiedId === url.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Favorites Section - Only show if user is authenticated and has URLs */}
      {isAuthenticated && urls.length > 0 && (
        <div className="mt-8">
          <FavoriteUrls />
        </div>
      )}
    </div>
  )
}

export default UserUrl
