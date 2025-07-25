import { useEffect, useRef, useCallback, useMemo } from 'react';

// Optimized Intersection Observer hook
export const useIntersectionObserver = (callback, options = {}) => {
  const observerRef = useRef(null);
  const elementsRef = useRef(new Set());

  const defaultOptions = useMemo(() => ({
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  }), [options]);

  const observe = useCallback((element) => {
    if (!element || elementsRef.current.has(element)) return;
    
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(callback, defaultOptions);
    }
    
    observerRef.current.observe(element);
    elementsRef.current.add(element);
  }, [callback, defaultOptions]);

  const unobserve = useCallback((element) => {
    if (!element || !observerRef.current) return;
    
    observerRef.current.unobserve(element);
    elementsRef.current.delete(element);
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      elementsRef.current.clear();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { observe, unobserve, disconnect };
};

// Optimized animation hook using requestAnimationFrame
export const useAnimatedCounter = (endValue, duration = 2000, startValue = 0) => {
  const frameRef = useRef();
  const startTimeRef = useRef();
  const currentValueRef = useRef(startValue);

  const animate = useCallback((setValue) => {
    const animateFrame = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
      
      currentValueRef.current = currentValue;
      setValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateFrame);
      } else {
        startTimeRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(animateFrame);
  }, [endValue, duration, startValue]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      startTimeRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { animate, stop, currentValue: currentValueRef.current };
};

// Debounced scroll handler
export const useOptimizedScroll = (callback, delay = 16) => {
  const timeoutRef = useRef();
  const lastCallRef = useRef(0);

  const optimizedCallback = useCallback(() => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      callback();
      lastCallRef.current = now;
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callback();
        lastCallRef.current = Date.now();
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return optimizedCallback;
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef();

  useEffect(() => {
    renderCountRef.current += 1;
    
    if (!mountTimeRef.current) {
      mountTimeRef.current = performance.now();
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${componentName} rendered ${renderCountRef.current} times`);
    }
  });

  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'development') {
        const mountDuration = performance.now() - mountTimeRef.current;
        console.log(`📊 ${componentName} was mounted for ${mountDuration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// Optimized resize observer
export const useResizeObserver = (callback) => {
  const observerRef = useRef();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const observe = useCallback((element) => {
    if (!element) return;

    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        callbackRef.current(entries);
      });
    }

    observerRef.current.observe(element);
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { observe, disconnect };
};
