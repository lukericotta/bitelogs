/**
 * Simple logger utility for production use
 * Provides structured logging with levels and timestamps
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default to 'info' in production, 'debug' in development
const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
};

const formatMessage = (level: LogLevel, message: string, data?: unknown): string => {
  const timestamp = new Date().toISOString();
  const entry: LogEntry = {
    level,
    message,
    timestamp,
    ...(data !== undefined && { data }),
  };
  
  // In production, output JSON for log aggregators
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }
  
  // In development, output human-readable format
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
  }
  return `${prefix} ${message}`;
};

export const logger = {
  debug(message: string, data?: unknown): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, data));
    }
  },

  info(message: string, data?: unknown): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, data));
    }
  },

  warn(message: string, data?: unknown): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, data));
    }
  },

  error(message: string, data?: unknown): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, data));
    }
  },

  // Log HTTP requests
  http(method: string, path: string, statusCode: number, duration: number): void {
    const message = `${method} ${path} ${statusCode} ${duration}ms`;
    if (statusCode >= 500) {
      this.error(message);
    } else if (statusCode >= 400) {
      this.warn(message);
    } else {
      this.info(message);
    }
  },
};

export default logger;
