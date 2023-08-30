import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from 'src/database/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { getModelToken } from '@nestjs/mongoose';

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
});
