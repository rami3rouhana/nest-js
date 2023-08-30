import { Test, TestingModule } from '@nestjs/testing';
import { HeaderVersioningFilter } from './header-versioning.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('HeaderVersioningFilter', () => {
  let filter: HeaderVersioningFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeaderVersioningFilter],
    }).compile();

    filter = module.get<HeaderVersioningFilter>(HeaderVersioningFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should add versioning information to the headers', () => {
    const mockRequest = {
      headers: { 'x-api-version': '1.0' },
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockArgumentsHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    const mockException = new HttpException(
      'Test exception',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(mockException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(mockException.getResponse());
  });
});
