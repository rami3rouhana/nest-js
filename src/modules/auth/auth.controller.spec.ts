import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ValidationError } from 'src/errors/ValidationError';
import { RefreshTokenRequiredError } from 'src/errors/RefreshTokenRequiredError';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(async () => {
    mockAuthService = {
      doesUsernameExist: jest.fn(),
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
    } as Partial<jest.Mocked<AuthService>> as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    mockReq = {
      headers: {},
      cookies: {},
      csrfToken: jest.fn(),
      body: {},
    };

    mockRes = {
      cookie: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      mockReq.body = { username: 'test', password: 'password' };
      mockAuthService.doesUsernameExist.mockResolvedValue(false);
      mockAuthService.register.mockResolvedValue({ id: '1', username: 'test' });

      await controller.register(mockReq as Request, mockRes as Response);

      expect(mockAuthService.doesUsernameExist).toHaveBeenCalledWith('test');
      expect(mockAuthService.register).toHaveBeenCalledWith('test', 'password');
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'User successfully registered',
        user: { id: '1', username: 'test' },
      });
    });

    it('should throw ValidationError if username already exists', async () => {
      mockReq.body = { username: 'test', password: 'password' };
      mockAuthService.doesUsernameExist.mockResolvedValue(true);

      await expect(() =>
        controller.register(mockReq as Request, mockRes as Response),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      mockReq.body = { username: 'test', password: 'password' };
      mockAuthService.validateUser.mockResolvedValue({
        id: '1',
        username: 'test',
      });
      mockAuthService.login.mockResolvedValue({
        accessToken: 'jwt_access_token',
        refreshToken: 'jwt_refresh_token',
      });

      await controller.login(
        mockReq.body,
        mockReq as Request,
        mockRes as Response,
      );

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test',
        'password',
      );
      expect(mockAuthService.login).toHaveBeenCalledWith({
        id: '1',
        username: 'test',
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful',
        accessToken: 'jwt_access_token',
      });
    });

    it('should throw ValidationError if invalid username or password', async () => {
      mockReq.body = { username: 'test', password: 'password' };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(() =>
        controller.login(mockReq.body, mockReq as Request, mockRes as Response),
      ).rejects.toThrow(ValidationError);
    });
  });
  describe('refreshToken', () => {
    it('should throw an error if no refresh token is provided', async () => {
      const mockReq = {
        cookies: {},
      };

      await expect(
        controller.refreshToken(mockReq as unknown as Request, {} as Response),
      ).rejects.toThrow(RefreshTokenRequiredError);
    });

    it('should return a new access token and set a new refresh token cookie', async () => {
      const mockReq = {
        cookies: {
          'refresh-token': 'oldRefreshToken',
        },
      };

      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockAccessToken = 'newAccessToken';
      const mockRefreshToken = 'newRefreshToken';

      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      await controller.refreshToken(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
      );

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh-token',
        mockRefreshToken,
        expect.any(Object),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Access token refreshed successfully',
        accessToken: mockAccessToken,
      });
    });
  });
});
