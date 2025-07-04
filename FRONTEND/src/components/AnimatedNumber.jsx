import React, { useState, useEffect } from 'react'

const AnimatedNumber = ({ value, duration = 1000, suffix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value === undefined || value === null) return

    const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value
    
    if (numericValue === displayValue) return

    setIsAnimating(true)
    const startValue = displayValue
    const endValue = numericValue
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, displayValue])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      {formatNumber(displayValue)}{suffix}
    </span>
  )
}

export default AnimatedNumber
