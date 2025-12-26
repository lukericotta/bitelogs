import { logger, LogLevel, LogEntry } from '../../utils/logger';

describe('Logger', () => {
  // Store original console methods and environment
  const originalConsoleDebug = console.debug;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalEnv = process.env.NODE_ENV;
  const originalLogLevel = process.env.LOG_LEVEL;

  beforeEach(() => {
    // Mock console methods
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    // Set test environment
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsoleDebug;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  describe('logger object', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });

    it('should have debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });

    it('should have info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('should have http method', () => {
      expect(typeof logger.http).toBe('function');
    });
  });

  describe('debug()', () => {
    it('should call console.debug', () => {
      logger.debug('test message');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should include message in output', () => {
      logger.debug('test debug message');
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('test debug message')
      );
    });

    it('should include DEBUG level in output', () => {
      logger.debug('test');
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG')
      );
    });

    it('should include data when provided', () => {
      logger.debug('test', { key: 'value' });
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('key')
      );
    });
  });

  describe('info()', () => {
    it('should call console.info', () => {
      logger.info('test message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should include message in output', () => {
      logger.info('test info message');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('test info message')
      );
    });

    it('should include INFO level in output', () => {
      logger.info('test');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
    });
  });

  describe('warn()', () => {
    it('should call console.warn', () => {
      logger.warn('test message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should include message in output', () => {
      logger.warn('test warning message');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('test warning message')
      );
    });

    it('should include WARN level in output', () => {
      logger.warn('test');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN')
      );
    });
  });

  describe('error()', () => {
    it('should call console.error', () => {
      logger.error('test message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should include message in output', () => {
      logger.error('test error message');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('test error message')
      );
    });

    it('should include ERROR level in output', () => {
      logger.error('test');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR')
      );
    });

    it('should handle error objects as data', () => {
      const error = new Error('Something went wrong');
      logger.error('Operation failed', error);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('http()', () => {
    it('should log successful requests as info', () => {
      logger.http('GET', '/api/users', 200, 50);
      expect(console.info).toHaveBeenCalled();
    });

    it('should log client errors as warn', () => {
      logger.http('POST', '/api/login', 401, 30);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log server errors as error', () => {
      logger.http('GET', '/api/data', 500, 100);
      expect(console.error).toHaveBeenCalled();
    });

    it('should include method in output', () => {
      logger.http('GET', '/api/test', 200, 50);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('GET')
      );
    });

    it('should include path in output', () => {
      logger.http('GET', '/api/test', 200, 50);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('/api/test')
      );
    });

    it('should include status code in output', () => {
      logger.http('GET', '/api/test', 200, 50);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('200')
      );
    });

    it('should include duration in output', () => {
      logger.http('GET', '/api/test', 200, 50);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('50ms')
      );
    });

    it('should log 404 as warn', () => {
      logger.http('GET', '/api/notfound', 404, 10);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log 503 as error', () => {
      logger.http('GET', '/api/service', 503, 100);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('log output format', () => {
    it('should include timestamp in output', () => {
      logger.info('test');
      // Check for ISO date format pattern
      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      );
    });

    it('should include brackets around timestamp', () => {
      logger.info('test');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[')
      );
    });
  });
});
