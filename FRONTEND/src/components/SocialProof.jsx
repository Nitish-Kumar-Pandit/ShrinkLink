import React, { useState, useEffect, useRef, useCallback } from 'react'

const SocialProof = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [animatedCounters, setAnimatedCounters] = useState({
    users: 0,
    links: 0,
    clicks: 0,
    countries: 0
  })
  const animationRef = useRef()
  const startTimeRef = useRef()

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&size=64&background=6366f1&color=ffffff",
      content: "ShrinkLink has revolutionized how we track our marketing campaigns. The analytics are incredibly detailed and the custom URLs help with our branding.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Social Media Manager",
      company: "StartupXYZ",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&size=64&background=8b5cf6&color=ffffff",
      content: "The QR code generation feature is a game-changer for our offline marketing. We can track everything seamlessly from print to digital.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Content Creator",
      company: "CreativeAgency",
      avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&size=64&background=ec4899&color=ffffff",
      content: "I love how easy it is to organize my links with folders and tags. The interface is beautiful and the performance is lightning fast.",
      rating: 5
    }
  ]

  const stats = [
    { label: "Active Users", value: 15000, suffix: "+" },
    { label: "Links Created", value: 2500000, suffix: "M+" },
    { label: "Clicks Tracked", value: 50000000, suffix: "M+" },
    { label: "Countries", value: 195, suffix: "" }
  ]

  const companies = [
    { name: "TechCorp", logo: "TC" },
    { name: "StartupXYZ", logo: "SX" },
    { name: "CreativeAgency", logo: "CA" },
    { name: "DigitalFlow", logo: "DF" },
    { name: "InnovateLab", logo: "IL" },
    { name: "GrowthHack", logo: "GH" }
  ]

  // Optimized counter animation using requestAnimationFrame
  const animateCounters = useCallback(() => {
    const duration = 2000
    const targetValues = {
      users: 15000,
      links: 2.5,
      clicks: 50,
      countries: 195
    }

    const animateFrame = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setAnimatedCounters({
        users: Math.floor(easeOutQuart * targetValues.users),
        links: Math.floor(easeOutQuart * targetValues.links),
        clicks: Math.floor(easeOutQuart * targetValues.clicks),
        countries: Math.floor(easeOutQuart * targetValues.countries)
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
          animateCounters()
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('social-proof')
    if (element) observer.observe(element)

    return () => {
      observer.disconnect()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animateCounters])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num, suffix) => {
    if (suffix === "M+") {
      return `${(num / 1000000).toFixed(1)}${suffix}`
    }
    return `${num.toLocaleString()}${suffix}`
  }

  return (
    <section 
      id="social-proof"
      className={`py-20 px-4 bg-gray-50/50 dark:bg-gray-800/50 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Thousands</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Join the growing community of professionals who rely on ShrinkLink for their URL management needs
          </p>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.label === "Active Users" && `${animatedCounters.users.toLocaleString()}${stat.suffix}`}
                  {stat.label === "Links Created" && `${animatedCounters.links}${stat.suffix}`}
                  {stat.label === "Clicks Tracked" && `${animatedCounters.clicks}${stat.suffix}`}
                  {stat.label === "Countries" && `${animatedCounters.countries}${stat.suffix}`}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-white/20 dark:border-gray-700/20">
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>

              {/* Testimonial Content */}
              <div className="pt-8">
                <div className="relative overflow-hidden h-32 mb-6">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className={`absolute inset-0 transition-all duration-500 ${
                        index === currentTestimonial 
                          ? 'opacity-100 translate-x-0' 
                          : index < currentTestimonial 
                            ? 'opacity-0 -translate-x-full' 
                            : 'opacity-0 translate-x-full'
                      }`}
                    >
                      <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                      </div>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial
                          ? 'bg-blue-500 scale-125'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">
            Trusted by teams at leading companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                    {company.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default React.memo(SocialProof);
