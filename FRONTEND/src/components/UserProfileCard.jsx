import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const UserProfileCard = () => {
  const { user } = useSelector((state) => state.auth)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (!user) return null

  // Calculate member since date
  const getMemberSince = (createdAt) => {
    if (!createdAt) return 'Joined'
    return 'Joined'
  }

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format join date
  const formatJoinDate = (createdAt) => {
    if (!createdAt) return ''
    const date = new Date(createdAt)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={`transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 mb-8">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
              {user.avatarUrl || user.avatar ? (
                <>
                  <img
                    src={user.avatarUrl || user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentNode.querySelector('.fallback-initials').style.display = 'flex'
                    }}
                  />
                  <div className="fallback-initials w-full h-full flex items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                    {getInitials(user.username)}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {getInitials(user.username)}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
              {user.username || 'User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 truncate">
              {user.email}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 dark:text-gray-500 space-y-1 sm:space-y-0">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-2m-6 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{getMemberSince(user.createdAt)}</span>
              </div>
              {user.createdAt && (
                <span className="ml-0 sm:ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs flex-shrink-0">
                  {formatJoinDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            <div className="flex items-center px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
              <span className="hidden sm:inline">Active</span>
              <span className="sm:hidden">●</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Pro Member
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>URL Creator</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics Access</span>
              </div>
            </div>

            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200 self-start sm:self-auto">
              <span className="hidden sm:inline">View Profile →</span>
              <span className="sm:hidden">Profile →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileCard
