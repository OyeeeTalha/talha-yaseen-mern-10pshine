import { logger } from "./logger";

interface ErrorInfo {
  componentStack?: string;
  [key: string]: unknown;
}

// Global error handler for uncaught errors
export const setupGlobalErrorHandler = () => {
  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    logger.error({
      msg: "Uncaught Error",
      error: {
        message: event.message,
        stack: event.error?.stack,
        name: event.error?.name,
      },
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    // Prevent default browser error handling in production
    if (!import.meta.env.DEV) {
      event.preventDefault();
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logger.error({
      msg: "Unhandled Promise Rejection",
      reason: event.reason,
      promise: String(event.promise),
    });

    // Prevent default browser handling in production
    if (!import.meta.env.DEV) {
      event.preventDefault();
    }
  });

  // Log when user navigates away
  window.addEventListener("beforeunload", () => {
    logger.debug({ msg: "User leaving page" });
  });
};

// Error logging helper for React components
export const logComponentError = (
  error: Error,
  errorInfo: ErrorInfo,
  componentName?: string,
) => {
  logger.error({
    msg: "React Component Error",
    component: componentName,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    errorInfo: {
      componentStack: errorInfo.componentStack,
    },
  });
};

// Network error helper
export const logNetworkError = (
  url: string,
  method: string,
  error: Error,
  status?: number,
) => {
  logger.error({
    msg: "Network Error",
    url,
    method,
    status,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  });
};

// User action logging
export const logUserAction = (
  action: string,
  details?: Record<string, unknown>,
) => {
  logger.info({
    msg: "User Action",
    action,
    ...details,
  });
};

// Performance logging
export const logPerformance = (metric: string, duration: number) => {
  logger.info({
    msg: "Performance Metric",
    metric,
    duration,
    unit: "ms",
  });
};
