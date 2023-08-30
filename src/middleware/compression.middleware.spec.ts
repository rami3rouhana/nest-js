import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction } from 'express';
import { CompressionMiddleware } from './compression.middleware';

describe('CompressionMiddleware', () => {
  let middleware: CompressionMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompressionMiddleware],
    }).compile();

    middleware = module.get<CompressionMiddleware>(CompressionMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should apply compression', () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext: NextFunction = jest.fn();

    middleware.use(mockReq as any, mockRes as any, mockNext);
  });
});
