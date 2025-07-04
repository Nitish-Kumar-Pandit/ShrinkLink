import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

const AnalyticsDemoPage = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({
    totalClicks: 0,
    totalLinks: 0,
    clickRate: 0,
    activeUsers: 0
  })

  useEffect(() => {
    setIsVisible(true)

    // Animate stats
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setAnimatedStats({
        totalClicks: Math.floor(progress * 24847),
        totalLinks: Math.floor(progress * 342),
        clickRate: Math.floor(progress * 87),
        activeUsers: Math.floor(progress * 156)
      })

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  const mockData = {
    topCountries: [
      { country: 'United States', clicks: 8234, percentage: 45 },
      { country: 'United Kingdom', clicks: 3421, percentage: 19 },
      { country: 'Canada', clicks: 2156, percentage: 12 },
      { country: 'Germany', clicks: 1876, percentage: 10 },
      { country: 'Australia', clicks: 1234, percentage: 7 },
      { country: 'Others', clicks: 1256, percentage: 7 }
    ],
    deviceBreakdown: [
      { device: 'Desktop', percentage: 60, color: 'from-blue-500 to-blue-600' },
      { device: 'Mobile', percentage: 35, color: 'from-green-500 to-green-600' },
      { device: 'Tablet', percentage: 5, color: 'from-purple-500 to-purple-600' }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => navigate({ to: '/' })}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex-shrink-0"
              >
                <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                <span className="hidden sm:inline">Analytics Demo</span>
                <span className="sm:hidden">Analytics</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Demo Mode</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>

        {/* Demo Notice */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6 mb-8">
          <div className="flex items-start sm:items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                <span className="block sm:inline">Experience ShrinkLink Analytics</span>
                <span className="block sm:inline text-sm text-gray-500 dark:text-gray-400 font-normal"> (Premium Users Only)</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                This is a live demo showcasing our powerful analytics dashboard. All data shown is simulated for demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {animatedStats.totalClicks.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12.5% this week</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Links</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {animatedStats.totalLinks.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">+8 today</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Click Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {animatedStats.clickRate}%
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">+5.2% this month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {animatedStats.activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">+23 online now</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Countries */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Top Countries</h3>
            <div className="space-y-4">
              {mockData.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                        style={{ width: isVisible ? `${country.percentage}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Device Types</h3>
            <div className="space-y-4">
              {mockData.deviceBreakdown.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 bg-gradient-to-r ${device.color} rounded-full`}></div>
                    <span className="text-gray-900 dark:text-white font-medium">{device.device}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${device.color} transition-all duration-1000`}
                        style={{ width: isVisible ? `${device.percentage}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Create your account today and start tracking your link performance with our powerful analytics dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate({ to: '/register' })}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg"
            >
              Sign Up Free
            </button>
            <button
              onClick={() => {
                navigate({ to: '/' })
                // Small delay to ensure navigation completes, then scroll to form
                setTimeout(() => {
                  const urlForm = document.querySelector('#url-form')
                  if (urlForm) {
                    urlForm.scrollIntoView({ behavior: 'smooth' })
                  }
                }, 100)
              }}
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              Try Without Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDemoPage