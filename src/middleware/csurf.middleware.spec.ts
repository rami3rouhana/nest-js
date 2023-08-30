import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { CsrfMiddleware } from './csurf.middleware';
import * as csurf from 'csurf';

jest.mock('csurf');

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsrfMiddleware],
    }).compile();

    middleware = module.get<CsrfMiddleware>(CsrfMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should validate CSRF tokens', () => {
    const mockReq = {} as Request;
    mockReq.cookies = {
      'csrf-token': 'mock-csrf-token',
    };

    const mockRes = {} as Response;
    const mockNext: NextFunction = jest.fn();

    const mockCsurfMiddleware = (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      next();
    };

    csurf.mockReturnValue(mockCsurfMiddleware);

    middleware.use(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
