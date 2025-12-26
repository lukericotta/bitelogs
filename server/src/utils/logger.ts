import { config } from '../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
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

const getMinLogLevel = (): number => {
  if (config.NODE_ENV === 'test') return LOG_LEVELS.error + 1; // Silence all in tests
  if (config.NODE_ENV === 'production') return LOG_LEVELS.info;
  return LOG_LEVELS.debug;
};

const formatMessage = (log: LogMessage): string => {
  const base = `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`;
  if (log.data !== undefined) {
    return `${base} ${JSON.stringify(log.data)}`;
  }
  return base;
};

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= getMinLogLevel();
};

const createLog = (level: LogLevel, message: string, data?: unknown): void => {
  if (!shouldLog(level)) return;

  const log: LogMessage = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  const formatted = formatMessage(log);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
};

export const logger = {
  debug: (message: string, data?: unknown): void => createLog('debug', message, data),
  info: (message: string, data?: unknown): void => createLog('info', message, data),
  warn: (message: string, data?: unknown): void => createLog('warn', message, data),
  error: (message: string, data?: unknown): void => createLog('error', message, data),
};

export default logger;
