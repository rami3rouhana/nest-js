import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserService } from './admin-user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Roles, User, UserDocument } from 'src/database/schemas/user.schema';
import { Model } from 'mongoose';

describe('AdminUserService', () => {
  let adminUserService: AdminUserService;
  let mockUserModel: jest.Mocked<Model<UserDocument>>;

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    adminUserService = module.get<AdminUserService>(AdminUserService);
  });

  it('should be defined', () => {
    expect(adminUserService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers: User[] = [
        { username: 'user1', password: 'pass1', role: Roles.user },
        { username: 'user2', password: 'pass2', role: Roles.user },
      ];

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUsers),
      } as any);

      const result = await adminUserService.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });
});
