import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

const HeroSection = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    'Smart Analytics',
    'Custom URLs',
    'QR Codes',
    'Unlimited Links'
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Rotate features
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    // Scroll to URL form
    const urlForm = document.querySelector('#url-form')
    if (urlForm) {
      urlForm.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleViewDemo = () => {
    navigate({ to: '/analytics-demo' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Brand Logo */}
            <div className="flex items-center justify-center lg:justify-start mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <div className="ml-4 text-left lg:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  <span className="text-blue-600">Shrink</span>
                  <span className="text-gray-900 dark:text-white">Link</span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Shrink URLs, Expand Possibilities</p>
              </div>
            </div>

            {/* Main Headlines */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Transform
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Long URLs
              </span>
              into Smart Links
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Create intelligent short links with{' '}
              <span className="relative inline-block min-w-[140px] text-center">
                <span className={`transition-all duration-500 ${currentFeature === 0 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                  analytics
                </span>
                <span className={`transition-all duration-500 ${currentFeature === 1 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                  QR codes
                </span>
                <span className={`transition-all duration-500 ${currentFeature === 2 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                  custom URLs
                </span>
                <span className={`transition-all duration-500 ${currentFeature === 3 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                  smart links
                </span>
              </span>
              , and powerful analytics
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Start Shrinking</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={handleViewDemo}
                className="group border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105"
              >
                View Analytics Demo
                <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>


          </div>

          {/* Right Column - Visual */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6">
                {/* Mock Browser Header */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">shrinklink.app</div>
                </div>

                {/* Mock URL Form */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-24 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                  </div>
                  
                  {/* Mock Result */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-800 dark:text-green-400">shrink.ly/abc123</div>
                      <div className="w-8 h-8 bg-green-500 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V5H5v14h14v-3.586l2-2V19a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                  <path d="M17.707 7.707a1 1 0 00-1.414-1.414L10 12.586 7.707 10.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7z"/>
                </svg>
              </div>

              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V5H5v14h14v-3.586l2-2V19a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
