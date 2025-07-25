import React, { useEffect, useRef } from 'react';

const PerformanceMonitor = ({ enabled = false }) => {
  const metricsRef = useRef({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0
  });

  const observerRef = useRef();

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    // Monitor render performance
    const startTime = performance.now();
    metricsRef.current.renderCount++;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      metricsRef.current.lastRenderTime = renderTime;
      metricsRef.current.averageRenderTime = 
        (metricsRef.current.averageRenderTime + renderTime) / 2;

      if (renderTime > 16) { // Slower than 60fps
        metricsRef.current.slowRenders++;
        console.warn(`🐌 Slow render detected: ${renderTime.toFixed(2)}ms`);
      }

      // Log metrics every 50 renders
      if (metricsRef.current.renderCount % 50 === 0) {
        console.log('📊 Performance Metrics:', {
          totalRenders: metricsRef.current.renderCount,
          averageRenderTime: metricsRef.current.averageRenderTime.toFixed(2) + 'ms',
          slowRenders: metricsRef.current.slowRenders,
          slowRenderPercentage: ((metricsRef.current.slowRenders / metricsRef.current.renderCount) * 100).toFixed(1) + '%'
        });
      }
    };
  });

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    // Monitor Long Tasks
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`🚨 Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });

      try {
        observerRef.current.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }
    }

    // Monitor memory usage
    const checkMemory = () => {
      if (performance.memory) {
        const memory = performance.memory;
        const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
        const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
        const limitMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);

        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
          console.warn(`🧠 High memory usage: ${usedMB}MB / ${limitMB}MB`);
        }

        // Log memory stats every 30 seconds
        setTimeout(checkMemory, 30000);
      }
    };

    checkMemory();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled]);

  // Monitor FPS
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        if (fps < 30) {
          console.warn(`📉 Low FPS detected: ${fps}fps`);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  // Don't render anything in production or when disabled
  if (!enabled || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <div>Renders: {metricsRef.current.renderCount}</div>
      <div>Avg: {metricsRef.current.averageRenderTime.toFixed(1)}ms</div>
      <div>Slow: {metricsRef.current.slowRenders}</div>
    </div>
  );
};

// Performance utilities
export const measurePerformance = (name, fn) => {
  if (process.env.NODE_ENV !== 'development') {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// React performance utilities
export const withPerformanceMonitoring = (Component, componentName) => {
  return React.memo((props) => {
    const renderStart = useRef();

    useEffect(() => {
      renderStart.current = performance.now();
    });

    useEffect(() => {
      if (renderStart.current && process.env.NODE_ENV === 'development') {
        const renderTime = performance.now() - renderStart.current;
        if (renderTime > 16) {
          console.warn(`🐌 ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
        }
      }
    });

    return React.createElement(Component, props);
  });
};

export default PerformanceMonitor;
