import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { firstValueFrom, of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  const mockCustomLoggerService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        { provide: CustomLoggerService, useValue: mockCustomLoggerService },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/test',
        }),
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: () =>
        of({
          /* response object */
        }),
    } as unknown as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log requests and responses', async () => {
    const spy = jest.spyOn(mockCustomLoggerService, 'log');

    const observable = interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );
    const result = firstValueFrom(observable);
    await result;

    expect(spy).toHaveBeenCalledWith('GET /test', 'Request');

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/test - Time: \d+ms$/),
      'Response',
    );
  });
});
