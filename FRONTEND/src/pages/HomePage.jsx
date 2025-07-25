
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