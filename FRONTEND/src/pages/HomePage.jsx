
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import UrlForm from '../components/UrlForm'
import AnonymousUsage from '../components/AnonymousUsage'
import FeatureCard from '../components/FeatureCard'
import HeroSection from '../components/HeroSection'
import DashboardPreview from '../components/DashboardPreview'
import SocialProof from '../components/SocialProof'

const HomePage = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState({})
  const [redirectError, setRedirectError] = useState(null)

  // Check for redirect errors in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      setRedirectError(decodeURIComponent(error))
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Optimized intersection observer with memoized options
  const observerOptions = useMemo(() => ({
    threshold: 0.1,
    rootMargin: '50px'
  }), [])

  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
      }
    })
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, observerOptions)

    const elements = document.querySelectorAll('[data-animate]')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [handleIntersection, observerOptions])

  const features = [
    {
      icon: 'bookmark',
      title: 'Save & Organize Links',
      description: 'Keep your links organized with smart folders and tags',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: 'pencil',
      title: 'Custom Short URLs',
      description: 'Create branded, memorable links with custom aliases',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: 'infinity',
      title: 'Unlimited URL Generation',
      description: 'Generate as many short links as you need, no limits',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: 'qr',
      title: 'QR Code Generation',
      description: 'Instantly create QR codes for any shortened URL',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: 'chart',
      title: 'Real-time Analytics',
      description: 'Track clicks, locations, devices, and engagement metrics',
      gradient: 'from-red-500 to-red-600'
    },
    {
      icon: 'heart',
      title: 'Bookmark & Favorites',
      description: 'Mark important links as favorites for quick access',
      gradient: 'from-pink-500 to-pink-600'
    }
  ]

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* URL Shortener Tool */}
      <section id="url-form" className="py-16  px-4">
        <div className="max-w-4xl mx-auto">
          {/* Redirect Error Display */}
          {redirectError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Short URL Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {redirectError}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setRedirectError(null)}
                      className="inline-flex bg-red-50 dark:bg-red-900/20 rounded-md p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 mb-8">
            <AnonymousUsage />
            <UrlForm/>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        data-animate
        className={`py-20 px-4  bg-gray-50/50 dark:bg-gray-800/50 transition-all duration-1000 ${
          isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Smart Links</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to create, manage, and track your shortened URLs with professional-grade features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <DashboardPreview />

      {/* Social Proof */}
      {/* <SocialProof /> */}

      {/* CTA Section */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-800/50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Links?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust ShrinkLink for their URL shortening needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg"
              >
                Start Shrinking
              </button>
              <button
                onClick={handleViewDemo}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors duration-200"
              >
                View Analytics Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default React.memo(HomePage);