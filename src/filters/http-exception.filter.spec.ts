import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';

class MockLoggerService extends CustomLoggerService {
  error = jest.fn();
}

let mockLoggerService: MockLoggerService;

beforeEach(() => {
  mockLoggerService = new MockLoggerService();
});

describe('HttpExceptionFilter', () => {
  let httpExceptionFilter: HttpExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        { provide: CustomLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    httpExceptionFilter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should catch HttpException and return a standardized error response', () => {
    const mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockHost: any = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({ url: 'http://example.com/test' }),
      }),
    };

    const exception = new HttpException('Test error message', 400);

    httpExceptionFilter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      timestamp: expect.any(String),
      path: 'http://example.com/test',
      message: 'Test error message',
    });

    const loggerArgs = mockLoggerService.error.mock.calls[0];
    const loggedJson = JSON.parse(loggerArgs[0]);

    expect(loggedJson).toHaveProperty('statusCode', 400);
    expect(loggerArgs[1]).toBe('HTTP Exception');
  });
});
