import React from 'react'
import UrlForm from '../components/UrlForm'
import UserUrl from '../components/UserUrl'
import { useSelector } from 'react-redux'

const DashboardPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Welcome Message */}
        {isAuthenticated && user && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.username || user.email}! 👋
            </h1>
            <p className="text-gray-600 mt-2">Create and manage your shortened URLs</p>
          </div>
        )}

        {/* URL Creation Section */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">URL Shortener</h2>
          <UrlForm/>
        </div>

        {/* User URLs Section */}
        <UserUrl/>
      </div>
    </div>
  )
}

export default DashboardPage
