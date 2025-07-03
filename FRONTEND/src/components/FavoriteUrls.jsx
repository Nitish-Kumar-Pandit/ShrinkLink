import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateUrlStats, toggleFavorite } from '../store/slices/urlSlice'

const FavoriteUrls = () => {
  const dispatch = useDispatch()
  const { urls } = useSelector((state) => state.url)
  const [copiedId, setCopiedId] = useState(null)
  const [clickedId, setClickedId] = useState(null)

  // Filter only favorite URLs
  const favoriteUrls = urls.filter(url => url.isFavorite)

  const handleCopy = async (shortUrl, id) => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatExpirationDate = (expiresAt) => {
    if (!expiresAt) return null
    const date = new Date(expiresAt)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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

  if (favoriteUrls.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Click the heart icon on any URL to add it to your favorites!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Favorite URLs</h2>
            <p className="text-sm text-gray-500">{favoriteUrls.length} favorite{favoriteUrls.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {favoriteUrls.map((url) => (
          <div key={url.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/30 hover:bg-white/80 transition-all duration-300">
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

                  {/* Remove from Favorites Button */}
                  <button
                    onClick={() => handleToggleFavorite(url.id)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-sm transition-all duration-200 bg-red-500/20 text-red-700 border border-red-300/30 hover:bg-red-500/30"
                    title="Remove from favorites"
                  >
                    <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(url.shortUrl, url.id)}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                      copiedId === url.id
                        ? 'bg-green-500/20 text-green-700 border border-green-300/30'
                        : 'bg-gray-500/20 text-gray-700 border border-gray-300/30 hover:bg-gray-500/30'
                    }`}
                    title="Copy URL"
                  >
                    {copiedId === url.id ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
    </div>
  )
}

export default FavoriteUrls
