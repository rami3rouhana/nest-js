import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response, NextFunction } from 'express';
import { CsrfMiddleware } from './csrf.middleware';
import { ConfigService } from '@nestjs/config';

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsrfMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('SOME_SECRET'),
          },
        },
      ],
    }).compile();

    middleware = module.get<CsrfMiddleware>(CsrfMiddleware);

    // Initialize request, response, and next function
    req = {
      method: '',
      headers: {},
      cookies: {},
    };

    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      cookie: jest.fn(),
    };

    next = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set the CSRF token in the header for GET request without a token in the cookie', () => {
    req.method = 'GET';
    middleware.use(req as Request, res as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-csrf-token',
      expect.any(String),
    );
  });

  it('should validate CSRF token in the header against the cookie for non-GET requests', () => {
    req.method = 'POST';
    req.headers = { 'x-csrf-token': 'someToken' };
    req.cookies = { 'x-csrf-token': 'someToken|hashedToken' };
    middleware.use(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should reject if CSRF token in the header does not match the one in the cookie', () => {
    req.method = 'POST';
    req.headers = { 'x-csrf-token': 'differentToken' };
    req.cookies = { 'x-csrf-token': 'someToken|hashedToken' };
    middleware.use(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Invalid CSRF token');
  });
});
