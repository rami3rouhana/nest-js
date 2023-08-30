import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../services/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtRolesGuard } from 'src/guards/jwt-roles/jwt-roles.guard';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserService = {
      getUserInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        JwtRolesGuard,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useClass: JwtService, // This is just an example; adjust as needed
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getAdminUser', () => {
    it('should return user info', async () => {
      const result = { status: 'Success' };
      userService.getUserInfo.mockReturnValue(result);

      expect(await userController.getAdminUser()).toBe(result);
    });
  });
});
