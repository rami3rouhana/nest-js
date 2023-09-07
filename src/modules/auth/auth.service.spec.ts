import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from 'src/database/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { getModelToken } from '@nestjs/mongoose';
import AuthorizationError from 'src/errors/AuthorizationError';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: jest.Mocked<Model<UserDocument>>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Model<UserDocument>>;

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if valid username and password are provided', async () => {
      const mockUser: Partial<UserDocument> = {
        username: 'testUser',
        password: '$2b$10$testhashedpassword',
      };
      mockUserModel.findOne.mockResolvedValue(mockUser as UserDocument);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testUser', 'testPassword');
      expect(result).toEqual(mockUser);
    });

    it('should return null if the user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const result = await service.validateUser('testUser', 'testPassword');
      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should return a new access and refresh token', async () => {
      const mockOldRefreshToken = 'oldRefreshToken';
      const mockPayload = {
        username: 'test',
        _id: 'testId',
        role: 'user',
        iat: 12345,
        exp: 67890,
      };
      const mockAccessToken = 'newAccessToken';
      const mockRefreshToken = 'newRefreshToken';

      mockJwtService.verify.mockResolvedValue(mockPayload as never);
      mockJwtService.sign.mockImplementation((payload, options) => {
        if (options && options.expiresIn) {
          return mockRefreshToken;
        }
        return mockAccessToken;
      });

      const result = await service.refreshToken(mockOldRefreshToken);

      expect(mockJwtService.verify).toHaveBeenCalledWith(mockOldRefreshToken);
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockOldRefreshToken);

      // Check the first call to mockJwtService.sign (for the access token)
      expect(mockJwtService.sign.mock.calls[0][0]).toEqual({
        username: 'test',
        _id: 'testId',
        role: 'user',
      });

      expect(mockJwtService.sign.mock.calls[0][1]).toBeUndefined();

      // Check the second call to mockJwtService.sign (for the refresh token)
      expect(mockJwtService.sign.mock.calls[1][0]).toEqual({
        username: 'test',
        _id: 'testId',
        role: 'user',
      });

      expect(mockJwtService.sign.mock.calls[1][1]).toEqual({ expiresIn: '7d' });
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it('should throw an AuthorizationError if jwt verification fails', async () => {
      const mockOldRefreshToken = 'invalidOldRefreshToken';

      mockJwtService.verify.mockRejectedValue(
        new Error('Verification failed') as never,
      );

      await expect(service.refreshToken(mockOldRefreshToken)).rejects.toThrow(
        AuthorizationError,
      );
    });
  });
});
