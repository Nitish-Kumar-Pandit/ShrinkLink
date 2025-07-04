import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUserUrls, getUserStats, updateUrlStats, toggleFavorite, clearError } from '../store/slices/urlSlice'
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
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(clearError()) // Clear any previous errors
      dispatch(getUserUrls())
      dispatch(getUserStats())
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Filter and sort URLs with safety checks
  const filteredUrls = (urls || []).filter(url => {
    // Add null checks and use correct property names
    if (!url) return false;

    const originalUrl = url.full_url || '';
    const shortUrl = url.shortUrl || '';
    const customUrl = url.short_url || '';
    const searchTermLower = (searchTerm || '').toLowerCase();

    const matchesSearch = originalUrl.toLowerCase().includes(searchTermLower) ||
                         shortUrl.toLowerCase().includes(searchTermLower) ||
                         customUrl.toLowerCase().includes(searchTermLower)

    const matchesStatus = filterStatus === 'all' || url.status === filterStatus

    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'clicks':
        return (b.clicks || 0) - (a.clicks || 0)
      case 'alphabetical': {
        const aUrl = a.full_url || '';
        const bUrl = b.full_url || '';
        return aUrl.localeCompare(bUrl)
      }
      default:
        return 0
    }
  })

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
    const baseClasses = "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300"

    switch (status) {
      case 'expired':
        return (
          <span className={`${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800`}>
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Expired
          </span>
        )
      case 'expiring_soon':
        return (
          <span className={`${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 animate-pulse`}
                style={{ animationDuration: '2s' }}>
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Expiring Soon
          </span>
        )
      case 'active':
      default:
        return (
          <span className={`${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800`}>
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
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
      const response = await fetch('http://localhost:3000/test-link', {
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
              <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow border border-white/20 dark:border-gray-700/20">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
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
    <div className={`space-y-8 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      {/* Header with Search and Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My URLs</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage and track your shortened URLs</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="clicks">Most Clicks</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Total URLs</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">{stats?.totalUrls || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">Total Clicks</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-300">{stats?.totalClicks || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URLs List */}
      {isLoading ? (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
          <CardSkeleton count={3} />
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-12 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-6">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchTerm || filterStatus !== 'all' ? 'No matching URLs found' : 'No URLs yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Start by creating your first shortened URL!'
            }
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredUrls.map((url, index) => (
            <div
              key={url.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Short URL with Status Badge */}
                  <div className="mb-3 flex items-center space-x-3">
                    <button
                      onClick={() => handleUrlClick(url)}
                      disabled={url.status === 'expired'}
                      className={`text-xl font-bold transition-all duration-200 truncate group-hover:scale-105 ${
                        url.status === 'expired'
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                      } ${clickedId === url.id ? 'animate-pulse' : ''}`}
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
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg" title={url.full_url}>
                      <span className="font-medium">→</span> {url.full_url}
                    </p>
                  </div>

                  {/* Created Date and Expiration Date */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {formatDate(url.createdAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Expires {formatExpirationDate(url.expiresAt)}
                    </div>
                    <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {getTimeRemaining(url.expiresAt)}
                    </div>
                  </div>
                </div>

                {/* Right side - Clicks and Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:ml-6">
                  {/* Clicks Counter */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 px-4 py-2 rounded-xl border border-green-200 dark:border-green-800">
                    <div className={`flex items-center text-sm font-semibold transition-all duration-300 ${
                      clickedId === url.id
                        ? 'text-green-600 dark:text-green-400 scale-110'
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatClicks(url.clicks)}
                      {clickedId === url.id && (
                        <span className="ml-2 text-green-600 dark:text-green-400 animate-bounce">+1</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {/* Visit Button */}
                    <button
                      onClick={() => handleUrlClick(url)}
                      disabled={url.status === 'expired'}
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                        url.status === 'expired'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 cursor-not-allowed'
                          : 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500'
                      }`}
                      title={url.status === 'expired' ? "URL has expired" : "Visit URL"}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>

                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(url.id)}
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                        url.isFavorite
                          ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 hover:bg-red-500/20 dark:hover:bg-red-500/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500 dark:hover:text-red-400'
                      }`}
                      title={url.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg className="w-5 h-5" fill={url.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(url.shortUrl, url.id)}
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                        copiedId === url.id
                          ? 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-500 dark:hover:text-blue-400'
                      }`}
                      title="Copy URL"
                    >
                      {copiedId === url.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
