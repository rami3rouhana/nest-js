import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { HeaderVersioningMiddleware } from './header-versioning.middleware';

describe('HeaderVersioningMiddleware', () => {
  let middleware: HeaderVersioningMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeaderVersioningMiddleware],
    }).compile();

    middleware = module.get<HeaderVersioningMiddleware>(
      HeaderVersioningMiddleware,
    );
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should check API header version if added', () => {
    const mockReq = { headers: {} } as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response<any>;
    const mockNext: NextFunction = jest.fn();

    middleware.use(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'API version is required in the X-API-Version header',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
