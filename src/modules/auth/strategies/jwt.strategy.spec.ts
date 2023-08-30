import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Roles } from 'src/database/schemas/user.schema';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn().mockReturnValue('some_secret_key'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return the user based on JWT payload', async () => {
      const mockUser = { username: 'test', role: Roles.user };
      const mockPayload: JwtPayload = {
        username: 'test',
        password: '',
        role: Roles.user,
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(mockPayload);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('test', '');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const mockPayload: JwtPayload = {
        username: 'test',
        password: '',
        role: Roles.user,
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
