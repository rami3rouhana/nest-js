import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { SwaggerInterceptor } from './swagger.interceptor';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

jest.mock('src/services/custom-logger.service');

describe('SwaggerInterceptor', () => {
  let interceptor: SwaggerInterceptor;
  let mockCustomLoggerService: jest.Mocked<CustomLoggerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwaggerInterceptor, CustomLoggerService],
    }).compile();

    interceptor = module.get<SwaggerInterceptor>(SwaggerInterceptor);
    mockCustomLoggerService = module.get<CustomLoggerService>(
      CustomLoggerService,
    ) as jest.Mocked<CustomLoggerService>;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log the controller and method being used', async () => {
    const mockExecutionContext: ExecutionContext = {
      getClass: () => ({ name: 'TestController' }),
      getHandler: () => ({ name: 'testMethod' }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of(null), // return an Observable using 'of' function
    };

    const result = firstValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    await result;

    expect(mockCustomLoggerService.log).toHaveBeenCalledWith(
      'TestController',
      'Controller',
    );
    expect(mockCustomLoggerService.log).toHaveBeenCalledWith(
      'testMethod',
      'Method',
    );
  });
});
