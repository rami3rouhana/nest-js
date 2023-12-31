import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringInterceptor } from './monitoring.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { CustomLoggerService } from 'src/services/custom-logger.service';

class MockCustomLoggerService {
  log(message: string, context: string) {
    console.log(message, context);
  }
}

describe('MonitoringInterceptor', () => {
  let interceptor: MonitoringInterceptor;
  let customLogger: MockCustomLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringInterceptor,
        {
          provide: CustomLoggerService,
          useClass: MockCustomLoggerService,
        },
      ],
    }).compile();

    interceptor = module.get<MonitoringInterceptor>(MonitoringInterceptor);
    customLogger = module.get<MockCustomLoggerService>(CustomLoggerService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log elapsed time', async () => {
    const mockNow = jest.spyOn(Date, 'now');
    mockNow.mockReturnValueOnce(0); // Start time
    mockNow.mockReturnValueOnce(100); // End time

    const mockExecutionContext: ExecutionContext = {
      switchToHttp: jest.fn(),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: () => of({}),
    };

    const nextHandleSpy = jest
      .spyOn(mockCallHandler, 'handle')
      .mockReturnValue(of({}));
    jest.spyOn(customLogger, 'log');

    const observable$ = interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );
    await lastValueFrom(observable$);

    expect(nextHandleSpy).toHaveBeenCalled();
    expect(customLogger.log).toHaveBeenCalledWith(
      '100ms',
      'Process Elapsed Time',
    );

    mockNow.mockRestore();
  });
});
