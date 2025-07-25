import React, { useState, useEffect, useRef, useCallback } from 'react'

const AnimatedNumber = ({ value, duration = 1000, suffix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef()
  const startTimeRef = useRef()

  const animate = useCallback((startValue, endValue) => {
    const animateFrame = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart)
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame)
      } else {
        setIsAnimating(false)
        startTimeRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animateFrame)
  }, [duration])

  useEffect(() => {
    if (value === undefined || value === null) return

    const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value

    if (numericValue === displayValue) return

    setIsAnimating(true)
    startTimeRef.current = null
    animate(displayValue, numericValue)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, displayValue, animate])

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

export default React.memo(AnimatedNumber);
