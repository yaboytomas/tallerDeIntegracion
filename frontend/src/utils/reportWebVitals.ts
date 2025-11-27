import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { isCookieAllowed } from '../components/cookies/CookieConsentBanner';

/**
 * Web Vitals Monitoring Utility
 * 
 * Tracks Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint): Measures loading performance (< 2.5s is good)
 * - INP (Interaction to Next Paint): Measures interactivity/responsiveness (< 200ms is good)
 * - CLS (Cumulative Layout Shift): Measures visual stability (< 0.1 is good)
 * - FCP (First Contentful Paint): Time to first content render
 * - TTFB (Time to First Byte): Server response time
 */

// Store metrics for later analysis
const metricsStore: Metric[] = [];

// Color coding for console logs
const getMetricRating = (metric: Metric): { rating: string; color: string; emoji: string } => {
  const { rating } = metric;
  
  const ratings = {
    good: { rating: '✅ Good', color: '#10b981', emoji: '✅' },
    'needs-improvement': { rating: '⚠️ Needs Improvement', color: '#f59e0b', emoji: '⚠️' },
    poor: { rating: '❌ Poor', color: '#ef4444', emoji: '❌' },
  };

  return ratings[rating as keyof typeof ratings] || ratings['needs-improvement'];
};

// Format metric value based on type
const formatValue = (metric: Metric): string => {
  const { name, value } = metric;
  
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  
  return `${Math.round(value)}ms`;
};

// Log metric to console with styling
const logMetric = (metric: Metric) => {
  const { name, value, rating } = metric;
  const { rating: ratingText, color, emoji } = getMetricRating(metric);
  const formattedValue = formatValue(metric);

  console.log(
    `%c${emoji} ${name}: ${formattedValue} (${ratingText})`,
    `color: ${color}; font-weight: bold; font-size: 12px; padding: 4px 8px; border-radius: 4px; background-color: ${color}22;`
  );

  // Detailed log for debugging
  console.debug('📊 Web Vital Details:', {
    name,
    value,
    rating,
    formattedValue,
    id: metric.id,
    navigationType: metric.navigationType,
  });
};

// Send metrics to analytics service (if analytics cookies are allowed)
const sendToAnalytics = (metric: Metric) => {
  // Only send if analytics cookies are allowed
  if (!isCookieAllowed('analytics')) {
    console.debug('🚫 Analytics cookies not allowed, skipping metric reporting');
    return;
  }

  // Store metrics locally
  metricsStore.push(metric);

  // Send to Google Analytics (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint (optional)
  // You can uncomment this and implement your own analytics API
  /*
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
    }),
  }).catch(err => console.error('Failed to send web vitals:', err));
  */
};

// Main handler for all metrics
const handleMetric = (metric: Metric) => {
  logMetric(metric);
  sendToAnalytics(metric);
};

// Initialize Web Vitals tracking
export function reportWebVitals() {
  try {
    // Core Web Vitals
    onLCP(handleMetric);  // Largest Contentful Paint
    onINP(handleMetric);  // Interaction to Next Paint (replaces FID)
    onCLS(handleMetric);  // Cumulative Layout Shift

    // Additional metrics
    onFCP(handleMetric);  // First Contentful Paint
    onTTFB(handleMetric); // Time to First Byte

    console.log(
      '%c🚀 Web Vitals Monitoring Active',
      'color: #8b5cf6; font-weight: bold; font-size: 14px; padding: 6px 12px; border-radius: 4px; background-color: #8b5cf622;'
    );
  } catch (error) {
    console.error('❌ Error initializing Web Vitals:', error);
  }
}

// Export function to get all collected metrics
export function getCollectedMetrics(): Metric[] {
  return [...metricsStore];
}

// Export function to get metrics summary
export function getMetricsSummary() {
  if (metricsStore.length === 0) {
    return null;
  }

  const summary: Record<string, { value: number; rating: string }> = {};
  
  metricsStore.forEach(metric => {
    summary[metric.name] = {
      value: metric.value,
      rating: metric.rating,
    };
  });

  return summary;
}

// Export function to check if site meets Core Web Vitals thresholds
export function getCoreWebVitalsScore(): { passed: number; total: number; percentage: number } {
  const coreMetrics = ['LCP', 'INP', 'CLS'];
  const goodMetrics = metricsStore.filter(
    m => coreMetrics.includes(m.name) && m.rating === 'good'
  );

  const total = Math.max(
    coreMetrics.filter(name => metricsStore.some(m => m.name === name)).length,
    1
  );

  return {
    passed: goodMetrics.length,
    total,
    percentage: Math.round((goodMetrics.length / total) * 100),
  };
}

// Listen for cookie consent changes and re-initialize if needed
if (typeof window !== 'undefined') {
  window.addEventListener('cookieConsentChanged', (event: any) => {
    const { preferences } = event.detail;
    if (preferences?.analytics) {
      console.log('📊 Analytics cookies enabled, Web Vitals reporting active');
    } else {
      console.log('🚫 Analytics cookies disabled, Web Vitals logging to console only');
    }
  });
}

