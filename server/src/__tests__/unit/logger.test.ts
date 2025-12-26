import { logger } from '../../utils/logger';

describe('Logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    // Restore console for these tests
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logger methods exist', () => {
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
  });

  describe('log level filtering', () => {
    // In test environment, logs should be silenced by default
    it('should not log debug in test environment', () => {
      logger.debug('test message');
      // In test mode, nothing should be logged
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not log info in test environment', () => {
      logger.info('test message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not log warn in test environment', () => {
      logger.warn('test message');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should not log error in test environment', () => {
      logger.error('test message');
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('logger accepts data parameter', () => {
    it('should accept data with debug', () => {
      expect(() => logger.debug('test', { foo: 'bar' })).not.toThrow();
    });

    it('should accept data with info', () => {
      expect(() => logger.info('test', { foo: 'bar' })).not.toThrow();
    });

    it('should accept data with warn', () => {
      expect(() => logger.warn('test', { foo: 'bar' })).not.toThrow();
    });

    it('should accept data with error', () => {
      expect(() => logger.error('test', { foo: 'bar' })).not.toThrow();
    });

    it('should accept undefined data', () => {
      expect(() => logger.info('test', undefined)).not.toThrow();
    });

    it('should accept null data', () => {
      expect(() => logger.info('test', null)).not.toThrow();
    });
  });
});
