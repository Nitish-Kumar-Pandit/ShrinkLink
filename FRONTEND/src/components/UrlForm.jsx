
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createShortUrl, getUserUrls, incrementAnonymousUsage, resetAnonymousUsage, clearCreateError, setCreateError } from '../store/slices/urlSlice.js'

// import { createShortUrl } from '../api/shortUrl.api'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import QRCode from 'qrcode';


const UrlForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const [customSlug, setCustomSlug] = useState('')
  const [expiration, setExpiration] = useState('14d') // Default to 14 days
  const [qrGenerated, setQrGenerated] = useState(false)
  const {isAuthenticated} = useSelector((state) => state.auth)
  const {currentShortUrl, isLoading, anonymousUsage, createError} = useSelector((state) => state.url)

  // Debug logging
  useEffect(() => {
    console.log('🔍 UrlForm state:', {
      currentShortUrl,
      isLoading,
      anonymousUsage,
      isAuthenticated
    });
  }, [currentShortUrl, isLoading, anonymousUsage, isAuthenticated]);

  useEffect(() => {
    // Clear any previous errors when component mounts or auth state changes
    dispatch(clearCreateError());

    // Only reset anonymous usage count, but preserve currentShortUrl
    if (!isAuthenticated) {
      // Clear localStorage for usage tracking only
      localStorage.removeItem('anonymousLinksCreated');
      localStorage.removeItem('anonymousUsage');
      localStorage.removeItem('urlSlice');
      // Reset only the usage count, not the current URL
      dispatch(resetAnonymousUsage());
      console.log('🧹 Anonymous usage data cleared on component mount');
    }
  }, [dispatch, isAuthenticated]);

  const generateQRCode = useCallback(async () => {
    try {
      console.log('🔄 Generating QR code...', {
        hasCanvas: !!canvasRef.current,
        currentShortUrl
      });

      if (canvasRef.current && currentShortUrl) {
        await QRCode.toCanvas(canvasRef.current, currentShortUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrGenerated(true);
        console.log('✅ QR code generated successfully');
      } else {
        console.log('❌ Cannot generate QR code:', {
          hasCanvas: !!canvasRef.current,
          hasUrl: !!currentShortUrl
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      console.error('Failed to generate QR code. Please try again.');
    }
  }, [currentShortUrl]);

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

  const handleGenerateQR = () => {
    console.log('📱 Generate QR clicked, currentShortUrl:', currentShortUrl, 'hasCanvas:', !!canvasRef.current);
    if (currentShortUrl) {
      // Always ensure QR section is visible first, then generate
      setQrGenerated(true);

      // Wait for DOM to update and canvas to be available
      setTimeout(() => {
        if (canvasRef.current) {
          console.log('✅ Generating QR code...');
          generateQRCode();
        } else {
          console.log('❌ Canvas still not ready after timeout');
          console.error('QR code canvas not ready. Please try again.');
        }
      }, 50);
    } else {
      console.log('❌ No currentShortUrl available for QR');
      console.error('Please create a short URL first before generating QR code');
    }
  }

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

      // Track anonymous usage
      if (!isAuthenticated) {
        dispatch(incrementAnonymousUsage());
      }

      // Refresh the URLs list to get the complete URL object with proper timestamps
      if (isAuthenticated) {
        dispatch(getUserUrls());
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
    <div className="space-y-6">
        {/* URL Input Section */}
        <div className="space-y-3">
          <label htmlFor="url" className="block text-sm font-semibold text-gray-800 mb-2">
            🔗 Enter your URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="url"
              value={url}
              onInput={(event) => {
                setUrl(event.target.value);
                if (createError) dispatch(clearCreateError()); // Clear error when user starts typing
              }}
              placeholder="https://example.com/your-very-long-url-here"
              required
              className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="space-y-3">
            <label htmlFor="customSlug" className="block text-sm font-semibold text-gray-800 mb-2">
              🎯 Custom URL (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-gray-500 text-sm font-mono">localhost:3001/</span>
              </div>
              <input
                type="text"
                id="customSlug"
                value={customSlug}
                onChange={(event) => setCustomSlug(event.target.value)}
                placeholder="my-custom-link"
                className="w-full pl-32 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Create a memorable custom URL instead of a random one</p>
          </div>
        )}

        {/* Expiration Dropdown */}
        <div className="space-y-3">
          <label htmlFor="expiration" className="block text-sm font-semibold text-gray-800 mb-2">
            ⏰ URL Expiration
          </label>
          <div className="relative">
            <select
              id="expiration"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white appearance-none cursor-pointer"
              required
            >
              <option value="5h">⚡ 5 hours - Quick share</option>
              <option value="1d">📅 1 day - Short term</option>
              <option value="7d">📊 7 days - Medium term</option>
              <option value="14d">⭐ 14 days - Recommended</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Choose how long your shortened URL will remain active</p>
        </div>
        

        {createError && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-medium block">Error Generating Link</span>
                <span className="text-sm mt-1 block">{createError}</span>
              </div>
            </div>
          </div>
        )}


        <button
          onClick={handleSubmit}
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating your short URL...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              ✨ Shorten URL
            </div>
          )}
        </button>

        {currentShortUrl && (
          <div className="mt-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-8 shadow-xl">
            {/* Header with checkmark */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800">🎉 Success!</h3>
                <p className="text-green-600 font-medium">Your URL has been shortened and is ready to share</p>
              </div>
            </div>

            {/* Short URL Display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-800">🔗 Your Shortened URL</label>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expires in: {expiration === '5h' ? '5 hours' : expiration === '1d' ? '1 day' : expiration === '7d' ? '7 days' : '14 days'}
                </div>
              </div>
              <div className="flex items-center bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex-1 mr-4">
                  <div className="text-blue-600 font-mono text-lg font-semibold break-all hover:text-blue-800 cursor-pointer"
                       onClick={() => window.open(currentShortUrl, '_blank')}>
                    {currentShortUrl}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Click to open in new tab</div>
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 transition-all duration-200 rounded-xl font-medium ${
                    copied
                      ? 'text-green-700 bg-green-100 border-2 border-green-300'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400'
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Test Link Button */}
              <button
                onClick={handleTestLink}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Test Link
              </button>

              {/* Generate QR Code Button */}
              <button
                onClick={handleGenerateQR}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Generate QR Code
              </button>
            </div>

            {/* Additional Info for Anonymous Users */}
            {!isAuthenticated && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sign up to create unlimited URLs and track analytics!
                </p>
              </div>
            )}
          </div>
        )}

        {/* QR Code Display */}
        {qrGenerated && (
          <div className="mt-8 text-center border-t-2 border-green-300 pt-8">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">📱 QR Code</h4>
              <p className="text-sm text-gray-600">Scan with your phone to instantly access the link</p>
            </div>
            <div className="flex justify-center mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow duration-200">
                <canvas ref={canvasRef} />
              </div>
            </div>
            <button
              onClick={downloadQRCode}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center mx-auto font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              💾 Download QR Code
            </button>
          </div>
        )}

        {/* Hidden canvas for QR generation - always present */}
        {!qrGenerated && <canvas ref={canvasRef} style={{ display: 'none' }} />}



      </div>
  )
}

export default UrlForm
