/**
 * Performance utilities for debugging and monitoring
 * 
 * This module provides utilities to help identify performance bottlenecks
 * and monitor component rendering performance.
 */

/**
 * Performance monitoring decorator for React components
 * Logs render time and helps identify slow components
 */
export function withPerformanceMonitoring<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  return React.memo((props: any) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Log if render takes longer than one frame (16ms)
        console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    });
    
    return React.createElement(Component, props);
  }) as T;
}

/**
 * Debounce function to limit the rate of function execution
 * Useful for preventing excessive API calls or DOM updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit the rate of function execution
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Measure function execution time
 * Useful for profiling specific operations
 */
export function measureTime<T>(
  operation: () => T,
  operationName: string
): T {
  const startTime = performance.now();
  const result = operation();
  const endTime = performance.now();
  
  console.log(`[Performance] ${operationName} took ${(endTime - startTime).toFixed(2)}ms`);
  
  return result;
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Performance-aware scroll function that uses requestAnimationFrame
 * to avoid forced reflows
 */
export function smoothScrollTo(
  element: HTMLElement | null,
  options: ScrollIntoViewOptions = {}
): void {
  if (!element) return;
  
  requestAnimationFrame(() => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    });
  });
}
