import React, { useState, useEffect, useRef, useCallback } from 'react'

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isVisible, setIsVisible] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({
    clicks: 0,
    links: 0,
    conversion: 0
  })
  const animationRef = useRef()
  const startTimeRef = useRef()

  // Optimized animation using requestAnimationFrame
  const animateStats = useCallback(() => {
    const duration = 2000
    const targetValues = {
      clicks: 12847,
      links: 156,
      conversion: 94
    }

    const animateFrame = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setAnimatedStats({
        clicks: Math.floor(easeOutQuart * targetValues.clicks),
        links: Math.floor(easeOutQuart * targetValues.links),
        conversion: Math.floor(easeOutQuart * targetValues.conversion)
      })

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame)
      }
    }

    animationRef.current = requestAnimationFrame(animateFrame)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          startTimeRef.current = null
          animateStats()
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('dashboard-preview')
    if (element) observer.observe(element)

    return () => {
      observer.disconnect()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animateStats])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'links', label: 'My Links', icon: 'link' },
    { id: 'analytics', label: 'Analytics', icon: 'graph' }
  ]

  const mockLinks = [
    { id: 1, original: 'https://example.com/very-long-url-that-needs-shortening', short: 'shrink.ly/abc123', clicks: 1247, status: 'active' },
    { id: 2, original: 'https://another-example.com/product-page', short: 'shrink.ly/def456', clicks: 892, status: 'active' },
    { id: 3, original: 'https://blog.example.com/article-title', short: 'shrink.ly/ghi789', clicks: 456, status: 'expiring' }
  ]

  return (
    <section 
      id="dashboard-preview"
      className={`py-20 px-4 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Dashboard
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Built for Professionals
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get comprehensive insights into your link performance with our intuitive dashboard
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative">
          {/* Browser Frame */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Browser Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                  dashboard.shrinklink.app
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Clicks</p>
                      <p className="text-3xl font-bold">{animatedStats.clicks.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Links</p>
                      <p className="text-3xl font-bold">{animatedStats.links}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Conversion Rate</p>
                      <p className="text-3xl font-bold">{animatedStats.conversion}%</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-64">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</span>
                      </div>
                      <div className="h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg flex items-end justify-between p-4">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm w-6 transition-all duration-1000"
                            style={{ 
                              height: isVisible ? `${height}%` : '0%',
                              transitionDelay: `${index * 100}ms`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'links' && (
                  <div className="space-y-3">
                    {mockLinks.map((link, index) => (
                      <div
                        key={link.id}
                        className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all duration-500 ${
                          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-blue-600 dark:text-blue-400 font-medium">{link.short}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                link.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              }`}>
                                {link.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{link.original}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{link.clicks}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">clicks</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h4>
                        <div className="space-y-3">
                          {['United States', 'United Kingdom', 'Canada'].map((country, index) => (
                            <div key={country} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{country}</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{[85, 65, 45][index]}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                  style={{
                                    width: isVisible ? `${[85, 65, 45][index]}%` : '0%',
                                    transitionDelay: `${index * 200}ms`
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Device Types</h4>
                        <div className="space-y-3">
                          {['Desktop', 'Mobile', 'Tablet'].map((device, index) => (
                            <div key={device} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{device}</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{[60, 35, 5][index]}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
                                  style={{
                                    width: isVisible ? `${[60, 35, 5][index]}%` : '0%',
                                    transitionDelay: `${index * 200}ms`
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute -bottom-4 -right-4 flex gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default React.memo(DashboardPreview);
