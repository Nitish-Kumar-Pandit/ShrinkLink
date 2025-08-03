
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createShortUrl, getUserUrls, getUserStats, fetchAnonymousUsage, clearCreateError, setCreateError } from '../store/slices/urlSlice.js'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from '@tanstack/react-router'
import QRCode from 'qrcode'


const UrlForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [customSlug, setCustomSlug] = useState('')
  const [customSlugError, setCustomSlugError] = useState('')
  const [expiration, setExpiration] = useState('14d') // Default to 14 days

  // Validate custom slug
  const validateCustomSlug = (slug) => {
    if (!slug.trim()) {
      setCustomSlugError('')
      return true
    }

    // Check length (3-50 characters)
    if (slug.length < 3) {
      setCustomSlugError('Custom slug must be at least 3 characters long')
      return false
    }
    if (slug.length > 50) {
      setCustomSlugError('Custom slug must be less than 50 characters')
      return false
    }

    // Check format (letters, numbers, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      setCustomSlugError('Custom slug can only contain letters, numbers, hyphens, and underscores')
      return false
    }

    // Check reserved words
    const reserved = ['api', 'admin', 'www', 'mail', 'ftp', 'localhost', 'health', 'auth', 'create', 'urls']
    if (reserved.includes(slug.toLowerCase())) {
      setCustomSlugError('This slug is reserved and cannot be used')
      return false
    }

    setCustomSlugError('')
    return true
  }
  const [qrGenerated, setQrGenerated] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isFormFocused, setIsFormFocused] = useState(false)

  const {isAuthenticated} = useSelector((state) => state.auth)
  const {currentShortUrl, isLoading, anonymousUsage, createError} = useSelector((state) => state.url)

  // Optimized effect - removed debug logging for performance
  useEffect(() => {
    // Clear any previous errors when component mounts or auth state changes
    dispatch(clearCreateError());

    // Load anonymous usage from backend
    if (!isAuthenticated) {
      dispatch(fetchAnonymousUsage());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Optimized QR code generation with memoized options
  const qrOptions = useMemo(() => ({
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }), []);

  const generateQRCode = useCallback(async () => {
    try {
      if (canvasRef.current && currentShortUrl) {
        await QRCode.toCanvas(canvasRef.current, currentShortUrl, qrOptions);
        setQrGenerated(true);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error generating QR code:', error);
      }
    }
  }, [currentShortUrl, qrOptions]);

  // Removed auto-QR generation - user must click "Generate QR" button manually

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handleTestLink = () => {
    if (currentShortUrl) {
      window.open(currentShortUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Optimized QR generation handler
  const handleGenerateQR = useCallback(() => {
    if (currentShortUrl) {
      setQrGenerated(true);
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          generateQRCode();
        }
      });
    }
  }, [currentShortUrl, generateQRCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentShortUrl);
    setCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }




  const handleSubmit = async () => {
    if (!url.trim()) {
      dispatch(setCreateError('Please enter a valid URL'));
      return;
    }

    // Check anonymous user limits and redirect to login
    if (!isAuthenticated && anonymousUsage.linksCreated >= anonymousUsage.maxLinks) {
      navigate({ to: '/auth' });
      return;
    }

    // Validate custom slug if provided
    if (isAuthenticated && customSlug.trim() && !validateCustomSlug(customSlug.trim())) {
      return; // Don't submit if validation fails
    }

    dispatch(clearCreateError());

    try {
      // Prepare the payload - include customSlug and expiration (expiration is now always required)
      const payload = {
        url,
        expiration // Always include expiration since it's mandatory
      };
      if (isAuthenticated && customSlug.trim()) {
        payload.customSlug = customSlug.trim();
      }

      await dispatch(createShortUrl(payload)).unwrap();

      // Clear any previous errors on successful creation
      dispatch(clearCreateError());

      // Refresh anonymous usage from backend
      if (!isAuthenticated) {
        dispatch(fetchAnonymousUsage());
      }

      // Refresh the URLs list and stats to get the complete URL object with proper timestamps
      if (isAuthenticated) {
        dispatch(getUserUrls());
        dispatch(getUserStats());
      }

      // The shortUrl will be automatically set in Redux state and QR code will be generated
    } catch (error) {
      console.error('Error creating short URL:', error);
      // Handle specific error messages from backend
      if (error && error.includes('limited to 5 links')) {
        // Redirect to login page instead of showing error
        navigate({ to: '/auth' });
      } else {
        dispatch(setCreateError(error || 'Failed to create short URL. Please try again.'));
      }
    }
  }



  return (
    <div className={`space-y-8 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      {/* Main Form Container */}
      <div className={`relative transition-all duration-500 ${
        isFormFocused ? 'scale-[1.02]' : 'scale-100'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl"></div>

        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
          {/* URL Input Section */}
          <div className="space-y-4 sm:space-y-5">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl mr-2 sm:mr-3 shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Shrink Your URL</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300">Transform long URLs into smart, trackable links</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label htmlFor="url" className="flex items-center text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                <span className="mr-1 sm:mr-2">🔗</span>
                <span>Enter your URL</span>
              </label>
              <div className="relative group">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onInput={(event) => {
                    setUrl(event.target.value);
                    if (createError) dispatch(clearCreateError()); // Clear error when user starts typing
                  }}
                  onFocus={() => setIsFormFocused(true)}
                  onBlur={() => setIsFormFocused(false)}
                  placeholder="https://example.com/long-url"
                  required
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Custom Slug Section - Only for authenticated users */}
            {isAuthenticated && (
              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="customSlug" className="flex items-center text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <span className="mr-1 sm:mr-2">🎯</span>
                  <span>Custom URL</span>
                  <span className="ml-1 sm:ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">Optional</span>
                </label>
                <div className="space-y-2">
                  {/* Input */}
                  <div className="relative group">
                    <input
                      type="text"
                      id="customSlug"
                      value={customSlug}
                      onChange={(event) => {
                        const value = event.target.value
                        setCustomSlug(value)
                        validateCustomSlug(value)
                      }}
                      placeholder="my-custom-link"
                      className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-500 ${
                        customSlugError
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                </div>
                {customSlugError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{customSlugError}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Create a memorable custom URL instead of a random one</span>
                </p>
              </div>
            )}

            {/* Expiration Dropdown */}
            <div className="space-y-2 sm:space-y-3">
              <label htmlFor="expiration" className="flex items-center text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                <span className="mr-1 sm:mr-2">⏰</span>
                <span>URL Expiration</span>
              </label>
              <div className="relative group">
                <select
                  id="expiration"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-3 py-2.5 pr-8 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 text-gray-900 dark:text-white bg-white dark:bg-gray-700 appearance-none cursor-pointer group-hover:border-gray-400 dark:group-hover:border-gray-500"
                  required
                >
                  <option value="5h">⚡ 5 hours</option>
                  <option value="1d">📅 1 day</option>
                  <option value="7d">📊 7 days</option>
                  <option value="14d">⭐ 14 days - Recommended</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Choose how long your shortened URL will remain active</span>
              </p>
            </div>

            {/* Error Message */}
            {createError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl shadow-lg">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-semibold block text-red-800 dark:text-red-300">Error Generating Link</span>
                    <span className="text-sm mt-1 block">{createError}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Success Result Section */}
      {currentShortUrl && (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          {/* Header with checkmark */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-green-800 dark:text-green-300">🎉 Success!</h3>
              <p className="text-green-600 dark:text-green-400 font-medium text-lg">Your URL has been shortened and is ready to share</p>
            </div>
          </div>

          {/* Short URL Display */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">🔗 Your Shortened URL</label>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expires in: {expiration === '5h' ? '5 hours' : expiration === '1d' ? '1 day' : expiration === '7d' ? '7 days' : '14 days'}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 gap-4">
              <div className="flex-1">
                <div className="text-blue-600 dark:text-blue-400 font-mono text-lg font-bold break-all hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors duration-200"
                     onClick={() => window.open(currentShortUrl, '_blank')}>
                  {currentShortUrl}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Click to open in new tab
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`px-6 py-3 transition-all duration-300 rounded-xl font-semibold text-sm hover:scale-105 ${
                  copied
                    ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700'
                    : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                title="Copy to clipboard"
              >
                {copied ? (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Test Link Button */}
            <button
              onClick={handleTestLink}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              🧪 Test Link
            </button>

            {/* Generate QR Code Button */}
            <button
              onClick={handleGenerateQR}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              📱 Generate QR Code
            </button>
          </div>

          {/* Additional Info for Anonymous Users */}
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                💡 Sign up to create unlimited URLs and track analytics!
              </p>
            </div>
          )}
        </div>
      )}

      {/* QR Code Display */}
      {qrGenerated && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📱 QR Code Generated</h4>
            <p className="text-gray-600 dark:text-gray-300">Scan with your phone to instantly access the link</p>
          </div>
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-100 p-6 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-300 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <canvas ref={canvasRef} />
            </div>
          </div>
          <button
            onClick={downloadQRCode}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 flex items-center justify-center mx-auto font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            💾 Download QR Code
          </button>
        </div>
      )}

      {/* Hidden canvas for QR generation - always present */}
      {!qrGenerated && <canvas ref={canvasRef} style={{ display: 'none' }} />}
    </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">Creating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Shorten URL
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      
  )
}

export default UrlForm
