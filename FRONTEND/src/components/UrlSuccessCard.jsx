import React, { useState } from 'react'
import { useSelector } from 'react-redux'

const UrlSuccessCard = ({ shortUrl, expirationTime, onGenerateQR, onTestLink }) => {
  const [copied, setCopied] = useState(false)
  const { isAuthenticated } = useSelector((state) => state.auth)

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUrlClick = () => {
    window.open(shortUrl, '_blank', 'noopener,noreferrer')
  }

  const formatExpirationTime = (expiration) => {
    switch (expiration) {
      case '5h':
        return '5 hours'
      case '1d':
        return '1 day'
      case '7d':
        return '7 days'
      case '14d':
        return '14 days'
      default:
        return '14 days'
    }
  }

  return (
    <div className="mt-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-8 shadow-xl">
      {/* Header with checkmark */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-800 flex items-center">
            🎉 URL Shortened!
          </h3>
          <p className="text-green-600 font-medium">Ready to share</p>
        </div>
      </div>

      {/* URL Display Card */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">🔗 Short URL</label>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatExpirationTime(expirationTime)}
          </div>
        </div>
        
        <div className="flex items-center bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex-1 mr-4">
            <div 
              className="text-blue-600 font-mono text-lg font-semibold break-all hover:text-blue-800 cursor-pointer transition-colors duration-200"
              onClick={handleUrlClick}
              title="Click to open in new tab"
            >
              {shortUrl}
            </div>
            <div className="text-xs text-gray-500 mt-1">Click to open in new tab</div>
          </div>
          
          <button
            onClick={handleCopy}
            className={`px-4 py-2 transition-all duration-200 rounded-xl font-medium flex items-center ${
              copied
                ? 'text-green-700 bg-green-100 border-2 border-green-300'
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400'
            }`}
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Test Link Button */}
        <button
          onClick={onTestLink}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Test Link
        </button>

        {/* Generate QR Code Button */}
        <button
          onClick={onGenerateQR}
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
  )
}

export default UrlSuccessCard
