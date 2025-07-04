import React, { useState, useEffect } from 'react'
import UrlForm from '../components/UrlForm'
import UserUrl from '../components/UserUrl'
import UserProfileCard from '../components/UserProfileCard'
import AnimatedNumber from '../components/AnimatedNumber'
import { useSelector, useDispatch } from 'react-redux'
import { getUserStats, getUserUrls } from '../store/slices/urlSlice'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { stats, isLoading, error } = useSelector((state) => state.url)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    // Fetch stats when component mounts and user is authenticated
    if (isAuthenticated && !statsLoaded) {
      // Add a small delay to make the loading animation visible
      setTimeout(() => {
        dispatch(getUserStats()).then(() => {
          setStatsLoaded(true)
        })
        dispatch(getUserUrls())
      }, 300)
    }
  }, [dispatch, isAuthenticated, statsLoaded])

  // Retry mechanism for failed stats loading
  useEffect(() => {
    if (error && isAuthenticated && !isLoading) {
      const retryTimer = setTimeout(() => {
        dispatch(getUserStats())
      }, 2000)

      return () => clearTimeout(retryTimer)
    }
  }, [error, isAuthenticated, isLoading, dispatch])

  const tabs = [
    { id: 'create', label: 'Create URL', icon: 'plus' },
    { id: 'manage', label: 'Manage URLs', icon: 'list' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' }
  ]

  const getIcon = (iconName) => {
    const iconProps = {
      className: "w-5 h-5",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      strokeWidth: 2
    }

    switch (iconName) {
      case 'plus':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )
      case 'list':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )
      case 'chart':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* User Profile Card */}
        {isAuthenticated && user && (
          <UserProfileCard />
        )}

        {/* Welcome Message for Mobile/Fallback */}
        {isAuthenticated && user && (
          <div className="mb-8 text-center">
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create, manage, and track your shortened URLs with powerful analytics
            </p>
          </div>
        )}

        {/* Stats Section */}
        {isAuthenticated && user && (
          <div className="mb-8">
            {/* Stats Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Stats</h2>
              {error && (
                <button
                  onClick={() => {
                    setStatsLoaded(false)
                    dispatch(getUserStats())
                  }}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              )}
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Links</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {isLoading && !statsLoaded ? (
                        <div className="animate-shimmer h-8 w-16 rounded-lg"></div>
                      ) : (
                        <AnimatedNumber
                          value={stats?.totalUrls || 0}
                          duration={800}
                          className="animate-countUp"
                        />
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {isLoading && !statsLoaded ? (
                        <div className="animate-shimmer h-8 w-20 rounded-lg"></div>
                      ) : (
                        <AnimatedNumber
                          value={stats?.totalClicks || 0}
                          duration={1000}
                          className="animate-countUp"
                        />
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Click Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {isLoading && !statsLoaded ? (
                        <div className="animate-shimmer h-8 w-16 rounded-lg"></div>
                      ) : (
                        <AnimatedNumber
                          value={stats?.clickRate || 0}
                          duration={600}
                          suffix="%"
                          className="animate-countUp"
                        />
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-8 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {getIcon(tab.icon)}
              <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8 min-h-[400px]">
          {activeTab === 'create' && (
            <div className="animate-fadeIn bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Short URL</h2>
                <p className="text-gray-600 dark:text-gray-300">Transform your long URLs into smart, trackable links</p>
              </div>
              <UrlForm/>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="animate-fadeIn transition-all duration-300 ease-in-out">
              <UserUrl/>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fadeIn bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Analytics Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">Coming soon! Track your link performance with detailed analytics.</p>
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
