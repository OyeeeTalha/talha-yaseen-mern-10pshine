import pino from "pino";

// Create base logger instance with configuration
const baseLogger = pino({
  browser: {
    asObject: true,
    serialize: true,
  },
  level: import.meta.env.DEV ? "debug" : "warn",
  base: {
    env: import.meta.env.MODE,
    app: "notes-frontend",
  },
  transport: import.meta.env.DEV
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

// Current logger instance (can be swapped with child logger)
export let logger = baseLogger;

// Add user context to all logs by creating a child logger
export const setUserContext = (userId: string, email?: string) => {
  logger = baseLogger.child({ userId, userEmail: email });
};

// Clear user context by resetting to base logger
export const clearUserContext = () => {
  logger = baseLogger;
};

// Helper functions for common logging patterns
export const logApiRequest = (method: string, url: string, data?: unknown) => {
  logger.debug({ msg: "API Request", method, url, data });
};

export const logApiResponse = (
  method: string,
  url: string,
  status: number,
  data?: unknown,
) => {
  logger.debug({ msg: "API Response", method, url, status, data });
};

export const logApiError = (
  method: string,
  url: string,
  error: Error,
  status?: number,
) => {
  logger.error({
    msg: "API Error",
    method,
    url,
    status,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  });
};
