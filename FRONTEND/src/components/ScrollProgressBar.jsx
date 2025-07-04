import React, { useState, useEffect } from 'react'

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = (window.scrollY / totalHeight) * 100
      
      setScrollProgress(currentProgress)
      setIsVisible(window.scrollY > 100) // Show after scrolling 100px
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial calculation
    handleScroll()

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {/* Background bar */}
      <div className="h-1 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm">
        {/* Progress bar */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out shadow-lg"
          style={{
            width: `${scrollProgress}%`,
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
            transition: 'width 0.1s ease-out, box-shadow 0.3s ease-out'
          }}
        >
          {/* Animated glow effect */}
          <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default ScrollProgressBar
