import { CustomLoggerService } from './custom-logger.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('CustomLoggerService', () => {
  let service: CustomLoggerService;
  let mockWriteStream: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);
    (path.join as jest.Mock).mockReturnValue('mocked_path');

    service = new CustomLoggerService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log info', () => {
    service.log('test message', 'testContext');
    expect(mockWriteStream.write).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] test message'),
    );
  });

  it('should log error', () => {
    service.error('test error', 'testTrace', 'testContext');
    expect(mockWriteStream.write).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] test error'),
    );
  });

  it('should log warning', () => {
    service.warn('test warning', 'testContext');
    expect(mockWriteStream.write).toHaveBeenCalledWith(
      expect.stringContaining('[WARN] test warning'),
    );
  });

  it('should filter sensitive data', () => {
    service.log('password="1234"', 'testContext');
    expect(mockWriteStream.write).toHaveBeenCalledWith(
      expect.stringContaining('password="[FILTERED]"'),
    );
  });

  it('should switch log file if date changes', () => {
    (path.basename as jest.Mock).mockReturnValueOnce('app-old.log');
    service.log('test message', 'testContext');
    expect(fs.createWriteStream).toHaveBeenCalledTimes(2); // Once in constructor, once in switchLogFile
  });

  it('should close write stream on module destroy', () => {
    service.onModuleDestroy();
    expect(mockWriteStream.end).toHaveBeenCalled();
  });
});
