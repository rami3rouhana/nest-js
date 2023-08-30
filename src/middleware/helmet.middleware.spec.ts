import { Test, TestingModule } from '@nestjs/testing';
import { HelmetMiddleware } from './helmet.middleware';

describe('HelmetMiddleware', () => {
  let middleware: HelmetMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelmetMiddleware],
    }).compile();

    middleware = module.get<HelmetMiddleware>(HelmetMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should use Helmet library for security headers', () => {
    const mockReq = {};
    const mockRes = { setHeader: jest.fn(), removeHeader: jest.fn() };
    const mockNext = jest.fn();

    middleware.use(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.any(String),
    );
    expect(mockRes.removeHeader).toHaveBeenCalledWith('X-Powered-By');
  });
});
